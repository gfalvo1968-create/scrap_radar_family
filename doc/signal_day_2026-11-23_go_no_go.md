# Signal Day: November 23, 2026 — launch control sheet

Prepared November 22, 2026. **Status: NO GO for paid public subscriptions; CONDITIONAL for limited free preview.**
This checklist is based on live connected GitHub, Railway and Supabase metadata, plus repository content. It is not a substitute for a real owner-device browser test. Jerry has final release authority. Keep production unchanged until the tests below are passed and release scope is explicitly approved.

## Intended scope

- **Candidate:** public information pages, Scrap Radar planning calculations, and Board Sense's deliberately limited **free** sampler, if it passes all checks.
- **Not included:** paid checkout/memberships, automatic dual-board grading/conveyor processing, Scrap Sense's future interactive upgrades, or the independent/private OSINT Radar.
- Prices, grades and metal-yield examples must not be represented as verified actual payouts, assays or guaranteed present-day yard rates.

## Verified environment evidence, November 22

| Component | Observed | Decision |
|---|---|---|
| Board Sense controlled staging | Railway project `Board Sense Launch Staging`, environment `staging`, service `Board_Sense_Staging`. Last deployment `1345b1bd-1d3a-46b3-a6e7-f1fbee925b15` succeeded on Nov 20 from the controlled multi-board/blueprint test branch. | STAGING BUILD OK; not the public release |
| Board Sense production | Railway project `hearty-quietude`, environment `production`, latest deployment `fe725e4c-d9f3-4ad2-95a2-7d7d6c8699b4` last reported SLEEPING on Nov 22. Production main revision `b451a899ea58c0a4d12d82f94acf771780f4be03` is older than guarded preview PRs. | Live request and controlled promotion still needed |
| Board Sense safety candidate | GitHub Board_Sense PR #14 (dark-PCB review) and PR #15 (guarded free-preview candidate) are OPEN DRAFT and unmerged. | Must review, test, approve and promote deliberately |
| Family frontend diagnostic | GitHub scrap_radar_family PR #28 (identity wording) is OPEN DRAFT and unmerged. | Do not claim its UI fix is live |
| Scrap Radar backend | Railway project `sparkling-manifestation`, service `Scrapradar-backend`, latest deployment `47f18706-d885-414b-ab12-2b6d95864541` SUCCESS from Nov 13. | Infrastructure success only |
| Family source | GitHub main contains `index.html`, `board_sense_case.html`, `scrap_radar.html`, `account.html`. GitHub commit status contains a successful Vercel status on the Nov 22 documentation commit. | Does not prove published Pages site/iPad behavior |
| Customer payments | `account.html` explicitly states checkout is unavailable and subscriptions are being prepared; `doc/customer-payments.md` requires signed provider events, entitlement enforcement, cancellation and sandbox/live acceptance. | **PAID LAUNCH BLOCKED** |
| Customer authentication | Public `customer_auth_config.json` references Scrap Radar Family Supabase project `plcecfxejriiorzwqbfc`; connected Supabase reports that project **INACTIVE** on Nov 22. | Account login cannot be presumed working; must restore/verify before dependent scope |
| External public probe | Direct public web probes from assistant runtime failed due to access/DNS limitation; failure here does not prove a website outage. | Owner iPad live test required |
| New entertainment | Copper Divorce Blues video created as an uploaded user video and derived formats, with Attic documentation. | Optional promotional asset, not a launch blocker |
| Private OSINT Radar | Separate project, private health-only application and incomplete authentication controls. | Do not include in public release |

## Hard exit gates before free preview

