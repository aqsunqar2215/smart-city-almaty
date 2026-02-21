import pathlib
import sys
import unittest
from unittest.mock import patch


sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from database import SessionLocal
from enhanced_gpt_ai import get_enhanced_ai
from main import AIQuery, analyze_data


class NoLLMRuntimeTests(unittest.TestCase):
    def test_chat_and_analyze_work_without_llm_calls(self) -> None:
        with patch("llm_engine.get_llm", side_effect=AssertionError("LLM runtime must not be called")):
            ai = get_enhanced_ai()
            response = ai.get_full_response("what is emergency phone number", session_id="no-llm-test")
            self.assertTrue(response.text)
            self.assertIn(response.source, {"retrieval_factual", "domain_template", "live_data", "controlled_fallback"})

            db = SessionLocal()
            try:
                api_payload = analyze_data(
                    AIQuery(query="what is current air quality", session_id="no-llm-api"),
                    db=db,
                )
            finally:
                db.close()

            self.assertIn("response", api_payload)
            self.assertIn("source", api_payload)


if __name__ == "__main__":
    unittest.main()
