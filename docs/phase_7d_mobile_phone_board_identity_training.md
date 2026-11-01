# Phase 7D — Confirmed mobile-phone PCB identity correction

Status: TRAINING EXAMPLE / NOT YET IMPLEMENTED IN CLASSIFIER
Source: User-confirmed older cell phone main PCB, tested in Phase 7C on 2026-11-01.
Case ID: 8f62872b-6f49-4736-83b6-b64dc0c35016
Evidence: Two views of the same physical board, shown in Board Sense and transferred to Scrap Radar on the Phase 7C preview site.

## Original SPIKE output (preserve for comparison)
- Identity: Dense Logic / Controller Board
- Subtype: Embedded / Proprietary Main Logic Board
- Identity confidence: 60%
- Same-board assessment: PROBABLY_SAME_BOARD (82%)
- Recovery grade: MANUAL REVIEW
- Condition: INSPECTION NEEDED
- Observed-feature score: 3
- One region labeled copper-wound magnet candidate (75% detector confidence); physical identification unverified.

## Human-confirmed correction
- Equipment origin: older mobile phone (confirmed by person who supplied the board).
- Board family: Mobile Phone Main PCB.
- Make/model: unknown; do not invent.
- Grade and metal yields: not established by the origin confirmation. Keep MANUAL REVIEW and do not infer a dollar value or assay from photographs.
- Same-board probability is an automated assessment, not proof of authenticity.

## Training and evaluation requirements
1. Consider whole-board geometry and device-origin clues before generic chip/logic categories: narrow handset-shaped PCB, shielding, IC layout, contact-pad distribution, and opposite-side correspondence.
2. Separate origin/family confidence from component detection confidence and from recovery grade.
3. A user-confirmed origin is ground truth for this training example, but should not silently override classification of unrelated future uploads.
4. Re-examine the copper-wound magnet candidate; do not convert a candidate into a confirmed part or recovery claim.
5. Retest this case before/after any model or rules change, plus unrelated controller boards as negative controls.
6. Preserve multi-board stop behavior: conflicting physical boards must halt, not receive a family correction.
7. Do not treat the two Phase 7C reduced-size previews as verified images or as metal-content measurements.

Acceptance target: recognize likely mobile-phone PCB family on comparable evidence, express uncertainty when necessary, and keep buyer grading and economics independently gated.
