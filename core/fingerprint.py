import uuid


class Fingerprint:

    def create(self, features):

        return {
            "id": str(uuid.uuid4()),
            "features": features
        }
