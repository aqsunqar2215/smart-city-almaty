import pathlib
import sys
import unittest


sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from local_retriever import get_local_retriever


class LocalRetrieverTests(unittest.TestCase):
    def test_retrieve_returns_ranked_candidates(self) -> None:
        retriever = get_local_retriever()
        results = retriever.retrieve("emergency phone number in almaty", context_topic="emergency", top_k=3)
        self.assertGreaterEqual(len(results), 1)
        self.assertLessEqual(len(results), 3)
        if len(results) > 1:
            self.assertGreaterEqual(results[0].score, results[1].score)
        self.assertTrue(any(num in results[0].text for num in ["101", "102", "103", "112"]))

    def test_transport_query_prefers_transport_context(self) -> None:
        retriever = get_local_retriever()
        results = retriever.retrieve("metro stations and bus routes", context_topic="transport", top_k=3)
        self.assertGreaterEqual(len(results), 1)
        top_category = results[0].category
        self.assertIn(top_category, {"TRANSPORT", "CITY_INFO", "GENERAL", "CHAT"})

    def test_weather_query_avoids_chat_as_top_result(self) -> None:
        retriever = get_local_retriever()
        results = retriever.retrieve("i need to know about weather", context_topic="", top_k=3)
        self.assertGreaterEqual(len(results), 1)
        self.assertNotEqual(results[0].category, "CHAT")
        self.assertIn(results[0].category, {"ECOLOGY", "WEATHER", "CITY_INFO", "GENERAL"})


if __name__ == "__main__":
    unittest.main()
