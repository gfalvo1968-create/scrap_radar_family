'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const home = fs.readFileSync('index.html', 'utf8');
const source = fs.readFileSync('script.js', 'utf8');

function fixture(initial = null, failWrite = false) {
  const nodes = {
    signalName: {value: ''}, signalMessage: {value: ''},
    signalStatus: {textContent: ''},
    'detect-name': {textContent: ''},
    'detect-message': {textContent: ''}
  };
  const wall = {
    children: [],
    replaceChildren() { this.children = []; },
    appendChild(item) { this.children.push(item); return item; }
  };
  nodes.signalWall = wall;
  const body = {children: [], appendChild(item) { this.children.push(item); return item; }};
  let value = initial;
  let writes = 0;
  let onload = null;
  const context = vm.createContext({
    localStorage: {
      getItem(key) { assert.equal(key, 'approvedRadarSignals'); return value; },
      setItem(key, next) {
        assert.equal(key, 'approvedRadarSignals');
        if (failWrite) throw new Error('Storage unavailable');
        value = next; writes++;
      }
    },
    document: {
      getElementById(id) { return nodes[id] || null; },
      createElement(tag) {
        return {tagName: tag, style: {}, textContent: '', remove() {}};
      },
      body
    },
    window: {addEventListener(name, callback) {
      if (name === 'load') onload = callback;
    }},
    setInterval() {},
    setTimeout() {},
    Math
  });
  vm.runInContext(source, context);
  assert.equal(typeof onload, 'function');
  onload();
  return {
    nodes, body, context, wall,
    get saved() { return value; },
    get writes() { return writes; },
    submit(name, message) {
      nodes.signalName.value = name;
      nodes.signalMessage.value = message;
      vm.runInContext('transmitSignal()', context);
    }
  };
}

test('homepage script never rotates back to Gerald', () => {
  assert.doesNotMatch(source, /Gerald Falvo/);
  assert.match(source, /Jerry Falvo/);
  const app = fixture();
  vm.runInContext('rotateDetectionFeed()', app.context);
  vm.runInContext('rotateDetectionFeed()', app.context);
  vm.runInContext('rotateDetectionFeed()', app.context);
  assert.equal(app.nodes['detect-name'].textContent, 'Jerry Falvo');
});

test('Signal Log explains browser-local storage and public Wall moderation', () => {
  assert.match(home, /Personal Signal Log/);
  assert.match(home, /saved only in this browser, not publicly transmitted/);
  assert.match(home, /submit for review/);
  assert.match(home, /href="hall\.html"/);
  assert.match(home, /Save Signal on This Device/);
  assert.match(home, /id="signalStatus" role="status"/);
});

test('new local entries save, render as text, and do not claim public submission', () => {
  const app = fixture();
  app.submit('Guest', '<script>alert(1)</script>');
  assert.equal(app.writes, 1);
  assert.equal(JSON.parse(app.saved)[0], 'Guest: <script>alert(1)</script>');
  assert.equal(app.wall.children[0].textContent, 'Guest: <script>alert(1)</script>');
  assert.equal(app.wall.children[0].innerHTML, undefined);
  assert.match(app.nodes.signalStatus.textContent, /Saved on this device only/);
  assert.equal(app.nodes.signalName.value, '');
  assert.equal(app.nodes.signalMessage.value, '');
});

test('malformed or legacy localStorage does not break homepage or duplicate defaults', () => {
  assert.equal(fixture('{not valid').wall.children[0].textContent,
    'No personal signals saved on this device yet.');
  const legacy = JSON.stringify([
    'Jerry Falvo: Built from imagination.',
    'Local: hello', 'Local: hello'
  ]);
  const app = fixture(legacy);
  assert.equal(app.wall.children.length, 1);
  assert.equal(app.wall.children[0].textContent, 'Local: hello');
  app.submit('Another', 'message');
  assert.deepEqual(JSON.parse(app.saved), ['Local: hello', 'Another: message']);
});

test('localStorage write failure and invalid inputs fail safely', () => {
  const unavailable = fixture(null, true);
  unavailable.submit('Guest', 'message');
  assert.match(unavailable.nodes.signalStatus.textContent, /could not save/);
  assert.equal(unavailable.wall.children.length, 1);
  assert.equal(unavailable.nodes.signalName.value, 'Guest');
  const invalid = fixture();
  invalid.submit('Guest', '');
  assert.equal(invalid.writes, 0);
  assert.match(invalid.nodes.signalStatus.textContent, /Please enter a name/);
});
