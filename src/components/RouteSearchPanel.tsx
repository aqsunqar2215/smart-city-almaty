import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, X, Locate } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RoutePoint, searchLocations, ALMATY_LOCATIONS } from '@/lib/routingEngine';

interface RouteSearchPanelProps {
  startPoint: RoutePoint | null;
  endPoint: RoutePoint | null;
  onStartChange: (point: RoutePoint | null) => void;
  onEndChange: (point: RoutePoint | null) => void;
  onSwapPoints: () => void;
}

const RouteSearchPanel: React.FC<RouteSearchPanelProps> = ({
  startPoint,
  endPoint,
  onStartChange,
  onEndChange,
  onSwapPoints,
}) => {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startSuggestions, setStartSuggestions] = useState<RoutePoint[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<RoutePoint[]>([]);
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search suggestions
  useEffect(() => {
    if (startQuery.length >= 2) {
      setStartSuggestions(searchLocations(startQuery));
    } else if (startQuery.length === 0 && activeField === 'start') {
      // Show popular locations when field is empty
      setStartSuggestions(Object.values(ALMATY_LOCATIONS).slice(0, 5));
    } else {
      setStartSuggestions([]);
    }
  }, [startQuery, activeField]);

  useEffect(() => {
    if (endQuery.length >= 2) {
      setEndSuggestions(searchLocations(endQuery));
    } else if (endQuery.length === 0 && activeField === 'end') {
      setEndSuggestions(Object.values(ALMATY_LOCATIONS).slice(0, 5));
    } else {
      setEndSuggestions([]);
    }
  }, [endQuery, activeField]);

  // Update input when point changes externally
  useEffect(() => {
    if (startPoint?.name && startQuery !== startPoint.name) {
      setStartQuery(startPoint.name);
    }
  }, [startPoint]);

  useEffect(() => {
    if (endPoint?.name && endQuery !== endPoint.name) {
      setEndQuery(endPoint.name);
    }
  }, [endPoint]);

  const handleSelectStart = (point: RoutePoint) => {
    onStartChange(point);
    setStartQuery(point.name || '');
    setActiveField(null);
  };

  const handleSelectEnd = (point: RoutePoint) => {
    onEndChange(point);
    setEndQuery(point.name || '');
    setActiveField(null);
  };

  const handleUseCurrentLocation = () => {
    // Simulate getting current location (Almaty center as default)
    const currentLocation: RoutePoint = {
      lat: 43.2567,
      lng: 76.9286,
      name: 'Current Location',
    };
    onStartChange(currentLocation);
    setStartQuery('Current Location');
  };

  return (
    <div ref={dropdownRef} className="bg-white dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
          <Navigation className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground tracking-tight">System Navigation</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono font-bold">Routing_Module_v4</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Start Point */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <div className="w-4 h-full border-l border-dashed border-primary/20 ml-[3px] mt-2 mb-2" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Origin location..."
                value={startQuery}
                onChange={(e) => setStartQuery(e.target.value)}
                onFocus={() => setActiveField('start')}
                className="pl-9 pr-10 bg-background/50 border-border focus:border-primary/50 text-foreground text-sm h-11 rounded-xl shadow-sm"
              />
              {startQuery && (
                <button
                  onClick={() => {
                    setStartQuery('');
                    onStartChange(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUseCurrentLocation}
              className="bg-muted hover:bg-muted/80 border-border rounded-xl h-11 w-11 transition-all"
              title="Use current GPS"
            >
              <Locate className="h-4 w-4 text-primary" />
            </Button>
          </div>

          {/* Start Suggestions */}
          {activeField === 'start' && startSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-auto backdrop-blur-xl">
              {startSuggestions.map((point, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectStart(point)}
                  className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-sm text-foreground"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{point.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwapPoints}
            className="text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4M7 4L3 8M7 4L11 8" />
              <path d="M17 8V20M17 20L21 16M17 20L13 16" />
            </svg>
          </Button>
        </div>

        {/* End Point */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Destination..."
                value={endQuery}
                onChange={(e) => setEndQuery(e.target.value)}
                onFocus={() => setActiveField('end')}
                className="pl-9 pr-10 bg-background/50 border-border focus:border-red-500/50 text-foreground text-sm h-11 rounded-xl shadow-sm"
              />
              {endQuery && (
                <button
                  onClick={() => {
                    setEndQuery('');
                    onEndChange(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* End Suggestions */}
          {activeField === 'end' && endSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-2xl max-h-48 overflow-auto backdrop-blur-xl">
              {endSuggestions.map((point, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectEnd(point)}
                  className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 text-sm text-foreground transition-colors border-b border-border last:border-0"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{point.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3 px-1">Rapid Access</p>
        <div className="flex flex-wrap gap-2">
          {['Mega Center', 'Esentai', 'Airport', 'Kok Tobe'].map((name) => (
            <button
              key={name}
              onClick={() => {
                const loc = ALMATY_LOCATIONS[name.toLowerCase()];
                if (loc) {
                  handleSelectEnd(loc);
                }
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-muted border border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium text-muted-foreground"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteSearchPanel;
