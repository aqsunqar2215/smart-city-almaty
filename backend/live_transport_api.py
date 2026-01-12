"""
Live Transport Data Integration
Uses free APIs to get real route data from OpenStreetMap
and simulates realistic bus movements along actual routes.
"""

import httpx
import asyncio
import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import json
import os

# Cache file for route data (to avoid hitting OSM API too often)
CACHE_FILE = os.path.join(os.path.dirname(__file__), 'osm_routes_cache.json')
CACHE_DURATION_HOURS = 24

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
        self.vehicle_positions: Dict[str, Dict] = {}  # route_id -> {position_index, direction, speed}
        self._load_cache()
    
    def _load_cache(self):
        """Load cached route data if available and fresh"""
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
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
        routes = {} # route_ref -> [way_ids]
        
        for element in data.get('elements', []):
            if element['type'] == 'node':
                nodes[element['id']] = (element['lat'], element['lon'])
            elif element['type'] == 'way':
                ways[element['id']] = element.get('nodes', [])
            elif element['type'] == 'relation':
                ref = element.get('tags', {}).get('ref', '')
                if ref:
                    way_ids = [m['ref'] for m in element.get('members', []) if m['type'] == 'way']
                    routes[ref] = way_ids
        
        # Build coordinate lists for each route
        result = {}
        for route_ref, way_ids in routes.items():
            coords = []
            for way_id in way_ids[:20]:  # Limit ways per route
                for node_id in ways.get(way_id, [])[:50]:  # Limit nodes per way
                    if node_id in nodes:
                        coords.append(nodes[node_id])
            if len(coords) >= 5:
                result[route_ref] = coords[:200]  # Max 200 points per route
        
        if result:
            self.routes_cache = result
            self._save_cache()
            print(f"[LiveTransport] Fetched {len(result)} real routes from OSM")
        else:
            result = self._generate_fallback_routes()
        
        return result
    
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
        """Generate a route with slight random variations (simulating real street curves)"""
        coords = []
        for i in range(num_points):
            t = i / (num_points - 1)
            lat = start_lat + (end_lat - start_lat) * t + (random.random() - 0.5) * 0.003
            lng = start_lng + (end_lng - start_lng) * t + (random.random() - 0.5) * 0.003
            coords.append((lat, lng))
        return coords
    
    def get_vehicle_positions(self, routes: Dict[str, List[Tuple[float, float]]]) -> List[Dict]:
        """
        Calculate current positions of vehicles along routes.
        Each route has 1-4 vehicles moving along it.
        """
        vehicles = []
        current_time = datetime.now()
        hour = current_time.hour
        
        # Rush hour factor (more vehicles during peak times)
        rush_factor = 1.0
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            rush_factor = 1.5
        elif 22 <= hour or hour <= 5:
            rush_factor = 0.5
        
        for route_ref, coords in routes.items():
            if len(coords) < 5:
                continue
            
            # Number of vehicles on this route
            base_vehicles = 2 if route_ref in ["92", "32", "12", "121"] else 1
            num_vehicles = max(1, int(base_vehicles * rush_factor + random.random()))
            
            for v_idx in range(min(num_vehicles, 4)):
                vehicle_id = f"{route_ref}_{v_idx}"
                
                # Initialize or update vehicle position
                if vehicle_id not in self.vehicle_positions:
                    self.vehicle_positions[vehicle_id] = {
                        'position_index': random.randint(0, len(coords) - 1),
                        'direction': random.choice([1, -1]),
                        'speed': random.uniform(0.5, 2.0),  # Points per update
                        'last_update': current_time
                    }
                
                vp = self.vehicle_positions[vehicle_id]
                
                # Calculate time-based movement
                elapsed = (current_time - vp['last_update']).total_seconds()
                movement = int(vp['speed'] * elapsed / 2)  # Move every 2 seconds
                
                if movement > 0:
                    vp['position_index'] += vp['direction'] * movement
                    vp['last_update'] = current_time
                    
                    # Bounce at route ends
                    if vp['position_index'] >= len(coords) - 1:
                        vp['position_index'] = len(coords) - 2
                        vp['direction'] = -1
                    elif vp['position_index'] <= 0:
                        vp['position_index'] = 1
                        vp['direction'] = 1
                
                # Get current coordinates
                idx = min(max(0, vp['position_index']), len(coords) - 1)
                lat, lng = coords[idx]
                
                # Calculate realistic occupancy based on time
                if route_ref in ["92", "32", "121"]:
                    base_occupancy = 45 if rush_factor > 1 else 30
                else:
                    base_occupancy = 25 if rush_factor > 1 else 15
                
                occupancy = min(95, max(5, base_occupancy + random.randint(-15, 25)))
                
                # Determine vehicle type
                is_minibus = route_ref.startswith("4") and len(route_ref) == 3
                vehicle_type = "MINIBUS" if is_minibus else "BUS"
                
                vehicles.append({
                    "id": hash(vehicle_id) % 10000,
                    "route_number": route_ref,
                    "vehicle_type": vehicle_type,
                    "lat": lat,
                    "lng": lng,
                    "speed_kmh": random.randint(15, 50),
                    "last_updated": current_time.isoformat(),
                    "occupancy": occupancy,
                    "has_ac": random.random() > 0.3 if vehicle_type == "BUS" else random.random() > 0.8,
                    "has_wifi": random.random() > 0.4 if vehicle_type == "BUS" else False,
                    "is_eco": route_ref in ["92", "12"],
                    "heading": self._calculate_heading(coords, idx, vp['direction'])
                })
        
        return vehicles
    
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


# For testing
if __name__ == "__main__":
    async def test():
        data = await get_live_bus_data()
        print(f"Got {len(data)} vehicles")
        for v in data[:3]:
            print(v)
    
    asyncio.run(test())
