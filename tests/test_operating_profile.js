"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");
const PROFILE = "scrapRadarOperatingProfileV1", CASE = "scrapRadarSpikeRecoveryPacketV1";
const source = fs.readFileSync("scrap_radar_profile.js", "utf8");
const operating = fs.readFileSync("scrap_radar_operating.js", "utf8");
const examples = { fuel_cost_per_mile: 0.45, target_hourly_wage: 25, chemical_cost_per_lb: 0.5 };
const empty = { fuel_cost_per_mile: null, target_hourly_wage: null, chemical_cost_per_lb: null };
const tick = () => new Promise(resolve => setImmediate(resolve));
function storage() {
  const data = new Map();
  return { failWrites: false, getItem: key => data.get(key) || null,
    setItem(key, value) { if (this.failWrites) throw Error("Storage unavailable"); data.set(key, value); },
    removeItem: key => data.delete(key), profile: () => JSON.parse(data.get(PROFILE) || "null") };
}
function service() {
  return { rates: null, offline: false, requests: [], pauseUpdate: null,
    async fetch(url, options) {
      if (this.offline) throw Error("Offline fixture");
      assert.match(options.headers.Authorization, /^Bearer srp_[0-9a-f]{64}$/);
      const path = new URL(url).pathname;
      const payload = options.body ? JSON.parse(options.body) : null;
      this.requests.push({ path, method: options.method, payload });
      let body;
      if (path === "/api/update-profile") {
        if (this.pauseUpdate) await this.pauseUpdate();
        this.rates = Object.values(payload).every(x => x === null) ? null : payload;
        body = { saved: !!this.rates, profile: this.rates };
      } else if (path === "/api/profile") body = { saved: !!this.rates, profile: this.rates };
      else {
        const p = this.rates;
        const costs = payload.distance_miles * 2 * p.fuel_cost_per_mile +
          payload.labor_hours_invested * p.target_hourly_wage +
          payload.processing_weight_lbs * p.chemical_cost_per_lb + payload.other_costs;
        body = { financial_summary: { total_overhead_deductions: Math.round(costs * 100) / 100 } };
      }
      return { ok: true, json: async () => body };
    }
  };
}
function page(saved, server, job = {}, recovery = false) {
  const elements = new Map(), windowEvents = new Map(), documentEvents = new Map();
  class Element {
    constructor() { this.value = ""; this.dataset = {}; this.style = {}; this.listeners = new Map(); this.textContent = ""; this.parentElement = root; }
    set id(id) { this._id = id; elements.set(id, this); }
    get id() { return this._id; }
    set innerHTML(html) {
      for (const match of html.matchAll(/<\w+\b([^>]*)>/g)) {
        const id = /\bid="([^"]+)"/.exec(match[1]); if (!id) continue;
        const child = new Element(); child.id = id[1];
        const value = /\bvalue="([^"]*)"/.exec(match[1]); if (value) child.value = value[1];
      }
    }
    querySelector() { return root; }
    insertAdjacentElement() {}
    addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(fn); }
    dispatchEvent(event) { event.currentTarget = this; for (const fn of this.listeners.get(event.type) || []) fn.call(this, event); }
    focus() {}
    setAttribute() {}
  }
  const root = { insertAdjacentElement() {}, querySelector() { return null; } };
  root.parentElement = root;
  const add = id => { const e = new Element(); e.id = id; return e; };
  ["evaluator", "calc-material", "calc-weight", "calc-price", "trip-miles", "trip-mpg", "trip-gas", "trip-other", "trip-minutes", "trip-target", "trip-fuel-rate", "trip-cost-method", "reset-evaluator", "calc-value", "op-roundtrip", "op-fuel", "op-costs", "op-net", "op-hourly", "op-decision", "op-detail"].forEach(add);
  if (recovery) ["spike-gold-costs", "spike-gold-minutes"].forEach(add);
  for (const [id, value] of Object.entries(job)) elements.get(id).value = String(value);
  const listen = (map, name, fn) => { if (!map.has(name)) map.set(name, []); map.get(name).push(fn); };
  const dispatch = (map, event) => { for (const fn of map.get(event.type) || []) fn(event); };
  const window = { addEventListener: (name, fn) => listen(windowEvents, name, fn), dispatchEvent: event => dispatch(windowEvents, event) };
  const document = { readyState: "complete", getElementById: id => elements.get(id) || null,
    createElement: () => new Element(), querySelector: () => null, head: { appendChild() {} },
    addEventListener: (name, fn) => listen(documentEvents, name, fn) };
  const context = vm.createContext({ window, document, localStorage: saved, crypto: webcrypto,
    fetch: (url, options) => server.fetch(url, options), AbortController, setTimeout, clearTimeout,
    Event: class { constructor(type) { this.type = type; this.isTrusted = false; } }, console });
  vm.runInContext(source, context); vm.runInContext(operating, context);
  dispatch(documentEvents, { type: "DOMContentLoaded" });
  return { api: window.ScrapRadarOperatingProfile, elements,
    edit(id, value) { const e = elements.get(id); e.value = String(value); e.dispatchEvent({ type: "input", isTrusted: true }); },
    click(id) { const e = elements.get(id); return e.onclick ? e.onclick() : e.dispatchEvent({ type: "click", isTrusted: true }); },
    text: id => elements.get(id).textContent,
    value: id => elements.get(id).value };
}

