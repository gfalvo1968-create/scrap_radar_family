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

## Release choices for November 19

- **Option A: Public guarded free preview.** Consider only if real iPad upload and report, refusal safety, honest uncertainty, data handling, quota, and any advertised handoff are demonstrably working. Announce the limitations: manual review on dark/unclear views and no automatic multi-photo merged valuation.
- **Option B: Signal Day awareness/announcement.** Use if the above has not passed. Share the mission and preview what is being built, but do **not** invite users into a broken workflow or promise immediate paid access. Announce the additional verification without an invented launch date.
- **Option C: Paid memberships.** **Not cleared.** Require separately demonstrated customer login, payment provider checkout, signed idempotent notifications, entitlement enforcement, cancellation/account flows, cross-account isolation, and sandbox plus controlled live validation.

**Decision record (must be filled with real evidence):**

| Gate | Current status |
| --- | --- |
| Candidate regression and staging infrastructure | PASS |
| Owner iPad dark-PCB staging report | UNTESTED on exact candidate |
| Owner iPad known-good standalone investigation | UNTESTED |
| Mixed/duplicate photos on exact owner-device candidate | UNTESTED |
| Board Sense / Scrap Radar round trip on owner iPad | UNTESTED |
| Public privacy, usage allowance, rollback | NOT SIGNED OFF |
| Paid checkout and membership | NOT VERIFIED |
| Owner final GO | PENDING |

## Ready-to-use truthful contingency message

> Tomorrow is Signal Day for Scrap Radar Family. We're sharing the mission and the tools we've been building for scrappers, recovery workers and families. We're still completing hands-on safety and reliability checks on Board Sense before opening the full experience. We'll announce access when those checks are complete. We'd rather earn your trust with a working product than rush out something we can't stand behind.

**Production safety:** Existing production deployment and all draft PRs remain unchanged by this documentation branch. Any subsequent deployment needs explicit owner release consent, a known rollback point, and real post-deploy acceptance.
