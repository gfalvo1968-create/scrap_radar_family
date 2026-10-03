"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const KEY = "scrapRadarSpikeRecoveryPacketV1";
const boardSource = fs.readFileSync("board_scrap_bridge.js", "utf8");
const radarSource = fs.readFileSync("scrap_radar_spike_bridge.js", "utf8");

// Run both real bridges against public form events and shared device storage.
// Quotes and analysis responses below are isolated test fixtures, not live data.
function storage() {
  const values = new Map();
  return {
    failWrites: false,
    getItem: key => values.get(key) || null,
    setItem(key, value) { if (this.failWrites) throw Error("Storage unavailable"); values.set(key, value); },
    removeItem: key => values.delete(key),
    packet: () => JSON.parse(values.get(KEY) || "null")
  };
}

function page(kind, localStorage) {
  const elements = new Map(), listeners = new Map();
  let responsePayload;
  class Element {
    constructor() { this.value = ""; this.dataset = {}; this.style = {}; this.listeners = new Map(); this.textContent = ""; }
    set id(value) { this._id = value; elements.set(value, this); }
    get id() { return this._id; }
    set innerHTML(value) {
      this._html = value;
      for (const match of value.matchAll(/<\w+\b([^>]*)>/g)) {
        const id = /\bid="([^"]+)"/.exec(match[1]);
        if (!id) continue;
        const child = new Element(); child.id = id[1];
        child.disabled = /\bdisabled\b/.test(match[1]);
        const initial = /\bvalue="([^"]*)"/.exec(match[1]);
        if (initial) child.value = initial[1];
        if (child.id === "spike-weight-unit") child.value = "lb";
      }
    }
    get innerHTML() { return this._html || ""; }
    addEventListener(name, fn) { if (!this.listeners.has(name)) this.listeners.set(name, []); this.listeners.get(name).push(fn); }
    dispatchEvent(event) { event.currentTarget = this; for (const fn of this.listeners.get(event.type) || []) fn.call(this, event); }
    emit(name, trusted = true) { this.dispatchEvent({ type: name, isTrusted: trusted }); }
    insertAdjacentElement() {}
    scrollIntoView() {}
    focus() {}
    setAttribute() {}
    querySelector(selector) { return selector === ".recovery-path-grid" ? grid : null; }
  }
  function add(id) { const e = new Element(); e.id = id; return e; }
  const grid = new Element(); grid.parentNode = { insertBefore() {} };
  if (kind === "board") {
    ["predictionBox", "sellValue", "recoveredValue", "laborMinutes"].forEach(add);
  } else {
    ["board-recovery", "br-whole", "br-partial-value", "br-residual", "br-partial-minutes", "br-partial-costs", "br-full-value", "br-full-residual", "br-full-minutes", "br-full-costs", "br-whole-miles", "br-whole-travel", "br-whole-fees", "br-partial-miles", "br-partial-travel", "br-partial-fees", "br-full-miles", "br-full-travel", "br-full-fees", "br-shared-mpg", "br-shared-gas", "trip-target", "calc-weight", "calc-price", "yard-weight", "yard-price-1"].forEach(add);
    const select = add("calc-material"); select.options = [{ value: "board_mid" }];
  }
  const window = {
    top: { location: { href: "", search: kind === "board" ? "?from=scrap-radar" : "?source=spike" } },
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, []); listeners.get(name).push(fn); },
    fetch: async () => ({ clone: () => ({ json: async () => responsePayload }) }),
    getScrapRadarMaterialQuote: id => ({ id, price: 0.65, type: "estimate", date: "2026-09-29", label: "Mid Grade Circuit Boards" })
  };
  vm.runInNewContext(kind === "board" ? boardSource : radarSource, {
    window, localStorage,
    document: { readyState: "complete", getElementById: id => elements.get(id) || null, createElement: () => new Element(), querySelectorAll: () => [] },
    location: { search: "?source=spike" }, URLSearchParams,
    Event: class { constructor(type) { this.type = type; this.isTrusted = false; } },
    setTimeout: fn => { fn(); return 1; }, console
  });
  return {
    elements, window,
    edit(id, value) { elements.get(id).value = String(value); elements.get(id).emit("input"); },
    unit(value) { elements.get("spike-weight-unit").value = value; elements.get("spike-weight-unit").emit("change"); },
    click(id) { return elements.get(id).onclick(); },
    dispatch(name, event = {}) { for (const fn of listeners.get(name) || []) fn(event); },
    async analyze(payload) { responsePayload = payload; await window.fetch("https://example.invalid/analyze-case"); await new Promise(resolve => setImmediate(resolve)); },
    send() { let prevented = false; elements.get("sendSpikeForm").onsubmit({ preventDefault() { prevented = true; } }); return !prevented; },
    status: () => elements.get("spikeScrapBridgeStatus").innerHTML
  };
}

