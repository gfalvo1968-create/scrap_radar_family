"""Scrap Radar central market-price normalization engine.

All Scrap Radar Family modules should consume normalized prices from this layer
instead of maintaining independent metal-price tables.
"""

from datetime import datetime, timezone

TROY_OUNCE_TO_GRAMS = 31.1034768
POUNDS_PER_METRIC_TON = 2204.6226218

METALS = {
    "gold": {"symbol": "XAU", "display_unit": "troy_oz"},
    "silver": {"symbol": "XAG", "display_unit": "troy_oz"},
    "platinum": {"symbol": "XPT", "display_unit": "troy_oz"},
    "palladium": {"symbol": "XPD", "display_unit": "troy_oz"},
    "copper": {"symbol": "XCU", "display_unit": "lb"},
}


def _number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def normalize_quote(name, raw_price, source_unit):
    price = _number(raw_price)
    if price is None or price <= 0:
        return None

    source_unit = (source_unit or "").lower().replace("$", "").strip()
    target = METALS[name]["display_unit"]

    if target == "troy_oz":
        if source_unit in {"troy_oz", "oz", "ozt"}:
            normalized = price
        elif source_unit in {"gram", "g"}:
            normalized = price * TROY_OUNCE_TO_GRAMS
        else:
            return None
    elif target == "lb":
        if source_unit in {"lb", "pound"}:
            normalized = price
        elif source_unit in {"metric_ton", "tonne", "mt"}:
            normalized = price / POUNDS_PER_METRIC_TON
        else:
            return None
    else:
        return None

    return round(normalized, 4)


def build_price_snapshot(provider_quotes, provider="unconfigured"):
    metals = {}
    for name, config in METALS.items():
        quote = (provider_quotes or {}).get(name, {})
        normalized = normalize_quote(name, quote.get("price"), quote.get("unit"))
        metals[name] = {
            "symbol": config["symbol"],
            "price": normalized,
            "currency": "USD",
            "unit": config["display_unit"],
            "available": normalized is not None,
        }

    available_count = sum(1 for item in metals.values() if item["available"])
    return {
        "status": "live" if available_count else "unavailable",
        "provider": provider,
        "currency": "USD",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "available_metals": available_count,
        "metals": metals,
    }


def empty_snapshot(message="Live market provider not configured yet."):
    snapshot = build_price_snapshot({}, provider="unconfigured")
    snapshot["message"] = message
    return snapshot
