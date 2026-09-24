"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("scrap_radar_market.js", "utf8");

function harness(payload) {
  const elements = new Proxy({}, {
    get(target, id) {
      if (!target[id]) target[id] = {
        value: "", textContent: "", className: "", innerHTML: "",
        addEventListener() {}, querySelectorAll() { return []; }
      };
      return target[id];
    }
  });
  elements["calc-material"].value = "copper";
  elements["calc-weight"].value = "2";
  const context = {
    document: { getElementById: id => elements[id], addEventListener() {} },
    localStorage: { getItem: () => null, setItem() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async () => ({ ok: true, json: async () => payload }),
    Date, Number, Object, JSON, Intl, console
  };
  vm.createContext(context);
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, "globalThis.testApi={loadData};\n})();"), context);
  return { elements, loadData: context.testApi.loadData };
}

function payload({ date, stale, status }) {
  return {
    status, checked_at: "2026-09-24T12:00:00Z",
    source: "Reference market", metals: {
      copper: { available: true, price: 3.4, unit: "lb", source_price_date: date, stale }
    },
    materials: [{ id: "copper", label: "Copper", materials: [
      { id: "copper", label: "Copper", unit: "lb", price_unit: "lb",
        price: 3.4, price_type: "market_reference", pricing_mode: "market_reference",
        source_price_date: date, stale }
    ] }]
  };
}

(async () => {
  const old = harness(payload({ date: "2026-09-18", stale: true, status: "stale" }));
  await old.loadData();
  assert.match(old.elements["sr-feed-status"].textContent, /stale/i);
  assert.match(old.elements["sr-updated"].textContent, /Feed checked/);
  assert.match(old.elements["benchmark-grid"].innerHTML, /Market date 2026-09-18 • verify before use/);
  assert.match(old.elements["material-categories"].innerHTML, /verify before use/);
  assert.equal(old.elements["calc-price"].value, "");
  assert.match(old.elements["calc-detail"].textContent, /Enter a current quote/);

  const legacy = harness(payload({ date: undefined, stale: undefined, status: "live" }));
  await legacy.loadData();
  assert.match(legacy.elements["sr-feed-status"].textContent, /unverified/);
  assert.match(legacy.elements["benchmark-grid"].innerHTML, /Market date unknown/);
  assert.equal(legacy.elements["calc-price"].value, "");

  const fresh = harness(payload({ date: "2026-09-21", stale: false, status: "live" }));
  await fresh.loadData();
  assert.match(fresh.elements["sr-feed-status"].textContent, /daily prices dated below/);
  assert.equal(fresh.elements["calc-price"].value, "3.40");
  assert.match(fresh.elements["calc-value"].textContent, /\$6\.80/);

  console.log("Market date warnings: 3 feed states passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
