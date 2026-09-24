"use strict";

const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const { webcrypto } = require("crypto");

class MockElement {
  constructor(id, elements) {
    this.id = id;
    this.elements = elements;
    this.value = "";
    this.textContent = "";
    this.hidden = false;
    this.children = [];
    this.files = [];
    this.classList = { add() {}, toggle() {} };
    this.dataset = {};
  }
  addEventListener() {}
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
  setAttribute() {}
  focus() {}
  click() {}
  reset() {
    ["recordTitle", "recordAuthor", "recordAssignee", "recordDetails"].forEach(id => { this.elements[id].value = ""; });
  }
}

function makeHarness() {
  const elements = new Proxy({}, {
    get(target, id) {
      if (!target[id]) target[id] = new MockElement(id, elements);
      return target[id];
    }
  });
  const storage = new Map();
  const context = {
    TextEncoder,
    TextDecoder,
    Uint8Array,
    Date,
    Intl,
    JSON,
    Math,
    Set,
    Promise,
    crypto: webcrypto,
    window: { crypto: webcrypto },
    document: {
      hidden: false,
      getElementById: id => elements[id],
      createElement: tag => new MockElement(tag, elements),
      addEventListener() {}
    },
    localStorage: {
      getItem: key => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key)
    },
    btoa: value => Buffer.from(value, "binary").toString("base64"),
    atob: value => Buffer.from(value, "base64").toString("binary"),
    fetch: async () => ({ ok: true, json: async () => ({ schemaVersion: 1, records: [] }) }),
    confirm: () => true,
    prompt: () => null,
    setTimeout: () => 1,
    clearTimeout() {},
    console,
    Blob,
    URL
  };
  vm.createContext(context);
  const source = fs.readFileSync("ai_hall.js", "utf8") + `\n;globalThis.testApi={state,configureGate,lockHall,encryptVault,deriveKey,decryptVault,importVault,installVerifiedImport,resetForgottenVault};`;
  vm.runInContext(source, context);
  return { context, elements, storage, api: context.testApi };
}

function privateVault(title) {
  return {
    owner: "Scrap Radar Family",
    createdAt: "2026-09-21T00:00:00.000Z",
    records: [{
      id: `record-${title.toLowerCase()}`,
      type: "note",
      title,
      author: "Maya",
      assignee: "",
      details: `${title} secret details`,
      status: "open",
      priority: "normal",
      createdAt: "2026-09-21T00:00:00.000Z"
    }]
  };
}

async function encryptedContainer(api, password, vault) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const key = await api.deriveKey(password, salt);
  return { container: await api.encryptVault(vault, key, salt), key };
}

(async () => {
  const { context, elements, storage, api } = makeHarness();

  api.state.key = { secret: true };
  api.state.vault = privateVault("Unsaved");
  elements.recordList.children = [{ textContent: "decrypted private details" }];
  elements.recordTitle.value = "unfinished title";
  elements.recordDetails.value = "unfinished sensitive draft";
  elements.recordAuthor.value = "Maya";
  elements.recordAssignee.value = "Jerry";
  elements.searchRecords.value = "sensitive search";
  api.lockHall();
  assert.strictEqual(api.state.key, null);
  assert.strictEqual(api.state.vault, null);
  assert.deepStrictEqual(elements.recordList.children, []);
  ["recordTitle", "recordDetails", "recordAuthor", "recordAssignee", "searchRecords"].forEach(id => assert.strictEqual(elements[id].value, ""));

  const oldEncrypted = await encryptedContainer(api, "old-password", privateVault("Old"));
  storage.set("scrapRadarFamilyAiHallVaultV1", JSON.stringify(oldEncrypted.container));
  const candidate = await encryptedContainer(api, "new-password", privateVault("New"));
  context.prompt = () => "wrong-password";
  elements.importInput.files = [{ size: 1000, text: async () => JSON.stringify(candidate.container) }];
  await api.importVault({ target: elements.importInput });
  assert.strictEqual(storage.get("scrapRadarFamilyAiHallVaultV1"), JSON.stringify(oldEncrypted.container));
  assert.match(elements.vaultStatus.textContent, /current vault was not changed/);

  const malformed = await encryptedContainer(api, "malformed-password", { owner: "Scrap Radar Family", createdAt: "2026-09-21T00:00:00.000Z", records: [{ id: "missing-fields" }] });
  context.prompt = () => "malformed-password";
  elements.importInput.files = [{ size: 1000, text: async () => JSON.stringify(malformed.container) }];
  await api.importVault({ target: elements.importInput });
  assert.strictEqual(storage.get("scrapRadarFamilyAiHallVaultV1"), JSON.stringify(oldEncrypted.container));
  assert.match(elements.vaultStatus.textContent, /current vault was not changed/);

  context.prompt = () => "new-password";
  elements.importInput.files = [{ size: 1000, text: async () => JSON.stringify(candidate.container) }];
  await api.importVault({ target: elements.importInput });
  assert.strictEqual(storage.get("scrapRadarFamilyAiHallVaultV1"), JSON.stringify(candidate.container));
  assert.strictEqual(api.state.vault.records[0].title, "New");
  api.lockHall();

  const locked = await encryptedContainer(api, "forgotten-password", privateVault("Forgotten"));
  storage.set("scrapRadarFamilyAiHallVaultV1", JSON.stringify(locked.container));
  api.configureGate();
  assert.strictEqual(elements.forgotPasswordPanel.hidden, false);

  context.confirm = () => false;
  api.resetForgottenVault();
  assert.strictEqual(storage.has("scrapRadarFamilyAiHallVaultV1"), true, "First warning must be cancellable");

  const cancelledFinalConfirmation = [true, false];
  context.confirm = () => cancelledFinalConfirmation.shift();
  api.resetForgottenVault();
  assert.strictEqual(storage.has("scrapRadarFamilyAiHallVaultV1"), true, "Final warning must be cancellable");

  elements.passwordInput.value = "incorrect password attempt";
  const confirmations = [true, true];
  context.confirm = () => confirmations.shift();
  api.resetForgottenVault();
  assert.strictEqual(storage.has("scrapRadarFamilyAiHallVaultV1"), false);
  assert.strictEqual(elements.forgotPasswordPanel.hidden, true);
  assert.strictEqual(elements.confirmInput.hidden, false);
  assert.strictEqual(elements.passwordInput.value, "");
  assert.match(elements.gateStatus.textContent, /shared records and review requests were not changed/);

  console.log("AI Hall security tests passed: lock purge, authenticated rollback-safe import, and confirmed local-only password reset.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
