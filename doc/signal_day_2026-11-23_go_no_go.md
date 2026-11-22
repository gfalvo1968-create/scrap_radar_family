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