1. **Owner iPad cold-start:** With fresh/reloaded tabs open the live Family home, Scrap Radar, and Board Sense paths over HTTPS. Confirm no stale cached version and no broken links. Screenshot errors.
2. **Board Sense live evidence:** On the actual public two-picture case page, upload original **front/component side and back/solder side photos of the same physical board** as **one board case and one allowance**. Confirm the flow processes and returns an understandable report or honest manual-review state, not a false classification. Keep a second distinct specimen for a separately authorized rejection test; do not mix two different boards or accidentally consume extra quota.
3. **Multi-board safety:** A mixed-board case must refuse combined grading, economic estimates and handoff. An accidental multi-board upload must not grant free extra analyses or silently debit the allowance on pre-analysis validation failures. Validate exact public release revision, not staging alone.
4. **Public allowance:** Server-side daily limit works across reloads; invalid/unrelated/rejected inputs don't consume paid work or grant extra cases. Show 429/503 transparently on outage.
5. **Board Sense ↔ Scrap Radar:** Only an accepted completed board case may hand off; original photo identity, measured mass, material category and entered costs remain coherent. One-way/round-trip travel is not double counted. No invented precious-metal contents, buyer acceptance or profit.
6. **Real pricing integrity:** Date/source/basis shown for quotes and market-derived estimates; stale feed fallback labeled; local yard prices only from actual quoted/entered data.
7. **Account, security, privacy:** Required public privacy/data-retention/contact details and allowed sharing/blueprint permissions approved. Verify owner GitHub + hosting MFA and recovery options, backup/rollback source and a known-good deployment. Resolve inactive Supabase if customer login offered.
8. **Controlled promotion:** Inspect safety PR diff; do not merge staging-only UI/debug traces or loosen gates. Record approved production commit and successful deploy. Repeat checks 1–6 on **production**.
9. **Go/no-go record:** Jerry makes explicit scope decision after seeing actual user-device tests; publish only passed features. Roll back if photo/report errors, buyer/pricing mislabeling, permission issues or quota bypass emerge.

## Separate paid release gates

Do **not** accept real money until all of the above pass plus: Supabase customer login/email and cross-account isolation; connected business checkout with explicit recurring terms; verified and idempotent PayPal/other provider callbacks; actual 25-case paid allowance enforced on backend; cancellation/failure/retry and refund/support policies; user receipts; sandbox, controlled live and rollback tests. A price table, successful Railway deployment or PayPal account is not sufficient.

## iPad test plan for Jerry (public paths, no tester secrets in URLs)

- Family: https://gfalvo1968-create.github.io/scrap_radar_family/
- Board Sense: https://gfalvo1968-create.github.io/scrap_radar_family/board_sense_case.html (**two photos: front and back of one physical board; one case, one allowance**)
- Scrap Radar: https://gfalvo1968-create.github.io/scrap_radar_family/scrap_radar.html
- Customer account (diagnostic only; Supabase currently inactive): https://gfalvo1968-create.github.io/scrap_radar_family/account.html
- Guarded standalone staging: https://boardsensestaging-staging.up.railway.app/ (not public sampler)

Mark each outcome PASS / FAIL / NOT TESTED with timestamp, screenshot and exact source/version before approving public exposure.

## Decisions still needed

- **Scope:** free preview only if validated, or defer; NOT paid launch until payment gates close.
- **Safety branch:** reviewed promotion of PR #14/#15 and Family UI PR #28 after real release acceptance.
- **Supabase:** restore paused/inactive customer identity project only with owner cost/operation awareness and verify login; do not confuse OSINT's separate active Supabase project.
- **Communications:** publish accurate availability (preview/test release versus paid membership) and supported contact/retention text; do not promise unimplemented features.

## November 22 owner iPad production test — 503 quota backend outage

