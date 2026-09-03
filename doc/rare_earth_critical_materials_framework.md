# Scrap Radar Rare Earth + Critical Materials Framework

Status: foundation v0.1

## Core rule
A material being present in a product is not the same thing as having a supported recoverable quantity, and neither is the same thing as having a real cash-out buyer.

Scrap Radar must keep these answers separate:

1. **Presence** — What critical material may be present, and in what component or stream?
2. **Recoverability** — Is there a supported quantity and a practical downstream recovery path?
3. **Cash-out** — Is there an actual buyer/refiner quote for this form, purity, lot size and settlement basis?

## Value doctrine
- Theoretical contained value = supported material mass × benchmark reference price.
- Cash-out estimate = supported material mass × actual buyer/refiner quote.
- A benchmark is not a yard/refiner payout.
- Photos and product categories never manufacture recoverable mass.
- Market value and cash-out value stay visibly separate.
- Buyer minimums, assay fees, treatment charges, shipping, transport, processing, labor, yield and residual disposal belong in later economics before a profit claim is made.
- Stockpile is a valid path when current quantity or economics do not justify recovery.

## Evidence ladder
Suggested future evidence levels:

- **LEVEL 0 — SPECULATIVE:** product category only; material may occur in some versions.
- **LEVEL 1 — LIKELY STREAM:** known component family or chemistry makes presence plausible.
- **LEVEL 2 — DOCUMENTED:** model documentation, SDS, bill of materials, markings or known alloy/battery chemistry supports presence.
- **LEVEL 3 — MEASURED:** supported mass/quantity from disassembly, component count, calibrated measurement or trusted process data.
- **LEVEL 4 — VERIFIED:** assay/XRF/lab/refiner report supports composition and/or recoverable quantity.

Only supported quantities should enter theoretical contained-value math. Cash-out still requires a real downstream buyer/refiner basis.

## Initial material scope
Rare earths: La, Ce, Pr, Nd, Sm, Eu, Gd, Tb, Dy, Ho, Er, Tm, Yb, Lu, Sc, Y and Pm (regulated/non-routine handling warning).

Other critical materials: lithium, cobalt, nickel, gallium, germanium, indium, tantalum, tungsten, tellurium, antimony, bismuth and graphite.

## Common streams to teach
- NdFeB / SmCo magnets: hard drives, speakers, motors, generators and specialty actuators.
- NiMH batteries: lanthanum-bearing rare-earth alloy systems.
- Lithium-ion batteries: lithium plus chemistry-dependent nickel/cobalt and graphite streams.
- Tantalum capacitors: tantalum-bearing sorted component stream.
- Displays/touch panels: indium-bearing ITO may be present but area is not recoverable mass.
- LEDs/RF/power semiconductors: gallium-bearing semiconductor families may be present but board presence alone is insufficient.
- Fiber/IR optics: germanium may occur in known optical streams.
- Carbide tooling: tungsten-rich material can have a direct specialist buyer route.
- Phosphors: yttrium/europium/terbium and other rare-earth-bearing streams require specialist processing and evidence.

## Product architecture
The Critical Materials module should remain separate from the ordinary scrap-grade Pricebook until reliable benchmark and buyer-source architecture is available. It may consume the central Scrap Radar market hub later.

Board Sense / SPIKE should eventually send **critical-material evidence**, not automatic dollars. Scrap Radar should then combine that evidence with supported quantity, buyer/refiner terms, time, distance, processing cost and the user's target rate.

## Safety / regulatory guardrails
The product should not turn critical-material economics into an unsafe chemistry manual. Damaged batteries, radioactive sources and hazardous processing streams require qualified handling and legal disposal/recycling pathways.

## Future dives
- Add evidence-level selector and receipt trail for why a quantity is trusted.
- Add buyer/refiner quote metadata: buyer, form, unit, minimum lot, date, fees, assay basis and location.
- Add market benchmark adapters only from licensed/public/authorized sources.
- Add stockpile threshold logic.
- Add SPIKE critical-material evidence handoff.
- Add realized ROI only after verified sale/recovery/savings occurs.
