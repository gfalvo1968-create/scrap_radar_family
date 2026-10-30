# SPIKE Buyer Price Intelligence: Training Rules v1
Status: training specification, not an active automatic pricing engine.
Owner: Scrap Radar Family. Updated: 2026-10-30.

## Purpose
Estimate board resale and recovery economics without confusing observed evidence, buyer categories, historical prices, and hypothetical metal yields.

## Required evidence
- Board photos: front, back, connectors, markings; identify whether all photos show the same physical board.
- Scale weight with unit (oz, lb, g); normalize to pounds using 16 oz/lb and 453.59237 g/lb.
- Board dimensions when available; condition, attached heat sinks, steel, batteries, daughterboards, and other buyer exclusions.
- Board identity/subtype, observed chip and connector features, confidence, and whether grade was withheld.
- Buyer location/region, category description, preparation requirements, minimums, shipping/fees, and effective quote date.

## Price-source record
Store: buyer, source URL, source capture date, effective price date if available, exact buyer category, USD/lb, preparation requirements, applicability notes, verification status, and expiration/recheck date.
Do not present a cached or illustrative number as a live offer. Never merge dissimilar buyer categories into an unqualified national average.
The existing board_price_reference.js contains dated planning samples (asOf 2026-10-06), not live quotes. Reverify each sample against its buyer before use.

## Matching logic
1. Reject mixed-board cases and unusable evidence.
2. Separate identity confidence from buyer-category confidence.
3. Match buyer-specific categories using visible evidence and buyer requirements; list missing evidence.
4. If category is unverified, display a range of *labeled candidate scenarios* only when supported by dated source records; never silently pick a grade.
5. If no defensible category/price exists, withhold dollar estimate and ask for the next decisive photo, marking, preparation detail, or actual buyer quote.
6. Weight × USD/lb = gross board sale estimate. Deduct travel, shipping, fees, and processing time separately to compute net. Never call gross 'profit'.
7. Maintain distinct paths: sell whole, sorted parts plus residual, and recovered metals minus costs/losses. No double counting.

## Metal recovery scenarios
Never infer gold, silver, palladium, platinum, or iridium yields from chip count alone. Label entered yields as assumptions, not measurements. Show recovery efficiency, costs, time, assay uncertainty, and metal price date. Avoid promising profitable chemical recovery.

## Example: 13 oz controller board
Weight: 0.8125 lb. Identity confidence: 62%. Same-board verification: 85%. Recovery grade: MANUAL REVIEW / withheld.
Decision: do not assign an automatic whole-board buyer category or payout. Show exact missing evidence and optional buyer-specific candidate scenarios only when their requirements can be inspected. An assumed 0.1 g gold scenario is not measured yield or board payout.

## Acceptance tests
- 13 oz converts to 0.8125 lb and approximately 368.54 g.
- Withheld grade + no confirmed category -> explanatory warning, not fabricated payout.
- Confirmed buyer category + dated valid price -> gross estimate with source/date and costs separate.
- Stale or unreachable source -> clearly marked historical; no 'live' claim.
- Different board photos -> stop and start new case.
- Buyer category selection does not rewrite SPIKE's identity or recovery grade.
- Metal recovery assumed yields remain separate from board resale.
