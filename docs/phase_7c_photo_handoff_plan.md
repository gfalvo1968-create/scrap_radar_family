# Phase 7C: Board Sense photo handoff (draft plan)

## Current evidence
- Board Sense `board_case_tray.js` owns the original `File` objects in a private `caseFiles` array. The files are not available to `board_scrap_bridge.js` or the Scrap Radar page today.
- `board_scrap_bridge.js` generates the case ID in `normalize()`, then stores the text-only packet under `scrapRadarSpikeRecoveryPacketV1`.
- Phase 7B only displays manually selected files; it cannot reuse original Board Sense photos.

## Safe implementation sequence
1. At **successful, unblocked** Board Sense analysis, associate the exact submitted photo set with the new packet case ID. Do not use photos from a failed, blocked, or mixed-board case.
2. Generate size-bounded browser-only previews, not full-resolution images. Store separately from the text packet in session storage with a schema version, exact case ID, count, and ordinal view numbers. Use a strict aggregate size limit and clear on quota errors.
3. In Scrap Radar, render only when the preview manifest's case ID exactly matches the active packet. Label images as *transferred, unverified photos*; never treat a preview as visual verification or a buyer grade.
4. Clear previews on new case, blocked case, handoff clear, or mismatched case. Keep Phase 7B manual selection as fallback.
5. Test on iPad: two-view same-board transfer; six-view case; mixed-board stop; blocked case; new case; reload; storage disabled/quota exceeded; back/forward navigation; independent Phase 6/7/7B loading.

## Non-goals
No photo upload to GitHub, Supabase, or Railway; no persistent image archive; no automatic image analysis, buyer grading, or metal yield inference. Do not assume view 1 is the front or view 2 is the back.

## Release gate
Do not merge before iPad testing confirms no cross-case image leakage, correct labels and case IDs, and no regressions to the existing handoff.
