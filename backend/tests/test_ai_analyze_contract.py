import os
import pathlib
import sys
import unittest
from unittest.mock import patch


sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from database import SessionLocal
from main import AIQuery, analyze_data


class AIAnalyzeContractTests(unittest.TestCase):
    def test_analyze_response_contract(self) -> None:
        db = SessionLocal()
        try:
            payload = analyze_data(
                AIQuery(
                    query="what is the traffic status now",
                    user_id=None,
                    session_id="contract-test",
                    context={"traffic": {"congestion": 55}, "air": {"aqi": 70, "pm25": 32}},
                ),
                db=db,
            )
        finally:
            db.close()

        required = {
            "response",
            "intent_detected",
            "intent_confidence",
            "engine",
            "source",
            "web_sources",
            "language",
            "proactive_suggestions",
            "processing_time_ms",
        }
        self.assertTrue(required.issubset(payload.keys()))

    def test_debug_fields_only_when_enabled(self) -> None:
        db = SessionLocal()
        try:
            with patch.dict(os.environ, {"AI_DEBUG": "1"}, clear=False):
                payload = analyze_data(AIQuery(query="air quality in almaty"), db=db)
        finally:
            db.close()

        self.assertIn("routing_reason", payload)
        self.assertIn("debug_trace_id", payload)


if __name__ == "__main__":
    unittest.main()
