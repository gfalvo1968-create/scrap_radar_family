"use strict";
// Regression: on-device Test Five showed whole-board net $0 after a $10
// per-mile trip cost, while the separate visible recommendation chose SELL WHOLE.
// These are hypothetical fixtures, not buyer quotes or live recovery yields.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("scrap_radar_recommendation.js", "utf8");
const elements = new Map();
const docHandlers = new Map();
const windowHandlers = new Map();
function on(map, type, fn) {
  if (!map.has(type)) map.set(type, []);
  map.get(type).push(fn);
}
class Element {
  constructor(id = "") {
    this.id = id; this.textContent = ""; this.value = ""; this.dataset = {};
    this.style = {}; this.listeners = [];
    if (id) elements.set(id, this);
  }
  set innerHTML(html) {
    this._html = html;
    for (const match of html.matchAll(/\bid="([^"]+)"/g)) new Element(match[1]);
  }
  get innerHTML() { return this._html || ""; }
  setAttribute() {}
  insertAdjacentElement() {}
  querySelector(selector) {
    if (this.id === "board-recovery" && selector === ".recovery-path-grid") return grid;
    if (this.id === "board-recovery" && selector === ".recovery-decision") return legacy;
    return null;
  }
}
const panel = new Element("board-recovery");
const grid = new Element();
const legacy = new Element();
const inputs = {
  "br-whole": "10", "br-partial-value": "14", "br-residual": "2",
  "br-partial-minutes": "10", "br-partial-costs": "3",
  "br-full-value": "20", "br-full-residual": "1",
  "br-full-minutes": "15", "br-full-costs": "5",
  "br-whole-miles": "10", "br-whole-travel": "0", "br-whole-fees": "0",
  "br-partial-miles": "0", "br-partial-travel": "0", "br-partial-fees": "0",
  "br-full-miles": "0", "br-full-travel": "0", "br-full-fees": "0",
  "br-shared-mpg": "", "br-shared-gas": "",
  "trip-mpg": "20", "trip-gas": "4", "trip-target": "25",
  "trip-fuel-rate": "0.50", "trip-cost-method": "rate"
};
for (const [id, value] of Object.entries(inputs)) new Element(id).value = value;
const document = {
  readyState: "complete",
  body: {},
  getElementById(id) { return elements.get(id) || null; },
  createElement() { return new Element(); },
  addEventListener(type, fn) { on(docHandlers, type, fn); }
};
const window = {
  addEventListener(type, fn) { on(windowHandlers, type, fn); },
  ScrapRadarOperatingProfile: {
    // Same input contract as scrap_radar_profile.js; never sum both methods.
    vehicleCost(miles, mpg, gas) {
      const method = elements.get("trip-cost-method").value;
      const rate = Number(elements.get("trip-fuel-rate").value);
      if (method === "rate") return miles * rate;
      return mpg > 0 && Number.isFinite(gas) ? miles / mpg * gas : 0;
    }
  }
};
class MutationObserver { observe() {} }
vm.runInNewContext(source, { window, document, MutationObserver, console, setTimeout(fn) { fn(); } });
const get = id => elements.get(id).textContent;
function edit(id, value, eventType = "input") {
  const target = elements.get(id);
  target.value = String(value);
  for (const callback of docHandlers.get(eventType) || []) callback({ target });
}
assert.match(get("br-economic-title"), /ECONOMIC RECOMMENDATION: DEEPER RECOVERY/);
assert.match(get("br-economic-detail"), /Highest priced net: DEEPER RECOVERY at \$16\.00/);
assert.equal(get("br-partial-target"), "$5.17", "selective break-even includes whole path vehicle savings");
assert.equal(get("br-full-target"), "$10.25", "deeper break-even includes whole path vehicle savings");
assert.match(get("br-break-even-basis"), /\$0\.00 after entered travel and time costs/);

// A change of the cost-per-mile field must recalculate immediately, not
// require another recovery value edit or page reload.
edit("trip-fuel-rate", "0");
assert.match(get("br-economic-title"), /ECONOMIC RECOMMENDATION: SELL WHOLE/);
assert.equal(get("br-partial-target"), "$15.17");
assert.equal(get("br-full-target"), "$20.25");

// Changing the vehicle-cost method is also an input change. MPG and a per-mile
// rate must never be charged simultaneously.
edit("trip-fuel-rate", "0.50");
edit("trip-cost-method", "mpg", "change");
assert.match(get("br-economic-title"), /ECONOMIC RECOMMENDATION: DEEPER RECOVERY/);
assert.equal(get("br-partial-target"), "$11.17");
assert.equal(get("br-full-target"), "$16.25");

// The updater must not infer a whole-board offer from distance/time alone.
edit("br-whole", "");
assert.match(get("br-economic-title"), /LIMITED PLANNING COMPARISON: DEEPER RECOVERY/);
assert.equal(get("br-partial-target"), "—");
console.log("Board Recovery visible recommendation: per-mile/MPG switching, 3-path time choice, no double-cost, dynamic break-even and missing-offer gates PASS");
