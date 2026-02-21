import React from 'react';
import { Car, ChevronRight, Leaf, Navigation, Sparkles, TriangleAlert, Wind, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EcoRoute } from '@/types/ecoRouting';
import { ECO_ROUTING_TEXT } from '@/lib/ecoRoutingTexts';

interface RouteResultsPanelProps {
  routes: EcoRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  isLoading?: boolean;
}

const formatDeltaMinutes = (deltaSeconds: number): string => {
  const minutes = Math.round(Math.abs(deltaSeconds) / 60);
  if (minutes === 0) return '0 min';
  return `${deltaSeconds > 0 ? '+' : '-'}${minutes} min`;
};

const formatSignedNumber = (value: number, suffix: string): string => {
  if (value === 0) return `0 ${suffix}`;
  return `${value > 0 ? '+' : ''}${Math.round(value)} ${suffix}`;
};

const RouteResultsPanel: React.FC<RouteResultsPanelProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  isLoading,
}) => {
  const routeHighlights = React.useMemo(() => {
    if (routes.length === 0) {
      return {
        fastestId: null as string | null,
        cleanestId: null as string | null,
        lowestCo2Id: null as string | null,
      };
    }

    const fastest = routes.reduce((best, current) => (current.etaS < best.etaS ? current : best), routes[0]);
    const lowestCo2 = routes.reduce((best, current) => (current.co2G < best.co2G ? current : best), routes[0]);
    const cleanestCandidates = routes.filter((route) => !route.degraded);
    const cleanestBase = cleanestCandidates.length > 0 ? cleanestCandidates : routes;
    const cleanest = cleanestBase.reduce((best, current) =>
      current.aqiExposure < best.aqiExposure ? current : best
    , cleanestBase[0]);

    return {
      fastestId: fastest.id,
      cleanestId: cleanest.id,
      lowestCo2Id: lowestCo2.id,
    };
  }, [routes]);

  const copyRouteSummary = async (route: EcoRoute) => {
    const summary = [
      `Route: ${route.type === 'recommended' ? 'Recommended' : 'Alternative'}`,
      `ETA: ${Math.round(route.etaS / 60)} min`,
      `Distance: ${(route.distanceM / 1000).toFixed(1)} km`,
      `Eco Score: ${route.ecoScore}/100`,
      `AQI Exposure: ${Math.round(route.aqiExposure)}`,
      `CO2: ${Math.round(route.co2G)} g`,
      `vs Fastest: ${formatDeltaMinutes(route.compareFastest.deltaTimeS)}, ${formatSignedNumber(route.compareFastest.deltaAqiExposure, 'exp')}, ${formatSignedNumber(route.compareFastest.deltaCo2G, 'g')}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      // clipboard not available; ignore silently
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted/20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="bg-white dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-primary/20">
            <Navigation className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <h4 className="text-xl font-black text-foreground tracking-tighter uppercase italic">Ready for Analysis</h4>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px] mx-auto font-medium">
            Define your origin and destination to compare <span className="text-primary font-bold">Fastest</span> vs{' '}
            <span className="text-emerald-500 font-bold">Eco routes</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Eco Route Comparison
        <Badge variant="outline" className="ml-auto text-[10px] bg-muted/50 border-border text-muted-foreground">
          {routes.length} options
        </Badge>
      </h4>

      <div className="space-y-4">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id || (!selectedRouteId && route.type === 'recommended');
          const isRecommended = route.type === 'recommended';
          const timeMin = Math.round(route.etaS / 60);
          const distKm = (route.distanceM / 1000).toFixed(1);

          return (
            <button
              key={route.id}
              data-testid="route-card"
              onClick={() => onSelectRoute(route.id)}
              className={`
                w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden
                ${isSelected
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.12)] ring-1 ring-primary/20'
                  : 'border-border bg-muted/25 hover:border-primary/30 hover:bg-muted/40'}
              `}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isRecommended ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isRecommended ? 'Recommended' : 'Alternative'}
                  </span>
                  {routeHighlights.fastestId === route.id && (
                    <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest bg-primary/10 text-primary border-primary/30">
                      Fastest ETA
                    </Badge>
                  )}
                  {routeHighlights.cleanestId === route.id && (
                    <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                      Lowest AQI
                    </Badge>
                  )}
                  {routeHighlights.lowestCo2Id === route.id && (
                    <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest bg-cyan-500/10 text-cyan-500 border-cyan-500/30">
                      Lowest CO2
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase font-black tracking-widest ${
                      route.mode === 'road'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    }`}
                  >
                    {route.mode === 'road' ? ECO_ROUTING_TEXT.labels.routeVerified : ECO_ROUTING_TEXT.labels.routeEstimated}
                  </Badge>
                  {route.degraded && (
                    <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest bg-amber-500/10 text-amber-500 border-amber-500/30">
                      AQI degraded
                    </Badge>
                  )}
                </div>
                <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <span className={`text-4xl font-black tracking-tighter tabular-nums ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {timeMin}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase ml-1 tracking-widest">min</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-foreground/80">{distKm}</span>
                  <span className="text-[10px] text-muted-foreground uppercase ml-1 font-bold">km</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-background/40 border border-border">
                  <Car className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-mono text-foreground/70 font-bold">{route.avgTraffic}% Traffic</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-background/40 border border-border">
                  <Wind className={`h-3 w-3 ${route.avgAqi < 90 ? 'text-emerald-500' : 'text-rose-500'}`} />
                  <span className="text-[10px] font-mono text-foreground/70 font-bold">AQI {route.avgAqi}</span>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-2 p-2 rounded-xl bg-background/40 border border-border">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] font-mono text-foreground/70 font-bold">{ECO_ROUTING_TEXT.labels.ecoScore}</span>
                  </div>
                  <span className="text-[11px] font-black tracking-tight text-emerald-500">{route.ecoScore}/100</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-background/40 border border-border">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Vs Fastest Baseline</div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="font-bold text-foreground">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground mr-1">time</span>
                    {formatDeltaMinutes(route.compareFastest.deltaTimeS)}
                  </div>
                  <div className="font-bold text-emerald-500">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground mr-1">aqi</span>
                    {route.degraded ? 'N/A AQI' : formatSignedNumber(route.compareFastest.deltaAqiExposure, 'exp')}
                  </div>
                  <div className="font-bold text-cyan-500">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground mr-1">co2</span>
                    {formatSignedNumber(route.compareFastest.deltaCo2G, 'g')}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-3 border-t border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="mb-2 flex items-center gap-1.5">
                    {route.mode === 'road' ? (
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{ECO_ROUTING_TEXT.labels.routeVerified}</span>
                    ) : (
                      <>
                        <TriangleAlert className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{ECO_ROUTING_TEXT.labels.routeEstimated}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-primary/80 font-bold italic leading-relaxed">{route.explanation}</p>
                  {route.steps.length > 0 && (
                    <div className="mt-3 p-2 rounded-xl bg-background/35 border border-border">
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1">
                        <Route className="h-3 w-3" />
                        Turn-by-turn preview
                      </div>
                      <div className="space-y-1.5">
                        {route.steps.slice(0, 4).map((step, idx) => (
                          <div key={`${route.id}-step-${idx}`} className="flex items-center justify-between gap-2 text-[10px]">
                            <span className="text-foreground/85 truncate">{idx + 1}. {step.instruction}</span>
                            <span className="text-muted-foreground font-mono whitespace-nowrap">{step.distanceText}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        void copyRouteSummary(route);
                      }}
                      className="text-[10px] uppercase tracking-widest font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Copy summary
                    </button>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RouteResultsPanel;