function analysis() {
  return { mode: "same_board_multi_photo", combined: {
    board_type: "Dense Logic / Controller Board", grade: "MEDIUM", score: 5, confidence: 85,
    object_gate: { confirmed_pcb: true },
    same_board_verification: { status: "PROBABLY_SAME_BOARD", confidence: 85 }
  } };
}

(async () => {
  const saved = storage(), original = page("board", saved);
  await original.analyze(analysis());
  original.dispatch("boardSensePlanningUpdated", { detail: { gradeId: "board_mid", weightGrams: null } });
  const firstCaseId = saved.packet().caseId;
  const radar = page("radar", saved);
  radar.unit("g"); radar.edit("spike-board-weight", 42.75);
  assert.equal(saved.packet().planning.weightGrams, 42.75);
  assert.equal(saved.packet().planning.wholeBoardEstimate.value, 0.06);
  assert.equal(saved.packet().planning.wholeBoardEstimate.pricePerLb, 0.65);
  assert.equal(saved.packet().planning.wholeBoardEstimate.priceDate, "2026-09-29");
  assert.equal(saved.packet().planning.wholeBoardEstimate.basis, "planning_estimate");
  assert.equal(saved.packet().economics.sellWholeValue, null, "an estimate must not become a buyer offer");
  assert.equal(radar.elements.get("br-whole").value, "0.06");
  radar.edit("br-partial-costs", 5);
  radar.edit("br-whole-miles", 0);
  radar.click("spike-back");
  assert.match(radar.window.top.location.href, /board_sense_case\.html\?from=scrap-radar&build=/);
  assert.equal(saved.packet().scrapRadarReturn.inputs["br-full-value"], null, "blank recovery dollars must remain unpriced");
  assert.equal(saved.packet().scrapRadarReturn.inputs["br-partial-minutes"], null, "blank time must remain unentered");
  assert.equal(saved.packet().scrapRadarReturn.inputs["br-whole-miles"], 0, "explicit zero differs from a blank input");
  const returned = page("board", saved);
  assert.match(returned.status(), /42\.75 grams/);
  assert.match(returned.status(), /Whole-board planning estimate:<\/b> \$0\.06/);
  assert.match(returned.status(), /planning rate dated 2026-09-29/);
  assert.match(returned.status(), /Selective harvest: unpriced/);
  assert.match(returned.status(), /Deeper recovery: unpriced/);
  assert.doesNotMatch(returned.status(), /Entered whole-board buyer offer/);
  assert.equal(original.send(), true, "an open Board Sense tab must use the updated saved packet");
  assert.equal(saved.packet().planning.weightGrams, 42.75);
  assert.equal(saved.packet().scrapRadarReturn.inputs["br-partial-costs"], 5);
  const reopened = page("radar", saved);
  assert.equal(reopened.elements.get("spike-board-weight").value, "42.75");
  assert.equal(reopened.elements.get("spike-weight-unit").value, "g");
  assert.equal(reopened.elements.get("br-whole").value, "0.06");
  assert.equal(reopened.elements.get("br-partial-costs").value, "5");
  assert.equal(reopened.elements.get("br-partial-value").value, "");

  // A manually entered offer remains separate and survives recalculation.
  reopened.edit("br-whole", 2.75); reopened.click("spike-estimate"); reopened.click("spike-back");
  assert.equal(saved.packet().scrapRadarReturn.wholeBasis, "entered_offer");
  assert.equal(saved.packet().scrapRadarReturn.inputs["br-whole"], 2.75);
  assert.equal(saved.packet().planning.wholeBoardEstimate.value, 0.06);
  assert.match(page("board", saved).status(), /Entered whole-board buyer offer:<\/b> \$2\.75/);
  assert.equal(page("radar", saved).elements.get("br-whole").value, "2.75");
  reopened.edit("spike-board-weight", "");
  assert.equal(saved.packet().planning.weightGrams, null);
  assert.equal(saved.packet().planning.wholeBoardEstimate, undefined);
  assert.equal(reopened.elements.get("br-whole").value, "2.75", "clearing weight must preserve an entered offer");
  original.dispatch("boardSensePlanningUpdated", { detail: { gradeId: "board_mid", weightGrams: 55 } });
  assert.equal(saved.packet().planning.wholeBoardEstimate, undefined);
  assert.equal(saved.packet().scrapRadarReturn.inputs["br-whole"], 2.75, "worksheet changes must preserve entered offers");

  // Old tabs cannot write their measurements or delete a new board's packet.
  returned.dispatch("boardSenseCaseReportReset");
  assert.equal(saved.packet(), null);
  assert.equal(original.send(), false, "a cleared case must not be resurrected from memory");
  await returned.analyze(analysis());
  assert.notEqual(saved.packet().caseId, firstCaseId);
  assert.equal(saved.packet().planning, null);
  assert.equal(saved.packet().scrapRadarReturn, undefined);
  const newPacket = saved.getItem(KEY);
  reopened.window.top.location.href = "";
  reopened.edit("spike-board-weight", 42.75); reopened.click("spike-back"); reopened.click("spike-clear");
  assert.equal(saved.getItem(KEY), newPacket);
  assert.equal(reopened.window.top.location.href, "");
  assert.match(reopened.elements.get("spike-estimate-result").textContent, /case changed/);

  // Legacy handoffs use their existing creation time; units survive reload.
  const legacy = saved.packet(); delete legacy.caseId;
  saved.setItem(KEY, JSON.stringify(legacy));
  const pounds = page("radar", saved);
  pounds.edit("spike-board-weight", 2); pounds.click("spike-back");
  assert.equal(saved.packet().planning.weightGrams, 907.18474);
  assert.equal(saved.packet().planning.wholeBoardEstimate.value, 1.3);
  assert.equal(saved.packet().scrapRadarReturn.caseId, legacy.createdAt);
  const poundReload = page("radar", saved);
  assert.equal(poundReload.elements.get("spike-board-weight").value, "2");
  assert.equal(poundReload.elements.get("spike-weight-unit").value, "lb");
  poundReload.edit("spike-board-weight", "");
  assert.equal(saved.packet().planning.wholeBoardEstimate, undefined);
  assert.equal(poundReload.elements.get("br-whole").value, "");
  poundReload.unit("g"); poundReload.edit("spike-board-weight", 1); poundReload.click("spike-back");
  assert.equal(saved.packet().planning.wholeBoardEstimate.value, 0, "a rounded zero is still a calculated estimate");
  assert.match(page("board", saved).status(), /planning estimate:<\/b> \$0\.00/);

  // Storage errors must stop navigation rather than silently lose the return.
  poundReload.window.top.location.href = ""; saved.failWrites = true;
  poundReload.click("spike-back");
  assert.equal(poundReload.window.top.location.href, "");
  assert.match(poundReload.elements.get("spike-estimate-result").textContent, /Could not save/);
  saved.failWrites = false;

  const mismatch = saved.packet(); mismatch.scrapRadarReturn.caseId = "a-different-board";
  mismatch.scrapRadarReturn.inputs["br-full-value"] = 999;
  saved.setItem(KEY, JSON.stringify(mismatch));
  assert.doesNotMatch(page("board", saved).status(), /999/);
  assert.equal(page("radar", saved).elements.get("br-full-value").value, "");

  const offerStore = storage(), offerBoard = page("board", offerStore);
  offerBoard.elements.get("sellValue").value = "4";
  await offerBoard.analyze(analysis());
  const offerRadar = page("radar", offerStore);
  offerRadar.unit("g"); offerRadar.edit("spike-board-weight", 42.75); offerRadar.click("spike-back");
  assert.equal(offerRadar.elements.get("br-whole").value, "4", "an imported offer must survive a planning estimate");
  assert.equal(offerStore.packet().economics.sellWholeValue, 4);
  assert.equal(offerStore.packet().scrapRadarReturn.wholeBasis, "entered_offer");
  const estimateStore = storage(), estimateBoard = page("board", estimateStore);
  await estimateBoard.analyze(analysis());
  const estimateRadar = page("radar", estimateStore);
  estimateRadar.unit("g"); estimateRadar.edit("spike-board-weight", 42.75); estimateRadar.click("spike-back");
  estimateBoard.dispatch("boardSensePlanningUpdated", { detail: { gradeId: "board_mid", weightGrams: 100 } });
  assert.equal(estimateStore.packet().planning.wholeBoardEstimate, undefined, "a changed measurement invalidates the previous estimate");
  assert.equal(estimateStore.packet().scrapRadarReturn.inputs["br-whole"], null, "an outdated planning total must not return as an offer");
  console.log("Board/Scrap Radar round trip: grams/pounds, dated estimates, entered offers, blank inputs, case isolation, resets, reloads and storage errors passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
