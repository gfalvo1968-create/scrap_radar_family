# Signal Day: Public Visitor and Security Audit

**Checked:** 2026-11-07
**Scope:** Vercel test deployment only, `scrap-radar-family-phase7c-test-nfw5r95xm.vercel.app`.
**Live production:** NOT updated. Test results are not certification of the public production release.

## Server-response verification

Requests fetched through the Vercel account's deployment fetch tool; responses inspected for actual body content, not status alone.

| Request | Observed HTTP | Interpretation |
| --- | --- | --- |
| `/` | 200 | Public entrance available |
| `/board_sense_case.html` | 200 | Board Sense wrapper available; no scan performed |
| `/scrap_radar.html` | 200 | Scrap Radar document available; no prices/analytics verified |
| `/account.html` | 200 | Account document available; sign-in not tested |
| `/guest_question_door.html` | 200 | Casey's question door document available; submission not tested |
| `/cassidy_proposal_door.html` | 200 | Cassidy's proposal door document available; submission not tested |
| `/island_neighborhood.html` | 200 | Interactive map document available |
| `/island_neighborhood_scene.svg` | 200 | Map scenery available |
| `/ai_hall.html` | 403 | Denial body, no Hall document returned |
| `/ai_hall.js` | 403 | Denial body |
| `/ai_hall.css` | 403 | Denial body |
| `/ai_hall_records/notes.json` | 403 | Denial body, no record JSON returned |
| `/ai_hall_records/decisions.json` | 403 | Denial body, no record JSON returned |
| `/privacy.html` | 404 | **Missing** |
| `/terms.html` | 404 | **Missing** |

Important: An earlier `vercel.json` status-only routing rule returned HTTP 404 **while still serving the private page contents**. That was rejected. The replacement `proxy.js` returns a fresh server-generated 403 response; recheck that behavior on every new deployment.

## Security boundaries

- **Closed on test Vercel host:** AI Hall page, JS, CSS, and record files via `proxy.js` matcher.
- **Not yet built:** owner / AI collaborator server-authenticated Hall access. Current gate is deny-all, not a login.
- **Not secured by this change:** public GitHub repository contents and all other hosting providers or aliases. Public repository records should never contain secrets or confidential data.
- **Tester access:** Public navigation no longer exposes tester shortcut links; Board Sense's actual tester bypass still requires server-side key validation. This audit did **not** attempt an authorized or unauthorized quota bypass.
- **Guest submission:** Casey and Cassidy doors are accessible but only document availability was tested, not the completed GitHub submission flow.
- **User-generated text:** Local Signal Log now renders text via `textContent` and explicitly describes local-only storage. This is not a multiuser guestbook.

## Must finish before launch

1. **Privacy and contact approval:** publish accurate visitor-facing privacy notice with actual photo handling, generated result URLs, browser storage, profiles, third-party processing, retention periods and deletion/contact procedure. Confirm facts with real system config and owner; do not invent periods or guarantees.
2. **Terms and program disclaimers:** get owner-reviewed terms. Distinguish heuristic board recognition, example metal scenarios, historical buyer samples, and actual quotes.
3. **Hall boundary:** choose either keep the Hall fully disabled on every public host, or add real collaborator identity + server authorization. Never rely on browser/device password or hidden links.
4. **Load testing:** perform controlled, bounded tests against staging/approved targets. Verify concurrent usage limits, 429 behavior, failed backend / payment states, and rate limits. No uncontrolled load against production.
5. **Cold visitor journey:** inspect private tab on physical iPad and at least one phone, including moving between Island/Board Sense/Scrap Radar, fresh scan quota, account failure states, and signed-out state.
6. **Site operations:** test rollback, domain/DNS and account 2FA, privacy and contact accessibility, sponsor links, observability, and final November 19 release candidate.
7. **Board classification accuracy:** the Intel i960 telecom-origin board got an observed-feature score of zero despite visible chips; investigate before making automated category or recovery claims.

## Release decision

**NOT LAUNCH CLEARED.** Test visitor routes and Hall deny-all response passed HTTP fetch checks. Privacy/terms, production parity, security ownership and multiuser capacity remain open. The owner's earlier iPad tests covered navigation only, not all these gates.
