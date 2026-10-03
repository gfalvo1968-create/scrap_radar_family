"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("scrap_radar_market.js", "utf8");

function harness(payload, quotes = {}) {
  const events = [];
  const elements = new Proxy({}, {
    get(target, id) {
      if (!target[id]) target[id] = {
        value: "", textContent: "", className: "", innerHTML: "", dataset: {},
        addEventListener() {}, querySelectorAll() { return []; }
      };
      return target[id];
    }
  });
  elements["calc-material"].value = "copper";
  elements["calc-weight"].value = "2";
  const context = {
    document: { getElementById: id => elements[id], addEventListener() {} },
    localStorage: { getItem: () => JSON.stringify(quotes), setItem() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async () => ({ ok: true, json: async () => payload }),
    window: { dispatchEvent: event => events.push(event.type) },
    CustomEvent: class { constructor(type) { this.type = type; } }, Date, Number, Object, JSON, Intl, console
  };
  vm.createContext(context);
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, "globalThis.testApi={loadData};\n})();"), context);
  return { elements, events, loadData: context.testApi.loadData,
    benchmark: id => context.window.getScrapRadarMetalBenchmark(id),
    quote: id => context.window.getScrapRadarMaterialQuote(id) };
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

  const goldFeed = payload({ date: "2026-10-02", stale: false, status: "live" });
  goldFeed.metals.gold = { available: true, price: 4172.1, unit: "troy_oz", source_price_date: "2026-10-02", stale: false };
  goldFeed.materials.push({ id: "precious_metals", label: "Precious Metals", materials: [
    { id: "gold", label: "Gold", unit: "troy_oz", price_unit: "troy_oz", price: 4172.1, price_type: "market_reference", source_price_date: "2026-10-02" }
  ] });
  const gold = harness(goldFeed, { gold: 99 }); await gold.loadData();
  assert.equal(gold.quote("gold").price, 99);
  const reference = gold.benchmark("gold");
  assert.equal(reference.price, 4172.1, "a yard quote must not replace the gold market benchmark");
  assert.equal(reference.unit, "troy_oz");
  assert.equal(reference.date, "2026-10-02");
  assert.equal(reference.available, true);
  reference.price = 1;
  assert.equal(gold.benchmark("gold").price, 4172.1, "the read-only getter returns a copy");
  assert.equal(gold.benchmark("missing"), null);
  assert.ok(gold.events.includes("scrapRadarMarketUpdated"));
  goldFeed.metals.gold.source_price_date = "not a date";
  const undatedGold = harness(goldFeed); await undatedGold.loadData();
  assert.equal(undatedGold.benchmark("gold").date, null);
  assert.equal(undatedGold.benchmark("gold").stale, true);
  goldFeed.metals.gold.available = false;
  const unavailableGold = harness(goldFeed); await unavailableGold.loadData();
  assert.equal(unavailableGold.benchmark("gold").available, false);

  // The Board Sense screen shares the market bridge and must also warn on stale prices.
  const boardScript = fs.readFileSync("board_sense.html", "utf8").split("<script>")[1].split("</script>")[0];
  async function boardMarket(feed) {
    const box = { innerHTML: "" };
    const context = {
      document: { getElementById: () => box, addEventListener() {} },
      fetch: async () => ({ ok: true, json: async () => feed }),
      Date, Number, JSON, console
    };
    vm.createContext(context);
    vm.runInContext(boardScript, context);
    await context.loadMarket();
    return box.innerHTML;
  }
  const oldBoardFeed = payload({ date: "2026-09-18", stale: true, status: "stale" });
  oldBoardFeed.metals.copper.intelligence = { trend: "RISING", signal: "FAVORABLE SELL WINDOW" };
  const boardOld = await boardMarket(oldBoardFeed);
  assert.match(boardOld, /stale or have no verified market date/);
  assert.match(boardOld, /Trend withheld pending a current quote/);
  assert.doesNotMatch(boardOld, /FAVORABLE SELL WINDOW/);
  const boardFresh = await boardMarket(payload({ date: "2026-09-21", stale: false, status: "live" }));
  assert.doesNotMatch(boardFresh, /Some prices are stale/);

  console.log("Market date warnings: Scrap Radar and Board Sense states passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
