import React from 'react';
import { Route, Clock, MapPin, Car, Wind, Sparkles, ChevronRight, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Route as RouteType } from '@/lib/routingEngine';

interface RouteResultsPanelProps {
  routes: RouteType[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  isLoading?: boolean;
}

const RouteResultsPanel: React.FC<RouteResultsPanelProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  isLoading,
}) => {
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
      <div className="bg-white dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 space-y-4">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl border border-primary/20">
            <Navigation className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <h4 className="text-xl font-black text-foreground tracking-tighter uppercase italic">Ready for Analysis</h4>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto font-medium">
            Please define your <span className="text-primary font-bold">Origin</span> and <span className="text-emerald-500 font-bold">Destination</span> to initialize neural routing pathfinding.
          </p>
          <div className="pt-4 flex justify-center gap-1">
            {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 200}ms` }} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Navigation className="w-16 h-16 text-foreground" />
      </div>

      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Neural Path Options
        <Badge variant="outline" className="ml-auto text-[10px] bg-muted/50 border-border text-muted-foreground">
          NODE_{routes.length}
        </Badge>
      </h4>

      <div className="space-y-4">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id || (!selectedRouteId && route.type === 'recommended');
          const isRecommended = route.type === 'recommended';
          const timeMin = Math.round(route.totalTime / 60);
          const distKm = (route.totalDistance / 1000).toFixed(1);

          return (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`
                w-full text-left p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden
                ${isSelected
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-primary/20'
                  : 'border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/50'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              )}

              <div className="flex items-start justify-between gap-2 mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isRecommended ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Sparkles className={`h-4 w-4 ${isRecommended ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-primary' : (isRecommended ? 'text-primary' : 'text-muted-foreground')}`}>
                    {isRecommended ? 'Optimal Protocol' : 'Alternative Flow'}
                  </span>
                </div>
                <div className={`transition-transform duration-500 ${isSelected ? 'translate-x-1' : ''}`}>
                  <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                {/* Primary Stats */}
                <div className="flex items-end justify-between">
                  <div>
                    <span className={`text-4xl font-black tracking-tighter tabular-nums ${isSelected ? 'text-primary' : 'text-foreground'}`}>{timeMin}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase ml-1 tracking-widest">min</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-foreground/80">{distKm}</span>
                    <span className="text-[10px] text-muted-foreground uppercase ml-1 font-bold">km</span>
                  </div>
                </div>

                {/* Environmental Badges */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-background/40 border border-border">
                    <Car className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-mono text-foreground/70 font-bold">{route.avgTraffic}% Load</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-background/40 border border-border">
                    <Wind className={`h-3 w-3 ${route.avgAirQuality < 100 ? 'text-emerald-500' : 'text-rose-500'}`} />
                    <span className="text-[10px] font-mono text-foreground/70 font-bold">AQI {route.avgAirQuality}</span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-primary/10 relative z-10 animate-in fade-in slide-in-from-top-2 duration-500">
                  <p className="text-[10px] text-primary/80 font-bold italic leading-relaxed">
                    NEURAL_LOG: {route.explanation}
                  </p>
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
