"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

// Exercise the real handoff through its fetch and public UI events. These
// response fixtures are test data only; no live classification is requested.
const source = fs.readFileSync("board_scrap_bridge.js", "utf8");
const HANDOFF_KEY = "scrapRadarSpikeRecoveryPacketV1";

function harness() {
  const elements = new Map();
  const stored = new Map();
  const listeners = new Map();
  let responsePayload;

  class Element {
    constructor() {
      this.value = "";
      this.disabled = false;
      this.style = {};
      this.textContent = "";
    }
    set id(value) { this._id = value; elements.set(value, this); }
    get id() { return this._id; }
    set innerHTML(value) {
      this._html = value;
      for (const match of value.matchAll(/<\w+\b([^>]*)>/g)) {
        const id = /\bid="([^"]+)"/.exec(match[1]);
        if (!id) continue;
        const child = new Element();
        child.id = id[1];
        child.disabled = /\bdisabled\b/.test(match[1]);
      }
    }
    get innerHTML() { return this._html || ""; }
    insertAdjacentElement() {}
  }
  const prediction = new Element();
  prediction.id = "predictionBox";
  const window = {
    addEventListener(name, listener) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(listener);
    },
    fetch: async () => ({ clone: () => ({ json: async () => responsePayload }) })
  };
  const localStorage = {
    getItem: key => stored.get(key) || null,
    setItem: (key, value) => stored.set(key, value),
    removeItem: key => stored.delete(key)
  };
  vm.runInNewContext(source, {
    window, localStorage,
    document: {
      readyState: "complete",
      getElementById: id => elements.get(id) || null,
      createElement: () => new Element()
    },
    Date, Number, String, Array, Object, JSON, console
  });
  return {
    elements,
    packet: () => JSON.parse(localStorage.getItem(HANDOFF_KEY) || "null"),
    dispatch: (name, detail) => (listeners.get(name) || []).forEach(fn => fn({ detail })),
    async analyze(payload) {
      responsePayload = payload;
      await window.fetch("https://example.invalid/analyze-case");
      await new Promise(resolve => setImmediate(resolve));
    },
    send() {
      let prevented = false;
      elements.get("sendSpikeForm").onsubmit({ preventDefault() { prevented = true; } });
      return { prevented };
    }
  };
}

function validCase() {
  return {
    mode: "same_board_multi_photo",
    combined: {
      board_type: "Processor-Rich Logic Board",
      grade: "MEDIUM", score: 15, confidence: 92,
      object_gate: { confirmed_pcb: true },
      same_board_verification: { status: "PROBABLY_SAME_BOARD", confidence: 94 }
    }
  };
}

(async () => {
  const h = harness();
  await h.analyze(validCase());
  h.dispatch("boardSensePlanningUpdated", { gradeId: "board_mid", weightGrams: 907.18474 });
  assert.equal(h.packet().recovery.grade, "MEDIUM");
  assert.equal(h.packet().planning.weightGrams, 907.18474);
  assert.equal(h.packet().sameBoard.status, "PROBABLY_SAME_BOARD");
  assert.equal(h.packet().economics.sellWholeValue, null);
  assert.equal(h.elements.get("sendSpikeToScrap").disabled, false);

  // Starting a scan or a new board must retire the prior saved AND in-memory
  // case. If the next request fails, the old board must remain unavailable.
  h.dispatch("boardSenseCaseReportReset");
  assert.equal(h.packet(), null, "reset must retire the previous saved board");
  assert.equal(h.elements.get("sendSpikeToScrap").disabled, true);
  assert.equal(h.send().prevented, true, "the old in-memory board must not be sent");
  assert.equal(h.packet(), null);

  await h.analyze(validCase());
  const mixed = validCase();
  mixed.mode = "multi_photo_identity_blocked";
  mixed.combined.status = "case_identity_failed";
  mixed.combined.same_board_verification.block_reconciliation = true;
  await h.analyze(mixed);
  assert.equal(h.packet(), null);
  assert.equal(h.elements.get("sendSpikeToScrap").disabled, true);

  await h.analyze(validCase());
  const uncertain = validCase();
  uncertain.combined.status = "case_identity_clarification";
  await h.analyze(uncertain);
  assert.equal(h.packet(), null, "identity clarification must withhold the handoff");
  assert.equal(h.elements.get("sendSpikeToScrap").disabled, true);

  await h.analyze(validCase());
  const otherObject = validCase();
  otherObject.combined.object_gate.confirmed_pcb = false;
  await h.analyze(otherObject);
  assert.equal(h.packet(), null);
  assert.equal(h.elements.get("sendSpikeToScrap").disabled, true);

  console.log("Board handoff: grade/weight, reset, mixed boards, identity clarification and non-PCB gates passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
