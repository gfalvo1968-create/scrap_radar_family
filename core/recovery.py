class RecoveryAdvisor:

    def recommend(self, features):

        recovery = {
            "Gold": 0,
            "Silver": 0,
            "Copper": 0,
            "Tantalum": 0
        }

        for feature in features:

            text = feature.lower()

            if "gold" in text:
                recovery["Gold"] += 5

            if "ceramic" in text:
                recovery["Gold"] += 2

            if "silver" in text:
                recovery["Silver"] += 3

            if "copper" in text:
                recovery["Copper"] += 3

            if "tantalum" in text:
                recovery["Tantalum"] += 4

        return recovery
