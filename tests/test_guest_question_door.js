"use strict";

const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("guest_question_door.html", "utf8");
const issueLink = html.match(/<a\s+[^>]*id="guestIssueLink"[^>]*>/);

assert.ok(issueLink, "Guest Question Door must contain its GitHub Issue link");
const anchor = issueLink[0];
const expectedUrl = "https://github.com/gfalvo1968-create/scrap_radar_family/issues/new?template=casey-guest-question.yml";
assert.match(anchor, new RegExp(`\\bhref="${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
assert.match(anchor, /\btarget="_blank"/);

const rel = anchor.match(/\brel="([^"]*)"/);
assert.ok(rel, "External Issue link must define a rel attribute");
const relTokens = new Set(rel[1].split(/\s+/));
assert.ok(relTokens.has("noopener"), "External Issue link must prevent opener access");
assert.ok(relTokens.has("noreferrer"), "External Issue link must suppress referrer data");

assert.ok(
  !html.includes('src="guest_question_door.js"'),
  "Location-dependent JavaScript must not replace the canonical Issue URL"
);

console.log("Guest Question Door uses the canonical safe GitHub Issue form link.");
