
class ScoreEngine:

    def calculate(self, evidence):

        score = 0

        for item in evidence:
            score += item.get("weight", 0)

        return score
