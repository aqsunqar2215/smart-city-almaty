from __future__ import annotations

import datetime as dt
import math
import threading
import time
from dataclasses import dataclass
from typing import Literal

import httpx
from fastapi import APIRouter
from pydantic import BaseModel, Field

routing_router = APIRouter(prefix="/api/routing", tags=["routing"])

OSRM_URL = "https://router.project-osrm.org/route/v1/driving"
AQI_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

PRIMARY_CACHE_TTL_SECONDS = 300
LOW_VOLATILITY_CACHE_TTL_SECONDS = 900
AQI_CACHE_TTL_SECONDS = 300

PROFILE_WEIGHTS: dict[str, dict[str, float]] = {
    "traffic": {"time": 0.70, "aqi": 0.20, "co2": 0.10},
    "balanced": {"time": 0.45, "aqi": 0.35, "co2": 0.20},
    "air": {"time": 0.20, "aqi": 0.60, "co2": 0.20},
}

FEATURE_FLAGS = {
    "ECO_ROUTING_V2": True,
    "AQI_EXPOSURE_SCORING": True,
    "ROAD_CANDIDATE_DEDUP": True,
}

HEALTH_RISK_THRESHOLDS = {
    "low": 50,
    "moderate": 100,
    "high": 150,
}


@dataclass
class CacheEntry:
    payload: dict
    expires_at: float


_response_cache: dict[str, CacheEntry] = {}
_aqi_cache: dict[str, CacheEntry] = {}
_cache_lock = threading.Lock()
_inflight_locks: dict[str, threading.Lock] = {}


class LatLng(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)


class EcoRoutingRequest(BaseModel):
    start: LatLng
    end: LatLng
    profile: Literal["traffic", "balanced", "air"] = "balanced"
    departure_time: dt.datetime | None = None


def _now_ts() -> float:
    return time.time()


def _cache_get(cache: dict[str, CacheEntry], key: str) -> dict | None:
    now = _now_ts()
    with _cache_lock:
        entry = cache.get(key)
        if not entry:
            return None
        if entry.expires_at <= now:
            cache.pop(key, None)
            return None
        return entry.payload


def _cache_set(cache: dict[str, CacheEntry], key: str, payload: dict, ttl_seconds: int) -> None:
    with _cache_lock:
        cache[key] = CacheEntry(payload=payload, expires_at=_now_ts() + ttl_seconds)


def _get_inflight_lock(key: str) -> threading.Lock:
    with _cache_lock:
        if key not in _inflight_locks:
            _inflight_locks[key] = threading.Lock()
        return _inflight_locks[key]


def _geohash_encode(lat: float, lng: float, precision: int = 6) -> str:
    base32 = "0123456789bcdefghjkmnpqrstuvwxyz"
    lat_interval = [-90.0, 90.0]
    lng_interval = [-180.0, 180.0]
    geohash: list[str] = []
    bits = [16, 8, 4, 2, 1]
    bit = 0
    ch = 0
    even = True

    while len(geohash) < precision:
        if even:
            mid = (lng_interval[0] + lng_interval[1]) / 2
            if lng > mid:
                ch |= bits[bit]
                lng_interval[0] = mid
            else:
                lng_interval[1] = mid
        else:
            mid = (lat_interval[0] + lat_interval[1]) / 2
            if lat > mid:
                ch |= bits[bit]
                lat_interval[0] = mid
            else:
                lat_interval[1] = mid
        even = not even
        if bit < 4:
            bit += 1
        else:
            geohash.append(base32[ch])
            bit = 0
            ch = 0

    return "".join(geohash)


