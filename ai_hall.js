"use strict";

const STORAGE_KEY = "scrapRadarFamilyAiHallVaultV1";
const KDF_ITERATIONS = 310000;
const LOCK_AFTER_MS = 15 * 60 * 1000;
const SHARED_RECORD_SOURCES = [
  ["note", "ai_hall_records/notes.json"],
  ["decision", "ai_hall_records/decisions.json"],
  ["assignment", "ai_hall_records/assignments.json"],
  ["status", "ai_hall_records/status_updates.json"]
];
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const state = { key: null, vault: null, timer: null, failures: 0, blockedUntil: 0 };
const $ = id => document.getElementById(id);

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function randomBytes(length) {
  return crypto.getRandomValues(new Uint8Array(length));
}

async function deriveKey(password, salt, iterations = KDF_ITERATIONS) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptVault(vault, key, salt) {
  const iv = randomBytes(12);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(vault)));
  return { format: "scrap-radar-family-ai-hall", version: 1, kdf: "PBKDF2-SHA-256", iterations: KDF_ITERATIONS, salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(ciphertext)) };
}

async function decryptVault(container, password) {
  validateContainer(container);
  const salt = base64ToBytes(container.salt);
  const key = await deriveKey(password, salt, container.iterations);
  const clear = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(container.iv) }, key, base64ToBytes(container.ciphertext));
  const vault = JSON.parse(decoder.decode(clear));
  validatePrivateVault(vault);
  return { vault, key };
}

function validatePrivateVault(vault) {
  if (!vault || vault.owner !== "Scrap Radar Family" || typeof vault.createdAt !== "string" || !Array.isArray(vault.records)) throw new Error("Invalid vault content");
  const allowedTypes = new Set(["note", "decision", "assignment", "status"]);
  const allowedStatuses = new Set(["open", "in-progress", "blocked", "done"]);
  const allowedPriorities = new Set(["low", "normal", "high"]);
  const ids = new Set();
  vault.records.forEach(record => {
    if (!record || typeof record !== "object" || typeof record.id !== "string" || !record.id || ids.has(record.id)) throw new Error("Invalid private record ID");
    ids.add(record.id);
    if (!allowedTypes.has(record.type) || !allowedStatuses.has(record.status) || !allowedPriorities.has(record.priority)) throw new Error("Invalid private record category");
    ["title", "author", "details", "createdAt"].forEach(field => {
      if (typeof record[field] !== "string" || !record[field].trim()) throw new Error(`Invalid private record ${field}`);
    });
    if (record.assignee !== undefined && typeof record.assignee !== "string") throw new Error("Invalid private record assignee");
    if (record.updatedAt !== undefined && typeof record.updatedAt !== "string") throw new Error("Invalid private record update time");
  });
}

function validateContainer(container) {
  if (!container || container.format !== "scrap-radar-family-ai-hall" || container.version !== 1 || container.kdf !== "PBKDF2-SHA-256") throw new Error("Not an AI Hall backup");
  if (container.iterations !== KDF_ITERATIONS) throw new Error("Unsupported key settings");
  ["salt", "iv", "ciphertext"].forEach(field => { if (typeof container[field] !== "string" || !container[field]) throw new Error("Incomplete vault"); });
}

function readContainer() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) { return { invalid: true }; }
}

async function persistVault() {
  if (!state.key || !state.vault) return;
  const existing = readContainer();
  const salt = existing && existing.salt ? base64ToBytes(existing.salt) : randomBytes(16);
  const container = await encryptVault(state.vault, state.key, salt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(container));
}

function setStatus(element, message, error = false) {
  element.textContent = message;
  element.classList.toggle("error", error);
}

function configureGate() {
  const exists = Boolean(localStorage.getItem(STORAGE_KEY));
  $("confirmLabel").hidden = exists;
  $("confirmInput").hidden = exists;
  $("confirmInput").required = !exists;
  $("setupHelp").hidden = exists;
  $("gateTitle").textContent = exists ? "The hall is locked" : "Secure the AI Hall";
  $("gateMessage").textContent = exists
    ? "Enter the device password to open the Hall. It protects only this browser’s optional private notes; shared records come from the repository."
    : "Create a device password for optional private notes. Shared Hall Records remain repository-backed and are not encrypted by this password.";
  $("unlockButton").textContent = exists ? "Unlock AI Hall" : "Create secure hall";
}