- Owner submitted two photos (`5026.jpg` and `5025.jpg`) through the public case tray. The UI displayed: `Case analysis failed: Board Sense public access is temporarily unavailable. Please try again shortly.`
- Live Railway production HTTP logs confirm `POST /analyze-case` returned **503** at **2026-11-22 14:31:47 UTC**; app logs show `Daily usage check failed: URLError (HTTP status: n/a)` at 14:31:55 UTC. This was an upstream quota/usage verification failure, not a board classification or two-photo-identity result.
- Board Sense `routes/free_usage_gate.py` points its production daily allowance gate at the Scrap Radar Family Supabase project `plcecfxejriiorzwqbfc`; the connected Supabase project was **INACTIVE**. This is a strong causal match for the URLError. The project's restore API returned `success:true`; subsequent status: **COMING_UP**, not yet `ACTIVE_HEALTHY`. Verification must continue.
- `main.py` calls `_gate_or_block` *before* `_claim_or_block` on `/analyze-case`. For this specific 503 at the check phase, no free board use was claimed and no verified board report was produced.
- **Public launch gate remains blocked** until Supabase is `ACTIVE_HEALTHY`, the anonymous `GET /free-usage` endpoint returns normal status *without consuming a case*, and Jerry's two-picture iPad test returns a verified report with correct daily accounting. Do not disable production quota checks or bypass usage protection to mask the outage.

## November 22 search visibility and service update

- **Google Search Console ownership verified by Jerry**, via the HTML file method for URL-prefix property `https://gfalvo1968-create.github.io/scrap_radar_family/`. Owner's screenshot shows Google's green `Ownership verified` confirmation. Permanent verification file `googledee97694df72e556.html` is committed in GitHub and an external crawler returned HTTP 200 for it.
- Website SEO foundations committed: index title/description/canonical/social metadata; dedicated public sitemap; improved titles/descriptions/canonicals for Scrap Radar, Welcome Hall and Island Portal. OpenSEO crawl read 17 public pages and identified missing meta descriptions and thin content in several others. These are *not* confirmation of Google's indexing.
- **Next Google actions:** Jerry opens the verified Search Console property, submits `sitemap.xml` under Sitemaps and inspects/requests indexing for the homepage. OpenSEO Google Search Console integration still reports `not_connected`; finish its property authorization after Google has registered the site. No indexing/rank guarantees.
- **Supabase recovered:** Connected Supabase status for `plcecfxejriiorzwqbfc` is now `ACTIVE_HEALTHY`, following the restore previously accepted. Board Sense `GET /free-usage` and owner iPad two-picture scan still require live verification; healthy database status alone doesn't clear the launch gate.

## November 22 Google Search Console milestone (10:05 AM Eastern)

- Owner screenshot confirms URL-prefix site property ownership verified using HTML file and subsequent **`Sitemap submitted successfully`** confirmation for `sitemap.xml`.
- **Not yet confirmed:** sitemap read/processed status; indexed pages; homepage URL Inspection status; live search-result ranking.
- OpenSEO Search Performance integration still returns `not_connected`, even though Search Console property itself is verified. Owner must return to OpenSEO, refresh, select the verified property and save.
- Next action: Google Search Console URL Inspection on `https://gfalvo1968-create.github.io/scrap_radar_family/`, request indexing when eligible, then check sitemap status after Google processes it.

## November 22 Google homepage indexing request (10:11 AM Eastern)

- Jerry's Google Search Console URL Inspection screenshot confirms `Indexing requested`; the homepage URL was added to Google's priority crawl queue. This does NOT mean the page is indexed or ranked; repeat submissions do not increase priority.
- Site ownership and sitemap submission are confirmed. OpenSEO Search Console performance connection is still `not_connected` as of this check. Next: owner opens OpenSEO's GSC Insights tab, presses Refresh, selects the newly verified property and saves it.

## November 22 Google reporting connected and Board Sense allowance probe

- At 10:16 AM Eastern, Jerry's OpenSEO screenshot displays Search Performance for the verified Google Search Console URL-prefix property, 0 clicks and 0 impressions over 28 days. Connected OpenSEO API independently returned `ok:true`, matching `https://gfalvo1968-create.github.io/scrap_radar_family/`, with zero query rows through Nov 19. This means the integration works, NOT that Google has indexed the homepage.
- Scrap Radar Family Supabase project is `ACTIVE_HEALTHY`.
- External non-consuming HTTP probe through OpenSEO crawler: `https://boardsense.scrapradarfamily.com/free-usage` returned HTTP **200** on Nov 22 (1.277s). This establishes availability of quota endpoint, but did not inspect its JSON payload or prove a successful full board analysis. Owner two-photo iPad test and backend accounting remain a release requirement.

