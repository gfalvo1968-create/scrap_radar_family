# Scrap Radar launch readiness

Reviewed October 6, 2026. Working launch target: November 19, 2026.

## October release

| Area | Result |
| --- | --- |
| Whole-board comparison | Added explicit buyer category choices for drive, telecom and phone boards, using buyer samples checked October 6. Selection stays separate from SPIKE's evidence grade and requires buyer acceptance. |
| Gold, silver and copper | Retained explicit assumed recovered quantities, unit conversions, per-metal buyer percentages, total mass check and costs counted once. Stale or undated benchmarks withhold net proceeds. |
| Operating rates | Live browser save, backend backup, reload/readback and clearing passed. Private SQLite storage uses the existing persistent Railway volume. Separate profile credentials cannot read one another's rates. |
| Board scans | Atomic quota claim precedes analysis after every view validates. Header changes cannot reset the same network's allowance. Production accounting fails closed. |
| Mixed boards | Stop the case, withhold combined economics and handoff, and request separate cases. No automatic extra board reports. |
| Private source records | IRM reads and writes require a separate server admin key. The live service returns 503 while that key is absent; private source records are disabled. Tester access does not grant admin access. |
| Reference library | Repaired three malformed JSON files. All 23 load; retained nine distinct processor entries. |
| Persistent quota database | Restored, healthy, server-only table/function access verified. Existing atomic claim hardened and tested in a rolled-back transaction. |
| Cloudflare origin check | Code and regression checks ready. Inactive until Cloudflare's proxy and private request-header rule are configured. |

Validation: nine frontend JavaScript suites and the shared-record validator;
56 Board Sense tests; 17 market/profile tests; all reference JSON files parse.
The request test allows one of eight concurrent requests to analyze and rejects
seven. The market test shares one refresh among eight concurrent consumers.
These checks do not establish actual metal content in a specimen.

Live browser verification: the published frontend loads dated metal prices and
separate gold, silver and copper scenario amounts. Whole-board controls wait for
a saved board case. The buyer-category and saved-case round trip passed fixture
checks. Live operating-rate backup and reload/readback passed after deployment;
temporary example rates were cleared. Jerry's newly supplied original front/back
photos completed a live scan and Board Sense → Scrap Radar → Board Sense return.
The physical iPad flow and the recovery-grade accuracy check remain open.
Recovered report screenshots were not used as substitutes for specimen photos.

## October 6 real-board check

Original photos: `IMG_5284.jpeg` (component side) and `IMG_5285.jpeg` (back),
showing an Acer-marked mainboard. Both passed the photo-quality check at 100/100.
Without operator confirmation, SPIKE matched the views as
`PROBABLY_SAME_BOARD` at 85% and completed one two-photo case. The report and
its identity arrived in Scrap Radar; the returned metal scenario appeared in
Board Sense. Actual whole-board and recovery payouts remained unpriced.

The wiring test used deliberately assumed amounts: 0.05 g gold, 0.2 g silver
and 20 g copper, with example buyer percentages of 90%, 80% and 70%, one $1
total cost and 15 minutes. At the test's dated benchmarks, the displayed gross
subtotal was $7.42, the scenario after entered costs $5.58 and its hourly
equivalent $22.32. These are test assumptions, not measured contents, buyer
terms or predicted proceeds from this specimen. No board weight was invented.
Reopening the case restored every amount, gold unit, buyer percentage, cost
and minute entry. Refreshed benchmarks later recalculated the same assumptions
to $7.43 gross, $5.59 after entered costs and $22.34/hour.

A second public request through Spike Glass was rejected with HTTP 429 and a
message explaining that today's free analysis was used. The completed case
and its handoff remained available; no second analysis was performed.

**Recovery-grade review remains a launch gate.** The recognizer reported
`Dense Logic / Controller Board`, subtype `Embedded / Proprietary Main Logic
Board`, confidence 69%, recovery grade LOW and score 3. Local review reproduced
that result: only four logic-package candidates were supported, and the two
long connector candidates did not establish a confirmed RAM-slot bank. The
back did not lower a higher front score; the front itself scored 3. Good photo
quality does not validate that recovery grade as a buyer's sorting category.
Review the motherboard/slot/package recognition on real specimens before
relying on the broad-grade price. Use an accepted buyer category or actual
quote and measured board weight for this board's whole-board comparison;
do not raise the grade or infer precious-metal grams without evidence.

## Deployment gate

The owner confirmed payment on October 6. Railway then deployed both current
backend releases successfully; the earlier billing blocker is cleared. The
frontend Pages release also succeeded.

| Service | Verified release | Railway deployment |
| --- | --- | --- |
| Board Sense | `bd19cb62399f85eeef0931c1e53f74386e696d9c` | `753bf047-143b-40fc-b8b7-c5b5edf6eff7` |
| Scrapradar-backend | `a6403dd38d0ea4e391d257962abc3f54b04f67b3` | `37f8df68-60b7-4841-8980-7314dfd9412f` |

