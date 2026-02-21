import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, Navigation, RefreshCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import EcoRoutingMap from '@/components/EcoRoutingMap';
import RouteSearchPanel from '@/components/RouteSearchPanel';
import RoutePreferencePanel from '@/components/RoutePreferencePanel';
import RouteResultsPanel from '@/components/RouteResultsPanel';
import AvoidAreaPanel from '@/components/AvoidAreaPanel';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal, SpotlightCard, CursorGlow } from '@/components/effects/InteractionEffects';
import {
  RoutePoint,
  Route as LocalRoute,
  calculateRoutes,
  ALMATY_LOCATIONS,
} from '@/lib/routingEngine';
import { AvoidArea, EcoRoute, EcoRoutingProfile } from '@/types/ecoRouting';
import { fetchEcoRoutes } from '@/lib/ecoRoutingApi';
import { ECO_ROUTING_TEXT } from '@/lib/ecoRoutingTexts';

const pointInCircle = (point: [number, number], area: AvoidArea): boolean => {
  const lat0 = area.lat;
  const lng0 = area.lng;
  const cosLat = Math.max(0.15, Math.cos((lat0 * Math.PI) / 180));
  const kx = 111_320 * cosLat;
  const ky = 111_320;
  const x = (point[1] - lng0) * kx;
  const y = (point[0] - lat0) * ky;
  return Math.hypot(x, y) <= area.radiusM;
};

const distancePointToSegmentMeters = (
  point: [number, number],
  start: [number, number],
  end: [number, number],
  latRef: number
): number => {
  const cosLat = Math.max(0.15, Math.cos((latRef * Math.PI) / 180));
  const kx = 111_320 * cosLat;
  const ky = 111_320;

  const px = point[1] * kx;
  const py = point[0] * ky;
  const ax = start[1] * kx;
  const ay = start[0] * ky;
  const bx = end[1] * kx;
  const by = end[0] * ky;

  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const len2 = abx * abx + aby * aby;
  if (len2 <= 1e-6) return Math.hypot(apx, apy);

  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / len2));
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  return Math.hypot(px - cx, py - cy);
};

const routeIntersectsAvoidArea = (route: EcoRoute, area: AvoidArea): boolean => {
  if (route.polyline.length === 0) return false;
  const center: [number, number] = [area.lat, area.lng];
  for (let idx = 0; idx < route.polyline.length; idx++) {
    if (pointInCircle(route.polyline[idx], area)) return true;
    if (idx > 0) {
      const segDistance = distancePointToSegmentMeters(center, route.polyline[idx - 1], route.polyline[idx], area.lat);
      if (segDistance <= area.radiusM) return true;
    }
  }
  return false;
};

const normalizeRouteComparison = (routes: EcoRoute[]): EcoRoute[] => {
  if (routes.length === 0) return [];
  const fastest = routes.reduce((best, current) => (current.etaS < best.etaS ? current : best), routes[0]);
  return routes.map((route, idx) => ({
    ...route,
    type: idx === 0 ? 'recommended' : 'alternative',
    compareFastest: {
      deltaTimeS: route.etaS - fastest.etaS,
      deltaAqiExposure: route.degraded || fastest.degraded ? 0 : route.aqiExposure - fastest.aqiExposure,
      deltaCo2G: route.co2G - fastest.co2G,
    },
  }));
};