## November 22 successful iPad two-photo case / accuracy review (10:47–10:52 AM Eastern)

- **Owner device evidence:** Uploaded front/back photos `5026.jpg` and `5025.jpg` as one case. UI displayed `Board identity checked. Three-answer board case complete.`, generated a numbered blueprint with 4 markers and full Board Investigation Report.
- **Verified production Railway logs:** `POST /analyze-case` at 15:47:04 UTC returned **HTTP 200** (about 12.9 sec); subsequent blueprint requests returned **200** and `GET /market-intelligence` returned **200**. Some proxy upstream connection-refused retries were recorded before successful response; monitor warm/cold service reliability, do not conclude from this successful request that availability is perfect.
- **Same-board:** `PROBABLY_SAME_BOARD` at **85%**, with two usable whole-board views, as reported by UI. The test confirms treatment as one case, but has not independently proved its allowance counter, classification accuracy, or cross-board rejection.
- **Identity:** `General PCB`, `LOW`, equipment family unresolved, **33%** identity confidence, observed-feature score **0**, condition `INSPECTION NEEDED`. Need expert review of expected real category (board appears to include multiple external port connectors); treat as low-confidence fallback, not verified grading.
- **Vision regions:** SPIKE Glass described `PCB Solder / Trace Side` 88% and `80 metallic solder/via candidates`. Blueprint marked four regions all `Likely Plated Contact Zone` with detector confidence 88–90%; these may simply be solder pads/vias rather than actual precious-metal plated contacts. Require image-to-feature QA and conservative label handling, especially because the 90% regional detector scores can be mistaken for confirmed metal content. No assay/metal value demonstrated.
- **Economics:** Buyer category default `board_low`; displayed **$0.43/lb** *U.S. buyer-sample planning estimate dated Oct 6, 2026* and explicitly over 30 days old. No verified board weight, actual buyer offer, recovered value or labor time. UI appropriately withheld calculated dollar returns.
- **Handoff:** `Send Case to Scrap Radar` button was visible and case data marked ready, but **user has not confirmed pressing the button or verifying the received data**. This remains a hard integration test gate.
- **Next actions:** Ask Jerry to identify/grade the physical specimen and evaluate those four marker locations. If weight is measured, enter it in **grams**; confirm any price as old estimate or actual quote. Test handoff once using the already completed case (no second scan), verify the received classification/weight/source/cost and ensure no invented returns. Keep public/paid go-no-go conditional until the questionable feature labels and low-confidence fallback are reviewed, other guardrail tests pass and entitlements/payment issues are solved.

## November 22 Board Sense → Scrap Radar handoff owner test (10:55–10:59 AM Eastern)

