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

## November 7 follow-up: privacy, backend readiness, and test-page verification

**New test deployment:** `scrap-radar-family-phase7c-test-gwx19x7mp.vercel.app`, commit `c829985982e25181bbe67cbe66e3c1b2b4815bad`.

| Request | Result |
| --- | --- |
| Home, Island Future, Welcome Hall | 200 |
| `/privacy.html` | 200; clearly labeled preliminary, not final policy |
| `/terms.html` | 200; preliminary limitations, not finalized contract |
| AI Hall and one Hall records path | 403, plain refusal body |

The privacy and limitations drafts are reachable from the home, Future, and Welcome Hall pages. This **closes only the missing-page HTTP issue**, not owner approval, legal review, retention verification, or deletion-contact readiness.

**Verified from Board Sense source (not a live capacity experiment):**

- `routes/free_usage_gate.py` derives a pseudonymous visitor key by hashing an IP address with a configured salt.
- The public daily allowance defaults to one board. Authorized tester bypass requires a server-side secret match in a request header.
- The production usage claim uses a Supabase RPC, `claim_board_sense_free_use`, before analysis and does not fall back to local JSON if that backend fails.
- Production usage backend unavailability is a fail-closed 503; used allowance returns 429.
- Analysis can generate public-by-link blueprint files under the `/blueprints` static route. **Actual server deletion and retention timelines still require examination and verification.**
- Coarse location/referral info can be stored with local development usage records. Provider logs and production operational telemetry remain unverified.

**Railway status inspected on November 7:**

| Service | Environment | Last listed deployment state |
| --- | --- | --- |
| Board Sense | Stageing | SUCCESS, November 1 (main b451a899) |
| Board Sense | production | SLEEPING, November 1 (same main revision) |
| Scrap Radar backend | production | SUCCESS, October 10 (main 50fc710a) |

`SLEEPING` is a Railway state and **does not alone prove an outage**. Controlled cold-start and concurrent-request observations are still required.

### Safe capacity rehearsal protocol (not yet executed)

1. Verify the staging backend has an independent quota database or isolated test identities. Never consume or reset public customer quota during the rehearsal.
2. Confirm budget, concurrency ceiling, provider costs, and observability before issuing test requests.
3. At the unit/integration level, race eight claims for the **same synthetic visitor** with a quota of one; expect exactly one successful claim and seven rejections. This historically passed in October, but re-run against the launch candidate.
4. Test read-only `/health` and `/free-usage` endpoints separately from full-photo processing and measure cold-start time, 429, 503, timeout, and user messaging. Do not assume a successful 200 document means analyses work.
5. In staging, use a few bounded full analyses with representative permitted images; verify abort, service recovery, quota persistence, and processing cost before changing limits.
6. Test the final visitor flow on iPad, Android/iPhone, and a clean signed-out browser. Confirm free allowance, sponsor/footer pages, and payment/account disabled states.
7. Only after steps 1–6, approve a specific low-risk load profile. No uncontrolled production stress test.

### Outstanding approval items

- Determine and publish the real Board Sense image and blueprint lifetime (including failed requests, old files, logs and provider backups).
- Confirm legal entity/contact, privacy contact, deletion request procedure, and approved terms.
- Decide whether AI Hall remains disabled or gets a fully authenticated owner/collaborator gate.
- Verify MFA and origin protection settings in owner services without revealing credentials.
- Verify staging/production parity and go/no-go process for November 19.

**Decision remains NOT LAUNCH CLEARED.**

## November 7: Bounded capacity rehearsal preparation

