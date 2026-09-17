# Board Sense Industrial — Attic Plan

Status: **Parked for post-launch development**

Board Sense Field remains the launch priority. Industrial work should not delay the Field beta or public release.

## Product split

### Board Sense Field
Current launch path for individual users, scrappers, yards, buyers, and field inspection.

Primary workflow:
- One physical board/case at a time.
- 2–6 photos.
- Same-board identity verification.
- Public-proofing and multiple-board safety stops.
- SPIKE Glass and board recognition.
- Board Blueprint.
- Recovery guidance and economics.
- Scrap Radar handoff.

### Board Sense Industrial
Future refinery / high-throughput version built around continuous video rather than manual case photography.

Primary workflow:
**Live camera → board detection → temporary object ID → frame-to-frame tracking → best-frame capture → physical continuity / instance separation → SPIKE analysis → grade / recovery class → routing or review lane**

## Industrial principles

- Multiple boards in one frame are expected, not automatically an error.
- Each physical board gets an independent temporary tracking ID.
- Track boards across multiple frames so touching, overlap, rotation, and hidden edges can resolve over time.
- Do not run full SPIKE reasoning on every video frame. Use lightweight detection/tracking first, then invoke deeper reasoning only for new boards, confidence drops, ambiguous joins, or final classification.
- Preserve the Field rule: **visual similarity is not physical identity.**
- Physical continuity outranks silhouette similarity.
- Uncertain boards should route to a review lane rather than be guessed.
- Industrial should reuse SPIKE's core identity, recovery, and evidence logic instead of becoming a separate reasoning system.

## Important future regression cases

Industrial training and acceptance tests should include:
- Touching PCBs.
- Overlapping / stacked PCBs.
- Broken and irregular boards.
- Harvested boards with removed gold fingers or missing material.
- Boards whose damaged edges visually align with a second PCB.
- Deliberately aligned PCBs that create false continuity.
- Different board colors and solder-mask finishes.
- Shadows, patterned conveyor backgrounds, glare, motion blur, and partial occlusion.
- Daughterboards, risers, and legitimate attached modules that must not be mistaken for unrelated boards.

### Harvested-Edge False Continuity
A permanent adversarial concept from field testing:

A second PCB can be positioned against a real harvested or damaged section of another board so the join appears to be one continuous board. Existing recovery damage can camouflage the seam.

Industrial continuity checks should therefore consider:
- whether substrate physically continues across the apparent join;
- whether traces or copper structures cross the boundary;
- whether board thickness / plane is consistent;
- whether the boundary is a manufactured edge, damage edge, harvested edge, or separate object edge;
- whether the two regions move together across successive video frames;
- whether mounting-hole and connector geometry belongs to one coherent physical object.

Video provides a major advantage: if two apparently connected regions move differently as the conveyor advances, the false-continuity illusion can collapse without requiring an expensive deep search.

## Launch guardrail

Do not begin the Industrial build until Board Sense Field is stable enough that Industrial work will not threaten the Field launch schedule.

**Field launches first. Industrial stays in the Attic until its turn.**
