"use strict";

const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("cassidy_proposal_door.html", "utf8");
const hall = fs.readFileSync("ai_hall.html", "utf8");
const template = fs.readFileSync(".github/ISSUE_TEMPLATE/cassidy-proposal.yml", "utf8");
const security = fs.readFileSync("SECURITY.md", "utf8");
const issueLink = html.match(/<a\s+[^>]*id="cassidyIssueLink"[^>]*>/);

assert.ok(issueLink, "Cassidy Proposal Door must contain its GitHub Issue link");
const anchor = issueLink[0];
const expectedUrl = "https://github.com/gfalvo1968-create/scrap_radar_family/issues/new?template=cassidy-proposal.yml";
assert.match(anchor, new RegExp(`\\bhref="${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
assert.match(anchor, /\btarget="_blank"/);

const rel = anchor.match(/\brel="([^"]*)"/);
assert.ok(rel, "External Issue link must define a rel attribute");
const relTokens = new Set(rel[1].split(/\s+/));
assert.ok(relTokens.has("noopener"), "External Issue link must prevent opener access");
assert.ok(relTokens.has("noreferrer"), "External Issue link must suppress referrer data");

assert.ok(!html.includes('src="cassidy_proposal_door.js"'), "The canonical Issue URL must not be replaced by location-dependent JavaScript");
assert.match(template, /title: "Cassidy — awaiting review: "/);
assert.match(template, /proposal for review only and is not approval to change, deploy, or merge anything/);
assert.match(template, /Cassidy and Casey Clark are separate identities/);
assert.match(template, /passwords, tokens, API keys, billing information, private notes, personal secrets/);
assert.match(hall, /href="cassidy_proposal_door\.html"/);
assert.match(security, /Cassidy proposal issue is review material only/);

console.log("Cassidy Proposal Door uses the canonical safe review form and preserves collaborator boundaries.");
