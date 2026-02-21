// Smart Eco-Routing Engine for Almaty
// Calculates optimal routes based on traffic, air quality, and distance

export interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface RouteSegment {
  start: RoutePoint;
  end: RoutePoint;
  distance: number; // meters
  trafficLevel: number; // 0-100
  airQuality: number; // AQI 0-500
  estimatedTime: number; // seconds
}

export interface Route {
  id: string;
  segments: RouteSegment[];
  totalDistance: number;
  totalTime: number;
  avgTraffic: number;
  avgAirQuality: number;
  score: number;
  ecoScore: number;
  source: 'road' | 'fallback';
  type: 'recommended' | 'alternative';
  explanation: string;
}

export type RoutePreference = 'traffic' | 'air' | 'balanced';

interface OsrmRouteGeometry {
  coordinates: [number, number][];
}

interface OsrmRouteItem {
  geometry: OsrmRouteGeometry;
}

interface OsrmRouteResponse {
  code: string;
  routes: OsrmRouteItem[];
}

// Almaty landmarks and popular locations
export const ALMATY_LOCATIONS: Record<string, RoutePoint> = {
  // Districts
  'almaly': { lat: 43.2567, lng: 76.9286, name: 'Almaly District' },
  'bostandyk': { lat: 43.2200, lng: 76.9300, name: 'Bostandyk District' },
  'medeu': { lat: 43.1800, lng: 76.9500, name: 'Medeu District' },
  'auezov': { lat: 43.2300, lng: 76.8700, name: 'Auezov District' },
  'turksib': { lat: 43.3000, lng: 76.9800, name: 'Turksib District' },
  'zhetysu': { lat: 43.2700, lng: 77.0200, name: 'Zhetysu District' },

  // Landmarks
  'mega center': { lat: 43.2022, lng: 76.8933, name: 'Mega Center Alma-Ata' },
  'esentai': { lat: 43.2180, lng: 76.9580, name: 'Esentai Mall' },
  'dostyk plaza': { lat: 43.2350, lng: 76.9550, name: 'Dostyk Plaza' },
  'kok tobe': { lat: 43.2315, lng: 76.9875, name: 'Kok Tobe' },
  'central park': { lat: 43.2400, lng: 76.9500, name: 'Central Park' },
  'airport': { lat: 43.3526, lng: 77.0405, name: 'Almaty Airport' },
  'railway station': { lat: 43.2333, lng: 76.9500, name: 'Almaty-1 Railway Station' },
  'green bazaar': { lat: 43.2550, lng: 76.9440, name: 'Green Bazaar' },
  'republic square': { lat: 43.2380, lng: 76.9456, name: 'Republic Square' },
  'abay opera': { lat: 43.2430, lng: 76.9530, name: 'Abay Opera House' },

  // Major Streets (represented by key intersections)
  'dostyk abay': { lat: 43.2380, lng: 76.9560, name: 'Dostyk Ave & Abay Ave' },
  'al-farabi seifullin': { lat: 43.2150, lng: 76.9280, name: 'Al-Farabi Ave & Seifullin Ave' },
  'raiymbek': { lat: 43.2650, lng: 76.9300, name: 'Raiymbek Ave' },
  'tole bi': { lat: 43.2500, lng: 76.9400, name: 'Tole Bi Street' },
};

// Traffic zones with congestion patterns
const TRAFFIC_ZONES: Array<{ center: RoutePoint; radius: number; baseCongestion: number; peakMultiplier: number }> = [
  { center: { lat: 43.2567, lng: 76.9286 }, radius: 2000, baseCongestion: 60, peakMultiplier: 1.5 }, // Almaly center
  { center: { lat: 43.2380, lng: 76.9560 }, radius: 1500, baseCongestion: 70, peakMultiplier: 1.6 }, // Dostyk-Abay
  { center: { lat: 43.2650, lng: 76.9300 }, radius: 2500, baseCongestion: 55, peakMultiplier: 1.4 }, // Raiymbek
  { center: { lat: 43.2150, lng: 76.9280 }, radius: 2000, baseCongestion: 50, peakMultiplier: 1.3 }, // Al-Farabi
];

