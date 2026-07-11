from app.core.engine import BoardSenseEngine

engine = BoardSenseEngine()

features = [
    "Gold Fingers",
    "Ceramic IC",
    "Fiber Port",
    "Dense IC Layout",
    "Server RAM"
]

result = engine.analyze(features)

print(result)
