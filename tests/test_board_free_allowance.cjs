'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseUsage, usageText, readAllowance, install
} = require('../board_free_allowance.js');

function response(used, limit = 1) {
  return {
    status: 'success',
    free_usage: {
      allowed: used < limit,
      visitor_id: 'anonymous-hash-not-for-display',
      used_today: used,
      remaining: limit - used,
      limit,
      day_utc: '2026-11-22',
      reason: used < limit ? 'free_board_available' : 'daily_free_board_limit_reached'
    }
  };
}

test('zero remaining after daily public free case is used', () => {
  const u = parseUsage(response(1));
  assert.deepEqual(u, {used: 1, remaining: 0, limit: 1, day: '2026-11-22'});
  assert.match(usageText(u), /0 of 1 remaining/);
  assert.match(usageText(u), /return tomorrow/i);
});

test('available daily case is described as one physical board with multiple photos', () => {
  const u = parseUsage(response(0));
  assert.match(usageText(u), /1 of 1 remaining/);
  assert.match(usageText(u), /2–6 photos/);
});

test('rejects contradictory, missing or malformed quota responses', () => {
  const invalid = [
    null, {}, {status: 'temporarily_unavailable'},
    {status: 'success', free_usage: {}},
    {...response(0), free_usage: {...response(0).free_usage, allowed: false}},
    {...response(1), free_usage: {...response(1).free_usage, remaining: 1}},
    {...response(0), free_usage: {...response(0).free_usage, used_today: '0'}},
    {...response(0), free_usage: {...response(0).free_usage, limit: -1}},
    {...response(0), free_usage: {...response(0).free_usage, day_utc: '<script>'}},
  ];
  for (const candidate of invalid) {
    assert.throws(() => parseUsage(candidate), /Unexpected free-usage response/);
  }
});

test('non-consuming GET does not send credentials, files or tester key', async () => {
  const calls = [];
  const usage = await readAllowance((url, init) => {
    calls.push({url, init});
    return Promise.resolve({ok: true, json: () => Promise.resolve(response(1))});
  });
  assert.equal(usage.remaining, 0);
  assert.deepEqual(calls, [{
    url: 'https://boardsense.scrapradarfamily.com/free-usage',
    init: {method: 'GET', credentials: 'omit', cache: 'no-store', redirect: 'error'}
  }]);
});

test('network and backend errors remain unknown and never imply free quota', async () => {
  await assert.rejects(readAllowance(() => Promise.reject(new Error('network down'))), /network down/);
  await assert.rejects(readAllowance(() => Promise.resolve({
    ok: false, json: () => Promise.resolve(response(0))
  })), /Allowance lookup unavailable/);
  await assert.rejects(readAllowance(() => Promise.resolve({
    ok: true, json: () => Promise.resolve({status: 'temporarily_unavailable'})
  })), /Unexpected free-usage response/);
});

function fakeDom() {
  class Element {
    constructor(tag) {
      this.tagName = tag;
      this.children = [];
      this.handlers = {};
      this.style = {};
      this.textContent = '';
    }
    setAttribute(key, value) { this[key] = value; }
    appendChild(child) { this.children.push(child); return child; }
    addEventListener(name, fn) { this.handlers[name] = fn; }
    insertBefore(child, ref) {
      const index = this.children.indexOf(ref);
      assert.notEqual(index, -1);
      this.children.splice(index, 0, child);
    }
  }
  const main = new Element('section');
  const tray = new Element('div');
  main.appendChild(tray);
  tray.parentNode = main;
  const photo = {closest: selector => selector === '.side-box' ? tray : null};
  const find = (node, id) => {
    if (node.id === id) return node;
    for (const child of node.children || []) {
      const result = find(child, id);
      if (result) return result;
    }
    return null;
  };
  return {
    createElement: tag => new Element(tag),
    getElementById: id => id === 'casePhotos' ? photo : find(main, id)
  };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('dashboard panel installs once and refresh button updates read-only status', async () => {
  const document = fakeDom();
  let used = 1, requests = 0;
  const win = {fetch: () => {
    requests++;
    return Promise.resolve({ok: true, json: () => Promise.resolve(response(used))});
  }};
  assert.equal(install(document, win), true);
  await flush();
  const result = document.getElementById('boardSenseFreeAllowanceText');
  assert.match(result.textContent, /0 of 1 remaining/);
  assert.equal(install(document, win), false);
  const refresh = document.getElementById('boardSenseFreeAllowanceRefresh');
  used = 0;
  refresh.handlers.click();
  await flush();
  assert.match(result.textContent, /1 of 1 remaining/);
  assert.equal(requests, 2);
  assert.equal(refresh.disabled, false);
});

test('dashboard panel shows an honest unavailable state after GET outage', async () => {
  const document = fakeDom();
  const win = {fetch: () => Promise.reject(Error('no network'))};
  assert.equal(install(document, win), true);
  await flush();
  assert.match(document.getElementById('boardSenseFreeAllowanceText').textContent,
    /temporarily unavailable/i);
  assert.match(document.getElementById('boardSenseFreeAllowanceText').textContent,
    /did not use a scan/i);
  assert.equal(document.getElementById('boardSenseFreeAllowanceRefresh').disabled, false);
});
