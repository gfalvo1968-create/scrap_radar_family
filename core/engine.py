from core.reasoning import BoardReasoner
from core.scoring import ScoreEngine
from core.confidence import ConfidenceEngine
from core.recovery import RecoveryAdvisor
from core.fingerprint import Fingerprint
from core.report import Report


class BoardSenseEngine:

    def __init__(self):

        self.reasoner = BoardReasoner()
        self.scorer = ScoreEngine()
        self.confidence = ConfidenceEngine()
        self.recovery = RecoveryAdvisor()
        self.fingerprint = Fingerprint()
        self.report = Report()

    def analyze(self, detected_features):

        evidence = self.reasoner.analyze(detected_features)

        score = self.scorer.calculate(evidence)

        confidence = self.confidence.level(score)

        recovery = self.recovery.recommend(detected_features)

        fingerprint = self.fingerprint.create(detected_features)

        return self.report.generate(
            evidence=evidence,
            score=score,
            confidence=confidence,
            recovery=recovery,
            fingerprint=fingerprint
        )