async function handleUnlock(event) {
  event.preventDefault();
  const now = Date.now();
  if (now < state.blockedUntil) {
    setStatus($("gateStatus"), `Please wait ${Math.ceil((state.blockedUntil - now) / 1000)} seconds before trying again.`, true);
    return;
  }
  const password = $("passwordInput").value;
  const container = readContainer();
  if (!container) {
    if (password.length < 10) return setStatus($("gateStatus"), "Use at least 10 characters.", true);
    if (password !== $("confirmInput").value) return setStatus($("gateStatus"), "The passwords do not match.", true);
    const salt = randomBytes(16);
    state.key = await deriveKey(password, salt);
    state.vault = { owner: "Scrap Radar Family", createdAt: new Date().toISOString(), records: [] };
    const encrypted = await encryptVault(state.vault, state.key, salt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
    openHall();
    return;
  }
  try {
    const unlocked = await decryptVault(container, password);
    state.key = unlocked.key;
    state.vault = unlocked.vault;
    state.failures = 0;
    openHall();
  } catch (_) {
    state.failures += 1;
    if (state.failures >= 5) {
      state.blockedUntil = Date.now() + 30000;
      state.failures = 0;
      setStatus($("gateStatus"), "Too many attempts. The door is paused for 30 seconds.", true);
    } else setStatus($("gateStatus"), "That password did not unlock this hall.", true);
  }
}

function openHall() {
  $("passwordInput").value = "";
  $("confirmInput").value = "";
  $("gate").hidden = true;
  $("hall").hidden = false;
  $("lockButton").hidden = false;
  resetLockTimer();
  renderRecords();
  loadSharedRecords();
  $("recordTitle").focus();
}

async function loadSharedRecords() {
  const status = $("sharedStatus");
  try {
    const groups = await Promise.all(SHARED_RECORD_SOURCES.map(async ([expectedType, path]) => {
      const response = await fetch(path, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error(`${path} returned ${response.status}`);
      const document = await response.json();
      if (!document || document.schemaVersion !== 1 || !Array.isArray(document.records)) throw new Error(`${path} has an invalid structure`);
      return document.records.map(record => ({ ...record, type: expectedType }));
    }));
    const records = groups.flat().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    renderSharedRecords(records);
    setStatus(status, `${records.length} shared repository record${records.length === 1 ? "" : "s"} loaded.`);
  } catch (error) {
    renderSharedRecords([]);
    setStatus(status, `Shared records could not be loaded: ${error.message}. Serve the repository over HTTP rather than opening this file directly.`, true);
  }
}

function renderSharedRecords(records) {
  const list = $("sharedRecordList");
  list.replaceChildren();
  records.forEach(record => list.appendChild(buildSharedRecordCard(record)));
  $("sharedEmptyState").hidden = records.length > 0;
  $("sharedCount").textContent = records.length;
}

function buildSharedRecordCard(record) {
  const card = document.createElement("article");
  card.className = "record-card shared-record-card";
  card.dataset.type = record.type;
  const top = document.createElement("div"); top.className = "record-top";
  const title = document.createElement("h3"); title.textContent = record.title;
  const type = document.createElement("span"); type.className = "badge"; type.textContent = labelFor(record.type);
  const status = document.createElement("span"); status.className = "badge status-badge"; status.dataset.status = record.status; status.textContent = record.status.replace("-", " ");
  top.append(title, type, status);
  const details = document.createElement("p"); details.className = "record-details"; details.textContent = record.details;
  const meta = document.createElement("div"); meta.className = "record-meta";
  const pieces = [`By ${record.author}`, formatDate(record.createdAt), `${record.priority} priority`, `ID ${record.id}`];
  if (record.assignee) pieces.push(`Assigned to ${record.assignee}`);
  if (record.updatedAt) pieces.push(`Updated ${formatDate(record.updatedAt)}`);
  meta.textContent = pieces.join(" • ");
  card.append(top, details, meta);
  return card;
}

function lockHall() {
  purgePrivateWorkspace();
  state.key = null;
  state.vault = null;
  clearTimeout(state.timer);
  $("hall").hidden = true;
  $("lockButton").hidden = true;
  $("gate").hidden = false;
  setStatus($("gateStatus"), "Hall locked. Decrypted records were cleared from this session.");
  configureGate();
  $("passwordInput").focus();
}

function purgePrivateWorkspace() {
  $("recordList").replaceChildren();
  $("recordForm").reset();
  $("recordTitle").value = "";
  $("recordAuthor").value = "";
  $("recordAssignee").value = "";
  $("recordDetails").value = "";
  $("searchRecords").value = "";
  $("filterType").value = "all";
  $("allCount").textContent = "0";
  $("openCount").textContent = "0";
  $("emptyState").hidden = false;
  setStatus($("saveStatus"), "");
  setStatus($("vaultStatus"), "");
}

function resetLockTimer() {
  if (!state.key) return;
  clearTimeout(state.timer);
  state.timer = setTimeout(lockHall, LOCK_AFTER_MS);
}

function labelFor(type) {
  return { note: "Project note", decision: "Decision", assignment: "Assignment", status: "Status update" }[type] || "Record";
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Unknown date" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function makeButton(text, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.className = className || "";
  button.addEventListener("click", onClick);
  return button;
}

function renderRecords() {
  if (!state.vault) return;
  const filter = $("filterType").value;
  const query = $("searchRecords").value.trim().toLocaleLowerCase();
  const records = state.vault.records.slice().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  const visible = records.filter(record => (filter === "all" || record.type === filter) && (!query || [record.title, record.details, record.author, record.assignee].join(" ").toLocaleLowerCase().includes(query)));
  const list = $("recordList");
  list.replaceChildren();
  visible.forEach(record => list.appendChild(buildRecordCard(record)));
  $("emptyState").hidden = visible.length > 0;
  $("allCount").textContent = records.length;
  $("openCount").textContent = records.filter(record => record.status !== "done").length;
}

function buildRecordCard(record) {
  const card = document.createElement("article");
  card.className = "record-card";
  card.dataset.type = record.type;
  const top = document.createElement("div"); top.className = "record-top";
  const title = document.createElement("h3"); title.textContent = record.title;
  const type = document.createElement("span"); type.className = "badge"; type.textContent = labelFor(record.type);
  const status = document.createElement("span"); status.className = "badge status-badge"; status.dataset.status = record.status; status.textContent = record.status.replace("-", " ");
  top.append(title, type, status);
  const details = document.createElement("p"); details.className = "record-details"; details.textContent = record.details;
  const meta = document.createElement("div"); meta.className = "record-meta";
  const pieces = [`Posted by ${record.author}`, formatDate(record.createdAt), `${record.priority} priority`];
  if (record.assignee) pieces.push(`Assigned to ${record.assignee}`);
  meta.textContent = pieces.join(" • ");
  const actions = document.createElement("div"); actions.className = "record-actions";
  if (record.status !== "done") actions.appendChild(makeButton("Mark done", "", () => updateRecordStatus(record.id, "done")));
  else actions.appendChild(makeButton("Reopen", "", () => updateRecordStatus(record.id, "open")));
  actions.appendChild(makeButton("Delete", "delete", () => deleteRecord(record.id)));
  card.append(top, details, meta, actions);
  return card;
}

async function handleRecordSubmit(event) {
  event.preventDefault();
  const record = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${bytesToBase64(randomBytes(8))}`,
    type: $("recordType").value,
    title: $("recordTitle").value.trim(),
    author: $("recordAuthor").value.trim(),
    assignee: $("recordAssignee").value.trim(),
    details: $("recordDetails").value.trim(),
    status: $("recordStatus").value,
    priority: $("recordPriority").value,
    createdAt: new Date().toISOString()
  };
  if (!record.title || !record.author || !record.details) return;
  state.vault.records.push(record);
  await persistVault();
  event.currentTarget.reset();
  renderRecords();
  setStatus($("saveStatus"), "Private note encrypted on this device. It was not added to Shared Hall Records.");
}

async function updateRecordStatus(id, status) {
  const record = state.vault.records.find(item => item.id === id);
  if (!record) return;
  record.status = status;
  record.updatedAt = new Date().toISOString();
  await persistVault();
  renderRecords();
}

async function deleteRecord(id) {
  if (!confirm("Permanently delete this hall record?")) return;
  state.vault.records = state.vault.records.filter(item => item.id !== id);
  await persistVault();
  renderRecords();
}

function exportVault() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const blob = new Blob([raw], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `scrap-radar-family-ai-hall-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  setStatus($("vaultStatus"), "Encrypted backup exported. It still requires the hall password.");
}

async function importVault(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) return setStatus($("vaultStatus"), "Backup is larger than the 5 MB safety limit.", true);
  try {
    const imported = JSON.parse(await file.text());
    validateContainer(imported);
    const password = prompt("Enter the password for this backup. The current vault will not be changed unless the backup decrypts and validates successfully.");
    if (password === null) return;
    const verified = await decryptVault(imported, password);
    if (!confirm("Replace this device’s current encrypted hall with the imported backup?")) return;
    installVerifiedImport(imported, verified);
    setStatus($("vaultStatus"), "Backup authenticated, validated, and imported. The previous vault was preserved until this backup unlocked successfully.");
  } catch (_) { setStatus($("vaultStatus"), "Import rejected. The backup could not be decrypted and validated; your current vault was not changed.", true); }
}

function installVerifiedImport(container, verified) {
  validateContainer(container);
  validatePrivateVault(verified.vault);
  if (!verified.key) throw new Error("Imported vault is not unlocked");
  const previous = localStorage.getItem(STORAGE_KEY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(container));
    state.key = verified.key;
    state.vault = verified.vault;
    openHall();
  } catch (error) {
    if (previous === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, previous);
    state.key = null;
    state.vault = null;
    purgePrivateWorkspace();
    throw error;
  }
}

