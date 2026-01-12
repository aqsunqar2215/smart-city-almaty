import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Navigation, RefreshCw, Search, Brain, Map as MapIcon, Sparkles, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import EcoRoutingMap from '@/components/EcoRoutingMap';
import RouteSearchPanel from '@/components/RouteSearchPanel';
import RoutePreferencePanel from '@/components/RoutePreferencePanel';
import RouteResultsPanel from '@/components/RouteResultsPanel';
import ShaderBackground from '@/components/backgrounds';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FloatingOrbs, TechPyramid, CyberSphere, Comet, StarField } from '@/components/3d/Animations';
import { ScrollReveal, SpotlightCard, CursorGlow } from '@/components/effects/InteractionEffects';
import { DirectionalScrollEffect } from '@/components/effects/ScrollInteractions';
import {
  RoutePoint,
  Route,
  RoutePreference,
  calculateRoutes,
  ALMATY_LOCATIONS,
} from '@/lib/routingEngine';

const EcoRouting: React.FC = () => {
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  const [preference, setPreference] = useState<RoutePreference>('balanced');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showAirQuality, setShowAirQuality] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [clickMode, setClickMode] = useState<'start' | 'end' | null>(null);
  const { playClick, playSuccess } = useSoundEffects();

  // Calculate routes when points or preference changes
  useEffect(() => {
    if (startPoint && endPoint) {
      setIsCalculating(true);
      // Simulate calculation delay
      const timer = setTimeout(() => {
        const newRoutes = calculateRoutes(startPoint, endPoint, preference);
        setRoutes(newRoutes);
        setSelectedRouteId(newRoutes[0]?.id || null);
        setIsCalculating(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setRoutes([]);
      setSelectedRouteId(null);
    }
  }, [startPoint, endPoint, preference]);

  const handleMapClick = useCallback((point: RoutePoint) => {
    if (clickMode === 'start') {
      setStartPoint({ ...point, name: 'Custom Location' });
      setClickMode(null);
    } else if (clickMode === 'end') {
      setEndPoint({ ...point, name: 'Custom Location' });
      setClickMode(null);
    }
  }, [clickMode]);

  const handleSwapPoints = () => {
    const temp = startPoint;
    setStartPoint(endPoint);
    setEndPoint(temp);
  };

  const handleRefresh = () => {
    if (startPoint && endPoint) {
      setIsCalculating(true);
      setTimeout(() => {
        const newRoutes = calculateRoutes(startPoint, endPoint, preference);
        setRoutes(newRoutes);
        setSelectedRouteId(newRoutes[0]?.id || null);
        setIsCalculating(false);
      }, 500);
    }
  };

  // Demo: Set default points
  const handleDemoRoute = () => {
    setStartPoint(ALMATY_LOCATIONS['republic square']);
    setEndPoint(ALMATY_LOCATIONS['mega center']);
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,transparent_70%)]" />
      </div>

      <CursorGlow />

      <div className="min-h-screen pb-8 max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700 relative z-10">

        {/* Header similar to Emergency Crisis Command Center */}
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
                  <span className="text-2xl font-black text-emerald-500">
                    94.2%
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 flex items-center justify-center animate-pulse text-emerald-500">
                  <Activity size={24} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-6 p-6 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md text-foreground dark:text-white shadow-xl card-3d overflow-hidden group">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="bg-primary/10 border-primary/20 hover:bg-primary/20 transition-all rounded-xl h-11 font-bold shadow-sm"
                  onClick={handleDemoRoute}
                >
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  Demo Analysis
                </Button>
              </div>

              <Button
                className="bg-primary hover:bg-primary/80 text-white rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] h-11 group px-8"
                onClick={handleRefresh}
                disabled={!startPoint || !endPoint || isCalculating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500 ${isCalculating ? 'animate-spin' : ''}`} />
                Recalculate
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Left Control Panel */}
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
          </div>

          {/* Map Visualization Viewport */}
          <div className="lg:col-span-6">
            <ScrollReveal direction="up" delay={0.1}>
              <SpotlightCard className="rounded-3xl h-[700px] shadow-2xl">
                <Card className="bg-card/40 backdrop-blur-md overflow-hidden border-border/50 rounded-3xl h-full relative group shadow-none">
                  <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <Button size="icon" variant="secondary" className="glass border shadow-sm h-10 w-10 rounded-xl" title="Expand View">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </Button>
                  </div>

                  <div className="h-full w-full">
                    <EcoRoutingMap
                      routes={routes}
                      startPoint={startPoint}
                      endPoint={endPoint}
                      showTraffic={showTraffic}
                      showAirQuality={showAirQuality}
                      onMapClick={handleMapClick}
                      selectedRouteId={selectedRouteId || undefined}
                    />
                  </div>
                </Card>
              </SpotlightCard>
            </ScrollReveal>
          </div>

          {/* Right Analysis Panel */}
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