const EcoRouting: React.FC = () => {
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  const [preference, setPreference] = useState<EcoRoutingProfile>('balanced');
  const [rawRoutes, setRawRoutes] = useState<EcoRoute[]>([]);
  const [routes, setRoutes] = useState<EcoRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showAirQuality, setShowAirQuality] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [baseRoutingStatus, setBaseRoutingStatus] = useState<string>(ECO_ROUTING_TEXT.status.selectPoints);
  const [routingStatus, setRoutingStatus] = useState<string>(ECO_ROUTING_TEXT.status.selectPoints);
  const [avoidAreas, setAvoidAreas] = useState<AvoidArea[]>([]);
  const [selectedAvoidAreaId, setSelectedAvoidAreaId] = useState<string | null>(null);
  const [isAddingAvoidArea, setIsAddingAvoidArea] = useState(false);
  const { playClick, playSuccess } = useSoundEffects();

  const activeAvoidAreas = useMemo(
    () => avoidAreas.filter((area) => area.enabled),
    [avoidAreas]
  );

  const mapLocalRoutesToEcoRoutes = useCallback((localRoutes: LocalRoute[]): EcoRoute[] => {
    if (localRoutes.length === 0) return [];

    const fastest = localRoutes.reduce((best, current) =>
      current.totalTime < best.totalTime ? current : best
    , localRoutes[0]);

    return localRoutes.map((route) => {
      const distanceKm = route.totalDistance / 1000;
      const co2G = Math.round(distanceKm * 168 * (1 + route.avgTraffic / 150));
      const fastestCo2G = Math.round((fastest.totalDistance / 1000) * 168 * (1 + fastest.avgTraffic / 150));
      const aqiExposure = Math.round(route.avgAirQuality * route.totalTime);
      const fastestExposure = Math.round(fastest.avgAirQuality * fastest.totalTime);
      const polyline: [number, number][] = route.segments.length > 0
        ? [
            [route.segments[0].start.lat, route.segments[0].start.lng],
            ...route.segments.map((segment) => [segment.end.lat, segment.end.lng] as [number, number]),
          ]
        : [];

      return {
        id: route.id,
        type: route.type,
        source: route.source,
        mode: route.source === 'road' ? 'road' : 'estimated',
        polyline,
        distanceM: Math.round(route.totalDistance),
        etaS: Math.round(route.totalTime),
        avgTraffic: route.avgTraffic,
        avgAqi: route.avgAirQuality,
        aqiExposure,
        co2G,
        ecoScore: route.ecoScore,
        compareFastest: {
          deltaTimeS: Math.round(route.totalTime - fastest.totalTime),
          deltaAqiExposure: Math.round(aqiExposure - fastestExposure),
          deltaCo2G: Math.round(co2G - fastestCo2G),
        },
        explanation: route.explanation,
        degraded: route.source !== 'road',
        aqiProfile: route.segments.map((segment) => segment.airQuality).slice(0, 120),
        steps: route.segments.slice(0, 8).map((segment, index) => ({
          instruction: index === 0 ? 'Start route' : `Continue to waypoint ${index + 1}`,
          distanceM: Math.round(segment.distance),
          durationS: Math.round(segment.estimatedTime),
          distanceText: segment.distance >= 1000 ? `${(segment.distance / 1000).toFixed(1)} km` : `${Math.round(segment.distance)} m`,
        })),
      };
    });
  }, []);

  const calculateViaBackend = useCallback(async (start: RoutePoint, end: RoutePoint, profile: EcoRoutingProfile) => {
    try {
      const payload = await fetchEcoRoutes(
        { lat: start.lat, lng: start.lng },
        { lat: end.lat, lng: end.lng },
        profile,
        avoidAreas
      );
      if (!payload.routes || payload.routes.length === 0) {
        throw new Error('Backend returned empty routes');
      }
      setRawRoutes(payload.routes);
      const status = payload.mode === 'road'
        ? payload.degraded
          ? `${ECO_ROUTING_TEXT.status.roadReady} • ${ECO_ROUTING_TEXT.status.degraded}`
          : ECO_ROUTING_TEXT.status.roadReady
        : ECO_ROUTING_TEXT.status.estimated;
      setBaseRoutingStatus(status);
      setRoutingStatus(status);
    } catch {
      const localRoutes = await calculateRoutes(start, end, profile);
      const fallback = mapLocalRoutesToEcoRoutes(localRoutes);
      setRawRoutes(fallback);
      const status = fallback.some((route) => route.mode === 'road')
        ? ECO_ROUTING_TEXT.status.roadReady
        : ECO_ROUTING_TEXT.status.estimated;
      setBaseRoutingStatus(status);
      setRoutingStatus(status);
    }
  }, [avoidAreas, mapLocalRoutesToEcoRoutes]);

  useEffect(() => {
    if (startPoint && endPoint) {
      let isCancelled = false;
      setIsCalculating(true);
      const timer = window.setTimeout(async () => {
        await calculateViaBackend(startPoint, endPoint, preference);
        if (isCancelled) return;
        setIsCalculating(false);
      }, 260);
      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }

    setRawRoutes([]);
    setRoutes([]);
    setSelectedRouteId(null);
    setBaseRoutingStatus(ECO_ROUTING_TEXT.status.selectPoints);
    setRoutingStatus(ECO_ROUTING_TEXT.status.selectPoints);
  }, [startPoint, endPoint, preference, calculateViaBackend]);

  useEffect(() => {
    const filtered = activeAvoidAreas.length === 0
      ? rawRoutes
      : rawRoutes.filter((route) => !activeAvoidAreas.some((area) => routeIntersectsAvoidArea(route, area)));

    if (rawRoutes.length > 0 && filtered.length === 0 && activeAvoidAreas.length > 0) {
      setRoutes([]);
      setSelectedRouteId(null);
      setRoutingStatus(ECO_ROUTING_TEXT.status.avoidFiltered);
      return;
    }

    const normalized = normalizeRouteComparison(filtered);
    setRoutes(normalized);
    setRoutingStatus(isAddingAvoidArea ? ECO_ROUTING_TEXT.status.avoidAddMode : baseRoutingStatus);
    setSelectedRouteId((prev) => {
      if (normalized.length === 0) return null;
      if (prev && normalized.some((route) => route.id === prev)) return prev;
      return normalized[0].id;
    });
  }, [rawRoutes, activeAvoidAreas, baseRoutingStatus, isAddingAvoidArea]);

  const handleSwapPoints = useCallback(() => {
    const temp = startPoint;
    setStartPoint(endPoint);
    setEndPoint(temp);
  }, [startPoint, endPoint]);

  const handleRefresh = useCallback(async () => {
    if (!startPoint || !endPoint) return;
    setIsCalculating(true);
    await calculateViaBackend(startPoint, endPoint, preference);
    setIsCalculating(false);
  }, [startPoint, endPoint, calculateViaBackend, preference]);

  const handleDemoRoute = useCallback(() => {
    setStartPoint(ALMATY_LOCATIONS['republic square']);
    setEndPoint(ALMATY_LOCATIONS['mega center']);
    playSuccess?.();
  }, [playSuccess]);

  const handleMapClick = useCallback((point: RoutePoint) => {
    if (!isAddingAvoidArea) return;
    const areaId = `avoid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setAvoidAreas((prev) => [...prev, {
      id: areaId,
      lat: point.lat,
      lng: point.lng,
      radiusM: 700,
      enabled: true,
    }]);
    setSelectedAvoidAreaId(areaId);
    setIsAddingAvoidArea(false);
    setRoutingStatus(baseRoutingStatus);
    playClick?.();
  }, [baseRoutingStatus, isAddingAvoidArea, playClick]);

  const handleStartPointDragged = useCallback((point: RoutePoint) => {
    setStartPoint((prev) => ({
      lat: point.lat,
      lng: point.lng,
      name: prev?.name || 'Start point',
    }));
  }, []);

  const handleEndPointDragged = useCallback((point: RoutePoint) => {
    setEndPoint((prev) => ({
      lat: point.lat,
      lng: point.lng,
      name: prev?.name || 'Destination',
    }));
  }, []);

  const handleToggleAddAvoidArea = useCallback(() => {
    setIsAddingAvoidArea((prev) => {
      const next = !prev;
      setRoutingStatus(next ? ECO_ROUTING_TEXT.status.avoidAddMode : baseRoutingStatus);
      return next;
    });
  }, [baseRoutingStatus]);

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,transparent_70%)]" />
      </div>

      <CursorGlow />

      <div className="min-h-screen pb-8 max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700 relative z-10">
        <ScrollReveal direction="down">
          <div className="mb-10 relative">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="ghost" size="icon" className="rounded-xl bg-card/40 backdrop-blur-md border border-border/50 h-12 w-12 hover:scale-110 transition-all text-primary">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <div className="space-y-1">
                  <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                    <Navigation className="text-primary w-10 h-10 animate-pulse" />
                    <span className="gradient-text">Neural Eco Routing</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] animate-pulse">AI-OPTIMIZED</Badge>
                  </h1>
                  <p className="text-muted-foreground">Smart pathfinding through Almaty taking air quality and traffic into account</p>
                </div>
              </div>

              <div className="flex items-center gap-6 bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-xl card-3d">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Network Efficiency</span>
                  <span className="text-2xl font-black text-emerald-500">94.2%</span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 flex items-center justify-center animate-pulse text-emerald-500">
                  <Activity size={24} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-6 p-6 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md text-foreground shadow-xl card-3d overflow-hidden group">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="bg-primary/10 border-primary/20 hover:bg-primary/20 transition-all rounded-xl h-11 font-bold shadow-sm"
                  onClick={handleDemoRoute}
                >
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  {ECO_ROUTING_TEXT.buttons.demo}
                </Button>
                <Badge
                  className={`border text-[10px] uppercase tracking-widest font-black ${
                    routingStatus.includes(ECO_ROUTING_TEXT.status.roadReady)
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                      : routingStatus.includes(ECO_ROUTING_TEXT.status.estimated) || routingStatus.includes(ECO_ROUTING_TEXT.status.avoidFiltered)
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                        : 'bg-primary/10 text-primary border-primary/30'
                  }`}
                >
                  {routingStatus}
                </Badge>
              </div>

              <Button
                data-testid="optimize-route-button"
                className={`text-white rounded-xl h-11 group px-8 transition-all duration-300 ${
                  isCalculating
                    ? 'bg-primary/70 shadow-[0_0_24px_rgba(59,130,246,0.45)]'
                    : 'bg-gradient-to-r from-primary via-cyan-500 to-emerald-500 hover:brightness-110 shadow-[0_0_24px_rgba(56,189,248,0.45)]'
                }`}
                onClick={handleRefresh}
                disabled={!startPoint || !endPoint || isCalculating}
                title={!startPoint || !endPoint ? ECO_ROUTING_TEXT.tooltips.invalidPoints : undefined}
              >
                <RefreshCw className={`h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500 ${isCalculating ? 'animate-spin' : ''}`} />
                {isCalculating ? ECO_ROUTING_TEXT.buttons.optimizing : ECO_ROUTING_TEXT.buttons.optimize}
              </Button>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-3 space-y-6">
            <ScrollReveal direction="left" delay={0.1}>
              <div className="card-3d">
                <RouteSearchPanel
                  startPoint={startPoint}
                  endPoint={endPoint}
                  onStartChange={setStartPoint}
                  onEndChange={setEndPoint}
                  onSwapPoints={handleSwapPoints}
                />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.2}>
              <div className="card-3d">
                <RoutePreferencePanel
                  preference={preference}
                  onPreferenceChange={setPreference}
                  showTraffic={showTraffic}
                  showAirQuality={showAirQuality}
                  onShowTrafficChange={setShowTraffic}
                  onShowAirQualityChange={setShowAirQuality}
                />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.25}>
              <div className="card-3d">
                <AvoidAreaPanel
                  areas={avoidAreas}
                  selectedAreaId={selectedAvoidAreaId}
                  isAddingMode={isAddingAvoidArea}
                  onToggleAddingMode={handleToggleAddAvoidArea}
                  onSelectArea={setSelectedAvoidAreaId}
                  onRadiusChange={(id, radiusM) => {
                    setAvoidAreas((prev) => prev.map((area) => area.id === id ? { ...area, radiusM } : area));
                  }}
                  onToggleArea={(id, enabled) => {
                    setAvoidAreas((prev) => prev.map((area) => area.id === id ? { ...area, enabled } : area));
                  }}
                  onRemoveArea={(id) => {
                    setAvoidAreas((prev) => prev.filter((area) => area.id !== id));
                    setSelectedAvoidAreaId((prev) => (prev === id ? null : prev));
                  }}
                  onClearAll={() => {
                    setAvoidAreas([]);
                    setSelectedAvoidAreaId(null);
                    setRoutingStatus(baseRoutingStatus);
                  }}
                />
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-6">
            <ScrollReveal direction="up" delay={0.1}>
              <SpotlightCard className="rounded-3xl h-[700px] shadow-2xl">
                <Card className="bg-card/40 backdrop-blur-md overflow-hidden border-border/50 rounded-3xl h-full relative group shadow-none">
                  <div className="h-full w-full">
                    <EcoRoutingMap
                      routes={routes}
                      startPoint={startPoint}
                      endPoint={endPoint}
                      avoidAreas={avoidAreas}
                      showTraffic={showTraffic}
                      showAirQuality={showAirQuality}
                      isAddingAvoidArea={isAddingAvoidArea}
                      selectedAvoidAreaId={selectedAvoidAreaId}
                      onMapClick={handleMapClick}
                      onAddAvoidArea={handleMapClick}
                      selectedRouteId={selectedRouteId || undefined}
                      onRouteSelect={setSelectedRouteId}
                      onAvoidAreaMove={(id, point) => {
                        setAvoidAreas((prev) => prev.map((area) => area.id === id
                          ? { ...area, lat: point.lat, lng: point.lng }
                          : area));
                      }}
                      onAvoidAreaSelect={setSelectedAvoidAreaId}
                      onStartPointChange={handleStartPointDragged}
                      onEndPointChange={handleEndPointDragged}
                    />
                  </div>
                </Card>
              </SpotlightCard>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-3">
            <ScrollReveal direction="right" delay={0.1}>
              <div className="card-3d sticky top-24">
                <RouteResultsPanel
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={setSelectedRouteId}
                  isLoading={isCalculating}
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoRouting;
