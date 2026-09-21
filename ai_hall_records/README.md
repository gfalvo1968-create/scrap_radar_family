# AI Hall shared records

This directory is the shared, repository-backed meeting table for **Scrap Radar Family**. It is independent from Board Sense. Jerry, Maya, Gemini, and future AI helpers who can contribute to this repository can read and update the same records through commits or pull requests.

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

## Guest contributor boundary

Casey Clark is listed as **Guest Contributor — Ideas & Questions**. Her read-only Guest Question Door routes questions, ideas, and reactions to `.github/ISSUE_TEMPLATE/casey-guest-question.yml` for Maya’s review. Guest submissions do not edit these records or grant access to code, private notes, passwords, administration, Railway, billing, approvals, or merging. Jerry remains owner and final decision-maker.
