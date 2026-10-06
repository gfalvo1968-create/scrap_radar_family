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
52 Board Sense tests; 17 market/profile tests; all reference JSON files parse.
The request test allows one of eight concurrent requests to analyze and rejects
seven. The market test shares one refresh among eight concurrent consumers.
These checks do not establish actual metal content in a specimen.

Live browser verification: the published frontend loads dated metal prices and
separate gold, silver and copper scenario amounts. Whole-board controls wait for
a saved board case. The buyer-category and saved-case round trip passed fixture
checks. Live operating-rate backup and reload/readback passed after deployment;
temporary example rates were cleared. A new real-board scan and iPad round trip
still need original front/back board photos. Recovered report screenshots were
not used as substitutes for specimen photos.

## Deployment gate

The owner confirmed payment on October 6. Railway then deployed both current
backend releases successfully; the earlier billing blocker is cleared. The
frontend Pages release also succeeded.

| Service | Verified release | Railway deployment |
| --- | --- | --- |
| Board Sense | `a5c707520a059baf7f25d1e980e6fb1dc13a40ed` | `edb02a79-2356-40f9-89ca-71d4e82f1de5` |
| Scrapradar-backend | `a6403dd38d0ea4e391d257962abc3f54b04f67b3` | `37f8df68-60b7-4841-8980-7314dfd9412f` |

Both live `/health` responses return 200 with `release: launch-20261006`.
The market service retained its mounted `/data` profile volume. Live checks
confirmed profile save/readback and credential isolation, rejection of negative
rates and case costs, and invalid-image rejection without consuming the public
scan allowance. The yield API counts entered round-trip travel, labor and
processing costs once; a category without recovered quantities does not invent
gold or net proceeds. Anonymous profile access returns 401, the unconfigured
private IRM route returns 503, and the persistent quota preview is available.

Still verify a valid public scan followed by 429, authorized tester access and
the complete photo/report/handoff flow. The database-outage 503 check passed
automated tests; no production database outage was induced. Local-only saved
rates remain available while the profile API is unavailable.

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
