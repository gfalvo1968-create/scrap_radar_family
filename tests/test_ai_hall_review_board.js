"use strict";

const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const { webcrypto } = require("crypto");

const html = fs.readFileSync("ai_hall.html", "utf8");
const source = fs.readFileSync("ai_hall.js", "utf8");
const guide = fs.readFileSync("ai_hall_records/README.md", "utf8");
const security = fs.readFileSync("SECURITY.md", "utf8");

class MockElement {
  constructor(tag, elements) {
    this.tag = tag;
    this.elements = elements;
    this.value = "";
    this.textContent = "";
    this.hidden = false;
    this.disabled = false;
    this.children = [];
    this.files = [];
    this.dataset = {};
    this.className = "";
    this.classList = { add() {}, toggle() {} };
  }
  addEventListener() {}
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
  setAttribute() {}
  focus() {}
  click() {}
  reset() {}
}

function issue(overrides) {
  return {
    number: 4,
    title: "Casey Clark — awaiting review:",
    body: "### Subject\n\nWhat should I expect?\n\n### Question, idea, or reaction\n\nPlease explain the family programs.",
    state: "open",
    html_url: "https://github.com/gfalvo1968-create/scrap_radar_family/issues/4",
    created_at: "2026-09-23T18:00:00Z",
    updated_at: "2026-09-23T18:00:00Z",
    comments: 1,
    user: { login: "449y526zp4-ops" },
    labels: [{ name: "awaiting-review" }],
    ...overrides
  };
}

function makeHarness(reviewIssues) {
  const elements = new Proxy({}, {
    get(target, id) {
      if (!target[id]) target[id] = new MockElement(id, elements);
      return target[id];
    }
  });
  const fetchCalls = [];
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
    URL,
    crypto: webcrypto,
    window: { crypto: webcrypto },
    document: {
      hidden: false,
      getElementById: id => elements[id],
      createElement: tag => new MockElement(tag, elements),
      addEventListener() {}
    },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    btoa: value => Buffer.from(value, "binary").toString("base64"),
    atob: value => Buffer.from(value, "base64").toString("binary"),
    fetch: async (url, options) => {
      fetchCalls.push({ url, options });
      if (String(url).startsWith("https://api.github.com/")) return { ok: true, json: async () => reviewIssues };
      return { ok: true, json: async () => ({ schemaVersion: 1, records: [] }) };
    },
    confirm: () => true,
    prompt: () => null,
    setTimeout: () => 1,
    clearTimeout() {},
    console,
    Blob
  };
  vm.createContext(context);
  vm.runInContext(source + "\n;globalThis.testApi={REVIEW_QUEUE_API,REVIEW_PREFIXES,classifyReviewIssues,extractIssueSection,safeGitHubIssueUrl,loadReviewQueue};", context);
  return { api: context.testApi, elements, fetchCalls };
}

function descendants(element) {
  return [element, ...element.children.flatMap(descendants)];
}

(async () => {
  const casey = issue({ number: 4 });
  const cassidy = issue({
    number: 7,
    title: "Cassidy — awaiting review: Proposal Door routing test",
    body: "### Subject\n\nRouting test\n\n### Cassidy’s proposal\n\nConfirm the review-only route.",
    html_url: "https://github.com/gfalvo1968-create/scrap_radar_family/issues/7",
    comments: 0,
    user: { login: "gfalvo1968-create" },
    created_at: "2026-09-24T18:17:45Z",
    updated_at: "2026-09-24T18:17:45Z"
  });
  const excluded = [
    issue({ number: 8, state: "closed" }),
    issue({ number: 9, title: "Cassidy — awaiting review: pull request", pull_request: {} }),
    issue({ number: 10, title: "Unrelated issue" })
  ];
  const { api, elements, fetchCalls } = makeHarness([casey, cassidy, ...excluded]);

  const grouped = api.classifyReviewIssues([casey, cassidy, ...excluded]);
  assert.deepStrictEqual(Array.from(grouped.casey, item => item.number), [4]);
  assert.deepStrictEqual(Array.from(grouped.cassidy, item => item.number), [7]);
  assert.strictEqual(api.extractIssueSection(casey.body, "Subject"), "What should I expect?");
  assert.strictEqual(api.safeGitHubIssueUrl(casey.html_url), casey.html_url);
  assert.strictEqual(api.safeGitHubIssueUrl("https://example.com/gfalvo1968-create/scrap_radar_family/issues/4"), "");
  assert.strictEqual(api.safeGitHubIssueUrl("https://github.com/another/repository/issues/4"), "");

  await api.loadReviewQueue();
  assert.strictEqual(fetchCalls.length, 1);
  assert.strictEqual(fetchCalls[0].url, api.REVIEW_QUEUE_API);
  assert.strictEqual(fetchCalls[0].options.method, "GET");
  assert.strictEqual(fetchCalls[0].options.credentials, "omit");
  assert.strictEqual(elements.caseyReviewCount.textContent, 1);
  assert.strictEqual(elements.cassidyReviewCount.textContent, 1);
  assert.strictEqual(elements.reviewCount.textContent, 2);
  assert.strictEqual(elements.caseyReviewList.children.length, 1);
  assert.strictEqual(elements.cassidyReviewList.children.length, 1);
  assert.strictEqual(elements.caseyReviewEmpty.hidden, true);
  assert.strictEqual(elements.cassidyReviewEmpty.hidden, true);

  const links = descendants(elements.cassidyReviewList.children[0]).filter(node => node.tag === "a");
  assert.strictEqual(links.length, 1);
  assert.strictEqual(links[0].href, cassidy.html_url);
  assert.strictEqual(links[0].target, "_blank");
  assert.strictEqual(links[0].rel, "noopener noreferrer");

  assert.match(html, /id="caseyReviewList"/);
  assert.match(html, /id="cassidyReviewList"/);
  assert.match(html, /connect-src 'self' https:\/\/api\.github\.com/);
  assert.ok(!source.includes("innerHTML"), "Issue content must be rendered with text nodes, not innerHTML");
  assert.ok(!source.includes("Authorization"), "The public review board must not send a GitHub credential");
  assert.match(guide, /board cannot post, comment, label, close, approve, deploy, merge, or change permissions/);
  assert.match(security, /must never contain, request, store, or transmit a GitHub token/);

  console.log("AI Hall Review Board keeps Casey and Cassidy separate and reads public GitHub issues without credentials or write access.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