// Air quality zones (pollution hotspots)
const AIR_QUALITY_ZONES: Array<{ center: RoutePoint; radius: number; baseAQI: number; trafficImpact: number }> = [
  { center: { lat: 43.2567, lng: 76.9286 }, radius: 2500, baseAQI: 80, trafficImpact: 0.5 }, // City center
  { center: { lat: 43.2650, lng: 76.9300 }, radius: 3000, baseAQI: 90, trafficImpact: 0.6 }, // Raiymbek (industrial)
  { center: { lat: 43.3000, lng: 76.9800 }, radius: 2000, baseAQI: 100, trafficImpact: 0.4 }, // Turksib (industrial)
  { center: { lat: 43.1800, lng: 76.9500 }, radius: 2000, baseAQI: 40, trafficImpact: 0.2 }, // Medeu (mountains, cleaner)
];

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (p1: RoutePoint, p2: RoutePoint): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Check if it's peak hour
const isPeakHour = (): boolean => {
  const hour = new Date().getHours();
  return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
};

// Deterministic jitter so identical input points produce stable route scores.
const getDeterministicJitter = (point: RoutePoint, amplitude: number, salt: number): number => {
  const now = new Date();
  const daySeed = now.getFullYear() * 1000 + (now.getMonth() + 1) * 31 + now.getDate();
  const seed = point.lat * 9283.17 + point.lng * 3643.11 + salt + daySeed;
  const unit = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  const normalized = unit - Math.floor(unit); // 0..1
  return (normalized * 2 - 1) * amplitude; // -amplitude..+amplitude
};

// Get traffic level at a point
export const getTrafficAtPoint = (point: RoutePoint): number => {
  let maxCongestion = 20; // Base congestion
  const peak = isPeakHour();

  for (const zone of TRAFFIC_ZONES) {
    const dist = calculateDistance(point, zone.center);
    if (dist < zone.radius) {
      const intensity = 1 - (dist / zone.radius);
      const congestion = zone.baseCongestion * intensity * (peak ? zone.peakMultiplier : 1);
      maxCongestion = Math.max(maxCongestion, congestion);
    }
  }

  const jitter = getDeterministicJitter(point, 4, 11);
  return Math.round(Math.min(100, Math.max(0, maxCongestion + jitter)));
};

// Get air quality at a point
export const getAirQualityAtPoint = (point: RoutePoint, trafficLevel: number): number => {
  let baseAQI = 30;

  for (const zone of AIR_QUALITY_ZONES) {
    const dist = calculateDistance(point, zone.center);
    if (dist < zone.radius) {
      const intensity = 1 - (dist / zone.radius);
      const zoneAQI = zone.baseAQI * intensity + (trafficLevel * zone.trafficImpact);
      baseAQI = Math.max(baseAQI, zoneAQI);
    }
  }

  const jitter = getDeterministicJitter(point, 4, 29 + Math.round(trafficLevel));
  return Math.round(Math.min(200, Math.max(0, baseAQI + jitter)));
};

// Generate waypoints for a route (Simulating road follow-up)
const generateWaypoints = (start: RoutePoint, end: RoutePoint, variant: number = 0): RoutePoint[] => {
  const points: RoutePoint[] = [start];

  // Simulation of Almaty grid (approximate)
  // Almaty center has a fairly regular grid rotated slightly, but we'll use Manhattan-style steps
  // with some variation for "alternative" routes.

  const latDiff = end.lat - start.lat;
  const lngDiff = end.lng - start.lng;

  // Number of steps (city blocks)
  const steps = 10;

  for (let i = 1; i <= steps; i++) {
    const progress = i / (steps + 1);

    if (variant === 0) {
      // Recommended: Orthogonal Manhattan steps
      if (i % 2 === 0) {
        points.push({
          lat: start.lat + latDiff * progress,
          lng: points[points.length - 1].lng
        });
      } else {
        points.push({
          lat: points[points.length - 1].lat,
          lng: start.lng + lngDiff * progress
        });
      }
    } else {
      // Alternatives: More varied paths
      const offset = variant * 0.006;
      const detour = Math.sin(progress * Math.PI) * offset * (variant % 2 === 0 ? 1 : -1);

      points.push({
        lat: start.lat + latDiff * progress + detour,
        lng: start.lng + lngDiff * progress - detour
      });
    }
  }

  points.push(end);
  return points;
};

