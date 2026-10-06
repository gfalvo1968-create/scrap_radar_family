# Scrap Radar launch readiness

Reviewed October 6, 2026. Working launch target: November 19, 2026.

## October release

| Area | Result |
| --- | --- |
| Whole-board comparison | Added explicit buyer category choices for drive, telecom and phone boards, using buyer samples checked October 6. Selection stays separate from SPIKE's evidence grade and requires buyer acceptance. |
| Gold, silver and copper | Retained explicit assumed recovered quantities, unit conversions, per-metal buyer percentages, total mass check and costs counted once. Stale or undated benchmarks withhold net proceeds. |
| Operating rates | Browser rates work locally. The private SQLite backend is implemented and has a persistent Railway volume; its new endpoints still need deployment. |
| Board scans | Atomic quota claim precedes analysis after every view validates. Header changes cannot reset the same network's allowance. Production accounting fails closed. |
| Mixed boards | Stop the case, withhold combined economics and handoff, and request separate cases. No automatic extra board reports. |
| Private source records | IRM reads and writes require a separate server admin key. Disabled when that key is absent. Tester access does not grant admin access. |
| Reference library | Repaired three malformed JSON files. All 23 load; retained nine distinct processor entries. |
| Persistent quota database | Restored, healthy, server-only table/function access verified. Existing atomic claim hardened and tested in a rolled-back transaction. |
| Cloudflare origin check | Code and regression checks ready. Inactive until Cloudflare's proxy and private request-header rule are configured. |

Validation: nine frontend JavaScript suites and the shared-record validator;
52 Board Sense tests; 17 market/profile tests; all reference JSON files parse.
The request test allows one of eight concurrent requests to analyze and rejects
seven. The market test shares one refresh among eight concurrent consumers.
These checks do not establish actual metal content in a specimen.

## Deployment gate

Railway previously rejected a new source build because the workspace trial
expired. Confirm billing in the owner account, then deploy current `main` for
both Board Sense and Scrapradar-backend. Check each `/health` response contains
`release: launch-20261006`; a successful older deployment does not satisfy this
gate. Keep the market service's existing `/data` profile volume.

After deployment, verify a browser profile round trip, one public scan followed
by a 429, authorized tester access, anonymous IRM denial, and database outage
returning 503 before analysis. Local-only saved rates remain available while
the profile API is unavailable.

## Owner account and DNS gate

Follow [the security setup](security-setup.md). Preserve existing email records
and Board Sense routing while adding Cloudflare. Verify two-factor access and
private recovery methods for accounts controlling source, DNS, hosting and
database. The AI Hall's device-note password is separate from those accounts.
No DNS cutover, paid plan change or account MFA enrollment has been claimed as
completed by this release.

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
