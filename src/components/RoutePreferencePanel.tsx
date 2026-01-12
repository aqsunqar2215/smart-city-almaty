import React from 'react';
import { Car, Wind, Scale, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RoutePreference, predictConditions } from '@/lib/routingEngine';

interface RoutePreferencePanelProps {
  preference: RoutePreference;
  onPreferenceChange: (pref: RoutePreference) => void;
  showTraffic: boolean;
  showAirQuality: boolean;
  onShowTrafficChange: (show: boolean) => void;
  onShowAirQualityChange: (show: boolean) => void;
}

const RoutePreferencePanel: React.FC<RoutePreferencePanelProps> = ({
  preference,
  onPreferenceChange,
  showTraffic,
  showAirQuality,
  onShowTrafficChange,
  onShowAirQualityChange,
}) => {
  const prediction = predictConditions(new Date());

  const preferences: Array<{ id: RoutePreference; label: string; icon: React.ReactNode; description: string }> = [
    {
      id: 'traffic',
      label: 'Less Traffic',
      icon: <Car className="h-4 w-4" />,
      description: '70% traffic, 30% air quality'
    },
    {
      id: 'air',
      label: 'Cleaner Air',
      icon: <Wind className="h-4 w-4" />,
      description: '70% air quality, 30% traffic'
    },
    {
      id: 'balanced',
      label: 'Balanced',
      icon: <Scale className="h-4 w-4" />,
      description: '50% traffic, 50% air quality'
    },
  ];

  return (
    <div className="bg-white dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />

      {/* Route Preferences */}
      <div>
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          Prioritization
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {preferences.map((pref) => (
            <Button
              key={pref.id}
              variant={preference === pref.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPreferenceChange(pref.id)}
              className={`flex flex-col h-auto py-3 gap-2 transition-all duration-300 rounded-xl ${preference === pref.id
                ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border-primary'
                : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
            >
              {pref.icon}
              <span className="text-[10px] font-bold uppercase tracking-tighter">{pref.label}</span>
            </Button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 text-center italic font-medium">
          {preferences.find(p => p.id === preference)?.description}
        </p>
      </div>

      {/* Layer Toggles */}
      <div className="border-t border-border pt-6">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Visual Data Layers</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border hover:border-primary/30 transition-colors">
            <Label htmlFor="traffic-layer" className="flex items-center gap-3 text-xs cursor-pointer text-foreground font-bold tracking-tight">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse [animation-delay:200ms]" />
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse [animation-delay:400ms]" />
              </div>
              Traffic Density Map
            </Label>
            <Switch
              id="traffic-layer"
              checked={showTraffic}
              onCheckedChange={onShowTrafficChange}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border hover:border-primary/30 transition-colors">
            <Label htmlFor="air-layer" className="flex items-center gap-3 text-xs cursor-pointer text-foreground font-bold tracking-tight">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <Wind className="h-4 w-4 text-emerald-500" />
              </div>
              AQI / Air Analysis
            </Label>
            <Switch
              id="air-layer"
              checked={showAirQuality}
              onCheckedChange={onShowAirQualityChange}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Predicted Flow
        </h4>
        <div className="space-y-3 font-mono">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border group/info">
            <Car className="h-4 w-4 text-muted-foreground mt-0.5 group-hover/info:text-primary transition-colors" />
            <span className="text-[11px] text-foreground font-bold leading-relaxed">{prediction.traffic}</span>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border group/info">
            <Wind className="h-4 w-4 text-muted-foreground mt-0.5 group-hover/info:text-emerald-500 transition-colors" />
            <span className="text-[11px] text-foreground font-bold leading-relaxed">{prediction.airQuality}</span>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]">
            <AlertTriangle className="h-4 w-4 text-primary mt-0.5 animate-bounce" />
            <span className="text-[11px] text-primary font-bold tracking-tight">{prediction.recommendation}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border pt-6 font-mono">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Map Legend</h4>
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
            <span className="text-foreground font-bold uppercase tracking-tighter">Primary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 border-b border-dashed border-muted-foreground" />
            <span className="text-muted-foreground font-bold uppercase tracking-tighter">Backup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-foreground font-bold uppercase tracking-tighter">Eco_Clear</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-foreground font-bold uppercase tracking-tighter">Eco_Warn</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePreferencePanel;