- Owner screenshots confirm **successful navigation and data transfer**. `SPIKE CASE HANDOFF` shows `General PCB`, subtype `Unresolved Equipment Family`, identity confidence 33%, recovery grade `LOW`, observed-feature score 0, condition `INSPECTION NEEDED`, and `PROBABLY_SAME_BOARD` at 85%. No whole-board offer, recovered value, or time has been filled, and the quick estimate asks for measured scale weight and buyer category before quoting any whole-board total.
- **Explicit design boundary, confirmed in source:** `scrap_radar_spike_evidence_transfer.js` transfers case metadata/signals only; it deliberately reports `Photograph evidence: NOT LINKED`, no original photo IDs/provenance, and no automatic independent verification. `scrap_radar_spike_photo_review.js` adds an optional **local-only** front/back file picker; no automatic upload, save, analysis or verification. Therefore the photo linkage indicator is **an unimplemented feature**, not a regression in the functioning case-data handoff. Do not force a second Board Sense scan or claim the original images followed the case.
- `scrap_radar_spike_verification.js` implements **five manual evidence-source checks**, initially 0/5. These are neither persistent nor automatically verified, and documented buyer grading remains separately required. Screenshot warns `Photograph evidence NOT LINKED` and `0 of 5 checks manually verified`, correctly reflecting this limitation.
- **Visual identity clarity issue:** A buyer-category coaching panel suggests tentative `Controller board identity (62% confidence)`, while the primary transferred SPIKE identity remains `General PCB` at **33% confidence**. These represent different heuristics and could confuse customers. Clarify the independent source and ensure tentative coaching cannot be mistaken for a verified override. This requires owner/real-board ground truth before grading signoff.
- Gold scenario displays **$11.30 gross metal value** from user-interface **assumed 0.1g recovered gold** (spot benchmark), with no measured yield, real buyer terms, or costs included. Must remain explicitly hypothetical; never mix hypothetical with realized money or use it to upgrade a board grade.
- **Assessment:** PASS for transfer of metadata into the receiving UI; NOT TESTED for automatic original-photo preservation (by design absent), evidence validation, specific buyer price, weight calculation, conversion accuracy, true-net economics, and grading accuracy. Owner can continue inspecting this already-transferred case and optionally entering known verified measurements; do not run another board scan solely to test the handoff. Release remains conditional on public claim and fail-closed checks.

## November 22 field ground truth — Lenovo notebook board

- Jerry identified the **source equipment** of the previously analyzed two-photo test board: a **Lenovo notebook/notepad computer**. This is **owner-reported physical origin**, not independently verified model or exact circuit-board role. Keep that distinction when constructing training data.
- Public SPIKE report identified **General PCB / Unresolved Equipment Family** at **33%** confidence, `LOW` recovery grade and feature score 0. Separate buyer-category coaching suggested **controller board** at **62%**, also tentative. This demonstrates a **missed equipment-origin classification** that should be used for regression testing; it does **not** prove an incorrect buyer scrap category without the exact board type, attachments and buyer definitions.
- Proposed **offline regression fixture**: same two photos as one Lenovo-source board, note manufacturer model number and whether main logic board or USB daughterboard/controller if observable; assert that an inconclusive image returns an explicit `Lenovo source reported by owner, exact board unknown` *only when the owner provides that provenance*, not a model-inferred claim. Evaluate board markings, connector pattern, major chips and heat-sink/attachment evidence. Never raise metal-yield, board-grade or buyer-payout confidence simply because provenance was provided.
- **No production grading changes made.** Await owner confirmation of board function/model or closer photos before changing classifier or adding a permanent automated visual classification rule.

## November 22 Lenovo motherboard original-photo ground truth (after 11 AM Eastern)

