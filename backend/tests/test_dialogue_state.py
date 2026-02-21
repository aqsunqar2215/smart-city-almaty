import pathlib
import sys
import unittest
from datetime import datetime, timedelta


sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from dialogue_state import DialogueStateManager
from intent_router_v3 import IntentPrediction


class DialogueStateTests(unittest.TestCase):
    def test_followup_boost_uses_previous_intent(self) -> None:
        mgr = DialogueStateManager(ttl_minutes=30)
        session_id = "s-followup"
        mgr.update_intent(session_id, "transport")
        pred = IntentPrediction(
            intent="weather_eco",
            confidence=0.45,
            margin=0.02,
            top2=[("weather_eco", 0.42), ("transport", 0.40)],
            routing_reason="ambiguous",
        )
        adjusted = mgr.contextualize_prediction(session_id, "what about it?", pred)
        self.assertEqual(adjusted.intent, "transport")
        self.assertGreaterEqual(adjusted.confidence, pred.confidence)
        self.assertEqual(adjusted.routing_reason, "followup_context_boost")

    def test_ttl_expires_session_state(self) -> None:
        mgr = DialogueStateManager(ttl_minutes=30)
        session_id = "s-ttl"
        mgr.update_intent(session_id, "city")
        state = mgr.get(session_id)
        state.updated_at = datetime.utcnow() - timedelta(minutes=31)
        expired_state = mgr.get(session_id)
        self.assertEqual(expired_state.last_intent, "unknown")
        self.assertEqual(expired_state.turn_count, 0)


if __name__ == "__main__":
    unittest.main()