function resetVault() {
  if (!confirm("Erase every AI Hall record stored on this device? Export a backup first if needed.")) return;
  if (!confirm("This cannot be undone. Erase the local hall now?")) return;
  localStorage.removeItem(STORAGE_KEY);
  lockHall();
  setStatus($("gateStatus"), "Local hall erased. Choose a new password to begin again.");
}

$("unlockForm").addEventListener("submit", event => { handleUnlock(event).catch(() => setStatus($("gateStatus"), "The secure vault is unavailable in this browser.", true)); });
$("togglePassword").addEventListener("click", () => {
  const showing = $("passwordInput").type === "text";
  $("passwordInput").type = showing ? "password" : "text";
  $("confirmInput").type = showing ? "password" : "text";
  $("togglePassword").textContent = showing ? "Show" : "Hide";
  $("togglePassword").setAttribute("aria-label", showing ? "Show password" : "Hide password");
});
$("lockButton").addEventListener("click", lockHall);
$("recordForm").addEventListener("submit", event => { handleRecordSubmit(event).catch(() => setStatus($("saveStatus"), "Record could not be encrypted.", true)); });
$("filterType").addEventListener("change", renderRecords);
$("searchRecords").addEventListener("input", renderRecords);
$("exportButton").addEventListener("click", exportVault);
$("importInput").addEventListener("change", importVault);
$("resetButton").addEventListener("click", resetVault);
["pointerdown", "keydown"].forEach(name => document.addEventListener(name, resetLockTimer, { passive: true }));
document.addEventListener("visibilitychange", () => { if (document.hidden && state.key) resetLockTimer(); });

if (!window.crypto || !window.crypto.subtle) {
  $("unlockButton").disabled = true;
  setStatus($("gateStatus"), "This browser cannot provide the encryption required by AI Hall.", true);
} else configureGate();