// Calculate route from waypoints
const calculateRouteFromWaypoints = (waypoints: RoutePoint[]): RouteSegment[] => {
  const segments: RouteSegment[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    const distance = calculateDistance(start, end);
    const trafficLevel = getTrafficAtPoint({
      lat: (start.lat + end.lat) / 2,
      lng: (start.lng + end.lng) / 2,
    });
    const airQuality = getAirQualityAtPoint(
      { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 },
      trafficLevel
    );

    // Speed calculation based on traffic (km/h)
    const baseSpeed = 50; // km/h
    const actualSpeed = baseSpeed * (1 - trafficLevel / 150); // Min 33% speed at max traffic
    const estimatedTime = (distance / 1000) / actualSpeed * 3600; // seconds

    segments.push({
      start,
      end,
      distance,
      trafficLevel: Math.round(trafficLevel),
      airQuality,
      estimatedTime: Math.round(estimatedTime),
    });
  }

  return segments;
};

// Calculate route score based on preference
const calculateRouteScore = (
  segments: RouteSegment[],
  preference: RoutePreference
): number => {
  const avgTraffic = segments.reduce((sum, s) => sum + s.trafficLevel, 0) / segments.length;
  const avgAQI = segments.reduce((sum, s) => sum + s.airQuality, 0) / segments.length;
  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);

  // Normalize values (0-100 scale, lower is better)
  const trafficScore = avgTraffic;
  const airScore = Math.min(100, avgAQI);
  const distanceScore = Math.min(100, totalDistance / 200); // 20km = 100

  // Weight based on preference
  switch (preference) {
    case 'traffic':
      return trafficScore * 0.7 + airScore * 0.2 + distanceScore * 0.1;
    case 'air':
      return trafficScore * 0.2 + airScore * 0.7 + distanceScore * 0.1;
    case 'balanced':
    default:
      return trafficScore * 0.4 + airScore * 0.4 + distanceScore * 0.2;
  }
};

// Generate route explanation using AI logic
const generateRouteExplanation = (
  route: { avgTraffic: number; avgAirQuality: number; totalDistance: number; totalTime: number; source: 'road' | 'fallback' },
  preference: RoutePreference,
  isRecommended: boolean
): string => {
  const parts: string[] = [];

  if (isRecommended) {
    parts.push(route.source === 'road' ? 'Road-verified recommended route' : 'Estimated recommended route');

    if (preference === 'air') {
      if (route.avgAirQuality < 50) {
        parts.push('passes through areas with excellent air quality');
      } else if (route.avgAirQuality < 80) {
        parts.push('avoids major pollution hotspots');
      } else {
        parts.push('minimizes exposure to polluted areas');
      }
    } else if (preference === 'traffic') {
      if (route.avgTraffic < 40) {
        parts.push('uses low-traffic roads');
      } else if (route.avgTraffic < 60) {
        parts.push('avoids major congestion points');
      } else {
        parts.push('minimizes time in heavy traffic');
      }
    } else {
      parts.push('balances clean air and low traffic');
    }
  } else {
    parts.push('Alternative route');
    if (route.totalDistance < route.totalDistance * 0.9) {
      parts.push('shorter distance but may have more traffic');
    } else {
      parts.push('different path with varying conditions');
    }
  }

  const timeMinutes = Math.round(route.totalTime / 60);
  const distanceKm = (route.totalDistance / 1000).toFixed(1);
  parts.push(`(${distanceKm} km, ~${timeMinutes} min)`);

  return parts.join(' - ');
};

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const coordinatesHash = (points: RoutePoint[]): string => {
  if (points.length < 2) return '';
  const first = points[0];
  const mid = points[Math.floor(points.length / 2)];
  const last = points[points.length - 1];
  return [
    first.lat.toFixed(4), first.lng.toFixed(4),
    mid.lat.toFixed(4), mid.lng.toFixed(4),
    last.lat.toFixed(4), last.lng.toFixed(4),
    String(points.length),
  ].join('|');
};

