"use strict";

const assert = require("assert");
const fs = require("fs");

const hall = fs.readFileSync("ai_hall.html", "utf8");
const guide = fs.readFileSync("ai_hall_records/README.md", "utf8");
const security = fs.readFileSync("SECURITY.md", "utf8");
const decisions = JSON.parse(fs.readFileSync("ai_hall_records/decisions.json", "utf8"));
const assignments = JSON.parse(fs.readFileSync("ai_hall_records/assignments.json", "utf8"));

assert.strictEqual((hall.match(/data-hall-id="cassidy-ai"/g) || []).length, 1, "Cassidy must have one unique Hall seat");
assert.strictEqual((hall.match(/data-hall-id="casey-clark-guest"/g) || []).length, 1, "Casey must have one distinct human guest seat");
assert.match(hall, /data-hall-id="cassidy-ai"[^>]*>[\s\S]*?<strong>Cassidy<\/strong>[\s\S]*?AI collaborator • Sponsored by Casey Clark[\s\S]*?Read-only Hall seat • Proposal-only route[\s\S]*?No admin, deployment, approval, or merge authority[\s\S]*?href="#cassidySeatTitle"/);
assert.match(hall, /data-hall-id="casey-clark-guest"[^>]*>[\s\S]*?Human Guest Contributor — Ideas &amp; Questions[\s\S]*?href="guest_question_door\.html"/);

assert.strictEqual((hall.match(/data-hall-seat="cassidy-ai"/g) || []).length, 1, "Cassidy must have one dedicated read-only Hall seat");
const cassidySeat = hall.match(/<section class="panel cassidy-seat" data-hall-seat="cassidy-ai"[\s\S]*?<\/section>\s*<\/div>\s*<\/section>/);
assert.ok(cassidySeat, "Cassidy's dedicated Hall seat must be present");
assert.match(cassidySeat[0], /<strong>Cassidy<\/strong> \(<code>cassidy-ai<\/code>\) is separate from Casey Clark/);
assert.match(cassidySeat[0], /does not create an account, sign Cassidy in, or grant repository permission/);
assert.match(cassidySeat[0], /Read public Shared Hall Records and the public review queue/);
assert.match(cassidySeat[0], /Open passwords, encrypted Private Device Notes, or owner controls/);
assert.match(cassidySeat[0], /Maya reviews and routes the proposal/);
assert.match(cassidySeat[0], /Jerry makes the final decision/);
assert.match(cassidySeat[0], /href="cassidy_proposal_door\.html"/);
assert.doesNotMatch(cassidySeat[0], /<(?:form|input|textarea|select|button)\b/i, "Cassidy's Hall seat must expose no write or credential controls");

const identityDecision = decisions.records.find(record => record.id === "decision-separate-casey-and-cassidy-identities");
assert.ok(identityDecision, "The Casey/Cassidy identity separation decision is required");
const cassidyAssignment = assignments.records.find(record => record.id === "assignment-cassidy-reviewed-collaboration");
assert.ok(cassidyAssignment, "Cassidy's review-only assignment is required");
assert.strictEqual(cassidyAssignment.assignee, "Cassidy");

const boundaryText = [identityDecision.details, cassidyAssignment.details, guide, security].join(" ").toLowerCase();
for (const boundary of ["password", "private-device notes", "billing", "railway", "deployment", "approval", "merging", "final decision"]) {
  assert.ok(boundaryText.includes(boundary), `Cassidy boundary must cover ${boundary}`);
}
assert.match(security, /Casey Clark and Cassidy are separate identities/);
assert.match(security, /documentation only; it does not create an account or grant GitHub/);

console.log("AI Hall roster tests passed: Cassidy is separate from Casey and remains collaborator-only.");
