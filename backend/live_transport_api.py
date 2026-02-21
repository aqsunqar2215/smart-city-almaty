"""
Live Transport Data Integration
Uses free APIs to get real route data from OpenStreetMap
and simulates realistic bus movements along actual routes.
"""

import httpx
import asyncio
import math
import hashlib
import unicodedata
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import json
import os

# Cache file for route data (to avoid hitting OSM API too often)
CACHE_FILE = os.path.join(os.path.dirname(__file__), 'osm_routes_cache.json')
CACHE_DURATION_HOURS = 24
CACHE_SCHEMA_VERSION = 6
ROUTE_MIN_LENGTH_M = 1200.0
ROUTE_MAX_JUMP_M = 700.0

class LiveTransportAPI:
    """
    Fetches real bus routes from OpenStreetMap and simulates
    realistic vehicle positions along those routes.
    """
    
    OVERPASS_URL = "https://overpass-api.de/api/interpreter"
    
    # Almaty bounding box
    ALMATY_BBOX = {
        "south": 43.15,
        "west": 76.75,
        "north": 43.35,
        "east": 77.15
    }
    
    def __init__(self):
        self.routes_cache: Dict[str, List[Tuple[float, float]]] = {}
        self._load_cache()
    
    def _load_cache(self):
        """Load cached route data if available and fresh"""
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    cache_version = data.get('schema_version', 0)
                    if cache_version != CACHE_SCHEMA_VERSION:
                        print("[LiveTransport] Cache schema mismatch, rebuilding routes cache")
                        return
                    cache_time = datetime.fromisoformat(data.get('timestamp', '2000-01-01'))
                    if datetime.now() - cache_time < timedelta(hours=CACHE_DURATION_HOURS):
                        self.routes_cache = {k: [tuple(p) for p in v] for k, v in data.get('routes', {}).items()}
                        print(f"[LiveTransport] Loaded {len(self.routes_cache)} cached routes")
            except Exception as e:
                print(f"[LiveTransport] Cache load error: {e}")
    
    def _save_cache(self):
        """Save route data to cache"""
        try:
            data = {
                'schema_version': CACHE_SCHEMA_VERSION,
                'timestamp': datetime.now().isoformat(),
                'routes': {k: list(v) for k, v in self.routes_cache.items()}
            }
            with open(CACHE_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f)
            print(f"[LiveTransport] Saved {len(self.routes_cache)} routes to cache")
        except Exception as e:
            print(f"[LiveTransport] Cache save error: {e}")
    
    async def fetch_osm_routes(self) -> Dict[str, List[Tuple[float, float]]]:
        """
        Fetch bus routes from OpenStreetMap Overpass API.
        Returns dict of route_number -> list of (lat, lng) coordinates.
        """
        if self.routes_cache:
            return self.routes_cache
        
        query = f"""
        [out:json][timeout:60];
        (
          relation["route"="bus"]["ref"](
            {self.ALMATY_BBOX['south']},{self.ALMATY_BBOX['west']},
            {self.ALMATY_BBOX['north']},{self.ALMATY_BBOX['east']}
          );
          relation["route"="trolleybus"]["ref"](
            {self.ALMATY_BBOX['south']},{self.ALMATY_BBOX['west']},
            {self.ALMATY_BBOX['north']},{self.ALMATY_BBOX['east']}
          );
        );
        out body;
        >;
        out skel qt;
        """
        
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(self.OVERPASS_URL, data={"data": query})
                response.raise_for_status()
                data = response.json()
        except Exception as e:
            print(f"[LiveTransport] OSM API error: {e}")
            return self._generate_fallback_routes()
        
        # Parse response
        nodes = {}  # node_id -> (lat, lon)
        ways = {}   # way_id -> [node_ids]
        routes: Dict[str, List[List[int]]] = {}  # route_ref -> variants of [way_ids]
        
        for element in data.get('elements', []):
            if element['type'] == 'node':
                nodes[element['id']] = (element['lat'], element['lon'])
            elif element['type'] == 'way':
                ways[element['id']] = element.get('nodes', [])
            elif element['type'] == 'relation':
                ref = element.get('tags', {}).get('ref', '')
                ref = self._normalize_route_ref(ref)
                if ref:
                    way_ids = [m['ref'] for m in element.get('members', []) if m['type'] == 'way']
                    if way_ids:
                        routes.setdefault(ref, []).append(way_ids)
        
        # Build coordinate lists for each route
        result = {}
        for route_ref, variants in routes.items():
            best_path: List[Tuple[float, float]] = []
            for way_ids in variants:
                segments: List[List[Tuple[float, float]]] = []
                for way_id in way_ids[:280]:
                    node_ids = ways.get(way_id, [])
                    if len(node_ids) < 2:
                        continue
                    segment = [nodes[node_id] for node_id in node_ids if node_id in nodes]
                    if len(segment) >= 2:
                        segments.append(segment)

                path = self._stitch_segments(segments, max_gap_m=700.0)
                if len(path) > len(best_path):
                    best_path = path

            cleaned_path = self._longest_continuous_path(best_path, max_jump_m=700.0)
            if len(cleaned_path) < 10:
                continue
            if self._path_length_m(cleaned_path) < ROUTE_MIN_LENGTH_M:
                continue
            if self._max_jump_m(cleaned_path) > ROUTE_MAX_JUMP_M:
                continue
            result[route_ref] = self._downsample(cleaned_path, max_points=1200)
        
        if result:
            self.routes_cache = result
            self._save_cache()
            print(f"[LiveTransport] Fetched {len(result)} real routes from OSM")
        else:
            result = self._generate_fallback_routes()
        
        return result

    def _stitch_segments(
        self,
        segments: List[List[Tuple[float, float]]],
        max_gap_m: float
    ) -> List[Tuple[float, float]]:
        """
        Stitch way segments into the longest continuous polyline.
        Prevents large jumps that create broken-looking routes on map.
        """
        if not segments:
            return []

        normalized = [self._normalize_segment(seg) for seg in segments if len(seg) >= 2]
        normalized = [seg for seg in normalized if len(seg) >= 2]
        if not normalized:
            return []

        chains: List[List[Tuple[float, float]]] = []
        current = normalized[0]

        for seg in normalized[1:]:
            current, connected = self._connect_segment(current, seg, max_gap_m)
            if connected:
                continue
            chains.append(current)
            current = seg
        chains.append(current)

        return max(chains, key=len) if chains else []

    def _connect_segment(
        self,
        current: List[Tuple[float, float]],
        segment: List[Tuple[float, float]],
        max_gap_m: float
    ) -> Tuple[List[Tuple[float, float]], bool]:
        """
        Connect a segment to current chain by nearest endpoints.
        Returns (new_chain, connected_flag).
        """
        c_start, c_end = current[0], current[-1]
        s_start, s_end = segment[0], segment[-1]

        d_end_start = self._distance_m(c_end, s_start)
        d_end_end = self._distance_m(c_end, s_end)
        d_start_start = self._distance_m(c_start, s_start)
        d_start_end = self._distance_m(c_start, s_end)

        best = min(d_end_start, d_end_end, d_start_start, d_start_end)
        if best > max_gap_m:
            return current, False

        if best == d_start_start or best == d_start_end:
            current = list(reversed(current))
            c_end = current[-1]
            d_end_start = self._distance_m(c_end, s_start)
            d_end_end = self._distance_m(c_end, s_end)

        if d_end_start <= d_end_end:
            merged = current + segment[1:]
        else:
            merged = current + list(reversed(segment))[1:]

        return self._normalize_segment(merged), True

    def _normalize_segment(self, segment: List[Tuple[float, float]]) -> List[Tuple[float, float]]:
        """Remove immediate duplicate points."""
        if not segment:
            return []
        result = [segment[0]]
        for point in segment[1:]:
            if point != result[-1]:
                result.append(point)
        return result

    def _distance_m(self, a: Tuple[float, float], b: Tuple[float, float]) -> float:
        """Approximate meter distance between two lat/lng points."""
        lat1, lng1 = a
        lat2, lng2 = b
        mean_lat_rad = math.radians((lat1 + lat2) / 2.0)
        d_lat = (lat2 - lat1) * 111_320.0
        d_lng = (lng2 - lng1) * 111_320.0 * math.cos(mean_lat_rad)
        return math.hypot(d_lat, d_lng)

    def _path_length_m(self, coords: List[Tuple[float, float]]) -> float:
        """Total polyline length in meters."""
        if len(coords) < 2:
            return 0.0
        total = 0.0
        for idx in range(len(coords) - 1):
            total += self._distance_m(coords[idx], coords[idx + 1])
        return total

    def _max_jump_m(self, coords: List[Tuple[float, float]]) -> float:
        """Largest distance between neighbor points in a path."""
        if len(coords) < 2:
            return 0.0
        max_jump = 0.0
        for idx in range(len(coords) - 1):
            max_jump = max(max_jump, self._distance_m(coords[idx], coords[idx + 1]))
        return max_jump

    def _normalize_route_ref(self, ref: str) -> str:
        """
        Normalize OSM route ref to stable ASCII-ish key:
        - trim spaces
        - map common Cyrillic route letters to Latin lookalikes
        - remove diacritics and punctuation
        - keep only [A-Z0-9]
        """
        if not ref:
            return ""

        ref = ref.strip().upper()
        cyr_map = str.maketrans({
            "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H",
            "О": "O", "Р": "P", "С": "C", "Т": "T", "У": "Y", "Х": "X",
            "І": "I", "Ї": "I", "Й": "I", "Ё": "E",
            "Д": "D", "Л": "L", "П": "P", "Ф": "F", "Г": "G", "З": "Z",
            "Ч": "CH", "Ш": "SH", "Щ": "SCH", "Ю": "YU", "Я": "YA",
            "Ж": "ZH", "Ц": "TS", "Ь": "", "Ъ": "",
        })
        ref = ref.translate(cyr_map)
        ref = unicodedata.normalize("NFKD", ref).encode("ascii", "ignore").decode("ascii")
        ref = "".join(ch for ch in ref if ch.isalnum())

        if not ref:
            return ""
        if not any(ch.isdigit() for ch in ref):
            return ""
        return ref[:8]

    def _downsample(
        self,
        coords: List[Tuple[float, float]],
        max_points: int
    ) -> List[Tuple[float, float]]:
        """Keep long paths lightweight while preserving shape endpoints."""
        if len(coords) <= max_points:
            return coords
        step = max(1, len(coords) // max_points)
        sampled = coords[::step]
        if sampled[-1] != coords[-1]:
            sampled.append(coords[-1])
        return sampled

    def _longest_continuous_path(
        self,
        coords: List[Tuple[float, float]],
        max_jump_m: float
    ) -> List[Tuple[float, float]]:
        """
        Split route by large jumps and keep the longest continuous chain.
        This removes visibly broken route fragments.
        """
        if len(coords) < 2:
            return coords

        chains: List[List[Tuple[float, float]]] = []
        current_chain = [coords[0]]

        for idx in range(1, len(coords)):
            prev = coords[idx - 1]
            cur = coords[idx]
            if self._distance_m(prev, cur) <= max_jump_m:
                current_chain.append(cur)
            else:
                chains.append(current_chain)
                current_chain = [cur]

        chains.append(current_chain)
        return max(chains, key=len) if chains else coords
    
    def _generate_fallback_routes(self) -> Dict[str, List[Tuple[float, float]]]:
        """Generate realistic fallback routes if OSM fails"""
        print("[LiveTransport] Using fallback routes")
        
        # Major Almaty streets as route templates
        routes = {
            "92": self._generate_route_along_street(43.238, 76.945, 43.255, 76.885, 30),  # Abay Ave
            "32": self._generate_route_along_street(43.220, 76.850, 43.265, 76.920, 28),  # Tole Bi
            "12": self._generate_route_along_street(43.245, 76.920, 43.200, 76.875, 25),  # Seifullin
            "201": self._generate_route_along_street(43.260, 76.940, 43.235, 76.800, 32),
            "79": self._generate_route_along_street(43.210, 76.870, 43.250, 76.950, 26),
            "45": self._generate_route_along_street(43.225, 76.910, 43.270, 76.860, 24),
            "18": self._generate_route_along_street(43.230, 76.890, 43.195, 76.930, 22),
            "121": self._generate_route_along_street(43.252, 76.875, 43.215, 76.945, 27),
        }
        
        self.routes_cache = routes
        self._save_cache()
        return routes
    
    def _generate_route_along_street(
        self, 
        start_lat: float, start_lng: float,
        end_lat: float, end_lng: float,
        num_points: int
    ) -> List[Tuple[float, float]]:
        """Generate a deterministic curved polyline between two points."""
        coords = []
        route_key = f"{start_lat:.4f}:{start_lng:.4f}:{end_lat:.4f}:{end_lng:.4f}:{num_points}"
        phase = (self._stable_int(route_key + ":phase", 628) / 100.0)  # 0..6.28
        amplitude = 0.00045 + (self._stable_int(route_key + ":amp", 5) * 0.0001)
        d_lat = end_lat - start_lat
        d_lng = end_lng - start_lng
        norm = math.hypot(d_lat, d_lng) or 1.0
        # Perpendicular unit vector to create soft deterministic street-like curvature
        p_lat = -d_lng / norm
        p_lng = d_lat / norm

        for i in range(num_points):
            t = i / (num_points - 1)
            base_lat = start_lat + d_lat * t
            base_lng = start_lng + d_lng * t
            curve = math.sin((t * math.pi * 2.0) + phase) * amplitude
            lat = base_lat + (p_lat * curve)
            lng = base_lng + (p_lng * curve)
            coords.append((lat, lng))
        return coords
    
    def get_vehicle_positions(self, routes: Dict[str, List[Tuple[float, float]]]) -> List[Dict]:
        """
        Deterministically calculate current positions of vehicles along routes.
        No randomness is used, so coordinates are reproducible for a given time.
        """
        vehicles = []
        current_time = datetime.now().replace(microsecond=0)
        hour = current_time.hour
        seconds_since_midnight = (
            current_time.hour * 3600
            + current_time.minute * 60
            + current_time.second
        )
        
        # Rush hour factor (more vehicles during peak times)
        rush_factor = self._rush_factor(hour)
        
        for route_ref, coords in routes.items():
            if len(coords) < 5:
                continue
            
            # Number of vehicles on this route
            num_vehicles = self._vehicle_count_for_route(route_ref, rush_factor)
            
            for v_idx in range(min(num_vehicles, 4)):
                route_progress, direction = self._route_progress(
                    route_ref,
                    v_idx,
                    len(coords),
                    seconds_since_midnight
                )

                idx = int(math.floor(route_progress))
                idx_next = min(idx + 1, len(coords) - 1)
                frac = route_progress - idx

                lat1, lng1 = coords[idx]
                lat2, lng2 = coords[idx_next]
                lat = lat1 + (lat2 - lat1) * frac
                lng = lng1 + (lng2 - lng1) * frac
                
                # Calculate realistic occupancy based on time
                if route_ref in ["92", "32", "121"]:
                    base_occupancy = 48 if rush_factor > 1.0 else 32
                else:
                    base_occupancy = 30 if rush_factor > 1.0 else 18
                
                phase = (seconds_since_midnight / 3600.0) + (self._stable_int(f"{route_ref}:{v_idx}:occ", 60) / 10.0)
                occupancy_wave = int(round(math.sin(phase) * 11))
                occupancy = min(95, max(5, base_occupancy + occupancy_wave))
                
                # Determine vehicle type
                is_minibus = route_ref.startswith("4") and len(route_ref) == 3
                vehicle_type = "MINIBUS" if is_minibus else "BUS"
                vehicle_key = f"{route_ref}_{v_idx}"

                # Deterministic speed profile (km/h)
                speed_base = 24 if vehicle_type == "BUS" else 30
                speed_variation = self._stable_int(vehicle_key + ":speed", 18)  # 0..17
                speed_penalty = 5 if rush_factor > 1.0 else 0
                speed_kmh = max(12, speed_base + speed_variation - speed_penalty)

                has_ac = (
                    (self._stable_int(vehicle_key + ":ac", 100) >= 15)
                    if vehicle_type == "BUS" else
                    (self._stable_int(vehicle_key + ":ac", 100) >= 85)
                )
                has_wifi = (
                    self._stable_int(vehicle_key + ":wifi", 100) >= 35
                    if vehicle_type == "BUS" else False
                )
                
                vehicles.append({
                    "id": self._stable_int(vehicle_key + ":id", 1_000_000),
                    "route_number": route_ref,
                    "vehicle_type": vehicle_type,
                    "lat": lat,
                    "lng": lng,
                    "speed_kmh": speed_kmh,
                    "last_updated": current_time.isoformat(),
                    "occupancy": occupancy,
                    "has_ac": has_ac,
                    "has_wifi": has_wifi,
                    "is_eco": route_ref in ["92", "12"],
                    "heading": self._calculate_heading(coords, idx, direction)
                })
        
        return vehicles

    def _stable_int(self, key: str, modulo: int) -> int:
        digest = hashlib.sha256(key.encode('utf-8')).hexdigest()
        return int(digest[:12], 16) % modulo

    def _rush_factor(self, hour: int) -> float:
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            return 1.5
        if 22 <= hour or hour <= 5:
            return 0.6
        return 1.0

    def _vehicle_count_for_route(self, route_ref: str, rush_factor: float) -> int:
        base_vehicles = 2 if route_ref in ["92", "32", "12", "121"] else 1
        if rush_factor > 1.0:
            base_vehicles += 1
        if rush_factor < 1.0:
            base_vehicles = max(1, base_vehicles - 1)
        return max(1, base_vehicles)

    def _route_progress(
        self,
        route_ref: str,
        vehicle_index: int,
        num_points: int,
        seconds_since_midnight: int
    ) -> Tuple[float, int]:
        """
        Return position in route polyline as float index and movement direction.
        Uses ping-pong movement to traverse route back and forth.
        """
        if num_points <= 1:
            return 0.0, 1

        cycle = max(2, (num_points - 1) * 2)
        speed_units = 0.35 + (self._stable_int(f"{route_ref}:{vehicle_index}:units", 40) / 100.0)
        phase = self._stable_int(f"{route_ref}:{vehicle_index}:phase", cycle)
        raw = (seconds_since_midnight * speed_units + phase) % cycle

        if raw <= (num_points - 1):
            return raw, 1
        reverse_pos = cycle - raw
        return reverse_pos, -1
    
    def _calculate_heading(self, coords: List[Tuple[float, float]], idx: int, direction: int) -> float:
        """Calculate heading direction in degrees"""
        if idx >= len(coords) - 1:
            idx = len(coords) - 2
        
        lat1, lng1 = coords[idx]
        lat2, lng2 = coords[min(idx + 1, len(coords) - 1)]
        
        if direction < 0:
            lat1, lat2 = lat2, lat1
            lng1, lng2 = lng2, lng1
        
        dlng = lng2 - lng1
        dlat = lat2 - lat1
        
        heading = math.degrees(math.atan2(dlng, dlat))
        return (heading + 360) % 360


# Global instance
live_transport = LiveTransportAPI()


async def get_live_bus_data() -> List[Dict]:
    """Main function to get live bus data"""
    routes = await live_transport.fetch_osm_routes()
    return live_transport.get_vehicle_positions(routes)


async def get_live_route_shapes(max_points: int = 500) -> List[Dict]:
    """
    Return deterministic route geometries for transport map rendering.
    Downsamples long polylines to keep payload light while preserving continuity.
    """
    routes = await live_transport.fetch_osm_routes()
    shapes: List[Dict] = []

    for route_ref, coords in routes.items():
        if len(coords) < 2:
            continue

        step = max(1, len(coords) // max_points)
        sampled = coords[::step]
        if sampled[-1] != coords[-1]:
            sampled.append(coords[-1])

        shapes.append({
            "route_number": route_ref,
            "point_count": len(coords),
            "path": [{"lat": lat, "lng": lng} for lat, lng in sampled]
        })

    def route_sort_key(item: Dict) -> tuple[int, str]:
        route = item.get("route_number", "")
        return (0, f"{int(route):05d}") if route.isdigit() else (1, route)

    return sorted(shapes, key=route_sort_key)


# For testing
if __name__ == "__main__":
    async def test():
        data = await get_live_bus_data()
        print(f"Got {len(data)} vehicles")
        for v in data[:3]:
            print(v)
    
    asyncio.run(test())