- Jerry supplied the **original two photographs**, clear component side and solder/trace side of the same physical board, rather than pictures of a phone displaying SPIKE's output. This is a **full-sized Lenovo laptop motherboard**, not merely a USB expansion/controller daughterboard.
- **Visible source evidence in the supplied photographs:** motherboard silkscreen `GS450&GS550&GS750 NM-C821`, `Rev 1.0`, `2019-12-05`. Component side includes main processor/APU package with thermal paste residue, RAM slot, onboard memory chips, board power stages/inductors and a row of external I/O ports. The second image has the corresponding board outline, connector row, mounting holes and same silkscreen, confirming two sides of the same board. These are user-supplied images **in conversation**, not copied into repository or automatically transferred to the Scrap Radar handoff.
- Cross-reference: publicly indexed Lenovo/Compal motherboard service listings identify `NM-C821` and the GS450/GS550/GS750 platform as a Lenovo IdeaPad 3 laptop motherboard, including 14ADA05, 15ADA05 and 17ADA05 variants; exact finished laptop SKU **not established** by the photos alone. Sources: https://reniemarquet.com/files/afs-lenovo-gs450-gs550-gs750-nm-c821-rev-1-0-af23532/ and https://enginerys.com/board/nm-c821/ .
- **Bug classification:** The production SPIKE identity answer `General PCB` with only 33% identity confidence (and the separate tentative controller board guess at 62%) failed to recognize an actual laptop **main motherboard** despite visible CPU/memory and legible motherboard silkscreen. Mark as a **recognition regression fixture candidate**, independent of buyer category or precious-metal assay. The 4 `Likely Plated Contact Zone` markers on the trace side merit specific inspection because solder/vias/mounting contacts are not proof of gold or recoverable plating.
- Recommended regression acceptance: for these **same front/back photos**, identify *laptop motherboard / Lenovo NM-C821 family* when text and board features are legible, or give an appropriately labeled uncertain motherboard hypothesis if OCR/marking is not read; do **not** call it a peripheral daughterboard solely because USB ports are prominent. Preserve one-case two-photo accounting and show evidence origin/confidence. Never infer precious-metal yield, buyer purchase category, guaranteed payout or high-value grade from the equipment-family identification alone.
- **No automatic classifier, production grading or deployment changes authorized or performed** as part of recording this field evidence. Public paid launch remains gated on real acceptance checks and checkout.

## SPIKE three-week learning/evaluation checkpoint — owner decision Nov 22

- Jerry explicitly elected **not to change SPIKE's grading/identity logic based on this single Lenovo-board miss**. Give SPIKE **three weeks of real user/testing operation**, then retest and compare. This is an observation-and-evaluation window, **not a promise that the model automatically learns from visitors' photos**. Any training, collection of user images or retention policy changes need separate consent, privacy and security review.
- **Scheduled checkpoint:** **Monday December 14, 2026, 9 AM America/New_York** (three weeks after the *planned* Monday November 23 launch). If public/tester operation starts later or 21 genuine days have not elapsed, report that and set the actual benchmark review relative to real start date; don't claim a three-week field study without usage.
- **Holdout test:** Repeat the same genuine front/back Lenovo `GS450/GS550/GS750 NM-C821` notebook **main motherboard** test, with previous baseline `General PCB`, 33% identification confidence, `LOW` grade, 85% same-board probability, and four unverified "plated contact" markers. Measure identification, calibration, responsible scrap grade/buyer distinction and correct metal-evidence caveats, including no fabricated yield.
- Also audit owner-approved, anonymized and legitimately logged field cases for false confidence, misgraded boards, mistaken front/back pairs, accidental multi-board submissions, one-case/one-allowance protection, price source labels and handoff. Avoid exposing customer board photos, proprietary yard terms or personal information without permission.
- Report **before/after evidence**, pass/fail, and any high-risk defects; **do not silently retrain or deploy grading changes**. Jerry approves changes after reviewing the results. Blocking safety bugs discovered during the trial still require timely mitigation; the three-week observation does not justify knowingly exposing customers to unsafe behavior.

## November 22 PayPal webhook diagnostic checkpoint

- Jerry approved the next billing brick: verify **real signed PayPal sandbox notifications** without enabling public checkout. Backend `PAYPAL_SANDBOX.md` now contains a detailed sandbox-event resend and acceptance checklist (commit `f7af5187ee74611ac963975fbf4f9cedb8feed1c`).
- Railway Scrapradar-backend service is **online** with one healthy replica, persistent storage and the expected sandbox variable **names**. Values are redacted; cannot claim credentials are correct from variable presence alone. No real signed webhook accepted event has been proven in the logs currently available to the assistant.
- Existing unit tests mock successful PayPal signature postback and cover duplicate detection, canonical status, mismatched bindings, malformed headers and fail-closed provider outage. **Real signed PayPal delivery and ledger reconciliation are still unverified.** The PayPal simulator is not sufficient because it cannot pass PayPal's postback signature verifier.
- **Owner's next action:** https://developer.paypal.com/dashboard/webhooks/sandbox → select the exact sandbox app used for our pilot → check whether a real event within the last 30 days exists → if so, resend a supported event **once** and provide a screenshot of delivery outcome without secrets. If none, plan a new owner-authorized **sandbox-only** subscription test; no live charges. Compare event with Railway request status and authorized stored ledger outcome; verify idempotent resend. Keep production paid checkout off.

