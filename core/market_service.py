"""One market snapshot for the whole Scrap Radar Family."""

from core.market_provider import get_market_snapshot
from core.scrap_grades import build_grade_references


def get_family_market_snapshot():
    snapshot = get_market_snapshot()
    snapshot["scrap_grades"] = build_grade_references(snapshot)
    snapshot["consumer_note"] = (
        "Board Sense and Recovery Lab should consume this shared snapshot rather "
        "than maintaining independent metal prices."
    )
    return snapshot
