"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("scrap_radar_spike_bridge.js", "utf8");
const KEY = "scrapRadarSpikeRecoveryPacketV1";

function run(fragment, previous) {
  const values = new Map();
  if (previous) values.set(KEY, JSON.stringify(previous));
  const store = {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
  const state = { replaced: "" };
  const window = {
    location: {
      hash: fragment, pathname: "/scrap_radar.html", search: "?source=spike"
    },
    history: { replaceState: (_, __, path) => { state.replaced = path; } },
    crypto: { randomUUID: () => "test-only-uuid" },
    addEventListener() {}
  };
  const document = { readyState: "loading", addEventListener() {} };
  vm.runInNewContext(source, {
    window, document, localStorage: store, console,
    setTimeout() {}, location: window.location
  });
  return { packet: JSON.parse(values.get(KEY) || "null"), replaced: state.replaced };
}

function fragment(data) {
  return "#bs-single-v1=" + encodeURIComponent(JSON.stringify(data));
}
const base = {
  version: 1, kind: "board_sense_single_view", manualReview: true,
  boardType: "Dense Logic / Controller Board", confidence: 78,
  signals: ["logic chips", "goldish contacts"]
};

let result = run(fragment({
  ...base,
  grade: "VERY HIGH", price: 9999999, buyerCategory: "premium",
  image_url: "data:image/jpeg;base64,PRIVATE", apiKey: "not-a-real-key",
  signals: ["logic chips", "<img src=x onerror=alert(1)>"]
}), { caseId: "previous-user-board" });
assert.equal(result.packet.version, 1);
assert.equal(result.packet.caseId, "test-only-uuid");
assert.equal(result.packet.sourceMode, "single_board_photo");
assert.equal(result.packet.identity.boardType, "Dense Logic / Controller Board");
assert.equal(result.packet.identity.confidence, 78);
assert.equal(result.packet.recovery.grade, "MANUAL REVIEW");
assert.equal(result.packet.sameBoard.status, "SINGLE_VIEW_ONLY");
assert.equal(result.packet.economics.sellWholeValue, null);
assert.equal(result.packet.economics.fullRecoveryValue, null);
assert.equal(result.packet.verification.buyerGradeVerified, false);
assert.equal(result.packet.verification.materialYieldVerified, false);
assert.equal(result.packet.price, undefined);
assert.equal(result.packet.image_url, undefined);
assert.equal(result.packet.apiKey, undefined);
assert.equal(result.replaced, "/scrap_radar.html?source=spike#board-recovery");

result = run(fragment({ ...base, confidence: 101 }), { caseId: "stale" });
assert.equal(result.packet, null, "invalid incoming case must retire previous stored one");
result = run("#bs-single-v1=malformed%ZZ", { caseId: "stale" });
assert.equal(result.packet, null, "malformed incoming case must retire previous stored one");
result = run(fragment({ ...base, manualReview: false }), { caseId: "stale" });
assert.equal(result.packet, null, "attempted unreviewed transfer must be rejected");
result = run("#board-recovery", { caseId: "existing-multi-photo-case" });
assert.equal(result.packet.caseId, "existing-multi-photo-case", "old multi-photo handoff remains unaffected");
console.log("Cross-origin single-board handoff: valid, privacy filtering, withheld prices, stale-packet reset, malformed packet and legacy behavior passed");
