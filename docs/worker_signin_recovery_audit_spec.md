# Worker Sign-In & Recovery Performance: design checkpoint (November 19, 2026)

## Purpose
The owner wants a repeatable, fair training and productivity review for workers who run the same processor/station regularly. The proposed system automatically attributes **actual job results** to the authenticated worker, not merely the account that happens to be selected in a client-side form.

## Founding principle: evidence informs people

> **We're not trying to replace human judgment. We're trying to give human judgment an honest foundation.**

This principle belongs in both the employee-facing fairness promise and the owner-facing design standards. The system should surface verifiable measurements, traceable corrections, consistent comparisons, positive recognition and six-month raise-review escalations. It must not autonomously accuse, punish, award compensation, or claim that data cannot be manipulated. Workers can review and challenge the evidence; managers must explain decisions. Human accountability remains essential on both sides.

## Existing staged feature versus future authentication
- The draft `scrap_radar_labor_presets.js` is **browser-local convenience only**. It remembers worker display names, hourly planning rates and usual process/station assignments.
- It does **not** sign employees in, verify identity, record actual output, or provide trusted audit history. Anyone using the same browser can change local presets.
- The displayed **Your Target $ / Hour** is presently a *time-value comparison*. Do not present it as wages paid or as an additional payroll expense. Keep labor cost accounting and a target return concept distinct to prevent double charging.
- Never claim worker productivity or actual recovery profit from estimated buyer prices, hypothetical metal yields, or unverified Board Sense grades.

## Suggested worker experience
1. Owner creates worker account and assigns a stable unique worker ID, permitted stations and role; initials are display-friendly, but not unique.
2. Worker enters their unique worker ID and a PIN; server verifies identity, rate limits attempts, and starts a short-lived session. A 4-digit code may only be acceptable as a *convenience* factor with strict throttling, lockouts, revocation and additional account/device controls; a longer PIN is preferable. Do not rely on initial + four digits as the only secret.
3. Worker selects station/job and verifies the automatically loaded hourly rate, with a manager-only action to change the wage.
4. Worker records input batch/material, measured input weight, process and actual work minutes; upon completion records recovered saleable output, actual measured recovered weights and grade evidence, separate sale/settlement confirmation, process consumables, hauling and verified payouts.
5. A signed-in supervisor reviews and closes records. Show edits and corrections as append-only events, never silently overwrite provenance.
6. Worker signs out or is automatically timed out; changing employees requires a fresh sign-in.

## Data model (server-side; pseudocode)
- `workers(id, unique_code, display_name, status, role, created_at)`; keep identity details minimal.
- `worker_credentials(worker_id, pin_hash, failed_attempts, locked_until, rotated_at)`; authenticated staff service only, no PINs in front-end code/localStorage, use secure server-side hashing, rate limiting, session expiry and reset flow.
- `worker_rate_history(worker_id, hourly_rate, effective_from, approved_by, created_at)`; changing a raise must not rewrite historical job costs.
- `stations(id, label, active)`; `station_assignments(station_id, worker_id, effective_from, effective_to, approved_by)`.
- `recovery_jobs(id, station_id, worker_id, started_at, ended_at, input_weight_grams_or_pounds, material_grade, source_batch_id, status)`.
- `recovery_job_results(job_id, weighed_output, measured_units, consumed_material_costs, labor_minutes, applied_rate_snapshot, logistics_costs, buyer_quote_or_receipt, recognized_revenue, owner_review_status)`.
- `audit_events(job_id, actor_id, action, timestamp, before_after_digest)` append-only; limited access by role.
- Identify the *person* and their *verified session* on the server, never trust a submitted worker_id alone.

## Owner private dashboard
- Filter by date, station, worker and material/grade; compare **similar batches and verified outcomes**, not raw dollar total alone.
- Show recovered yield/weight, verified net after actual labor and costs, time per unit, rework/reject rates, and data completeness.
- Flag unusual variation for owner review with context about incoming grade, machinery, run size, experience, buyer price changes and downtime; it is a *training prompt*, not an automatic employee finding.
- Owner can recognize excellent results, assign coaching, and confirm a rate increase or worker transfer.
- Workers see their own results and corrections; only owner/supervisors see other workers' comparisons and payroll rates.

## Security, privacy & release gates
- Access controlled server-side using vetted authentication or a carefully reviewed staff PIN service; enforce owner-only role on rates and report views.
- Audit source-of-truth must be a protected database; localStorage is neither identity verification nor durable financial evidence.
- Restrict unnecessary personal information, preserve data only as needed for operations, and give employees transparent notice of collection/use.
- Reject unauthenticated submissions, replayed/reused sessions, wrong-account attempts, and tampered worker IDs; test logouts, multi-device access, PIN reset, duplicate initials and lockout recovery.
- A role/PIN feature is **not** to be merged simply to meet Signal Day; test before exposing employees or recording purported actual results.

## Material accountability: small-loss variance control
A single unexplained 0.1 gram per workday is 26 grams across 260 days; 0.1 gram every calendar day is 36.5 grams in 365 days. **These are scenarios, not assumed losses or evidence of employee wrongdoing.**

