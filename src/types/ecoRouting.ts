export type EcoRoutingProfile = 'traffic' | 'balanced' | 'air';
export type EcoRoutingMode = 'road' | 'estimated';
export type EcoRoutingSource = 'road' | 'fallback';

export interface EcoRouteCompare {
  deltaTimeS: number;
  deltaAqiExposure: number;
  deltaCo2G: number;
}

export interface EcoRouteStep {
  instruction: string;
  distanceM: number;
  durationS: number;
  distanceText: string;
}

export interface EcoRoute {
  id: string;
  type: 'recommended' | 'alternative';
  source: EcoRoutingSource;
  mode: EcoRoutingMode;
  polyline: [number, number][];
  distanceM: number;
  etaS: number;
  avgTraffic: number;
  avgAqi: number;
  aqiExposure: number;
  co2G: number;
  ecoScore: number;
  compareFastest: EcoRouteCompare;
  explanation: string;
  degraded: boolean;
  aqiProfile: number[];
  steps: EcoRouteStep[];
}

export interface EcoRoutingRequestPayload {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  profile: EcoRoutingProfile;
  departure_time: string;
}

export interface EcoRoutingResponse {
  status: 'ok';
  mode: EcoRoutingMode;
  degraded: boolean;
  routes: EcoRoute[];
}