## November 22, 11:24 AM owner PayPal developer screenshot check

- PayPal Developer account screens clearly show **Sandbox** selected, owner-created **Scrap Radar Family Sandbox** REST API app, and **Subscriptions** app capability checked.
- The sandbox app has an existing webhook pointing to `https://scrapradar-backend-production.up.railway.app/api/paypal/pilot/webhook`, matching backend FastAPI `/api/paypal/pilot/webhook`. Registered event types shown: billing subscription activated, cancelled, created, expired, payment failed, suspended, updated, and payment sale completed. Do not create a duplicate webhook or modify the existing configuration.
- PayPal sandbox Webhook Events view said **No data for this selection** and noted the view is restricted to the preceding 30 days; old October 8–10 pilot events predate the visible window on Nov 22. This **does not validate any real delivery** or prove there have been no historical events.
- Railway OAuth connector can inspect **variable names**, not the private PayPal values. Webhook ID matching to the exact PayPal app in Railway remains unverified; do not store identifiers, sandbox passwords or secrets in source or screenshots.
- Safe next owner action: open `https://gfalvo1968-create.github.io/scrap_radar_family/sandbox_checkout.html` and verify existing owner Family session and *test-only* options load. Do not select/create a new subscription until screen/status is reviewed; subsequent sandbox approval must use a personal PayPal **sandbox buyer** account and must not activate real paid subscriptions. Once genuinely emitted event exists, inspect signed delivery/response and verify canonical ledger idempotence.

## November 22 ~11:55 AM — PayPal Family sandbox end-to-end breakthrough

- Owner's authenticated test checkout navigated to the **PayPal Sandbox** subscription review at **$44.95 every month** and then returned successfully. Owner screenshot reports **family · $44.95 USD/month · PayPal ACTIVE · test payment recorded** with paid access **OFF**.
- Connected Railway proxy logs on the `Scrapradar-backend` production-named Railway service (but **sandbox-only PayPal integration**) show `POST /api/paypal/pilot/checkout` **200** at 16:44:22Z, three genuine calls to `POST /api/paypal/pilot/webhook` **200** at 16:44:38Z, 16:55:27Z and 16:55:28Z, plus authenticated `GET /api/paypal/pilot/intents/{intent}` **200** at 16:55:11Z. Webhook implementation verifies signatures with PayPal and rejects failed verification; requests reaching 200 indicate signed verification path completed or previously verified duplicate, not proof of event type/ledger outcome by proxy logs alone.
- Detailed verification log in backend `PAYPAL_SANDBOX.md` (commit `7606baf15b96bf32ddf9e31232fa456f104a33b8`). Next: inspect newly generated **PayPal Developer Sandbox Webhook Events** list and delivery detail; correlate event IDs/types with authorized persisted sandbox ledger, confirm duplicate-idempotence and canonical subscription state. Do not start additional paid tests, leak payment/account identifiers, or enable paid memberships.
- **Status:** Sandbox checkout/payment/provider direct reconciliation **PASS**. Real signed sandbox webhook HTTP acceptance **PASS based on current code + logs**, event-specific audit/duplicate and account entitlement **NOT YET VERIFIED**. Public production subscription payment and paid board access **BLOCKED** until the remaining safety/entitlement gates pass.

## November 22 11:55 AM: real sandbox PayPal Family payment + callbacks

