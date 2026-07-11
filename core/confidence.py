class ConfidenceEngine:

    def level(self, score):

        if score >= 80:
            return "Premium"

        if score >= 60:
            return "High"

        if score >= 40:
            return "Medium"

        return "Low"
