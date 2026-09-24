# Scrap Radar Family security boundaries

This file is the central security checklist for the Scrap Radar Family AI Hall, review board, and proposal doors. It records boundaries and tests, never passwords, tokens, recovery codes, encrypted exports, or other secrets.

## Identity and authority matrix

| Identity | Role | May do | Must not do |
| --- | --- | --- | --- |
| Jerry | Owner and final decision-maker | Approve final changes and control owner accounts | Share owner credentials |
| Maya | Reviewer and coordinator | Review guest submissions and route proposed work | Claim owner authority or expose secrets |
| Gemini | AI collaborator | Propose reviewed record or code changes | Administer, deploy, approve, merge, or make final decisions without separate authority |
| Cassidy (`cassidy-ai`) | AI collaborator sponsored by Casey Clark | Read public Shared Hall Records and propose reviewed changes when separately authorized | Access passwords, private-device notes, owner/admin controls, billing, Railway, deployments, approvals, merging, or final decisions |
| Casey Clark | Human Guest Contributor | Submit questions, ideas, and reactions through the Guest Question Door | Edit shared records or access code, private notes, passwords, administration, Railway, billing, approvals, or merging |

Casey Clark and Cassidy are separate identities. They must not share an account, password, token, recovery method, or authority record. A name shown in the Hall is documentation only; it does not create an account or grant GitHub, Railway, billing, deployment, or administrative access.

## Data locations

- The GitHub repository, GitHub Pages site, Guest Question Door, issue submissions, and `ai_hall_records/` are public. Never place secrets or private personal information in them.
- The Incoming Review Board makes unauthenticated `GET` requests for public issue metadata from `api.github.com`. It must never contain, request, store, or transmit a GitHub token, and it must never call a GitHub write endpoint.
- Shared Hall Records change only through repository commits or pull requests.
- Optional Private Device Notes are encrypted in that browser with AES-GCM. The browser password protects only that local vault; it is not server-side authentication and does not hide public repository files.
- The device password cannot be recovered. The locked-door reset requires two confirmations and may remove only this browser's encrypted local vault; it must not change Shared Hall Records, GitHub issues, repository files, accounts, or permissions.
- Locking the Hall must remove decrypted records, unfinished note text, and search text from memory and the page.
- A backup import must authenticate, decrypt, and validate completely before it can replace the current local vault.

## Review and incident rules

1. Read the proposed diff before merging.
2. Reject any contribution containing a password, token, billing detail, private note, or other secret; rotate an exposed credential outside the repository.
3. Keep guest submissions in the review queue. A guest issue is not permission to edit, deploy, approve, or merge.
4. A Cassidy proposal issue is review material only. It does not authenticate Cassidy, grant repository access, or authorize a change, deployment, approval, or merge.
5. Treat every issue title, body, label, username, and URL as untrusted input. Render text with DOM text nodes and allow direct links only to this repository's numbered GitHub issues.
6. Give every future account a unique identity and the minimum access required. Do not reuse Jerry's or Casey's credentials.
7. Jerry makes the final decision on membership, permissions, deployments, and merges.

## Required checks

Run these before merging AI Hall or Guest Door changes:

```sh
python tests/validate_ai_hall_records.py
node tests/test_ai_hall_security.js
node tests/test_ai_hall_roster.js
node tests/test_guest_question_door.js
node tests/test_cassidy_proposal_door.js
node tests/test_ai_hall_review_board.js
```
