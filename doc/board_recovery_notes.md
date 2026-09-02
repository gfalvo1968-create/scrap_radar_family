# ♻️ Scrap Radar Board Recovery Notes

These notes preserve the planned relationship between Scrap Radar and Board Sense / SPIKE for circuit-board recovery, economics, and guided processing.

## Core Product Split

**Board Sense / SPIKE supplies the evidence. Scrap Radar turns that evidence into a business and recovery decision.**

Board Sense should go deeper on:
- Board identity and subtype
- Multi-photo verification
- Component recognition
- Gold-contact and other recovery-bearing evidence
- Board condition and previous harvesting
- What is physically present versus uncertain or missing
- Recovery-supported component maps and explanations

Scrap Radar should focus on:
- What should be done with the board now
- Sell whole versus harvest versus recover versus stockpile
- Expected value of each path
- Labor minutes and value per minute
- Processing costs
- Residual board value after harvesting
- Market/refiner/yard price basis
- Net value and economics

The two programs should not duplicate the same job. Board Sense identifies and explains. Scrap Radar evaluates the money and workflow.

---

## Board Recovery Section on the Main Scrap Radar Operating Screen

Board Recovery should remain visible as a major module on the main Scrap Radar operating screen, alongside Market & Material Pricing and the other evaluators.

Possible outputs:
- Sell whole
- Selective harvest
- Full recovery
- Stockpile
- Send to refiner
- Recycle remaining material

The user should be able to open a deeper analysis in Board Sense when more identification or physical evidence is needed.

---

## Guided Board Recovery Decision Tree

Planned workflow:

**Keep Whole → Selective Harvest → Revalue the Remainder → Separate Materials → Mechanically Process if Worthwhile → Refiner / Recycler Handoff**

### 1. Identify the board and condition

Before removing anything, establish:
- Broad board type
- Condition
- Whether the board appears intact, partially harvested, heavily harvested, or stripped
- High-value visible components
- Any uncertainty that requires more photos or verification

### 2. Decide whether the board should stay intact

Do not assume disassembly always creates more value. Some boards may be worth more sold whole.

Compare:
- Current whole-board offer
- Expected harvest value
- Remaining board value after harvest
- Labor time
- Processing cost
- Buyer/refiner requirements

### 3. Selective harvest guidance

SPIKE should identify components and classify them into practical recovery groups such as:

- **REMOVE FIRST**
- **OPTIONAL / ECONOMICS DEPENDENT**
- **LEAVE ON BOARD**
- **NOT WORTH THE TIME**

Candidate components may include, when genuinely identified and economically justified:
- CPUs / processors
- RAM and removable modules
- Gold-finger connectors
- Certain IC packages
- Relays
- Transformers
- Copper coils / inductors
- Aluminum heatsinks
- Other confirmed high-value or reusable parts

The system must not recommend stripping a component simply because it looks valuable.

### 4. Revalue the board after each harvest stage

After components are removed, Scrap Radar should ask:

**What is still here?**

Recalculate:
- Harvested component value
- Residual board value
- Time spent so far
- Value gained per minute
- Whether continuing is still worthwhile

Harvested does not automatically mean worthless.

### 5. Separate harvested material streams

Track recovered parts/material separately rather than blending everything into one board value.

Possible streams:
- Precious-metal-bearing contacts/components
- Copper-bearing components
- Aluminum heatsinks
- Ferrous parts
- Motors / transformers / coils
- Reusable electronic components
- Remaining PCB fraction

### 6. Mechanical processing as a later branch

Shredding or size reduction should be a **later step, not the first step**.

Before mechanically processing a board, remove anything worth more intact or selectively harvested.

The system may guide users through safe mechanical preparation and downstream sorting concepts such as:
- Size reduction where appropriate
- Magnetic separation
- Separation of metal-bearing and nonmetal fractions
- Preparation for a legitimate recycler or refiner

Mechanical processing should only be recommended when the economics and safety make sense.

### 7. Refiner / recycler handoff

When recovery is better handled professionally, Scrap Radar should recommend the proper downstream path rather than pretending every material should be processed in-house.

Potential guidance:
- Sell to board buyer
- Send to refiner
- Send specialty material to specialist buyer
- Recycle residual PCB fraction
- Stockpile until volume or economics justify processing

---

## Time-Value Layer

Time value should be visible at every stage.

For each step, track:
- Minutes spent
- Gross value recovered
- Additional cost
- Remaining value
- Net gain from the step
- Dollars per minute
- Dollars per hour

A component may contain valuable material but still be a poor recovery target if removal time destroys the economics.

Core question:

**Is removing this actually worth the time?**

The app should be able to stop the user from over-processing a board when the next step produces less value than selling or stockpiling the remainder.

---

## Safety Boundary

The recovery guide can explain material identification, recovery pathways, process choices, economics, required controls/PPE, and when professional refining is appropriate.

For hazardous chemical or thermal recovery, the product should emphasize safe handling and legitimate professional/refiner pathways rather than providing unsafe backyard processing instructions.

Safety is a hard gate and can override an otherwise profitable-looking recovery path.

---

## Main Scrap Radar Architecture Reminder

The current Material Pricebook is **one section of the main operating screen**, not the whole Scrap Radar product.

The larger operating screen is still planned to include modules such as:
- Market & Material Pricing
- Scrap Evaluator
- Trip / Yard Evaluator
- Buyer / Yard Comparison
- Load Evaluator
- Profit / ROI
- Inventory / History
- Market Trend / Sell-Hold Intelligence
- Precious Metals / Refinery
- **Board Recovery**
- Board Sense handoff
- Yard finder, sponsor, alerts, forecasts, and future tools

Board Recovery should use the central Scrap Radar pricing layer so every dollar can be traced back to a benchmark, buyer, yard, refiner, or user-supplied value.

**Every dollar needs a receipt.**
