# Signal Day: November 18, 2026 operator gate

**Owner decision:** Jerry. **Public target:** November 19, 2026.
**Scope:** Evidence-based release checkpoint only. This document does not authorize a production merge, deployment, billing activation, or a public claim of a completed user flow.

## Live platform and repo observations (November 18)

| Surface | Observed today | Meaning |
| --- | --- | --- |
| Board Sense launch staging, Railway project `2234d220-b18a-4581-9043-9fd779677cc6` | `Board_Sense_Staging` online, one replica, no active warnings/criticals and no recent failed deployments. Deployment `fb2730c9-545d-4cf8-8287-48926fbad3b8` successful. | Staging infrastructure ready for real owner-device smoke test; does not prove browser upload. |
| Staging source | Board Sense [draft PR #15](https://github.com/gfalvo1968-create/Board_Sense/pull/15), exact candidate `cd0bc878c3f133cb65f2c23447aa8db702d70d85` | Preview only, not merged to production. |
| Candidate GitHub Actions | `PCB object-gate and grade regression checks` and `Jekyll site CI` completed successfully for candidate commit | Automated checks pass; no iPad acceptance yet. Earlier full backend run recorded 128 passed, 9 skipped. |
| Board Sense production, Railway project `077052e4-2f37-4733-9e6b-0da8b67e880d` | Production service `Board_Sense` currently reports `SLEEPING`, deployed release `fe725e4c-d9f3-4ad2-95a2-7d7d6c8699b4`; no recent failures recorded | A sleeping service is not proof of an outage or a passing cold-start; direct owner-device health check is required. |
| Scrapradar-backend production | `Scrapradar-backend` online, deployment `47f18706-d885-414b-ab12-2b6d95864541` successful; no recent failures | Infrastructure online; case handoff remains unverified on current owner device. |
| Family frontend diagnostic fix | Family [draft PR #28](https://github.com/gfalvo1968-create/scrap_radar_family/pull/28) still open/unmerged; diagnostic regression completed successfully | UI wording only; does not fix the dark-back object-gate false-negative. |
| Broader Board Sense guarded work | [Draft PR #14](https://github.com/gfalvo1968-create/Board_Sense/pull/14) still open/unmerged | Do not merge the broad staging patch instead of reviewing candidate #15. |
| Billing | [customer-payments.md](customer-payments.md) still records PayPal checkout, authenticated entitlements, billing-event verification and account/admin flow as unfinished or unverified | No paid launch GO based on pricing or backend catalog alone. |

**External probe limitation:** Attempts by the assistant's public web fetcher to load both the staging URL and the GitHub Pages case URL were unsuccessful at the fetch-tool level. No success or failure of those sites in a real iPad browser can be inferred from that. The Railway/GitHub observations above are independently sourced platform reads.

## Owner-iPad smoke test: exact safe order

**First action:** On the iPad open https://boardsensestaging-staging.up.railway.app/ and refresh. In the single-photo **Scan Board** flow, choose only the **dark physical PCB back photo** `IMG_5864.jpeg`, then submit once. This is the known production false-negative example.

- Expected acceptable guarded result: classify as **PCB-like / manual verification required** (`pcb_review`), with low confidence, **no final buyer grade, no recoverable-metal gram claim, no automatic dollar value and no Scrap Radar handoff** for that uncertain image.
- A second false `Unknown object / not PCB` result is a failure to resolve this specific defect. An automatic priced `HIGH` or similar confident result on the uncertain image is an unsafe failure.
- Record screenshots of the entire text report, including classification, reasons and whether any grade/economics/handoff was presented. Avoid repeated submits that could consume quota.

**Then, if the first test behaves correctly:** use an independently known, clearly visible **single-board** photo to test a provisional standalone investigation and the intended handoff. Record actual owner-entered **pounds or grams**, material category, cost assumptions, dated market reference, and whether the Board Sense -> Scrap Radar -> Board Sense return retains them.

**Safety gate:** Test clearly different physical board images and exact duplicate images through the supported case path (checkbox unchecked and checked where applicable). Under this candidate, unverified multi-photo identity, even if operator-attested, **must not** create a combined final grade, recovery economics, or handoff. Different-board mixing and duplicated evidence must remain blocked. Do not claim the candidate can verify matching front/back faces.

**Visitor and operational gate:** Test mobile navigation, invalid upload handling, server-side free allowance and that rejected validation does not consume allowance; test cold-start, domain access, support/contact, privacy and retention, reliable rollback. Document the result as PASS / BLOCKED / UNTESTED, not guessed.

## November 18 evening: iPad test completed, confirmed in staging proxy logs

- Repaired `index.html` upload wiring on Board Sense PR #15 commit `4533a2e95e23ba96cc70a0d22e3c2eeae4c4de04`: added missing `uploadStatus`, routed `/analyze` to same-origin staging, and stopped displaying nonexistent estimated payout fields.
- Exact commit's PCB regression and Jekyll workflows completed successfully. Deployed to **Board Sense Launch Staging only**, Railway deployment `908fd465-4444-4ccf-b18e-33caf7483bbb` SUCCESS, one replica online. Production unchanged.
- **Owner iPad screenshot evidence, Wednesday November 18, 8:01 PM EST:** URL bar `boardsensestaging-staging.up.railway.app`, selected file `IMG_5864.jpeg`, scan status `Analysis completed for IMG_5864.jpeg.` Board Investigation Report displayed `PCB-like object / manual verification required`, `PCB-like / MANUAL VERIFICATION REQUIRED`, **44% confidence**, buyer grade and recovery economics withheld, plus supporting evidence.
- Developer console in same screenshot: selected file 8:01:28 PM, `Analysis completed. Object gate: pcb_review` 8:01:32 PM.
- Railway HTTP request log independently confirms staging `GET /` status **200** at `2026-11-19T01:01:14Z`, and staging `POST /analyze` status **200**, duration **3,493 ms**, at `2026-11-19T01:01:32Z`.
- **Interpretation: PASS for this narrow staging dark-board object-gate test.** It corrects the prior complete non-PCB rejection for this test photo while withholding unproven economics. Not proof of valid clear-PCB grading, multi-photo same-board identity, public production behavior, Scrap Radar handoff, quota safety, or paid release readiness.

### November 18, 8:08 PM EST: second owner-iPad PCB view

- Owner submitted `IMG_5865.jpeg` alone to the repaired Board Sense staging scan at `boardsensestaging-staging.up.railway.app`.
- Screenshot reported `Object: Circuit board / PCB`, `PCB check: Board candidate`, `Confidence: 33%`, `Provisional grade: MANUAL REVIEW`, `Board type: General PCB` and recommended keeping the board separate for manual grade review. Object gate shown in developer console as `board`; scan completed at approximately 8:08:47 PM EST.
- Railway staging HTTP logs corroborate `GET /` HTTP 200 at `2026-11-19T01:08:21Z` and `POST /analyze` HTTP **200**, approximately **3,091 ms**, at `2026-11-19T01:08:47Z`.
- **PASS:** Single-image iPad scan dispatch and board-object recognition; low-confidence grade guard behaves cautiously without manufacturing an automated buyer category. **NOT PASS:** Full standalone valuation, component-level report, recovery intelligence, or Scrap Radar case handoff. Staging UI's Recovery Intelligence panel still literally states `Recovery information will appear here` and does not prove recovery features are wired.
- This screenshot reports 33% overall confidence alongside recognized PCB construction. Treat these as separate signals, not a 33% probability the object is a PCB. Investigate report semantics before public claims. Continue to mark full product flow untested.

## November 18 security challenge: read-only source and configuration check

Scope: authenticated GitHub source review of Board Sense guarded candidate `release/guarded-preview-candidate-20261116` and Railway configuration **variable names only**. No payload attacks, production writes, secrets read or deployment.

- **Positive:** `routes/upload_security.py` rejects unsupported suffixes/formats, enforces byte and pixel budgets, generates random storage filenames, validates decodability, and removes temporary uploaded originals after analysis. HTTP body limits apply before multipart parsing. This is source-level inspection, not proof against all malformed inputs.
- **Positive:** `routes/free_usage_gate.py` applies server-side daily-use checks and reserves usage before analysis. In declared production mode, missing required Supabase credentials or visitor salt causes the quota gate to fail closed. Need test the actual configured production behavior.
- **Launch security gap / BLOCKED:** `routes/origin_security.py` activates the Cloudflare origin-header gate only when `BOARD_SENSE_ORIGIN_KEY` is set. **Production Railway variable names** visible during review: `BOARD_SENSE_TESTER_KEY`, `BOARD_SENSE_VISITOR_SALT`, `SCRAP_RADAR_API_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_URL`. `BOARD_SENSE_ORIGIN_KEY` is **absent**. Therefore the optional origin-header protection is currently disabled. Do not turn on the server key until proxy header injection and route testing are correctly configured, or legitimate traffic may receive 403.
- **Unverified:** Request-origin IP semantics and per-visitor isolation behind Railway proxies, duplicate/mixed photos, non-image edge cases, parallel quotas, reviewer/admin privilege separation, image privacy and retention, and startup failure behavior. A working 10-scan staging quota is not proof that the public one-scan allowance cannot be bypassed.
- **Privacy review:** `/free-usage` currently returns `visitor_id` to its caller. This is a pseudonymous identifier, not an IP or authentication credential, but consider omitting it from public responses or verifying that disclosure is justified.
- **Do next:** First check the intended public domain/proxy chain and retention policy; configure matching Cloudflare header transformation and Railway secret in a controlled window; run low-impact negative upload and access tests **on staging** and a single documented production smoke test only after owner authorization. Never use destructive rate flooding.
- **Release gate:** Security hardening remains **NOT SIGNED OFF**. Findings are from configuration and code, not a completed penetration test.

### Castle Check follow-on: derived-image privacy and route inspection

- **Privacy risk (requires remediation before open public use):** Board Sense `main.py` mounts the generated `data/Blueprints` folder as unauthenticated `/blueprints` static content. `routes/board_analyzer.py` builds an `image_url` to the annotated image, while `routes/board_blueprint.py` writes an image derived from the submitted full-board photo into that folder. The upload cleanup in `routes/upload_security.py` removes temporary originals but does not remove these derived blueprint images. Filenames are randomly generated via the upload UUID, which lowers the likelihood of guessing links but is not authorization, expiration, or a retention policy.
- **Other surface:** `/multi-board-crops` is also statically mounted without a separate access gate; `routes/multi_board_split.py` has a crop-writing helper. Confirm whether the running API creates those files before classifying live impact. Do not inspect anyone's actual images or URLs during review.
- **Remediation options:** require access-controlled or short-lived signed image delivery scoped to a user/case; define deletion/retention rules for all generated artifacts; test anonymous and cross-account denial; ensure no public listability and avoid caching of customer photos. Do not simply remove the mount in production without replacing the blueprint display route and validating it on staging.
- **Active probe attempted but not verified:** A low-impact series of staging status-only HTTP checks (`/health`, `/free-usage`, unauthenticated `/irm/sources`, incomplete `/analyze`, and a clearly nonexistent blueprint URL) did not reach Railway because this runtime could not resolve the staging host (curl exit 6). These results are **neither passes nor failures of the staging server**; no valid HTTP response or security exploitation was obtained.
- **Positive from code:** `routes/irm_core.py` guards the entire private sources router with a separate bearer admin key; unconfigured/short key fails closed with 503. This is not yet corroborated by a live unauthorized-access test.
- **Release disposition:** Owner-iPad scans pass their narrow recognition checks. **Privacy/auth/retention and full paid/public release remain blocked pending staging validation and approved mitigation.**

### November 18 evening: blueprint privacy hardening staged successfully

- Board Sense draft PR #15 branch `release/guarded-preview-candidate-20261116`, exact code/test commit `1057be25d57a3b47c09e7c313bdeb1177f59bed2`.
- Removed FastAPI public static mounts `/blueprints` and `/multi-board-crops` from `main.py`, and removed the analyzer's generated `/blueprints/...` link. `generate_blueprint` now encodes resized annotated images as inline JPEG data in the scan response instead of writing persistent blueprint files. Maximum preview side is 1200 pixels, JPEG quality 82.
- Added `tests/test_generated_artifact_privacy.py` for inline preview, no image file persistence, and no public mounts. Updated legacy `tests/test_analysis_image.py` to assert the new privacy model (distinct inline images, none left in the Blueprint folder). The first CI run correctly caught that outdated public-image assertion. After updating it, **PCB object-gate and grade regression checks: SUCCESS**, **Jekyll site CI: SUCCESS** on exact commit.
- Deployed **only** to `Board Sense Launch Staging` Railway service `Board_Sense_Staging`, deploy `b2c48aa6-0bf4-476d-aa26-57874105280b` **SUCCESS**; staging environment online, 1/1 replicas, no warnings or criticals. GitHub source SHA pinned to exact code commit. Prior staging deployment `908fd465-4444-4ccf-b18e-33caf7483bbb` is known rollback version. **Production untouched.**
- **Remaining acceptance:** no verified live owner-iPad scan on this new privacy commit yet. Check an isolated, ordinary single-board scan, confirm it still displays a blueprint inline where available, and confirm public `/blueprints/<random-nonexistent>` and `/multi-board-crops/<random-nonexistent>` are unavailable. Do not inspect private generated assets. Validate intended front-end display, response/cache headers and limits, quotas and handoff before any launch GO. Existing files on prior production remain an exposure until production migration and retention cleanup are authorized.
- **Status:** PATCHED AND DEPLOYED TO STAGING / AUTOMATED REGRESSIONS PASS; owner-device privacy and report acceptance PENDING; production privacy NOT FIXED. Paid launch remains blocked.

### Castle Check follow-up: visual-report wiring, staging boundaries, and safe endpoint verification

- **Confirmed code gap / BLOCKED user flow:** `Board_Sense/index.html` current staging candidate reports only `object_gate`, `confidence`, `grade`, `board_type`, `recommendation` and generic evidence in `predictionBox`. It never reads `data.board_blueprint.image_url`, so the new inline JPEG, while generated safely by the backend for eligible confirmed boards, is **not rendered in the staging UI**. `recoveryBox` remains the literal placeholder `Recovery information will appear here.` and the `Investigate Further` button has no click handler. **Do not ask for more uploads solely to see a blueprint until viewer is wired and code-reviewed**.
- **Code-level privacy gap:** `routes/free_usage_gate.py` includes stable pseudonymous `visitor_id` in the public `GateDecision.as_dict()` output; this identifier is returned by `/free-usage` and scan responses. Recommend excluding it from public responses while retaining server-side quota accounting. An ID hash is not a proof of anonymous data.
- **Staging configuration fact:** Railway `Board_Sense_Staging` lists only `BOARD_SENSE_DAILY_FREE_BOARD_LIMIT`. No configured visitor salt, origin-protection key, Supabase secret, or admin key by those names. This is an intentionally lightweight preview, not a representative production security check. `BOARD_SENSE_VISITOR_SALT` defaults to a static development string when missing; stage usage falls back to a local JSON file, so it is not an acceptable claim about persistent production quota security.
- **Protected-data finding:** The `/irm` router has a route-wide bearer admin-key dependency and fails closed (503) when that key is absent/short; `BOARD_SENSE_IRM_ADMIN_KEY` is not among staging or production Railway variable names. This supports private-contact protection by code, while administrative functionality and denial behavior require separate tests.
- **Live status:** Railway staging pinned to `1057be25d57a3b47c09e7c313bdeb1177f59bed2`, deployment `b2c48aa6-0bf4-476d-aa26-57874105280b` SUCCESS, `index.html` unchanged from earlier working iPad test. Production remains on its older `main` release. No fresh iPad scan yet on privacy change.
- **Probe limitation:** Public web fetch attempts for staging `/health`, `/free-usage`, and a nonexistent `/blueprints/...` return fetch-tool inaccessible errors. These are **not** actual server HTTP statuses. No staging 404/401/403 behavior is verified from those probes. Treat private-route and old-mount denial as source-level checks until measured on a real client.
- **Next hardening step, staging first:** wire the image preview from `board_blueprint.image_url` with safe `<img src>` assignment (never interpolate image into `innerHTML`), clear prior image on next scan/error, display truthful placeholder for gated PCB views, set `Cache-Control: no-store` on responses containing customer-derived images, remove public visitor IDs, run targeted tests, then owner-iPad screenshot and safe unauthorized-route checks. Do not use personal customer images in the public staging test.

### November 18 night: inline blueprint viewer and public-response privacy deployed to staging

- Board Sense guarded candidate PR #15, code commit `f474bc1ade7ff532d9853ef61efa5745dc3d082f`.
- Updated `index.html`: added a private blueprint image preview using the backend's `board_blueprint.image_url` only when `object_gate.mode == "board"` and `delivery_mode == "inline_no_store"`; a new/failed/unconfirmed scan clears any previous image; avoids unsanitized `innerHTML` and remote image links. Does **not** imply an automated buyer grade, monetary valuation, or completed Scrap Radar handoff.
- Updated `routes/free_usage_gate.py`: internal pseudonymous visitor ID is used for server quota accounting but no longer serialized to public free-usage and analysis responses.
- Added `PrivateResponseNoStoreMiddleware` to `routes/upload_security.py` and enabled it in `main.py` for public analysis and free-usage routes, including error statuses; `Cache-Control: private, no-store, max-age=0`, `Pragma: no-cache`, `Expires: 0`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`.
- Added `tests/test_private_api_responses.py` and GitHub workflow JavaScript syntax checking. **PCB object-gate/grade regression suite: SUCCESS** and **Jekyll site CI: SUCCESS** at this commit.
- Railway `Board Sense Launch Staging` deployment `7feb68d4-fc4a-440f-a852-594d3272138d`: **SUCCESS**, 1/1 running replicas, 0 warning/critical notifications and no startup errors in deployment log. Staging service pins this exact commit. The earlier privacy-only staging commit `1057be25d57a3b47c09e7c313bdeb1177f59bed2` is the rollback checkpoint.
- **Outstanding test:** owner iPad must check real same-origin photo upload, visible blueprint when one is generated, withheld blueprint on review images, clean second-scan/error state, and denied public derived-image URLs. There was no new HTTP-request evidence for these paths on the new staging deployment at time of write. CDN/cache delivery still needs external verification where relevant.
- **Production not changed.** Origin restriction, paid entitlement/payment flows, and full Recovery Intelligence/handoff remain separate launch gates.

### November 18, 9:52 PM ET: Owner-iPad acceptance of private blueprint viewer

- Owner sent two iPad screenshots of `boardsensestaging-staging.up.railway.app`: browser shows `IMG_5174.jpeg` analysis completed, object `Circuit board / PCB`, `object_gate` whole-board candidate, confidence **67%**, provisional grade **MANUAL REVIEW**, type **Dense Logic / Controller Board**, and no inferred buyer-grade/recovery economics. Visible **Private Board Blueprint** section says `Annotated blueprint for this scan`, and displays a numbered yellow annotation overlay. A second screenshot shows lower portion of the rendered image, confirming it did not disappear when scrolling.
- Railway staging HTTP logs corroborate one `POST /analyze` **200** at `2026-11-19T02:51:07.041Z` (November 18, **9:51 PM EST**), approximately 10.1 seconds; corresponding staging dashboard GET at `02:49:08Z` returned 200. Screenshots are approximately 9:52–9:53 PM EST. No server exception appeared in retrieved logs. This is real same-origin on-device success, not a prerecorded sample.
- **Mark PASS:** owner iPad same-origin photo upload, completed Board Sense basic report, inline generated blueprint visibly rendered on iPad, manual-review valuation restraint maintained.
- **Remain PENDING:** prove no-store cache headers and removed blueprint/crop URL 404s with actual HTTP client, second-scan clearing, unavailable/ambiguous PCB behavior, paid entitlements/payments, full Recovery Intelligence, economic figures and Scrap Radar handoff. Privacy derived-asset protection in production remains unpromoted.
- **Operator conclusion:** Maintain guarded/demo-only release stance until the remaining blockers are verified; do not imply a complete paid public launch is ready based solely on this successful staging scan.

### November 18, 10:26 PM ET: independent staging HTTP security verification

- Added a non-destructive, anonymous, five-GET staging smoke test `Board_Sense/scripts/staging_http_security_check.py` in Board Sense guarded PR #15, exact SHA `d44da94e8f971a477a1894544e3101a88188f736`. This avoids the separate assistant runtime DNS issue and runs on GitHub Actions against the existing, privacy-hardened Railway **staging-only** deployment. No POST uploads, quota claims, destructive testing or private-record reads.
- GitHub Actions workflow `44451415000`, job `135316016607`: **SUCCESS**. The full local API/source regression suite ran **134 tests** successfully, and the JavaScript syntax check passed. Jekyll site CI also passed.
- Independent staging HTTP results **5/5 PASS**, from the GitHub Actions log (UTC approximately `2026-11-19T03:26:37Z`): `/health` HTTP **200**; `/free-usage` HTTP **200**, no public `visitor_id`, `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`; bogus `/blueprints/nonexistent-safe-probe.jpg` HTTP **404** FastAPI JSON; bogus `/multi-board-crops/nonexistent-safe-probe.jpg` HTTP **404** FastAPI JSON; anonymous `/irm/sources` HTTP **503**, safely denied due to missing admin secret on staging.
- Note: fabricated nonexistent paths prove the old mounts are closed in this deployed staging version when combined with code/unit inspection. The test does **not** retrieve any actual generated image or private data. A 503 admin denial confirms fail-closed for an **unconfigured** staging secret, not successful authorized admin function.
- **Staging passes now:** owner iPad completed one real board scan and saw an annotated inline blueprint; 134 automated regressions; five safe live GETs verify health, public response privacy, closed legacy image mounts, and anonymous admin rejection.
- **Still pending:** second scan stale-image reset, physical board identity edge cases on hardware, production origin proxy setup, production cache/retention rollout, Supabase-backed quota behavior and paid entitlement gates, Recovery Intelligence and Scrap Radar handoff. No production changes or promotion have occurred.

### November 18, 11:22 PM ET: second distinct board and blueprint owner-iPad pass

- Owner supplied new staging screenshots at **11:22 PM EST**. Different board image was a prior Google Drive browser screenshot showing a densely populated legacy PCB. Board Sense returned `Circuit board / PCB`, `Board candidate`, **78% confidence**, **Dense Logic / Controller Board**, **MANUAL REVIEW**, and withheld buyer-grade/economic payout pending verification. The page visibly rendered its **Private Board Blueprint** with numbered markers (up to 16 visible).
- Railway staging corroborates `GET /free-usage` **200** at `2026-11-19T04:20:44Z`, `GET /` **200** at `04:20:56Z`, and `POST /analyze` **200** at `04:21:39Z` (approximately 5.8 seconds), with no retrieved runtime exceptions. These times match the screenshots to within a couple minutes.
- **PASS:** A different board's own annotated image replaces the first previously tested board's report in the owner-device interface; scan two completed and received a fresh result. The image contains a screenshot of a Google Drive browser tab, which the blueprint faithfully retained as source pixels; this is a user-input quality caveat, not a failure of private delivery.
- **NOT YET PROVEN BY STILL SCREENSHOTS:** The precise instant the previous preview is cleared during upload, the failure-state clearing behavior, whether cross-customer response caching is absent at all intermediary layers, or whether all numbered component markers are correct. Separate browser automation or video could verify timing; source-side `clearBlueprint` and JavaScript syntax test already passed.
- **Result:** Two different-board owner-iPad staging scans received successful HTTP 200 and visibly rendered distinct annotated blueprints. Leave paid/production security and Recovery Intelligence/handoff as OPEN blockers; do not promote merely because these tests pass.

### November 18 late evening: Recovery Intelligence first working stage + cross-domain handoff preparation

- **Board Sense staging change:** guarded preview candidate PR #15, pinned SHA `37de6a07fb183f02737275852652f3fa7d056530`. Updated `index.html` to render `recovery_lab.labs` as *inspection cues*, conditionally withhold recovery guidance for non-PCB/`pcb_review`, show controlled-process/refinery warning when relevant, explicitly mark economics **unpriced** without real offers, and link to the current Scrap Radar manual board-recovery screen. New scan and failed scan clear stale recovery text. Text is rendered with DOM `textContent`, not untrusted `innerHTML`.
- **One-photo handoff sender prepared but deliberately NOT ENABLED:** `Board_Sense/single_board_handoff.js` can generate a versioned, bounded URL-fragment payload carrying only `boardType`, `confidence`, up to 4 lab labels and explicit `manualReview: true`. No original photo/blueprint, buyer grade, weight, customer/visitor identifier, payout, token or recovery yield enters this transfer. It is **not** loaded into the staging page until the receiving release is approved, so the staging link stays marked *manual economics only*.
- **Scrap Radar receiver prepared separately:** new **draft** PR #30 `https://github.com/gfalvo1968-create/scrap_radar_family/pull/30` on `feature/single-board-fragment-handoff-20261118`, SHA `73a8d5d87cefb9f1e0f9cbf09877a97eb0853ae7`. It decodes bounded opt-in URL fragments, retires prior device-local cases, normalizes single-photo transfers to `MANUAL REVIEW` and `SINGLE_VIEW_ONLY`, drops untrusted prices, images and source metadata, then presents case evidence only for operator-led Scrap Radar price/weight/travel entry. Preserves older multi-photo bridge. Family GitHub workflow **SUCCESS** on this SHA.
- **Tests:** Board Sense CI on SHA `37de6a07fb183f02737275852652f3fa7d056530` **SUCCESS** for Python regression suite, JavaScript syntax, sanitized sender unit test, guarded Recovery Intelligence UI unit test and safe staging read-only HTTP checks. Jekyll CI **SUCCESS**. Initial new-test error was a JS-only test-harness split call, corrected before passing.
- **Railway:** deployed Board Sense Recovery Intelligence stage to **staging only**, deployment `734898fa-955c-4965-b7c2-4e8ee5f79aa6` **SUCCESS**; 1/1 replica online, zero warnings/criticals, no startup exceptions in retrieved deploy logs. Earlier successful staging SHA `f474bc1ade7ff532d9853ef61efa5745dc3d082f` is prior checkpoint. **Production untouched.**
- **Still PENDING:** owner-iPad acceptance of newly populated Recovery Intelligence section, true live end-to-end cross-domain sender/receiver behavior after coordinated approval and publishing, paid entitlement and checkout, production origin protection, production private photo retention and quotas, and robust price/board-economics handoff. No computed value from a photo is approved.
- **GO/NO-GO:** This is staging progress, **not** proof of full public paid readiness. Keep family receiver PR #30 and Board Sense PR #15 in draft pending acceptance.

### November 18, 11:58 PM EST: owner-iPad negative-gate test of Recovery Intelligence

- Owner uploaded `IMG_5286.jpeg` to `boardsensestaging-staging.up.railway.app`; screenshot reports `Unknown object`, `PCB check: Not confirmed as a PCB`, confidence **46%**, with buyer grade and recovery economics explicitly **withheld**. The new `Recovery Intelligence` panel says whole-board recovery routing was withheld and assigns **no yield, buyer grade, or dollar estimate**. The private blueprint was also withheld with the expected gating message. This confirms the client display follows the non-PCB/unknown result correctly.
- Railway staging HTTP logs corroborate `GET /` **200** at `2026-11-19T04:56:42Z` and `POST /analyze` **200** at `04:58:23Z`, approximately **2.5 seconds**. No relevant exception in queried deployment logs. Owner screenshot shows same 11:58 PM time.
- **PASS:** negative/unknown-object Recovery Intelligence and blueprint withholding on real owner iPad. **Still pending:** positive recognized-board Recovery Intelligence lab-list display, user experience of manual Scrap Radar link, and cross-domain case handoff (which is not yet active). Do not mislabel the image as a confirmed PCB or classify this as a regression without source-image inspection.
- No production promotion, price fabrication, or private data reads.

### November 19, 12:12 AM EST: owner-iPad positive Recovery Intelligence acceptance

- User supplied owner-iPad staging screenshots taken at approximately **12:12 AM EST, Nov 19**. The private annotated blueprint renders a small keypad-like circuit board with numbered component inspection overlays, indicating the whole-PCB view gate allowed a blueprint.
- Recovery Intelligence panel displays **"Board status: MANUAL REVIEW"**, with explicit disclaimer that buyer acceptance and material assay are unverified; a **"Circuit Board Lab"** entry under **"Recovery Labs to review (inspection cues only)"**; appropriate mechanical sorting and inspection caution; **"Economics: unpriced"** with buyer offers, weight, labor, fuel and processing costs identified as missing; and a visible **"Open Scrap Radar for manual economics"** link.
- **PASS:** positive PCB-route display on a real owner iPad, Recovery Labs inspection cue, safety note, intentionally withheld assay/financial claims, and visual presence of manual Scrap Radar link. Combined with the earlier **46%-confidence unknown-object** negative-path screenshot, both positive and negative Recovery Intelligence display gates have now been observed in staging.
- Railway staging proxy shows `POST /analyze` **HTTP 200** at `2026-11-19T05:08:22Z`, approximately **5.2 seconds**, with no exceptions identified in the queried runtime logs. Screenshot time around 12:12 AM aligns with this within a few minutes.
- **Not yet verified:** tapping the manual Scrap Radar link; actual cross-domain case transfer (separate **draft** PR #30 and an inactive sender); confidence/grade accuracy as a scrap buyer would judge it; complete economic workflow, production gate/security/retention, paid billing. The preview must **not** imply end-to-end handoff or public paid readiness. No production changes in this checkpoint.

### November 19, 12:17 AM EST: owner-iPad manual Scrap Radar navigation PASS

- Owner tapped **"Open Scrap Radar for manual economics"** from Board Sense staging's positive Recovery Intelligence report and shared a screenshot at approximately **12:17 AM EST**. The browser visibly reached `gfalvo1968-create.github.io` and loaded the Scrap Radar Family operating cockpit (Decision Center and Load + Trip Evaluator).
- Dashboard showed **Single Load Net $0.00**, **Mixed Load Gross $0.00**, **Best Yard Net —**, **ROI Realized Net $0.00**, and **Decision Center: WAITING FOR INPUT** with Board Recovery "ENTER BOARD VALUES." These are empty-input defaults, **not verified profit, buyer quotes or a transferred board result**.
- **PASS:** link navigates to Scrap Radar main page on owner iPad; manual economics page renders and does not fabricate prices or profits.
- **PENDING:** actual visual scroll/anchor arrival at the Board Recovery panel (screenshot is above that panel), ability to enter and calculate a manual three-path case, and **automatic** cross-domain single-board transfer (still unmerged draft PR #30). Do not claim handoff or paid-feature readiness based on navigation.
- **Production:** Existing Scrap Radar GitHub Pages page was visited but not modified as part of this check. Board Sense production and paid release remain unchanged.

## Release choices for November 19

- **Option A: Public guarded free preview.** Consider only if real iPad upload and report, refusal safety, honest uncertainty, data handling, quota, and any advertised handoff are demonstrably working. Announce the limitations: manual review on dark/unclear views and no automatic multi-photo merged valuation.
- **Option B: Signal Day awareness/announcement.** Use if the above has not passed. Share the mission and preview what is being built, but do **not** invite users into a broken workflow or promise immediate paid access. Announce the additional verification without an invented launch date.
- **Option C: Paid memberships.** **Not cleared.** Require separately demonstrated customer login, payment provider checkout, signed idempotent notifications, entitlement enforcement, cancellation/account flows, cross-account isolation, and sandbox plus controlled live validation.

**Decision record (must be filled with real evidence):**

| Gate | Current status |
| --- | --- |
| Candidate regression and staging infrastructure | PASS |
| Owner iPad dark-PCB staging report | **PASS (Nov 18, 8:01 PM EST)** on repaired staging candidate 4533a2e9; PCB-like / manual verification required, 44%, grade/economics withheld |
| Owner iPad clearer PCB-side staging recognition | **PASS recognition, LIMITATION in grading (Nov 18, 8:08 PM EST)**: IMG_5865.jpeg recognized as Circuit board / PCB, 33% overall confidence, General PCB, provisional grade MANUAL REVIEW; no demonstrated buyer-grade or recovery-economics computation |
| Mixed/duplicate photos on exact owner-device candidate | UNTESTED |
| Board Sense / Scrap Radar round trip on owner iPad | UNTESTED |
| Public privacy, usage allowance, rollback | Staging blueprint privacy fix CI PASS and deployment SUCCESS; owner-device proof and production sign-off PENDING |
| Paid checkout and membership | NOT VERIFIED |
| Owner final GO | PENDING |

## Ready-to-use truthful contingency message

> Tomorrow is Signal Day for Scrap Radar Family. We're sharing the mission and the tools we've been building for scrappers, recovery workers and families. We're still completing hands-on safety and reliability checks on Board Sense before opening the full experience. We'll announce access when those checks are complete. We'd rather earn your trust with a working product than rush out something we can't stand behind.

**Production safety:** Existing production deployment and all draft PRs remain unchanged by this documentation branch. Any subsequent deployment needs explicit owner release consent, a known rollback point, and real post-deploy acceptance.
