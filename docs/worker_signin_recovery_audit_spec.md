# Worker Sign-In & Recovery Performance: design checkpoint (November 19, 2026)

## Purpose
The owner wants a repeatable, fair training and productivity review for workers who run the same processor/station regularly. The proposed system automatically attributes **actual job results** to the authenticated worker, not merely the account that happens to be selected in a client-side form.

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
