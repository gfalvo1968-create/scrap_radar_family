from pathlib import Path
import json


class BoardReasoner:

    def __init__(self, reference_path="reference_data"):
        self.reference_path = Path(reference_path)
        self.rules = {}
        self.load_rules()

    def load_rules(self):
        if not self.reference_path.exists():
            return

        for file in self.reference_path.glob("*.json"):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    self.rules[file.stem] = json.load(f)
            except Exception:
                pass

    def analyze(self, detected_features):
        evidence = []

        for feature in detected_features:
            evidence.append({
                "feature": feature,
                "weight": 10
            })

        return evidence