def _timeslot_key(departure_time: dt.datetime | None) -> str:
    dep = departure_time or dt.datetime.utcnow().replace(tzinfo=dt.timezone.utc)
    dep_utc = dep.astimezone(dt.timezone.utc)
    slot_minute = (dep_utc.minute // 5) * 5
    return dep_utc.replace(minute=slot_minute, second=0, microsecond=0).isoformat()


def _cache_ttl_for_departure(departure_time: dt.datetime | None) -> int:
    if departure_time is None:
        return PRIMARY_CACHE_TTL_SECONDS
    dep = departure_time.astimezone(dt.timezone.utc)
    delta = dep - dt.datetime.now(dt.timezone.utc)
    if delta.total_seconds() <= 3 * 3600:
        return PRIMARY_CACHE_TTL_SECONDS
    return LOW_VOLATILITY_CACHE_TTL_SECONDS


def _routing_cache_key(req: EcoRoutingRequest) -> str:
    start_hash = _geohash_encode(req.start.lat, req.start.lng, precision=7)
    end_hash = _geohash_encode(req.end.lat, req.end.lng, precision=7)
    slot = _timeslot_key(req.departure_time)
    return f"{start_hash}:{end_hash}:{req.profile}:{slot}"


def _haversine_m(p1: tuple[float, float], p2: tuple[float, float]) -> float:
    lat1, lon1 = p1
    lat2, lon2 = p2
    r = 6_371_000
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def _polyline_length_m(polyline: list[list[float]]) -> float:
    if len(polyline) < 2:
        return 0.0
    total = 0.0
    for idx in range(1, len(polyline)):
        total += _haversine_m((polyline[idx - 1][0], polyline[idx - 1][1]), (polyline[idx][0], polyline[idx][1]))
    return total


def _coarse_polyline_hash(polyline: list[list[float]]) -> str:
    if len(polyline) < 2:
        return ""
    step = max(1, len(polyline) // 12)
    sampled = polyline[::step]
    if sampled[-1] != polyline[-1]:
        sampled.append(polyline[-1])
    return "|".join(f"{p[0]:.4f},{p[1]:.4f}" for p in sampled)


def _meters_to_human(distance_m: float) -> str:
    if distance_m >= 1000:
        return f"{distance_m / 1000:.1f} km"
    return f"{int(round(distance_m))} m"


def _build_instruction_from_step(step: dict) -> str:
    maneuver = step.get("maneuver", {}) if isinstance(step, dict) else {}
    name = (step.get("name") or "").strip()
    m_type = (maneuver.get("type") or "continue").lower()
    modifier = (maneuver.get("modifier") or "").lower()

    if m_type in {"depart", "new name"}:
        return f"Start on {name}" if name else "Start route"
    if m_type in {"arrive"}:
        return "Arrive at destination"
    if m_type in {"roundabout", "rotary"}:
        return f"Take roundabout to {name}" if name else "Take the roundabout"
    if m_type in {"merge", "on ramp", "off ramp"}:
        if modifier:
            return f"Merge {modifier} onto {name}" if name else f"Merge {modifier}"
        return f"Merge onto {name}" if name else "Merge"
    if m_type in {"turn"}:
        if modifier:
            return f"Turn {modifier} onto {name}" if name else f"Turn {modifier}"
        return f"Turn onto {name}" if name else "Turn"
    if m_type in {"fork"}:
        if modifier:
            return f"Keep {modifier} at fork"
        return "Keep at fork"
    if name:
        return f"Continue on {name}"
    return "Continue"


def _extract_osrm_steps(route: dict) -> list[dict]:
    legs = route.get("legs", []) if isinstance(route, dict) else []
    if not legs:
        return []
    flat_steps: list[dict] = []
    for leg in legs:
        for step in leg.get("steps", []):
            distance_m = float(step.get("distance", 0.0))
            duration_s = int(round(float(step.get("duration", 0.0))))
            flat_steps.append(
                {
                    "instruction": _build_instruction_from_step(step),
                    "distance_m": int(round(distance_m)),
                    "duration_s": duration_s,
                    "distance_text": _meters_to_human(distance_m),
                }
            )
            if len(flat_steps) >= 8:
                return flat_steps
    return flat_steps


def _midpoint_with_perpendicular_offset(start: LatLng, end: LatLng, offset_m: float) -> tuple[float, float]:
    mid_lat = (start.lat + end.lat) / 2
    mid_lng = (start.lng + end.lng) / 2
    cos_lat = max(0.1, math.cos(math.radians(mid_lat)))

    vx = (end.lng - start.lng) * 111_320 * cos_lat
    vy = (end.lat - start.lat) * 111_320
    norm = math.hypot(vx, vy)
    if norm < 1:
        return mid_lat, mid_lng

    px = -vy / norm
    py = vx / norm
    offset_x = px * offset_m
    offset_y = py * offset_m

    via_lat = mid_lat + offset_y / 111_320
    via_lng = mid_lng + offset_x / (111_320 * cos_lat)
    return via_lat, via_lng


def _extra_grid_waypoints(start: LatLng, end: LatLng, offset_m: float) -> list[list[tuple[float, float]]]:
    via_main = _midpoint_with_perpendicular_offset(start, end, offset_m)
    via_alt = _midpoint_with_perpendicular_offset(start, end, -offset_m * 0.8)
    quarter = LatLng(
        lat=start.lat + (end.lat - start.lat) * 0.35,
        lng=start.lng + (end.lng - start.lng) * 0.35,
    )
    three_quarter = LatLng(
        lat=start.lat + (end.lat - start.lat) * 0.7,
        lng=start.lng + (end.lng - start.lng) * 0.7,
    )
    q1 = _midpoint_with_perpendicular_offset(quarter, three_quarter, offset_m * 0.5)
    q2 = _midpoint_with_perpendicular_offset(quarter, three_quarter, -offset_m * 0.5)
    return [[q1, via_main], [q2, via_alt]]


def _build_route_candidates(start: LatLng, end: LatLng) -> list[list[tuple[float, float]]]:
    direct = [(start.lat, start.lng), (end.lat, end.lng)]
    trip_distance = _haversine_m((start.lat, start.lng), (end.lat, end.lng))
    offset_m = min(1500.0, max(450.0, trip_distance * 0.16))

    via_left = _midpoint_with_perpendicular_offset(start, end, offset_m)
    via_right = _midpoint_with_perpendicular_offset(start, end, -offset_m)
    candidates: list[list[tuple[float, float]]] = [
        direct,
        [(start.lat, start.lng), via_left, (end.lat, end.lng)],
        [(start.lat, start.lng), via_right, (end.lat, end.lng)],
    ]

    if trip_distance > 11_000:
        for pair in _extra_grid_waypoints(start, end, offset_m):
            candidates.append([(start.lat, start.lng), pair[0], pair[1], (end.lat, end.lng)])

    return candidates


def _fetch_osrm_route(points: list[tuple[float, float]]) -> dict | None:
    coords = ";".join(f"{lng},{lat}" for lat, lng in points)
    url = f"{OSRM_URL}/{coords}?overview=full&geometries=geojson&alternatives=false&steps=true"
    try:
        response = httpx.get(url, timeout=6.5)
        if response.status_code != 200:
            return None
        data = response.json()
        if data.get("code") != "Ok" or not data.get("routes"):
            return None
        route = data["routes"][0]
        geometry = route.get("geometry", {}).get("coordinates", [])
        if len(geometry) < 2:
            return None
        polyline = [[lat, lng] for lng, lat in geometry]
        return {
            "polyline": polyline,
            "distance_m": float(route.get("distance", _polyline_length_m(polyline))),
            "eta_s": float(route.get("duration", 0.0)),
            "source": "road",
            "steps": _extract_osrm_steps(route),
        }
    except Exception:
        return None


def _build_estimated_route(start: LatLng, end: LatLng, variant: int) -> dict:
    midpoint = _midpoint_with_perpendicular_offset(start, end, (variant - 1) * 700.0)
    polyline = [
        [start.lat, start.lng],
        [midpoint[0], midpoint[1]],
        [end.lat, end.lng],
    ]
    distance_m = _polyline_length_m(polyline)
    avg_speed_kmh = 38.0 - (variant * 2.5)
    eta_s = (distance_m / 1000.0) / max(avg_speed_kmh, 18.0) * 3600.0
    segment_duration = int(round(eta_s / 2))
    steps = [
        {
            "instruction": "Start route",
            "distance_m": int(round(_haversine_m((start.lat, start.lng), (midpoint[0], midpoint[1])))),
            "duration_s": segment_duration,
            "distance_text": _meters_to_human(_haversine_m((start.lat, start.lng), (midpoint[0], midpoint[1]))),
        },
        {
            "instruction": "Continue to destination",
            "distance_m": int(round(_haversine_m((midpoint[0], midpoint[1]), (end.lat, end.lng)))),
            "duration_s": segment_duration,
            "distance_text": _meters_to_human(_haversine_m((midpoint[0], midpoint[1]), (end.lat, end.lng))),
        },
        {
            "instruction": "Arrive at destination",
            "distance_m": 0,
            "duration_s": 0,
            "distance_text": "0 m",
        },
    ]
    return {
        "polyline": polyline,
        "distance_m": distance_m,
        "eta_s": eta_s,
        "source": "fallback",
        "steps": steps,
    }


def _sample_polyline(polyline: list[list[float]], step_m: float = 200.0) -> list[list[float]]:
    if len(polyline) < 2:
        return polyline

    cumulative = [0.0]
    for idx in range(1, len(polyline)):
        seg = _haversine_m((polyline[idx - 1][0], polyline[idx - 1][1]), (polyline[idx][0], polyline[idx][1]))
        cumulative.append(cumulative[-1] + seg)

    total = cumulative[-1]
    if total <= step_m:
        return [polyline[0], polyline[-1]]

    targets = [0.0]
    cursor = step_m
    while cursor < total:
        targets.append(cursor)
        cursor += step_m
    targets.append(total)

    sampled: list[list[float]] = []
    segment_idx = 1
    for target in targets:
        while segment_idx < len(cumulative) and cumulative[segment_idx] < target:
            segment_idx += 1
        if segment_idx >= len(cumulative):
            sampled.append(polyline[-1])
            continue
        prev_dist = cumulative[segment_idx - 1]
        next_dist = cumulative[segment_idx]
        if next_dist <= prev_dist:
            sampled.append(polyline[segment_idx][:])
            continue
        ratio = (target - prev_dist) / (next_dist - prev_dist)
        p1 = polyline[segment_idx - 1]
        p2 = polyline[segment_idx]
        sampled.append([p1[0] + (p2[0] - p1[0]) * ratio, p1[1] + (p2[1] - p1[1]) * ratio])
    return sampled


def _aqi_cache_key(lat: float, lng: float, slot: str) -> str:
    # Open-Meteo AQI grid is coarse enough that 2-decimal quantization
    # meaningfully increases cache reuse across nearby route points.
    return f"{round(lat, 2)}:{round(lng, 2)}:{slot}"


def _fetch_aqi_point(lat: float, lng: float, slot: str) -> float | None:
    key = _aqi_cache_key(lat, lng, slot)
    cached = _cache_get(_aqi_cache, key)
    if cached is not None:
        return float(cached["aqi"])

    try:
        response = httpx.get(
            AQI_URL,
            params={
                "latitude": lat,
                "longitude": lng,
                "current": "european_aqi,pm2_5",
            },
            timeout=1.8,
        )
        if response.status_code != 200:
            return None
        data = response.json()
        current = data.get("current", {})
        aqi = current.get("european_aqi")
        if aqi is None:
            return None
        value = float(aqi)
        _cache_set(_aqi_cache, key, {"aqi": value}, AQI_CACHE_TTL_SECONDS)
        return value
    except Exception:
        return None


def _estimate_traffic(route_distance_m: float, eta_s: float, polyline_points: int) -> int:
    free_eta = (route_distance_m / 1000.0) / 52.0 * 3600.0
    ratio = eta_s / max(free_eta, 1.0)
    turn_penalty = min(18.0, polyline_points / 45.0)
    raw = 22.0 + (ratio - 1.0) * 88.0 + turn_penalty
    return int(max(8, min(96, round(raw))))


def _estimate_co2(distance_m: float, avg_traffic: int) -> float:
    distance_km = max(0.0, distance_m / 1000.0)
    base_g_per_km = 168.0
    stop_go_penalty = 1.0 + (avg_traffic / 150.0)
    return max(0.0, distance_km * base_g_per_km * stop_go_penalty)


def _health_risk(avg_aqi: float, degraded: bool) -> str:
    if degraded:
        return "unknown"
    if avg_aqi < HEALTH_RISK_THRESHOLDS["low"]:
        return "low"
    if avg_aqi < HEALTH_RISK_THRESHOLDS["moderate"]:
        return "moderate"
    if avg_aqi < HEALTH_RISK_THRESHOLDS["high"]:
        return "high"
    return "very_high"


def _route_metrics(route: dict, slot: str) -> tuple[dict, bool]:
    polyline = route["polyline"]
    sampled = _sample_polyline(polyline, step_m=220.0)
    if len(sampled) > 6:
        stride = math.ceil(len(sampled) / 6)
        sampled = sampled[::stride]
        if sampled[-1] != polyline[-1]:
            sampled.append(polyline[-1])

    aqi_values: list[float] = []
    consecutive_failures = 0
    for point in sampled:
        aqi_value = _fetch_aqi_point(point[0], point[1], slot)
        if aqi_value is not None:
            aqi_values.append(aqi_value)
            consecutive_failures = 0
        else:
            consecutive_failures += 1
            if consecutive_failures >= 1 and len(aqi_values) == 0:
                break

    degraded = len(aqi_values) == 0
    avg_aqi = (sum(aqi_values) / len(aqi_values)) if aqi_values else 0.0

    # AQI exposure = sum(AQI_segment * time_segment). We use sampled segment weights by distance.
    if len(sampled) >= 2 and aqi_values:
        distances = []
        total_sampled_distance = 0.0
        for idx in range(1, len(sampled)):
            seg_dist = _haversine_m((sampled[idx - 1][0], sampled[idx - 1][1]), (sampled[idx][0], sampled[idx][1]))
            distances.append(seg_dist)
            total_sampled_distance += seg_dist
        exposure = 0.0
        if total_sampled_distance > 0:
            for idx, seg_dist in enumerate(distances):
                segment_time = route["eta_s"] * (seg_dist / total_sampled_distance)
                aqi_idx = min(idx, len(aqi_values) - 1)
                exposure += aqi_values[aqi_idx] * segment_time
        else:
            exposure = avg_aqi * route["eta_s"]
    else:
        exposure = 0.0

    avg_traffic = _estimate_traffic(route["distance_m"], route["eta_s"], len(polyline))
    co2 = _estimate_co2(route["distance_m"], avg_traffic)

    metrics = {
        "avg_traffic": avg_traffic,
        "avg_aqi": int(round(avg_aqi)),
        "aqi_exposure": float(round(exposure)),
        "co2_g": float(round(co2)),
        "aqi_profile": [int(round(v)) for v in aqi_values[:120]],
    }
    return metrics, degraded


def _calculate_composite_score(route: dict, fastest: dict, profile: str, degraded: bool) -> float:
    weights = PROFILE_WEIGHTS[profile]
    time_norm = route["eta_s"] / max(fastest["eta_s"], 1.0)
    co2_norm = route["co2_g"] / max(fastest["co2_g"], 1.0)
    if degraded:
        aqi_norm = 1.0
    else:
        aqi_norm = route["aqi_exposure"] / max(fastest["aqi_exposure"], 1.0)
    return (
        weights["time"] * time_norm
        + weights["aqi"] * aqi_norm
        + weights["co2"] * co2_norm
    )


def _eco_score_from_composite(composite: float) -> int:
    # Composite 1.0 means equal to fastest baseline.
    delta = composite - 1.0
    score = 82 - (delta * 95)
    return int(max(1, min(99, round(score))))


def _route_explanation(route: dict, recommended: bool) -> str:
    mode_phrase = "Road-verified" if route["mode"] == "road" else "Estimated"
    if recommended:
        if route["degraded"]:
            return f"{mode_phrase} eco route selected while AQI feed is degraded"
        if route["compare_fastest"]["delta_time_s"] > 0:
            return f"{mode_phrase} cleanest route with moderate delay"
        return f"{mode_phrase} clean route with no additional delay"
    if route["compare_fastest"]["delta_time_s"] < 0:
        return "Fastest baseline option with higher environmental exposure"
    return "Alternative road option with different eco/time trade-off"


def _compose_routes(req: EcoRoutingRequest) -> dict:
    slot = _timeslot_key(req.departure_time)
    candidates = _build_route_candidates(req.start, req.end)

    raw_routes: list[dict] = []
    seen_hashes: set[str] = set()

    for candidate in candidates:
        osrm_route = _fetch_osrm_route(candidate)
        if not osrm_route:
            continue
        shape_hash = _coarse_polyline_hash(osrm_route["polyline"])
        if not shape_hash or shape_hash in seen_hashes:
            continue
        seen_hashes.add(shape_hash)
        raw_routes.append(osrm_route)
        if len(raw_routes) >= 5:
            break

    mode: Literal["road", "estimated"]
    if raw_routes:
        mode = "road"
    else:
        mode = "estimated"
        raw_routes = [
            _build_estimated_route(req.start, req.end, 0),
            _build_estimated_route(req.start, req.end, 1),
            _build_estimated_route(req.start, req.end, 2),
        ]

    enriched: list[dict] = []
    degraded_count = 0
    for idx, route in enumerate(raw_routes):
        metrics, degraded = _route_metrics(route, slot)
        if degraded:
            degraded_count += 1
        enriched.append(
            {
                "id": f"r{idx + 1}",
                "polyline": route["polyline"],
                "distance_m": int(round(route["distance_m"])),
                "eta_s": int(round(route["eta_s"])),
                "mode": mode,
                "source": route["source"],
                "steps": route.get("steps", []),
                **metrics,
                "degraded": degraded,
            }
        )

    fastest = min(enriched, key=lambda item: item["eta_s"])
    for route in enriched:
        route["compare_fastest"] = {
            "delta_time_s": int(route["eta_s"] - fastest["eta_s"]),
            "delta_aqi_exposure": int(route["aqi_exposure"] - fastest["aqi_exposure"]) if not route["degraded"] else 0,
            "delta_co2_g": int(route["co2_g"] - fastest["co2_g"]),
        }
        route["health_risk"] = _health_risk(route["avg_aqi"], route["degraded"])
        route["composite"] = _calculate_composite_score(route, fastest, req.profile, route["degraded"])

    enriched.sort(key=lambda item: item["composite"])
    for idx, route in enumerate(enriched):
        route["type"] = "recommended" if idx == 0 else "alternative"
        route["eco_score"] = _eco_score_from_composite(route["composite"])
        route["explanation"] = _route_explanation(route, idx == 0)

    for route in enriched:
        route.pop("composite", None)

    degraded_global = degraded_count == len(enriched)
    response = {
        "status": "ok",
        "mode": mode,
        "degraded": degraded_global,
        "routes": enriched,
    }
    return response


@routing_router.post("/eco")
def eco_routing(request: EcoRoutingRequest):
    key = _routing_cache_key(request)
    cached = _cache_get(_response_cache, key)
    if cached is not None:
        return cached

    lock = _get_inflight_lock(key)
    with lock:
        cached_after_lock = _cache_get(_response_cache, key)
        if cached_after_lock is not None:
            return cached_after_lock
        payload = _compose_routes(request)
        ttl = _cache_ttl_for_departure(request.departure_time)
        _cache_set(_response_cache, key, payload, ttl)
        return payload


@routing_router.get("/config")
def routing_config():
    return {
        "status": "ok",
        "profiles": PROFILE_WEIGHTS,
        "thresholds": HEALTH_RISK_THRESHOLDS,
        "ttl_seconds": {
            "near_real_time": PRIMARY_CACHE_TTL_SECONDS,
            "low_volatility": LOW_VOLATILITY_CACHE_TTL_SECONDS,
            "aqi_cache": AQI_CACHE_TTL_SECONDS,
        },
        "feature_flags": FEATURE_FLAGS,
    }


def _check_osrm_health() -> bool:
    try:
        response = httpx.get(
            f"{OSRM_URL}/76.9456,43.2380;76.8933,43.2022?overview=false&steps=false",
            timeout=3.0,
        )
        if response.status_code != 200:
            return False
        data = response.json()
        return data.get("code") == "Ok"
    except Exception:
        return False


def _check_aqi_health() -> bool:
    try:
        response = httpx.get(
            AQI_URL,
            params={
                "latitude": 43.2380,
                "longitude": 76.9456,
                "current": "european_aqi",
            },
            timeout=3.0,
        )
        if response.status_code != 200:
            return False
        data = response.json()
        return data.get("current", {}).get("european_aqi") is not None
    except Exception:
        return False


@routing_router.get("/health")
def routing_health():
    osrm_ok = _check_osrm_health()
    aqi_ok = _check_aqi_health()
    degraded = not (osrm_ok and aqi_ok)
    return {
        "status": "degraded" if degraded else "ok",
        "providers": {
            "osrm": "up" if osrm_ok else "down",
            "aqi": "up" if aqi_ok else "down",
        },
        "timestamp": dt.datetime.utcnow().isoformat() + "Z",
    }
