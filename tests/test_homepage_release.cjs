const fs = require("node:fs");
const assert = require("node:assert/strict");

const home = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("style.css", "utf8");
const casePage = fs.readFileSync("board_sense_case.html", "utf8");

const tests = [
  ["public homepage identifies Jerry", () => {
    assert.match(home, /id="detect-name">Jerry Falvo<\/div>/);
    assert.doesNotMatch(home, /Gerald Falvo/);
  }],
  ["ordinary Board Sense and Scrap Radar navigation remain", () => {
    assert.match(home, /href="board_sense_case\.html"/);
    assert.match(home, /href="scrap_radar\.html"/);
    assert.match(home, /<script src="script\.js\?v=signal-local-3"><\/script>/);
  }],
  ["public homepage has no tester access or client secret lookup", () => {
    assert.doesNotMatch(home, /mainTesterDoor|boardSenseTesterKeyV1|tester=1|localStorage/);
  }],
  ["iPad account link is styled like a real portal and decorative effects cannot intercept taps", () => {
    assert.match(home, /href="account\.html" class="portal account-btn"/);
    assert.match(home, /href="style\.css\?v=preview-mobile-3"/);
    assert.match(css, /\.account-btn\s*\{/);
    assert.match(css, /\.signal-popup\s*\{[^}]*pointer-events:none/s);
    assert.match(css, /max-width:min\(260px,calc\(100vw - 24px\)\)/);
  }],
  ["private tester path functionality remains on case page for authorized team", () => {
    assert.match(casePage, /boardSenseTesterKeyV1/);
    assert.match(casePage, /installTesterAccess/);
  }],
  ["homepage explains preview limitations and explicitly excludes paid access", () => {
    assert.match(home, /id="publicPreviewStatus"/);
    assert.match(home, /Public preview checks are underway/);
    assert.match(home, /not guaranteed yard offers/);
    assert.match(home, /manual review/);
    assert.match(home, /Paid subscriptions are not open/);
    assert.match(css, /\.preview-note\s*\{/);
  }],
];

for (const [name, fn] of tests) {
  fn();
  console.log("PASS", name);
}
console.log(`Completed ${tests.length} homepage release-hygiene checks.`);