(async () => {
  const saved = storage(), server = service(), p = page(saved, server);
  assert.deepEqual(JSON.parse(JSON.stringify(p.api.get())), empty);
  assert.equal(p.value("trip-target"), "");
  p.click("profile-example");
  assert.equal(saved.profile(), null, "examples are opt-in and cannot silently become saved costs");
  assert.equal(p.value("trip-fuel-rate"), "");
  await p.click("profile-save");
  assert.deepEqual(saved.profile().rates, examples);
  assert.equal(saved.profile().pending, false);
  assert.equal(p.value("trip-target"), "25");
  assert.equal(p.value("trip-cost-method"), "rate");

  const reload = page(saved, server); await tick();
  assert.equal(reload.value("profile-fuel"), "0.45");
  assert.equal(reload.value("trip-target"), "25");
  assert.ok(server.requests.some(r => r.path === "/api/profile"), "reload reads the private SQLite backup");
  reload.edit("calc-weight", 50); reload.edit("calc-price", 10); reload.edit("trip-miles", 30);
  reload.edit("trip-mpg", 20); reload.edit("trip-gas", 3);
  assert.equal(reload.text("op-fuel"), "$27.00", "30 one-way miles count a round trip at the saved rate");
  assert.equal(reload.text("op-net"), "$473.00", "MPG fuel is not added to a per-mile allowance");
  reload.edit("trip-cost-method", "mpg");
  assert.equal(reload.text("op-fuel"), "$9.00");

  reload.edit("trip-target", 40); reload.edit("trip-fuel-rate", 0.7);
  reload.edit("profile-fuel", 0.5); reload.edit("profile-wage", 30); await reload.click("profile-save");
  assert.equal(reload.value("trip-target"), "40", "saving new defaults preserves manually entered job costs");
  assert.equal(reload.value("trip-fuel-rate"), "0.7");
  assert.equal(reload.value("trip-cost-method"), "mpg");
  reload.click("reset-evaluator");
  assert.equal(reload.value("trip-target"), "30");
  assert.equal(reload.value("trip-fuel-rate"), "0.5");
  assert.equal(reload.value("trip-cost-method"), "rate");

  const beforeInvalid = saved.getItem(PROFILE);
  reload.edit("profile-fuel", -1); await reload.click("profile-save");
  assert.equal(saved.getItem(PROFILE), beforeInvalid);
  reload.edit("profile-fuel", "Infinity"); await reload.click("profile-save");
  assert.equal(saved.getItem(PROFILE), beforeInvalid);
  reload.edit("profile-fuel", 0.6); saved.failWrites = true; await reload.click("profile-save");
  assert.equal(saved.getItem(PROFILE), beforeInvalid); assert.match(reload.text("profile-status"), /could not be saved/);
  saved.failWrites = false; server.offline = true; await reload.click("profile-save");
  assert.equal(saved.profile().rates.fuel_cost_per_mile, 0.6);
  assert.equal(saved.profile().pending, true); assert.match(reload.text("profile-status"), /local rates still work/);
  server.offline = false;
  page(saved, server); await tick(); await tick();
  assert.equal(saved.profile().pending, false, "an offline save is backed up on the next reload");
  assert.equal(server.rates.fuel_cost_per_mile, 0.6);

  const recoveryStore = storage(), recoveryServer = service();
  recoveryStore.setItem(CASE, JSON.stringify({ caseId: "test-cost-case", planning: { weightGrams: 50 * 453.59237 } }));
  const recovery = page(recoveryStore, recoveryServer, {}, true);
  recovery.click("profile-example"); await recovery.click("profile-save");
  recovery.edit("profile-process-lbs", 15); recovery.edit("spike-gold-minutes", 150);
  recovery.edit("profile-recovery-miles", 30); recovery.edit("profile-recovery-other", 0);
  recovery.edit("spike-gold-costs", 999); await recovery.click("profile-apply-recovery");
  assert.equal(recovery.value("spike-gold-costs"), "97.00", "travel 27 + labor 62.50 + processing 7.50 replace the previous total");
  assert.match(recovery.text("profile-recovery-status"), /Counted once/);
  await recovery.click("profile-apply-recovery");
  assert.equal(recovery.value("spike-gold-costs"), "97.00", "repeated application cannot double the costs");
  assert.deepEqual(recoveryServer.requests.find(r => r.path.endsWith("calculate-yield")).payload.recovered_metals, [], "the cost helper never invents a recovered yield");
  recovery.edit("profile-process-lbs", 51); await recovery.click("profile-apply-recovery");
  assert.match(recovery.text("profile-recovery-status"), /exceeds/);
  assert.equal(recovery.value("spike-gold-costs"), "97.00");
  recovery.edit("profile-process-lbs", 15); recovery.edit("profile-recovery-miles", ""); await recovery.click("profile-apply-recovery");
  assert.match(recovery.text("profile-recovery-status"), /Enter processing weight/);
  await recovery.click("profile-clear");
  assert.equal(server.rates.fuel_cost_per_mile, 0.6, "a separate browser owns a separate profile fixture");
  assert.equal(recoveryServer.rates, null);
  assert.equal(recovery.value("spike-gold-costs"), "97.00", "clearing default rates preserves case totals");
  recovery.edit("profile-recovery-miles", 30); await recovery.click("profile-apply-recovery");
  assert.match(recovery.text("profile-recovery-status"), /Save a rate/);
  assert.equal(recovery.value("spike-gold-costs"), "97.00");
  assert.equal(recovery.api.localOverhead({ distance_miles: 0, labor_hours_invested: 0, processing_weight_lbs: 0, other_costs: 0 }, empty).total, 0, "explicit zero does not require a saved rate");

  // Delayed requests must not restore an older save after a newer user change.
  const raceStore = storage(), raceServer = service(), race = page(raceStore, raceServer);
  let release;
  raceServer.pauseUpdate = () => new Promise(resolve => { release = resolve; });
  race.click("profile-example"); const first = race.click("profile-save"); await tick();
  race.edit("profile-wage", 55); const second = race.click("profile-save"); await tick();
  assert.equal(raceServer.requests.length, 1, "profile writes are serialized");
  raceServer.pauseUpdate = null; release(); await first; await second;
  assert.equal(raceStore.profile().rates.target_hourly_wage, 55);
  assert.equal(raceServer.rates.target_hourly_wage, 55);
  const finalReload = page(raceStore, raceServer); await tick();
  assert.equal(finalReload.value("trip-target"), "55");
  console.log("Operating profile persistence, cost methods, case costs, missing inputs and delayed-save checks passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });
