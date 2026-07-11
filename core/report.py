class Report:

    def generate(
        self,
        evidence,
        score,
        confidence,
        recovery,
        fingerprint
    ):

        return {

            "fingerprint": fingerprint,

            "score": score,

            "confidence": confidence,

            "evidence": evidence,

            "recovery": recovery,

            "recommendation": self.recommend(score)

        }

    def recommend(self, score):

        if score >= 80:
            return "Premium Board"

        if score >= 60:
            return "High Grade"

        if score >= 40:
            return "Medium Grade"

        return "Low Grade"
