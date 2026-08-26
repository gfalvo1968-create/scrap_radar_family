"""Convert normalized commodity baselines into configurable scrap-grade references.

These are NOT claimed yard bids. Multipliers are conservative placeholders and
must be calibrated against actual buyer/yard data before customer-facing use.
"""

DEFAULT_MULTIPLIERS = {
    "bare_bright_copper": {"metal": "copper", "factor": 0.94, "unit": "lb"},
    "number_1_copper": {"metal": "copper", "factor": 0.90, "unit": "lb"},
    "number_2_copper": {"metal": "copper", "factor": 0.82, "unit": "lb"},
    "light_copper": {"metal": "copper", "factor": 0.70, "unit": "lb"},
}


def build_grade_references(snapshot, multipliers=None):
    multipliers = multipliers or DEFAULT_MULTIPLIERS
    metals = (snapshot or {}).get("metals", {})
    grades = {}
    for key, config in multipliers.items():
        metal = metals.get(config["metal"], {})
        baseline = metal.get("price") if metal.get("available") else None
        price = round(float(baseline) * config["factor"], 4) if baseline is not None else None
        grades[key] = {
            "metal": config["metal"],
            "reference_price": price,
            "unit": config["unit"],
            "factor": config["factor"],
            "available": price is not None,
            "kind": "market-linked reference",
        }
    return grades
