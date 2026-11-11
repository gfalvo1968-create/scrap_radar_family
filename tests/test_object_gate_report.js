const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'board_case_tray.js'), 'utf8');
const start = source.indexOf('function objectGateStopHTML(');
const end = source.indexOf('function tray(){', start);
assert.ok(start >= 0 && end > start, 'Object gate report function must be available');
const sandbox = {
  safe: value => String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
};
vm.runInNewContext(source.slice(start, end), sandbox);
const report = sandbox.objectGateStopHTML(
  { board_type: 'Unknown object', grade: 'N/A', confidence: 35 },
  { views: [
    { view_number: 1, board: 'front.jpeg', object_gate: { mode: 'board', board_likelihood: 82 } },
    { view_number: 2, board: 'chassis.jpeg', object_gate: { mode: 'unknown', label: 'Unknown object', board_likelihood: 42 } },
    { view_number: 3, board: '<unsafe>.jpg', object_gate: { mode: 'component', label: 'Speaker', board_likelihood: 15 } },
  ] }
);
assert.match(report, /Photo 2: chassis\.jpeg/);
assert.match(report, /PCB evidence score 42/);
assert.match(report, /Photo 3: &lt;unsafe&gt;\.jpg/);
assert.doesNotMatch(report, /Photo 1: front\.jpeg/);
assert.doesNotMatch(report, /<unsafe>/);
assert.match(report, /Scrap Radar handoff were withheld/);
console.log('Object gate per-view report smoke test passed');