const createPerpendicularWaypoint = (start: RoutePoint, end: RoutePoint, offsetMeters: number): RoutePoint => {
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  const cosLat = Math.cos((midLat * Math.PI) / 180);

  const vectorXMeters = (end.lng - start.lng) * 111320 * cosLat;
  const vectorYMeters = (end.lat - start.lat) * 111320;
  const norm = Math.hypot(vectorXMeters, vectorYMeters);
  if (norm < 1) return { lat: midLat, lng: midLng };

  const perpX = -vectorYMeters / norm;
  const perpY = vectorXMeters / norm;
  const offsetX = perpX * offsetMeters;
  const offsetY = perpY * offsetMeters;

  return {
    lat: midLat + offsetY / 111320,
    lng: midLng + offsetX / (111320 * cosLat),
  };
};

const fetchRoadRouteByPoints = async (points: RoutePoint[], signal: AbortSignal): Promise<RouteSegment[] | null> => {
  const coordinateString = points.map((p) => `${p.lng},${p.lat}`).join(';');
  const url = `${OSRM_BASE_URL}/${coordinateString}?overview=full&geometries=geojson&alternatives=false&steps=false`;
  const response = await fetch(url, { signal });
  if (!response.ok) return null;

  const data = await response.json() as OsrmRouteResponse;
  if (data.code !== 'Ok' || !Array.isArray(data.routes) || !data.routes[0]) {
    return null;
  }

  const geometryPoints: RoutePoint[] = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
  if (geometryPoints.length < 2) return null;
  return calculateRouteFromWaypoints(geometryPoints);
};

const calculateEcoScore = (score: number): number => {
  const normalized = clamp(score, 0, 100);
  return Math.round(100 - normalized);
};

const buildRoute = (
  id: string,
  segments: RouteSegment[],
  preference: RoutePreference,
  source: 'road' | 'fallback'
): Route => {
  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  const totalTime = segments.reduce((sum, s) => sum + s.estimatedTime, 0);
  const avgTraffic = Math.round(segments.reduce((sum, s) => sum + s.trafficLevel, 0) / segments.length);
  const avgAirQuality = Math.round(segments.reduce((sum, s) => sum + s.airQuality, 0) / segments.length);
  const score = calculateRouteScore(segments, preference);

  return {
    id,
    segments,
    totalDistance,
    totalTime,
    avgTraffic,
    avgAirQuality,
    score,
    ecoScore: calculateEcoScore(score),
    source,
    type: 'alternative',
    explanation: '',
  };
};

const fetchRoadNetworkRoutes = async (
  start: RoutePoint,
  end: RoutePoint
): Promise<RouteSegment[][]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const distance = calculateDistance(start, end);
    const offset = clamp(distance * 0.14, 350, 1400);
    const viaLeft = createPerpendicularWaypoint(start, end, offset);
    const viaRight = createPerpendicularWaypoint(start, end, -offset);

    const routeCandidates: RoutePoint[][] = [
      [start, end],
      [start, viaLeft, end],
      [start, viaRight, end],
    ];

    const fetched = await Promise.all(
      routeCandidates.map((candidate) => fetchRoadRouteByPoints(candidate, controller.signal))
    );

    const seen = new Set<string>();
    const routes: RouteSegment[][] = [];
    for (const segments of fetched) {
      if (!segments || segments.length === 0) continue;
      const points: RoutePoint[] = [segments[0].start, ...segments.map((s) => s.end)];
      const hash = coordinatesHash(points);
      if (!hash || seen.has(hash)) continue;
      seen.add(hash);
      routes.push(segments);
    }

    return routes.slice(0, 3);
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
};

