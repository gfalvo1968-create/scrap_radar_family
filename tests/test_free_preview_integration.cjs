'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');

const home = fs.readFileSync('index.html', 'utf8');
const casePage = fs.readFileSync('board_sense_case.html', 'utf8');
const caseTray = fs.readFileSync('board_case_tray.js', 'utf8');
const allowance = fs.readFileSync('board_free_allowance.js', 'utf8');

assert.match(home, /id="detect-name">Jerry Falvo/);
assert.doesNotMatch(home, /mainTesterDoor|boardSenseTesterKeyV1|tester=1/);
assert.match(home, /Public preview checks are underway/);
assert.match(home, /Paid subscriptions are not open/);
assert.match(home, /href="scrap_radar\.html"/);
assert.match(home, /href="board_sense_case\.html"/);

assert.match(casePage, /board_case_tray\.js\?v=25/);
assert.match(casePage, /board_free_allowance\.js\?v=1/);
assert.match(casePage, /installTesterAccess/);
assert.match(caseTray, /function caseObjectBlock\(/);
assert.match(caseTray, /Case paused: same-board identity is uncertain\. Review the evidence below/);
assert.doesNotMatch(caseTray, /Case paused: same-board identity is uncertain\. Confirm it above/);
assert.match(caseTray, /Scrap Radar handoff were withheld/);

assert.match(allowance, /https:\/\/boardsense\.scrapradarfamily\.com\/free-usage/);
assert.match(allowance, /method: 'GET', credentials: 'omit'/);
assert.doesNotMatch(allowance, /fetch\([^)]*\/analyze/);
console.log('Combined preview homepage + case identity + read-only allowance integration passed.');