- Owner approved one **PayPal sandbox** Family test subscription at **$44.95 per month** on the `sandbox.paypal.com` test buyer flow, with a return to `sandbox_checkout.html` showing `PayPal state: ACTIVE`, `PayPal recorded the test payment` and **paid app access remains off**. This is **sandbox** evidence, not live revenue or production membership.
- Live Railway backend logs show the owner test `POST /api/paypal/pilot/checkout` **200** at 16:44:22 UTC, signed webhook receiver `POST /api/paypal/pilot/webhook` **200** at 16:44:38 UTC, authenticated `GET /api/paypal/pilot/intents/{intent}` **200** at 16:55:11 UTC, and two further webhook POSTs **200** at 16:55:27 and 16:55:28 UTC. Source webhook implementation requires PayPal `verify-webhook-signature = SUCCESS` before successful return; this is meaningful signed-delivery evidence.
- **Remaining:** view actual Sandbox Webhook Events at PayPal for today's event IDs/types and statuses; perform controlled resend to confirm idempotent outcome with authorized ledger inspection. Keep all real public paid entitlements off pending full lifecycle and 25/day authenticated quota tests. Further provider subscription approval is **not needed** just to view today's events.
- Backend runbook updated in `Scrapradar-backend/PAYPAL_SANDBOX.md`; no sensitive credentials or payment details saved.

## November 22, 1:40 PM Eastern: draft paid membership quota foundation, CI green

- Separate backend GitHub draft PR **#3** created: https://github.com/gfalvo1968-create/Scrapradar-backend/pull/3 . **NOT merged, NOT deployed**, public paid checkout and entitlements remain off.
- Implementation adds a **private, internal** SQLite atomic allowance engine for **25 physical Board Sense cases/customer/UTC day** (a multi-photo case is one case), trusted reconciled plan checks, plan separation, idempotent duplicate case IDs, cross-account binding, successful completion, and trusted server-side reservation release on failed analysis. Current PayPal sandbox subscription is NOT a valid paid entitlement and is never copied into the production membership ledger.
- New isolated GitHub Actions job `Internal paid-board quota tests` on draft PR ran **SUCCESS** (workflow run 45056501010, `paid-board-quota` job 137312803286). This is **unit testing only**, not verified Board Sense integration or full payment lifecycle.
- **Still blocking paid launch:** provider-verified production entitlement writer and webhook reconciliation; authenticated server-to-server access checks between Scrapradar backend and Board Sense; quota failure/retry correctness under actual image analysis; owner decision on daily UTC reset/failure credits; cancellation/rejoin and failed-payment policy; account portal. No production code changes were applied, and no public paid billing was activated by this work.

## November 22, 2:25 PM Eastern: Board Sense member allowance bridge, draft only

- Board Sense draft PR **#20**: https://github.com/gfalvo1968-create/Board_Sense/pull/20. **Not merged or deployed**. Adds an intentionally unused/disabled-by-default internal HTTPS client for eventual Board Sense → trusted Scrap Radar membership quota reservation. No public analysis endpoint or free-board sampler changed.
- Safety gates: exact trusted HTTPS membership origin, server-only service key, customer bearer token relay for **backend revalidation**, canonical server-generated case UUID, reject redirects and malformed responses, and **no paid-to-free fallback** during denial/outage. Browser can never choose a plan, amount, identity or quota.
- New draft contract at `Board_Sense/docs/PAID_MEMBER_BRIDGE.md` explicitly states the receiving backend route **does not exist** yet and production provider-reconciled entitlements remain a blocker.
- GitHub Actions workflow `Draft member bridge safety tests` run **45060628456** passed **11 isolated offline/mock tests**. Together with existing draft backend PR **#3** (13 quota tests passed), this is **24 passing unit/contract tests**, **not an end-to-end live member integration**.
- **Still NO-GO for public paid membership**. Free public preview is independently gated by its own service and must be evaluated separately. Next paid build: trusted backend receive endpoint requiring service identity + Auth-verified customer + production provider reconciliation; thereafter cross-service staging tests. No real customer payment exposure.