// Main routing function
export const calculateRoutes = async (
  start: RoutePoint,
  end: RoutePoint,
  preference: RoutePreference = 'balanced'
): Promise<Route[]> => {
  const routes: Route[] = [];

  // First try real road network routes from OSRM
  const roadRoutes = await fetchRoadNetworkRoutes(start, end);
  roadRoutes.forEach((segments, idx) => {
    routes.push(buildRoute(`route-road-${idx}`, segments, preference, 'road'));
  });

  // Fallback synthetic variants only when road API is unavailable
  if (routes.length === 0) {
    for (let variant = 0; variant < 3; variant++) {
      const waypoints = generateWaypoints(start, end, variant);
      const segments = calculateRouteFromWaypoints(waypoints);
      routes.push(buildRoute(`route-fallback-${variant}`, segments, preference, 'fallback'));
    }
  }

  // Sort by score (lower is better) and mark best as recommended
  routes.sort((a, b) => a.score - b.score);
  if (routes[0]) {
    routes[0].type = 'recommended';
  }

  // Generate explanations
  routes.forEach((route, index) => {
    route.explanation = generateRouteExplanation(
      route,
      preference,
      index === 0
    );
  });

  return routes;
};

// Search locations
export const searchLocations = (query: string): RoutePoint[] => {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: RoutePoint[] = [];

  for (const [key, location] of Object.entries(ALMATY_LOCATIONS)) {
    if (key.includes(q) || (location.name && location.name.toLowerCase().includes(q))) {
      results.push(location);
    }
  }

  return results.slice(0, 5);
};

// Predict conditions for departure time
export const predictConditions = (
  departureTime: Date
): { traffic: string; airQuality: string; recommendation: string } => {
  const hour = departureTime.getHours();
  const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  const isNight = hour >= 22 || hour <= 5;
  const isWeekend = departureTime.getDay() === 0 || departureTime.getDay() === 6;

  let traffic: string;
  let airQuality: string;
  let recommendation: string;

  if (isNight) {
    traffic = 'Very light traffic expected';
    airQuality = 'Better air quality at night';
    recommendation = 'Excellent time to travel with minimal congestion';
  } else if (isWeekend) {
    traffic = 'Moderate weekend traffic';
    airQuality = 'Generally better air quality';
    recommendation = 'Good conditions, consider avoiding shopping districts';
  } else if (isPeak) {
    traffic = 'Heavy rush hour traffic expected';
    airQuality = 'Higher pollution levels during peak hours';
    recommendation = 'Consider departing 30-60 minutes earlier or later to avoid congestion';
  } else {
    traffic = 'Normal traffic flow';
    airQuality = 'Moderate air quality';
    recommendation = 'Standard conditions, most routes should be efficient';
  }

  return { traffic, airQuality, recommendation };
};

// Get grid data for heatmaps
export const getTrafficHeatmapData = (): Array<{ lat: number; lng: number; intensity: number }> => {
  const data: Array<{ lat: number; lng: number; intensity: number }> = [];

  // Generate grid points
  for (let lat = 43.16; lat <= 43.32; lat += 0.01) {
    for (let lng = 76.85; lng <= 77.05; lng += 0.01) {
      const traffic = getTrafficAtPoint({ lat, lng });
      if (traffic > 30) {
        data.push({ lat, lng, intensity: traffic / 100 });
      }
    }
  }

  return data;
};

export const getAirQualityHeatmapData = (): Array<{ lat: number; lng: number; intensity: number; aqi: number }> => {
  const data: Array<{ lat: number; lng: number; intensity: number; aqi: number }> = [];

  for (let lat = 43.16; lat <= 43.32; lat += 0.01) {
    for (let lng = 76.85; lng <= 77.05; lng += 0.01) {
      const traffic = getTrafficAtPoint({ lat, lng });
      const aqi = getAirQualityAtPoint({ lat, lng }, traffic);
      data.push({ lat, lng, intensity: Math.min(1, aqi / 150), aqi });
    }
  }

  return data;
};
