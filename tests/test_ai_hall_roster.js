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
assert.match(hall, /data-hall-id="cassidy-ai"[^>]*>[\s\S]*?<strong>Cassidy<\/strong>[\s\S]*?AI collaborator • Sponsored by Casey Clark[\s\S]*?No admin, deployment, approval, or merge authority/);
assert.match(hall, /data-hall-id="casey-clark-guest"[^>]*>[\s\S]*?Human Guest Contributor — Ideas &amp; Questions[\s\S]*?href="guest_question_door\.html"/);

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
