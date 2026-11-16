# Signal Day — November 16, 2026 release gate

**Target public date:** November 19, 2026  
**Checkpoint type:** launch readiness / no production changes  
**Owner/final release decision:** Jerry  
**Status:** CONDITIONAL / NO full paid-launch clearance yet

This checkpoint distinguishes *passing automation and online staging* from *verified production usability*. It supersedes no earlier safety requirements. It does not authorize deployment, billing activation, or use of synthetic prices as live values.

## What was checked November 16

| Surface | Observed evidence | Gate |
| --- | --- | --- |
| Scrap Radar Family GitHub Pages | Latest `pages build and deployment` workflow at commit `902e63997a22dfc4436acddde308cb32fbf87c18` completed successfully | Automated publish PASS; direct browser behavior NOT retested in this checkpoint |
| Family diagnostic regression | Workflow completed successfully on same commit | PASS, not an end-to-end iPad proof |
| Board Sense guarded staging | Railway `Board Sense Launch Staging` environment showed `Board_Sense_Staging` online, successful deployment `b83a779f-d1e4-4a57-87fd-7ef04a500909` | STAGING PASS |
| Board Sense staging automated regressions | Latest checked `PCB object-gate and grade regression checks` on guarded branch `fix/pcb-dark-laptop-review-20261113` passed, with the Jekyll CI build also successful; prior job log reported 128 tests with 9 skipped | AUTOMATED PASS, staged code only |
| Board Sense main production | Railway `hearty-quietude`, production `Board_Sense` reported **sleeping**, deployment `fe725e4c-d9f3-4ad2-95a2-7d7d6c8699b4` | WAKE / LIVE REQUEST MUST BE VERIFIED; sleeping is not proof of outage |
| Scrapradar-backend production | Railway `sparkling-manifestation`, `Scrapradar-backend` reported online and successful deployment `47f18706-d885-414b-ab12-2b6d95864541` | INFRASTRUCTURE ONLINE, workflow still needs real browser test |
| Board Sense safety patch release | PR #14 from `fix/pcb-dark-laptop-review-20261113` to `main` is open | NOT IN MAIN BY THIS CHECKPOINT; do not assume production contains its fixes |
| Paid memberships | `doc/customer-payments.md` records prices and 25 daily cases but still lists checkout, verified provider notifications, paid entitlements, account/admin pages and payment-to-access acceptance as unfinished. These notes may be stale; no more recent successful paid checkout was verified here | **NO PAID BILLING GO** without evidence |
| Owner-account and privacy setup | `doc/customer-account-setup.md` records verified iPad email flows on October 7. `doc/security-setup.md` lists additional Cloudflare origin/DNS, MFA, privacy and retention checks | REVERIFY ACCOUNT/SECURITY GATE |

**Probe limitation:** The external web/browser probe and direct HTTPS request from this execution environment could not reach the listed public URLs (tool access / DNS), so actual live `/health` and upload responses were **not verified**. Successful provider deployments do not replace a user-device smoke test.

## Release scope decision (must be explicit)

**Track A: Public free-preview / sampler.** Potential November 19 launch candidate, but only after:
1. Landing page and Board Sense pages load from the public iPad path.
2. One real, valid board photo passes upload → analyzer → usable report, with reported uncertainty and no invented buyer grade.
3. One mixed-board or unrelated-photo case reliably blocks reconciliation and any handoff.
4. Exact duplicate upload blocks independent evidence/combined grades (guarded staging behavior verified with owner's screenshot; production must be tested after approved code release).
5. Board Sense → Scrap Radar → Board Sense return preserves measured weight, buyer category, entered costs/assumptions, and date/source labels; does not claim a spot benchmark is a yard offer.
6. Free daily allowance operates on server, fails closed on missing database, and does not charge a quota for rejected validation.
7. Public privacy/retention/contact/support, sponsor links, recovery/export and rollback instructions are approved and published.
8. Production startup, domain access, service wake-up, and owner-account access protections are verified on real hardware.

**Track B: Paid memberships.** **Not cleared by this checkpoint.** Requires all Track A checks **plus** verified customer sign-in/email, checkout and displayed recurring terms, signed and idempotent payment events, paid entitlement/25-case daily enforcement, cross-account isolation, cancellation/failure/retry policies, receipts/account pages, published support/refund/privacy terms, and sandbox + controlled live acceptance. Do **not** switch on real billing because the price table or a PayPal account exists.

## Three highest-value next actions

1. **Prove production end-to-end on Jerry's iPad.** Cold load public landing → Board Sense single-photo case and report → Scrap Radar handoff → return. Record every failure with step, screenshot, and whether the issue is launch-blocking. Specifically test wake-up behavior of sleeping Board Sense production.
2. **Resolve staging-versus-production safety code.** Review PR #14 and latest regression evidence, approve/merge/deploy deliberately only after review. Confirm distinct boards, duplicate uploads, ambiguous back faces, and operator-checkbox bypass are still blocked *on the public target*.
3. **Make a written scope call:** November 19 free preview only if Track A passes, or paid launch only if Track B demonstrably passes. Avoid rushing checkout, DNS, Cloudflare, or public sharing while tests remain uncertain.

## Go / no-go record

- **Automated code and staging checks:** PASS as above.
- **Real public Board Sense production flow:** UNVERIFIED.
- **Real iPad end-to-end report and Scrap Radar return after latest changes:** UNVERIFIED.
- **Privacy/contact, security, restore and rollback owner signoff:** UNVERIFIED for final launch.
- **Paid subscriptions:** NOT VERIFIED; keep disabled unless subsequently proven.
- **GO decision:** **PENDING**. No public launch, production promotion, or paid checkout is authorized by this document.

## Principles

- No invented real-time metal prices, recoverable grams, buyer terms, or payouts.
- No automatic fusion of separate boards or duplicate photographs into a buyer grade.
- Visitor reports disclose uncertainty and manual-review states.
- Never claim completed tasks merely because CI passes. Evidence must track what actually ran and where.
- Preserve November 19 goal without confusing a free preview with a verified paid launch.
- Keep SPIKE Discovery Engine, Music Room, future AI Hall / Journal work in the Attic until public core is dependable.

## November 16, 1:45 PM — owner iPad public case check

- **PASS:** The public `board_sense_case.html` interface displayed correctly and accepted `IMG_5864.jpeg` and `IMG_5865.jpeg` into a 2/6 case tray. The checkbox was unchecked.
- **BLOCKED / review:** The same screenshot showed `Analysis stopped: this item is not confirmed as a circuit board.` This message is assigned by the live `board_case_tray.js` code after the server returns a case response, but the screenshot did not include the lower detailed report, so it does **not** establish which photo-level PCB gate or cross-view identity test caused the halt.
- **Specific frontend diagnostic:** The current public code applies `pcbGate(combined)` even when `combined.status == case_identity_failed`. Identity-placeholder results can therefore receive a generic non-PCB message, masking a different same-board-identity failure. This is a wording/routing flaw, not proof the underlying safety gate failed.
- **Change staged for review:** [Draft PR #28](https://github.com/gfalvo1968-create/scrap_radar_family/pull/28) separates identity review from actual non-board view rejection without changing backend grade/economics/handoff. Its pull-request regression run passed. **Not merged or live.**
- **Next owner action:** Do not resubmit or consume another allowance; scroll down to the existing Board Investigation Report and photograph the actual object-gate and identity details, if present. Then determine whether `IMG_5864.jpeg` was classified as unknown / PCB-like or merely insufficient for independent same-board verification.
