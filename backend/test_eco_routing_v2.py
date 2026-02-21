import os
import sys
import unittest
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(__file__))

import routing_api  # noqa: E402
from routing_api import _calculate_composite_score, routing_router  # noqa: E402


def _mock_route(distance_m: float, eta_s: float, offset: float = 0.0, source: str = "road"):
    return {
        "polyline": [
            [43.2380, 76.9456],
            [43.2300 + offset, 76.9300 - offset],
            [43.2022, 76.8933],
        ],
        "distance_m": distance_m,
        "eta_s": eta_s,
        "source": source,
    }


class EcoRoutingV2Tests(unittest.TestCase):
    def setUp(self):
        app = FastAPI()
        app.include_router(routing_router)
        self.client = TestClient(app)
        routing_api._response_cache.clear()
        routing_api._aqi_cache.clear()

    def test_profile_weighting_changes_composite_priority(self):
        fastest = {"eta_s": 900, "aqi_exposure": 90000, "co2_g": 1400}
        candidate = {"eta_s": 960, "aqi_exposure": 70000, "co2_g": 1320}

        traffic_score = _calculate_composite_score(candidate, fastest, "traffic", degraded=False)
        air_score = _calculate_composite_score(candidate, fastest, "air", degraded=False)

        self.assertLess(air_score, traffic_score)

    @patch("routing_api._fetch_aqi_point")
    @patch("routing_api._fetch_osrm_route")
    def test_api_contract_has_compare_fastest_and_mode(self, mock_osrm, mock_aqi):
        mock_osrm.side_effect = [
            _mock_route(8200, 1180, 0.0000),
            _mock_route(9000, 1280, 0.0030),
            _mock_route(8600, 1230, -0.0025),
            None,
            None,
        ]
        mock_aqi.return_value = 72.0

        response = self.client.post(
            "/api/routing/eco",
            json={
                "start": {"lat": 43.2380, "lng": 76.9456},
                "end": {"lat": 43.2022, "lng": 76.8933},
                "profile": "balanced",
                "departure_time": "2026-02-21T10:30:00Z",
            },
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()

        self.assertEqual(body["status"], "ok")
        self.assertEqual(body["mode"], "road")
        self.assertGreaterEqual(len(body["routes"]), 3)

        first = body["routes"][0]
        self.assertIn("compare_fastest", first)
        self.assertIn("delta_time_s", first["compare_fastest"])
        self.assertIn("delta_aqi_exposure", first["compare_fastest"])
        self.assertIn("delta_co2_g", first["compare_fastest"])
        self.assertIn(first["type"], ["recommended", "alternative"])

    @patch("routing_api._fetch_aqi_point")
    @patch("routing_api._fetch_osrm_route")
    def test_degraded_mode_when_aqi_provider_missing(self, mock_osrm, mock_aqi):
        mock_osrm.side_effect = [
            _mock_route(8200, 1180, 0.0000),
            _mock_route(9000, 1280, 0.0030),
            _mock_route(8600, 1230, -0.0025),
            None,
            None,
        ]
        mock_aqi.return_value = None

        response = self.client.post(
            "/api/routing/eco",
            json={
                "start": {"lat": 43.2380, "lng": 76.9456},
                "end": {"lat": 43.2022, "lng": 76.8933},
                "profile": "air",
                "departure_time": "2026-02-21T10:30:00Z",
            },
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["degraded"])
        self.assertEqual(body["mode"], "road")
        self.assertTrue(all(route["degraded"] for route in body["routes"]))
        self.assertTrue(all(route["compare_fastest"]["delta_aqi_exposure"] == 0 for route in body["routes"]))


if __name__ == "__main__":
    unittest.main()
