# AI Hall shared records

This directory is the shared, repository-backed meeting table for **Scrap Radar Family**. It is independent from Board Sense. Jerry, Maya, Gemini, Cassidy, and future AI helpers who can contribute to this repository can read and update the same records through commits or pull requests.

## Files

- `notes.json` — durable project context, evidence, and discoveries.
- `decisions.json` — decisions and their reasoning.
- `assignments.json` — work owners and current assignment state.
- `status_updates.json` — project and system progress reports.

Each document has `schemaVersion`, `recordType`, and a `records` array. Every record requires:

- `id`: unique lowercase identifier using letters, numbers, and hyphens.
- `title`: concise summary.
- `details`: complete context another helper needs.
- `author`: human or AI contributor name.
- `createdAt`: UTC ISO 8601 timestamp, such as `2026-09-21T15:30:00Z`.
- `status`: `open`, `in-progress`, `blocked`, or `done`.
- `priority`: `low`, `normal`, or `high`.
- `assignee`: required string for assignments; optional for other records.
- `updatedAt`: optional UTC ISO 8601 timestamp, required whenever an existing record is changed.

## Contributor workflow

1. Read all four files before changing the meeting record.
2. Add or update the record in the matching file. Never reuse an ID.
3. Preserve authorship. Set `updatedAt` when editing an existing record.
4. Run `python tests/validate_ai_hall_records.py`.
5. Commit the record update or submit it in a pull request.

Do not put passwords, API keys, tokens, personal secrets, or encrypted private-device exports in this directory. Repository access and its review workflow control collaboration. The web interface reads these committed files; it does not claim that browser-local notes are shared or that a client-side password protects direct access to repository files.

## Hall identities and authority

- **Jerry** is the owner and final decision-maker.
- **Maya** reviews and routes guest submissions.
- **Gemini** is an AI collaborator.
- **Cassidy** is the AI collaborator sponsored by Casey Clark. Her Hall ID is `cassidy-ai`.
- **Casey Clark** is the human Guest Contributor at the read-only Guest Question Door. Casey and Cassidy are separate identities and must never share an account, credential, or authority record.

A roster entry documents a role; it does not create a GitHub account or grant access. Cassidy may read public Shared Hall Records and propose changes through the repository review path when separately authorized. She has no access to passwords, private-device notes, owner or administrator controls, billing, Railway, deployments, approvals, merging, or final decisions. Jerry must approve any future account or integration separately and give it only the minimum access needed.

Cassidy’s public Proposal Door routes questions, ideas, research findings, suggested changes, and security observations to `.github/ISSUE_TEMPLATE/cassidy-proposal.yml`. Each issue begins **“Cassidy — awaiting review:”** and remains review material until Maya routes it and Jerry makes the final decision. The door does not authenticate an AI, create an account, edit these records, or grant repository permission.

## Guest contributor boundary

Casey Clark is listed as **Guest Contributor — Ideas & Questions**. Her read-only Guest Question Door routes questions, ideas, and reactions to `.github/ISSUE_TEMPLATE/casey-guest-question.yml` for Maya’s review. Guest submissions do not edit these records or grant access to code, private notes, passwords, administration, Railway, billing, approvals, or merging. Jerry remains owner and final decision-maker.

## Private-vault security checks

Run `node tests/test_ai_hall_security.js` to verify that locking purges decrypted private records and unfinished composer text from both memory and the DOM, and that an imported backup cannot replace the current vault until its password, authenticated ciphertext, and record data have all been verified.

Run `node tests/test_ai_hall_roster.js` to verify that Casey and Cassidy remain separate, that Cassidy's collaborator-only boundary is recorded, and that Casey's Guest Door stays the human guest route.

Run `node tests/test_cassidy_proposal_door.js` to verify Cassidy’s canonical proposal link, public-review warning, separate identity acknowledgement, and no-authority boundary.