- At **batch intake**, record material type and grade, net weight, scale ID/calibration status, timestamp, source batch and the authenticated worker accepting custody.
- During each **controlled transfer** (processor feed, harvest, residue, temporary stock, shipment), log measured quantity, unit, source/destination station, signed-in sender and receiver, and timestamp. An accountable owner/supervisor approves adjustments and waste classifications.
- At **batch close**, reconcile the mass balance: verified incoming weight minus weighed outputs, residuals, documented process waste and remaining work-in-progress. Keep gross circuit-board mass distinct from assay-derived recoverable precious-metal mass; do not compare unlike streams as if all input grams should become recovered metal.
- Show measured yield ratios only for like-for-like grades/processes with complete inputs. Track **estimated theoretical yield separately** from measured recovery and verified sale proceeds.
- Configure station/material-specific thresholds based on measurement uncertainty, normal process loss, and verified historical yields; alert a supervisor on unexplained discrepancies or repeated adverse drift. Never presume that a low yield is theft.
- Use **append-only corrections and chain of custody**, including scale calibration log, batch status, and authorization for scrap disposal; prohibit a worker from silently changing their own closed result.
- Owner sees trends and can ask questions or schedule training. If loss prevention requires investigation, provide measured evidence and allow equipment/quality explanations before considering individual accountability.
- Reports are owner-only and exclude unnecessary personal data. Do not alert or accuse workers based solely on hypothetical per-day variance.

### Acceptance cases for future authenticated rollout
1. Record 0.1 gram actual unexplained mass variance with stable calibration and complete batch accounting, then flag against a user-approved threshold when exceeded.
2. Confirm a mathematically equivalent clean batch is not flagged; verify routine documented residue or assay uncertainty isn't misrepresented as missing precious metal.
3. Two workers on the same processor must retain distinct verified sessions and handoffs. Shared-device sign-out prevents cross-attribution.
4. A worker cannot alter final receipts or retroactively change the applied wage; approved supervisor correction creates a visible history event.
5. Missing scale readings or unverified buyer settlement results in **incomplete evidence**, not a fabricated profit or theft claim.

## Positive performance recognition and raise-review triggers

The system is for **fair recognition as well as detecting process variation**. A worker who produces consistently better verified results should be eligible for an owner-reviewed raise, bonus, promotion, or peer-training opportunity. The software must never promise automatic compensation or autonomously change wages.

- The example discussed by the owner is a **4% sustained improvement** in verified recovery relative to a fair comparable baseline. Treat 4% as an example/owner-configurable review threshold, **not** a guaranteed raise or automatic finding.
- Define the comparison metric explicitly: *verified recovery value per comparable input batch*, *recovered mass/yield of a specific metal per comparable incoming grade*, or *verified contribution margin after costs*. Never interchange these measures.
- Evaluate a configurable review window, such as consecutive comparable batches or weeks, with minimum sample size and consistency requirements. Do not count a single lucky batch as a trend.
- Normalize for starting material type/grade, input batch weight, assay uncertainty, buyer prices, machine condition, shift, and actual processing time. Exclude unverified theoretical yields and fabricated market-price estimates.
- Include **beneficial process effects** such as lower scrap losses, safer handling, improved measured yield, fewer rejected batches, and repeatable techniques useful to train colleagues.
- Owner-only dashboard can display `Sustained above-baseline recovery: review for recognition` with evidence, confidence, dates and comparable peers; also allow employee to see their own measured accomplishments and dispute inaccurate records.
- A performance flag opens a **human pay-review conversation**, not an automatic salary decision. Any approved raise creates a dated, owner-approved rate-history record. Historical job economics must retain the rate that applied when the work happened.
- The same investigation standard applies to unusually low output: check measuring equipment, input quality, differences in machine settings and work assignment before drawing conclusions. Do not presume fraud, punish a worker automatically, or rank dissimilar jobs.
- Avoid perverse incentives: employees should not be rewarded for skipping safety rules, misclassifying input grade, discarding unrecovered residue improperly, or rushing documentation.

Acceptance criteria for a future owner-approved implementation: a sustained ~4% verified improvement on a fair baseline generates a review prompt; isolated/noisy changes and mismatched material do not; confirmed raises update only effective-dated future calculations; workers see the evidence supporting decisions.

### Owner policy: early recognition flag, six-month raise escalation

- **Early recognition:** As soon as a statistically credible sustained positive pattern emerges, raise a positive-performance flag on the owner dashboard. Notify the owner without promising a raise or withholding recognition until six months. Require comparable batches, verified recovery measures, adequate sample size, safety/quality context and opportunities for worker correction.
- **Six-month escalation:** If the worker maintains documented above-baseline performance for **six consecutive months**, automatically escalate the positive-performance flag to **Raise Review Due** for the owner/supervisor. The recommendation is to evaluate a raise, not to apply an automatic payroll change.
- **Review packet:** Show the six-month evidence history, fair baseline and batch mix, variance/uncertainty, safety and quality, mentorship contributions, verified incremental contribution margin, current wage, any prior raises, and suggested review options. A missing performance measurement is flagged as incomplete rather than counted against the worker.
- **Decision record:** The owner approves a raise (with effective date), approves another kind of recognition, documents a reason to defer, or seeks more evidence. Keep the review record visible to the owner and provide the employee an appropriate explanation and appeal/correction mechanism. Set a follow-up for deferred reviews so they do not quietly disappear.
- **No perverse incentives:** Do not reward unsafe shortcuts, skimped containment, selective reporting or material substitution. Six months of results must be like-for-like, not a naive comparison of gross revenue between dissimilar machines or material grades.
- **Payroll integrity:** A raise changes the rate history starting on its approved effective date only; never rewrite historic labor-cost snapshots. Future job defaults adopt the new rate after approval.

The 4% improvement referenced in conversation remains an example of a positive trend, not a universal threshold or guarantee of a wage increase.