- **Backend development repo:** `gfalvo1968-create/Board_Sense`, branch `feature/phase-7d-phone-family-evidence`.
- Added `tests/test_launch_quota_concurrency.py` at commit `7d212bb31af1fa8177caa0b186c58043e4a51646`: four offline regression tests covering (1) eight parallel claims by one synthetic visitor, (2) fail-closed database outage without local fallback, (3) user-agent / X-Forwarded-For spoofing, (4) exact tester-secret validation.
- Added GitHub Actions workflow `.github/workflows/offline-launch-quota.yml` at commit `0b67973a35e5473a52a70a9949819af43a0f2ab7`, scoped to the development branch. No production credentials, database calls, actual customer scans or real image processing.
- **Execution status:** The test code and CI configuration are committed. No passing CI run has been verified; GitHub combined commit statuses did not expose any results yet. Do not mark load capacity passed based only on these commits.
- Railway staging's last deploy shows app startup messages. Production was reported sleeping at the deployment snapshot. Production deploy logs included automated probing of unrelated paths but are not by themselves evidence of an outage or capacity result.
- Health endpoint could not be reached through the available public HTTP access here. No live `/health` latency or public `/free-usage` observation is claimed.
- **Next gates:** verify test runner results, then bounded staging cold-start timing and service-observability under an approved test budget. No uncontrolled production traffic.

## November 7 follow-up: staging service baseline and workflow status

- Railway's `Stageing` environment (project `hearty-quietude`, service `Board_Sense`) is live, latest deployment SUCCESS from `main` revision `b451a899ea58c0a4d12d82f94acf771780f4be03` on November 1. There are no staged Railway configuration changes.
- The recent one-hour staging metric sample (61 observations) shows approximately 0.00137 CPU usage average and 0.0545 GB average memory. These are idle/low-load observations, **not** throughput measurements.
- Dedicated staging URL is `boardsense-stageing.up.railway.app`; direct `/health` and `/free-usage` could not be accessed through available public HTTP tools, so no cold-start timing or response code was established.
- The test source and GitHub workflow are on **`feature/phase-7d-phone-family-evidence`**, while Railway staging still deploys **`main`**. Never treat staging telemetry as evidence that the new branch's tests passed.
- No GitHub Actions workflow result or combined status was returned for test commit `0b67973a35e5473a52a70a9949819af43a0f2ab7`. CI test results are pending/unverified. Before a release, run the offline tests in a trusted runner and review artifacts, then deploy a reviewed backend candidate into isolated staging for low-volume measurements.
- We made no Railway deployment, traffic-generating scan, quota reset, database mutation, or production change during this check.

## November 7 verified execution: offline tests passed, staging DNS blocked

- Executed the actual `gfalvo1968-create/Board_Sense` development source in an ephemeral Vercel sandbox, checked out from `feature/phase-7d-phone-family-evidence`. Python 3.14.4, pytest 8.4.2, FastAPI 0.142.2 and Starlette 1.7.0 used with no production secrets.
- **Initial test result: 3 passed, 1 failed.** The failure came from the test fixture: `BOARD_SENSE_ENV` is read at module import time; setting the environment variable later did not affect the already-loaded constant. This was a test setup problem rather than a demonstrated production quota bug.
- Corrected fixture by explicitly monkeypatching `gate.BOARD_SENSE_ENV` to `production`; reran: **4 passed in 0.18 seconds**. Correction committed to the backend feature branch as `ba260b6a2db1a34f1dd5f398376d25d571707381`. These tests mock the atomic quota backend and do not establish live-database concurrency throughput.
- Railway confirms staging domain `boardsense-stageing.up.railway.app` is Railway managed and targets port 8080, but sandbox DNS resolution for that hostname failed (`curl` status 000; no connect or response timing). Control hostname DNS lookups for github.com and pypi.org succeeded. Neither staging cold-start latency nor app-layer availability was measured.
- No live Board Sense upload, real quota consumption, production traffic burst, Railway deployment, or configuration change was performed.
- **Next:** resolve staging DNS/public reachability in provider configuration, then make one read-only `/health` request, record first-byte latency, and only afterward proceed to a bounded staging test with an isolated quota store.

**Updated verdict:** Offline quota regression logic passes (4/4); staging cold-start and real capacity remain **NOT VERIFIED**.
