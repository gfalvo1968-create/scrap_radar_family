"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const KEY = "scrapRadarSpikeRecoveryPacketV1";
const boardSource = fs.readFileSync("board_scrap_bridge.js", "utf8");
const radarSource = fs.readFileSync("scrap_radar_spike_bridge.js", "utf8");
const goldSource = fs.readFileSync("scrap_radar_gold_scenario.js", "utf8");

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
  const metalBenchmarks = {
    gold: { id: "gold", available: true, price: 4172.10, unit: "troy_oz", date: "2026-10-02", stale: false, source: "Test benchmark" },
    silver: { id: "silver", available: true, price: 60.71, unit: "troy_oz", date: "2026-10-02", stale: false, source: "Test benchmark" },
    copper: { id: "copper", available: true, price: 6.579, unit: "lb", date: "2026-10-02", stale: false, source: "Test benchmark" }
  };
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
    add("trip-cost-method"); add("trip-fuel-rate");
    const select = add("calc-material"); select.options = [{ value: "board_mid" }];
  }
  const window = {
    top: { location: { href: "", search: kind === "board" ? "?from=scrap-radar" : "?source=spike" } },
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, []); listeners.get(name).push(fn); },
    fetch: async () => ({ clone: () => ({ json: async () => responsePayload }) }),
    getScrapRadarMaterialQuote: id => ({ id, price: 0.65, type: "estimate", date: "2026-09-29", label: "Mid Grade Circuit Boards" })
  };
  window.getScrapRadarMetalBenchmark = id => metalBenchmarks[id] || null;
  const context = vm.createContext({
    window, localStorage,
    document: { readyState: "complete", getElementById: id => elements.get(id) || null, createElement: () => new Element(), querySelectorAll: () => [] },
    location: { search: "?source=spike" }, URLSearchParams,
    Event: class { constructor(type) { this.type = type; this.isTrusted = false; } },
    setTimeout: fn => { fn(); return 1; }, console
  });
  vm.runInContext(fs.readFileSync("board_price_reference.js", "utf8"), context);
  vm.runInContext(kind === "board" ? boardSource : radarSource, context);
  if(kind === "radar")vm.runInContext(goldSource, context);
  return {
    elements, window,
    edit(id, value) { elements.get(id).value = String(value); elements.get(id).emit("input"); },
    unit(value) { elements.get("spike-weight-unit").value = value; elements.get("spike-weight-unit").emit("change"); },
    click(id) { return elements.get(id).onclick(); },
    category(value) { elements.get("spike-buyer-category").value=value; elements.get("spike-buyer-category").emit("change"); },
    goldUnit(value) { elements.get("spike-gold-unit").value = value; elements.get("spike-gold-unit").emit("change"); },
    metalUnit(id, value) { elements.get("spike-"+id+"-unit").value = value; elements.get("spike-"+id+"-unit").emit("change"); },
    market(value) { metalBenchmarks[value.id || "gold"] = value; for (const fn of listeners.get("scrapRadarMarketUpdated") || []) fn({}); },
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
  const categoryStore=storage(),categoryBoard=page("board",categoryStore);
  await categoryBoard.analyze(analysis());
  categoryBoard.dispatch("boardSensePlanningUpdated", {detail:{gradeId:"board_mid",weightGrams:42.75}});
  const categoryRadar=page("radar",categoryStore);
  assert.equal(categoryStore.packet().planning.buyerCategoryId, undefined, "specific buyer category cannot be inferred from a broad grade");
  categoryRadar.category("board_cdrom");
  assert.equal(categoryStore.packet().planning.wholeBoardEstimate.value, .75);
  assert.equal(categoryStore.packet().planning.wholeBoardEstimate.pricePerLb, 8);
  assert.equal(categoryStore.packet().planning.gradeId,"board_mid", "buyer selection cannot change the evidence grade");
  assert.equal(categoryStore.packet().planning.buyerCategoryBasis,"user_selected_unconfirmed");
  assert.match(categoryRadar.elements.get("spike-estimate-result").innerHTML,/buyer acceptance unconfirmed/);
  categoryRadar.category("board_hdd_non_sata");
  assert.equal(categoryStore.packet().planning.wholeBoardEstimate.value,1.88);
  assert.equal(categoryStore.packet().identity.boardType,"Dense Logic / Controller Board");
  assert.equal(page("radar",categoryStore).elements.get("spike-buyer-category").value,"board_hdd_non_sata");
  categoryRadar.category("");
  assert.equal(categoryStore.packet().planning.wholeBoardEstimate.value,.06);

  const radar = page("radar", saved);
  radar.unit("g"); radar.edit("spike-board-weight", 42.75);
  assert.equal(saved.packet().planning.weightGrams, 42.75);
  assert.equal(saved.packet().planning.wholeBoardEstimate.value, 0.06);
  assert.equal(saved.packet().planning.wholeBoardEstimate.pricePerLb, 0.65);
  assert.equal(saved.packet().planning.wholeBoardEstimate.priceDate, "2026-09-29");
  assert.equal(saved.packet().planning.wholeBoardEstimate.basis, "planning_estimate");
  assert.equal(saved.packet().economics.sellWholeValue, null, "an estimate must not become a buyer offer");
  assert.equal(radar.elements.get("br-whole").value, "0.06");
  assert.equal(radar.elements.get("spike-gold-gross").textContent, "$13.41");
  assert.match(radar.elements.get("spike-gold-basis").textContent, /1 scale point = 0.1 g/);
  assert.equal(saved.packet().planning.goldRecoveryScenario.kind, "hypothetical");
  assert.equal(saved.packet().planning.goldRecoveryScenario.netAfterEnteredCosts, null, "blank buyer terms and costs cannot create net proceeds");
  assert.equal(saved.packet().planning.materialRecoveryScenario.status, "partial");
  assert.deepEqual(saved.packet().planning.materialRecoveryScenario.missingQuantities, ["silver", "copper"], "missing quantities are unknown, not zero");
  radar.edit("br-partial-costs", 5);
  radar.edit("br-whole-miles", 0);
  radar.edit("trip-cost-method", "rate"); radar.edit("trip-fuel-rate", 0.45);
  radar.click("spike-back");
  assert.match(radar.window.top.location.href, /board_sense_case\.html\?from=scrap-radar&build=/);
  assert.equal(saved.packet().scrapRadarReturn.inputs["br-full-value"], null, "blank recovery dollars must remain unpriced");
  assert.equal(saved.packet().scrapRadarReturn.inputs["br-partial-minutes"], null, "blank time must remain unentered");
  assert.equal(saved.packet().scrapRadarReturn.inputs["br-whole-miles"], 0, "explicit zero differs from a blank input");
  assert.equal(saved.packet().scrapRadarReturn.inputs["trip-cost-method"], "rate");
  assert.equal(saved.packet().scrapRadarReturn.inputs["trip-fuel-rate"], 0.45);
  const returned = page("board", saved);
  assert.match(returned.status(), /42\.75 grams/);
  assert.match(returned.status(), /Whole-board planning estimate:<\/b> \$0\.06/);
  assert.match(returned.status(), /planning rate dated 2026-09-29/);
  assert.match(returned.status(), /Selective harvest: unpriced/);
  assert.match(returned.status(), /Deeper recovery: unpriced/);
  assert.doesNotMatch(returned.status(), /Entered whole-board buyer offer/);
  assert.match(returned.status(), /Gold \+ silver \+ copper recovery • assumed yields/);
  assert.match(returned.status(), /Priced metal subtotal • partial scenario:<\/b> \$13\.41/);
  assert.equal(original.send(), true, "an open Board Sense tab must use the updated saved packet");
  assert.equal(saved.packet().planning.weightGrams, 42.75);
  assert.equal(saved.packet().scrapRadarReturn.inputs["br-partial-costs"], 5);
  const reopened = page("radar", saved);
  assert.equal(reopened.elements.get("spike-board-weight").value, "42.75");
  assert.equal(reopened.elements.get("spike-weight-unit").value, "g");
  assert.equal(reopened.elements.get("br-whole").value, "0.06");
  assert.equal(reopened.elements.get("br-partial-costs").value, "5");
  assert.equal(reopened.elements.get("br-partial-value").value, "");
  assert.equal(reopened.elements.get("trip-cost-method").value, "rate", "vehicle cost method survives the case handoff");
  assert.equal(reopened.elements.get("trip-fuel-rate").value, "0.45");

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

  // Gold scenarios stay separate from actual payouts; unit changes and market
  // refreshes recalculate using the current benchmark rather than a fixed price.
  const scenarioStore = storage(), scenarioBoard = page("board", scenarioStore);
  await scenarioBoard.analyze(analysis());
  scenarioBoard.dispatch("boardSensePlanningUpdated", { detail: { gradeId: "board_mid", weightGrams: 42.75 } });
  const scenario = page("radar", scenarioStore);
  const baseGold = { id: "gold", available: true, price: 4172.10, unit: "troy_oz", date: "2026-10-02", stale: false, source: "Test benchmark" };
  scenario.edit("spike-gold-amount", 2);
  assert.equal(scenario.elements.get("spike-gold-gross").textContent, "$26.83");
  scenario.goldUnit("g"); scenario.edit("spike-gold-amount", 0.2);
  assert.equal(scenario.elements.get("spike-gold-gross").textContent, "$26.83");
  scenario.goldUnit("mg"); scenario.edit("spike-gold-amount", 200);
  assert.equal(scenario.elements.get("spike-gold-gross").textContent, "$26.83");
  scenario.edit("spike-gold-amount", "");
  assert.equal(scenario.elements.get("spike-gold-gross").textContent, "—");
  scenario.click("spike-gold-one-point");
  scenario.edit("spike-gold-pay-percent", 100); scenario.edit("spike-gold-costs", 0); scenario.edit("spike-gold-minutes", 10);
  assert.equal(scenarioStore.packet().planning.goldRecoveryScenario.netAfterEnteredCosts, 13.41);
  assert.equal(scenarioStore.packet().planning.goldRecoveryScenario.hourlyAfterEnteredCosts, 80.48);
  scenario.edit("spike-gold-pay-percent", 50); scenario.edit("spike-gold-costs", 20);
  assert.equal(scenarioStore.packet().planning.goldRecoveryScenario.netAfterEnteredCosts, -13.29);
  scenario.click("spike-back");
  assert.match(page("board", scenarioStore).status(), /Scenario after entered costs: \$-13\.29/);
  assert.equal(scenarioStore.packet().economics.fullRecoveryValue, null);
  assert.equal(scenarioStore.packet().scrapRadarReturn.inputs["br-full-value"], null);
  assert.equal(scenarioStore.packet().scrapRadarReturn.inputs["br-partial-value"], null);
  const savedScenario = page("radar", scenarioStore);
  assert.equal(savedScenario.elements.get("spike-gold-amount").value, "1");
  assert.equal(savedScenario.elements.get("spike-gold-pay-percent").value, "50");
  assert.equal(savedScenario.elements.get("spike-gold-costs").value, "20");
  savedScenario.edit("spike-gold-pay-percent", 101);
  assert.equal(scenarioStore.packet().planning.goldRecoveryScenario.netAfterEnteredCosts, null);
  assert.match(savedScenario.elements.get("spike-gold-net-note").textContent, /between 0 and 100/);
  savedScenario.goldUnit("g"); savedScenario.edit("spike-gold-amount", 50);
  assert.equal(scenarioStore.packet().planning.goldRecoveryScenario.status, "exceeds_board_weight");
  assert.equal(savedScenario.elements.get("spike-gold-gross").textContent, "—");
  savedScenario.click("spike-gold-one-point");
  savedScenario.market({ ...baseGold, available: false });
  assert.equal(scenarioStore.packet().planning.goldRecoveryScenario.status, "needs_benchmark");
  assert.equal(savedScenario.elements.get("spike-gold-gross").textContent, "—");
  savedScenario.market({ ...baseGold, unit: "oz" });
  assert.equal(scenarioStore.packet().planning.goldRecoveryScenario.status, "needs_benchmark", "do not confuse troy and ordinary ounces");
  savedScenario.market({ ...baseGold, price: 0 });
  assert.equal(scenarioStore.packet().planning.goldRecoveryScenario.status, "needs_benchmark");
  savedScenario.market({ ...baseGold, stale: true, date: "2026-09-01" });
  assert.match(savedScenario.elements.get("spike-gold-basis").textContent, /stale or unverified/);
  savedScenario.edit("spike-gold-pay-percent",100); savedScenario.edit("spike-gold-costs",0);
  assert.equal(scenarioStore.packet().planning.goldRecoveryScenario.netAfterEnteredCosts,null);
  assert.equal(scenarioStore.packet().planning.materialRecoveryScenario.netAfterEnteredCosts,null);
  assert.match(savedScenario.elements.get("spike-gold-net-note").textContent,/Refresh Prices/);

  savedScenario.market({ ...baseGold, unit: "g", price: 100 });
  assert.equal(savedScenario.elements.get("spike-gold-gross").textContent, "$10.00");
  assert.equal(scenarioStore.packet().economics.fullRecoveryValue, null);
  scenarioBoard.dispatch("boardSenseCaseReportReset");
  savedScenario.edit("spike-gold-amount", 2);
  assert.equal(scenarioStore.packet(), null, "gold scenarios cannot resurrect a cleared board");
  assert.match(savedScenario.elements.get("spike-gold-basis").textContent, /case changed/);

  // A recovery breakdown uses each metal's original benchmark unit and full
  // precision; it is not a sum of the already-rounded display values.
  const metalsStore = storage(), metalsBoard = page("board", metalsStore);
  await metalsBoard.analyze(analysis());
  metalsBoard.dispatch("boardSensePlanningUpdated", { detail: { gradeId: "board_mid", weightGrams: 42.75 } });
  const metals = page("radar", metalsStore);
  metals.goldUnit("g"); metals.edit("spike-gold-amount", .05);
  metals.edit("spike-silver-amount", .2); metals.edit("spike-copper-amount", 15);
  let breakdown = metalsStore.packet().planning.materialRecoveryScenario;
  assert.equal(metals.elements.get("spike-gold-gross").textContent, "$6.71");
  assert.equal(metals.elements.get("spike-silver-gross").textContent, "$0.39");
  assert.equal(metals.elements.get("spike-copper-gross").textContent, "$0.22");
  assert.equal(breakdown.status, "complete");
  assert.equal(breakdown.grossMetalValue, 7.31, "round the full-precision sum once, rather than adding $6.71 + $0.39 + $0.22");
  assert.equal(breakdown.netAfterEnteredCosts, null);
  assert.equal(breakdown.knownRecoveredGrams, 15.25);
  metals.metalUnit("silver", "mg"); metals.edit("spike-silver-amount", 200);
  metals.metalUnit("copper", "kg"); metals.edit("spike-copper-amount", .015);
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.grossMetalValue, 7.31);
  metals.metalUnit("copper", "lb"); metals.edit("spike-copper-amount", 15 / 453.59237);
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.grossMetalValue, 7.31);
  metals.edit("spike-gold-pay-percent", 90); metals.edit("spike-silver-pay-percent", 80);
  metals.edit("spike-copper-pay-percent", 60); metals.edit("spike-gold-costs", 1.5); metals.edit("spike-gold-minutes", 10);
  breakdown = metalsStore.packet().planning.materialRecoveryScenario;
  assert.equal(breakdown.netAfterEnteredCosts, 4.98, "different buyer terms apply before shared costs are subtracted exactly once");
  assert.equal(breakdown.hourlyAfterEnteredCosts, 29.87);
  assert.equal(metals.elements.get("spike-gold-net").textContent, "$4.98");
  metals.click("spike-back");
  const metalReturn = page("board", metalsStore);
  assert.match(metalReturn.status(), /Combined gross metal value:<\/b> \$7\.31/);
  assert.match(metalReturn.status(), /Scenario after entered costs: \$4\.98/);
  assert.match(metalReturn.status(), /<td>Silver<\/td><td>0\.2<\/td>/);
  assert.match(metalReturn.status(), /<td>Copper<\/td><td>15<\/td>/);
  assert.equal(metalsStore.packet().scrapRadarReturn.inputs["br-full-value"], null);
  assert.equal(metalsStore.packet().economics.fullRecoveryValue, null);
  const metalsReload = page("radar", metalsStore);
  assert.equal(metalsReload.elements.get("spike-silver-amount").value, "200");
  assert.equal(metalsReload.elements.get("spike-silver-unit").value, "mg");
  assert.equal(metalsReload.elements.get("spike-copper-unit").value, "lb");
  assert.equal(metalsReload.elements.get("spike-copper-pay-percent").value, "60");
  assert.equal(metalsReload.elements.get("spike-gold-net").textContent, "$4.98");

  const baseCopper = { id: "copper", available: true, price: 6.579, unit: "lb", date: "2026-10-02", stale: false, source: "Test benchmark" };
  const baseSilver = { id: "silver", available: true, price: 60.71, unit: "troy_oz", date: "2026-10-02", stale: false, source: "Test benchmark" };
  metalsReload.market({ ...baseCopper, available: false });
  breakdown = metalsStore.packet().planning.materialRecoveryScenario;
  assert.equal(breakdown.status, "partial");
  assert.equal(breakdown.grossMetalValue, 7.1);
  assert.deepEqual(breakdown.unpricedMetals, ["copper"]);
  assert.equal(breakdown.netAfterEnteredCosts, null, "a missing benchmark for an entered metal blocks net proceeds");
  metalsReload.market({ ...baseCopper, price: 453.59237 });
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.grossMetalValue, 22.1);
  metalsReload.market({ ...baseCopper, unit: "metric_ton", price: 1000000 });
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.grossMetalValue, 22.1);
  metalsReload.market({ ...baseCopper, unit: "kg", price: 1000 });
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.grossMetalValue, 22.1);
  metalsReload.market(baseCopper);
  metalsReload.market({ ...baseSilver, unit: "oz" });
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.materials[1].status, "needs_benchmark");
  metalsReload.market({ ...baseSilver, unit: "g", price: 2, stale: true, date: null });
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.grossMetalValue, 7.32);
  assert.match(metalsReload.elements.get("spike-silver-basis").textContent, /stale or unverified/);
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.netAfterEnteredCosts,null,"unverified dates must withhold net");

  metalsReload.market(baseSilver);
  metalsReload.edit("spike-silver-pay-percent", 101);
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.netAfterEnteredCosts, null);
  metalsReload.edit("spike-silver-pay-percent", 80);
  metalsReload.edit("spike-gold-costs", "");
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.netAfterEnteredCosts, null, "blank costs are not zero costs");
  metalsReload.edit("spike-gold-costs", 1.5);
  metalsReload.edit("spike-silver-amount", "");
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.status, "partial");
  assert.match(metalsReload.elements.get("spike-material-basis").textContent, /Quantities still unknown: Silver/);
  metalsReload.metalUnit("silver", "g"); metalsReload.edit("spike-silver-amount", 1);
  metalsReload.metalUnit("copper", "g"); metalsReload.edit("spike-copper-amount", 42);
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.status, "exceeds_board_weight", "individually plausible yields must also fit the board's total mass");
  assert.equal(metalsReload.elements.get("spike-material-gross").textContent, "—");
  metalsReload.click("spike-back");
  assert.match(page("board", metalsStore).status(), /Combined value withheld/);
  metalsReload.edit("spike-copper-amount", -1);
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.status, "invalid_value");
  metalsReload.edit("spike-copper-amount", 15); metalsReload.edit("spike-silver-amount", .2);
  metalsReload.edit("spike-gold-costs", 20);
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.netAfterEnteredCosts, -13.52);

  // Explicit zero excludes a metal without silently filling a missing amount.
  metalsReload.edit("spike-gold-amount", 0); metalsReload.edit("spike-silver-amount", 0); metalsReload.edit("spike-copper-amount", 0);
  metalsReload.market({ ...baseGold, available: false });
  metalsReload.market({ ...baseSilver, available: false });
  metalsReload.market({ ...baseCopper, available: false });
  metalsReload.edit("spike-gold-costs", 0);
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.status, "complete");
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.grossMetalValue, 0);
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.netAfterEnteredCosts, 0);
  metalsReload.click("spike-back");
  assert.match(page("board", metalsStore).status(), /Combined gross metal value:<\/b> \$0\.00/);
  metalsStore.failWrites = true; metalsReload.window.top.location.href = "";
  metalsReload.edit("spike-silver-amount", 1); metalsReload.click("spike-back");
  assert.equal(metalsReload.window.top.location.href, "", "storage failure must not discard a material breakdown during navigation");
  metalsStore.failWrites = false;
  metalReturn.dispatch("boardSenseCaseReportReset");
  metalsReload.edit("spike-copper-amount", 1);
  assert.equal(metalsStore.packet(), null);
  assert.equal(metalsReload.elements.get("spike-material-gross").textContent, "—");
  await metalReturn.analyze(analysis());
  const resetMetals = page("radar", metalsStore);
  assert.equal(resetMetals.elements.get("spike-silver-amount").value, "");
  assert.equal(resetMetals.elements.get("spike-copper-amount").value, "");
  assert.equal(resetMetals.elements.get("spike-silver-pay-percent").value, "");
  const migratedPacket = metalsStore.packet();
  delete migratedPacket.planning.materialRecoveryScenario;
  migratedPacket.planning.goldRecoveryScenario.input = { amount: .05, unit: "g", buyerPayPercent: 90, costs: 1.5, minutes: 10 };
  metalsStore.setItem(KEY, JSON.stringify(migratedPacket));
  const migrated = page("radar", metalsStore);
  assert.equal(migrated.elements.get("spike-gold-gross").textContent, "$6.71", "existing gold-only assumptions migrate without changing their weight unit");
  assert.equal(migrated.elements.get("spike-gold-net").textContent, "$4.54");
  assert.equal(migrated.elements.get("spike-silver-amount").value, "");
  assert.equal(migrated.elements.get("spike-copper-amount").value, "");
  const damaged = metalsStore.packet(); damaged.planning.materialRecoveryScenario.materials = "invalid";
  metalsStore.setItem(KEY, JSON.stringify(damaged));
  assert.equal(page("radar", metalsStore).elements.get("spike-silver-amount").value, "", "invalid saved row schemas cannot break the calculator");
  migrated.edit("spike-gold-amount", ""); migrated.edit("spike-silver-amount", ""); migrated.edit("spike-copper-amount", "");
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.grossMetalValue, null, "an entirely blank scenario cannot manufacture a zero-valued total");
  migrated.edit("spike-gold-amount", -1);
  assert.equal(metalsStore.packet().planning.materialRecoveryScenario.status, "invalid_value");
  migrated.edit("spike-gold-amount", .05); migrated.edit("spike-silver-amount", .2); migrated.edit("spike-copper-amount", 15);
  const isolated = metalsStore.packet();
  isolated.caseId = "new-physical-board"; isolated.planning = null;
  metalsStore.setItem(KEY, JSON.stringify(isolated));
  const newBefore = metalsStore.getItem(KEY);
  migrated.edit("spike-silver-amount", 100); migrated.click("spike-back"); migrated.click("spike-clear");
  assert.equal(metalsStore.getItem(KEY), newBefore, "old material scenario tabs cannot overwrite or clear a new physical board");
  console.log("Board/Scrap Radar round trip and metal scenarios: per-metal units and buyer terms, full-precision totals, shared costs, missing inputs/prices, case isolation, resets and storage errors passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
