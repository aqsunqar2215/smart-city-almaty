import pathlib
import sys
import unittest


sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from intent_router_v3 import get_intent_router


class IntentRouterV3Tests(unittest.TestCase):
    def test_predict_returns_confidence_and_top2(self) -> None:
        router = get_intent_router()
        pred = router.predict("what is the air quality in almaty today")
        self.assertTrue(0.0 <= pred.confidence <= 1.0)
        self.assertGreaterEqual(len(pred.top2), 1)
        self.assertIn(pred.routing_reason, {"high_confidence", "ambiguous", "router_unavailable"})

    def test_predict_core_intents(self) -> None:
        router = get_intent_router()
        samples = [
            ("call police now", "emergency"),
            ("metro schedule and bus route", "transport"),
            ("hello there", "greeting"),
        ]
        for text, expected in samples:
            with self.subTest(text=text):
                pred = router.predict(text)
                self.assertEqual(pred.intent, expected)


if __name__ == "__main__":
    unittest.main()
