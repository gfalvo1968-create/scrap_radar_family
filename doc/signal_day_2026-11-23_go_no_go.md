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