Board Sense `/health` returns 200 with `release: launch-20261006-phone-routing`,
rechecked during the October 6 evening closeout. The market release previously
passed HTTP 200 with `release: launch-20261006`.
The market service retained its mounted `/data` profile volume. Live checks
confirmed profile save/readback and credential isolation, rejection of negative
rates and case costs, and invalid-image rejection without consuming the public
scan allowance. The yield API counts entered round-trip travel, labor and
processing costs once; a category without recovered quantities does not invent
gold or net proceeds. Anonymous profile access returns 401, the unconfigured
private IRM route returns 503, and the persistent quota preview is available.

The valid public scan, shared daily allowance rejection and photo/report/metal
scenario return passed the real-board check above. Still verify authorized
tester access, measured-weight and buyer-category return on the owner's iPad,
and classification accuracy across the specimen set. The database-outage 503
check passed automated tests; no production database outage was induced.
Local-only saved rates remain available while the profile API is unavailable.

## Owner account and DNS gate

Follow [the security setup](security-setup.md). Preserve existing email records
and Board Sense routing while adding Cloudflare. Verify two-factor access and
private recovery methods for accounts controlling source, DNS, hosting and
database. The AI Hall's device-note password is separate from those accounts.
DNS cutover and account MFA enrollment remain owner account setup gates.

## Public demo gate

- Run real single-board cases: a drive/controller board, a phone board, a power
  board and a deliberately mixed-board case. Confirm front/back order does not
  inflate recovery scores and that uncertainty stays visible.
- On iPad, follow Board Sense → Scrap Radar → Board Sense with weight, buyer
  category, metal assumptions, costs and time. Reopen and clear cases; verify
  old tabs cannot overwrite a newly scanned board.
- Confirm price-feed behavior during unavailability as well as success. A
  market reference is not a yard offer, an assay or a promise about Friday.
  Dated buyer samples must be refreshed before launch.
- Approve the public privacy/contact text and retention policy. Uploaded
  originals are temporary; generated blueprints have shareable random URLs.
  Device cases, profiles and private notes need export/recovery instructions.
- Confirm public business contact information, sponsor links and release
  rollback instructions. Keep personal investigation accounts separate.

## Work order to launch

| Window | Exit condition |
| --- | --- |
| October 6–12 | Current release deployed; persistent quota and profile storage verified; owner account protections completed. |
| October 13–26 | Real specimen and iPad flow checks recorded; buyer categories and uncertainty corrected where evidence warrants. |
| October 27–November 9 | Family acceptance pass; public privacy/contact text, retention and backup recovery approved. |
| November 10–18 | Release freeze, fresh buyer samples, final cold-start/outage check and rehearsal. |
| November 19 | Launch only after the deployment, account/DNS and public demo gates pass. |


### October 6 — unidentified 22.6 g phone-board follow-up

Owner identifies this loose board as an older cell-phone board; exact make/model remain unknown (possibly Nokia, unconfirmed). Measured weight: **22.6 g**. Original model/casing is optional for buyer-category planning. BoardSort’s October 6 posted cell-phone-board sample is **$20.50/lb**, producing **$1.02 gross planning value** before costs and subject to buyer acceptance. This is a whole-board sale estimate, not contained-metal value.

Local production-code diagnosis initially routed the wider keypad view as unknown and chip-side view as a speaker. Object Gate v0.5 now checks circuit detail within an isolated supported PCB surface rather than diluting evidence across the background. Speaker routing also requires a visible circular perimeter across at least nine of twelve angular sectors. The six supplied original/close-up images now route as PCB locally. Automated regressions cover wide/close/rotated framing, plain colored-sheet rejection, speaker retention and partial-arc rejection. Original images are not committed to the repository.

The Board Sense worksheet now passes an explicitly selected buyer category to Scrap Radar, separately from visual recovery grade. A 22.6 g phone-category regression verifies $1.02, buyer-acceptance disclosure, unchanged identity/LOW recovery grade, no invented metal payout, return/reopen persistence, and retirement of stale estimates when category changes.

**Remaining recognition gate:** downstream logic currently produces general or power/controller labels and LOW recovery grades on these phone photos. The PCB-routing fix is deployed; all six specimen views passed the local diagnostic. Automatic phone identity, package/keypad detection and accurate recovery grading still require work. Do not treat LOW as a confirmed buyer grade or claim measured gold/silver/copper yields. Public daily quota is retained; no quota reset or extra live analysis was performed to test this change.


### October 6 evening closeout

**Closed:** PCB-versus-speaker routing fix published and deployed; current Board Sense health verified. Frontend buyer-category handoff release `fe07cb0b91aaa2d02256c6acf087f2a579c3c649` passed Pages deployment, and published worksheet/bridge bytes matched the tested files. All 56 backend tests passed, along with handoff, round-trip and operating-profile suites. The phone-board weight/category calculation is verified by regression fixtures, not a new live phone scan.

**Next:** (1) correct and validate phone keypad/package and motherboard-slot recognition on real specimens; (2) complete owner-iPad tester, new-case, weight/category and saved-return checks; (3) verify owner account/DNS protections and final privacy/retention/recovery instructions. Published metal-content reference ranges require documented specimen populations and methods before integration. Actual contained or recovered metal grams remain unknown for this board.

Working launch target remains November 19. These closed fixes do not close the remaining recognition, owner-device or security gates.
