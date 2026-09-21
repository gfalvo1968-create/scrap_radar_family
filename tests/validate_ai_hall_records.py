#!/usr/bin/env python3
"""Validate the repository-backed Scrap Radar Family AI Hall records."""
import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {"notes.json":"note", "decisions.json":"decision", "assignments.json":"assignment", "status_updates.json":"status"}
REQUIRED = {"id", "title", "details", "author", "createdAt", "status", "priority"}
STATUSES = {"open", "in-progress", "blocked", "done"}
PRIORITIES = {"low", "normal", "high"}
ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

def iso_timestamp(value, location):
    assert isinstance(value, str) and value.endswith("Z"), f"{location} must be a UTC ISO 8601 timestamp ending in Z"
    datetime.fromisoformat(value.replace("Z", "+00:00"))

def validate():
    seen_ids = set()
    total = 0
    hall_script = (ROOT / "ai_hall.js").read_text(encoding="utf-8")
    guest_page = (ROOT / "guest_question_door.html").read_text(encoding="utf-8")
    guest_form = (ROOT / ".github" / "ISSUE_TEMPLATE" / "casey-guest-question.yml").read_text(encoding="utf-8")
    assert "Guest Contributor — Ideas &amp; Questions" in guest_page
    assert "Casey Clark — awaiting review:" in guest_form
    assert "Jerry remains owner and final decision-maker" in guest_form
    assert all(boundary in guest_form for boundary in ("private notes", "passwords", "Railway", "billing", "approvals", "merging"))
    for filename, expected_type in SOURCES.items():
        assert f'ai_hall_records/{filename}' in hall_script, f"ai_hall.js does not load {filename}"
        document = json.loads((ROOT / "ai_hall_records" / filename).read_text(encoding="utf-8"))
        assert set(document) == {"schemaVersion", "recordType", "records"}, f"{filename} has unexpected document keys"
        assert document["schemaVersion"] == 1, f"{filename} uses an unsupported schema version"
        assert document["recordType"] == expected_type, f"{filename} has the wrong recordType"
        assert isinstance(document["records"], list), f"{filename}.records must be an array"
        for index, record in enumerate(document["records"]):
            location = f"{filename}.records[{index}]"
            assert isinstance(record, dict), f"{location} must be an object"
            assert not REQUIRED - record.keys(), f"{location} is missing {sorted(REQUIRED - record.keys())}"
            allowed = REQUIRED | {"assignee", "updatedAt"}
            assert not record.keys() - allowed, f"{location} has unexpected keys {sorted(record.keys() - allowed)}"
            assert isinstance(record["id"], str) and ID_PATTERN.fullmatch(record["id"]), f"{location}.id has an invalid format"
            assert record["id"] not in seen_ids, f"duplicate record id: {record['id']}"
            seen_ids.add(record["id"])
            for field in ("title", "details", "author"):
                assert isinstance(record[field], str) and record[field].strip(), f"{location}.{field} must be a non-empty string"
            assert record["status"] in STATUSES, f"{location}.status is invalid"
            assert record["priority"] in PRIORITIES, f"{location}.priority is invalid"
            iso_timestamp(record["createdAt"], f"{location}.createdAt")
            if "updatedAt" in record: iso_timestamp(record["updatedAt"], f"{location}.updatedAt")
            if "assignee" in record: assert isinstance(record["assignee"], str) and record["assignee"].strip(), f"{location}.assignee must be non-empty"
            if expected_type == "assignment": assert "assignee" in record, f"{location}.assignee is required for assignments"
            total += 1
    return total

if __name__ == "__main__":
    count = validate()
    print(f"Validated {count} shared AI Hall records across {len(SOURCES)} files.")
