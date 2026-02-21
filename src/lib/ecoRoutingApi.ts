import { EcoRoute, EcoRoutingProfile, EcoRoutingResponse } from '@/types/ecoRouting';

interface RawRouteCompare {
  delta_time_s: number;
  delta_aqi_exposure: number;
  delta_co2_g: number;
}

interface RawRouteStep {
  instruction: string;
  distance_m: number;
  duration_s: number;
  distance_text: string;
}

interface RawRoute {
  id: string;
  type: 'recommended' | 'alternative';
  source: 'road' | 'fallback';
  mode: 'road' | 'estimated';
  polyline: [number, number][];
  distance_m: number;
  eta_s: number;
  avg_traffic: number;
  avg_aqi: number;
  aqi_exposure: number;
  co2_g: number;
  eco_score: number;
  compare_fastest: RawRouteCompare;
  explanation: string;
  degraded?: boolean;
  aqi_profile?: number[];
  steps?: RawRouteStep[];
}

interface RawEcoRoutingResponse {
  status: 'ok';
  mode: 'road' | 'estimated';
  degraded?: boolean;
  routes: RawRoute[];
}

const resolveApiRoot = (): string => {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!configured) return 'http://localhost:8000/api';
  return configured.replace(/\/+$/, '').endsWith('/api')
    ? configured.replace(/\/+$/, '')
    : `${configured.replace(/\/+$/, '')}/api`;
};

const API_ROOT = resolveApiRoot();

const mapRoute = (route: RawRoute): EcoRoute => ({
  id: route.id,
  type: route.type,
  source: route.source,
  mode: route.mode,
  polyline: route.polyline,
  distanceM: route.distance_m,
  etaS: route.eta_s,
  avgTraffic: route.avg_traffic,
  avgAqi: route.avg_aqi,
  aqiExposure: route.aqi_exposure,
  co2G: route.co2_g,
  ecoScore: route.eco_score,
  compareFastest: {
    deltaTimeS: route.compare_fastest.delta_time_s,
    deltaAqiExposure: route.compare_fastest.delta_aqi_exposure,
    deltaCo2G: route.compare_fastest.delta_co2_g,
  },
  explanation: route.explanation,
  degraded: route.degraded ?? false,
  aqiProfile: route.aqi_profile ?? [],
  steps: (route.steps ?? []).map((step) => ({
    instruction: step.instruction,
    distanceM: step.distance_m,
    durationS: step.duration_s,
    distanceText: step.distance_text,
  })),
});

export const fetchEcoRoutes = async (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  profile: EcoRoutingProfile
): Promise<EcoRoutingResponse> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(`${API_ROOT}/routing/eco`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        start,
        end,
        profile,
        departure_time: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Eco routing failed with HTTP ${response.status}`);
    }

    const raw = (await response.json()) as RawEcoRoutingResponse;
    if (raw.status !== 'ok' || !Array.isArray(raw.routes)) {
      throw new Error('Eco routing payload is invalid');
    }

    return {
      status: 'ok',
      mode: raw.mode,
      degraded: raw.degraded ?? false,
      routes: raw.routes.map(mapRoute),
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};
