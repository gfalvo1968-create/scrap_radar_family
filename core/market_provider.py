"""Scrap Radar live market provider adapter.

Provider credentials and URLs belong in deployment environment variables, never
in source control. The adapter accepts a simple JSON quote feed and passes raw
quotes to core.price for normalization.
"""

import json
import os
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

from core.price import build_price_snapshot, empty_snapshot

DEFAULT_TIMEOUT = 8


def _headers():
    headers = {"Accept": "application/json", "User-Agent": "ScrapRadar/1.0"}
    api_key = os.getenv("SCRAP_RADAR_MARKET_API_KEY", "").strip()
    header_name = os.getenv("SCRAP_RADAR_MARKET_API_HEADER", "Authorization").strip()
    prefix = os.getenv("SCRAP_RADAR_MARKET_API_PREFIX", "Bearer").strip()
    if api_key:
        headers[header_name] = f"{prefix} {api_key}".strip()
    return headers


def _extract_quotes(payload):
    """Accept either {metals:{...}} or a direct {gold:{price,unit},...} map."""
    if not isinstance(payload, dict):
        return {}
    quotes = payload.get("metals", payload)
    if not isinstance(quotes, dict):
        return {}
    result = {}
    for metal in ("gold", "silver", "platinum", "palladium", "copper"):
        item = quotes.get(metal)
        if isinstance(item, dict):
            result[metal] = {"price": item.get("price"), "unit": item.get("unit")}
    return result


def get_market_snapshot():
    url = os.getenv("SCRAP_RADAR_MARKET_URL", "").strip()
    provider = os.getenv("SCRAP_RADAR_MARKET_PROVIDER", "configured-feed").strip()
    if not url:
        return empty_snapshot("Set SCRAP_RADAR_MARKET_URL to activate the live market feed.")

    try:
        request = Request(url, headers=_headers())
        with urlopen(request, timeout=DEFAULT_TIMEOUT) as response:
            payload = json.loads(response.read().decode("utf-8"))
        quotes = _extract_quotes(payload)
        snapshot = build_price_snapshot(quotes, provider=provider)
        if not snapshot.get("available_metals"):
            snapshot["message"] = "Provider responded, but no supported quotes could be normalized."
        return snapshot
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
        snapshot = empty_snapshot("Live market feed temporarily unavailable.")
        snapshot["provider"] = provider
        snapshot["error_type"] = type(exc).__name__
        return snapshot
