import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { RefreshCw, MapPin, Database, Cpu, Navigation, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import SmartCityMap from '@/components/SmartCityMap';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import HistoricalCharts from '@/components/HistoricalCharts';
import RealTimeDataPanels from '@/components/RealTimeDataPanels';
import ShaderBackground from '@/components/backgrounds';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { toast } from 'sonner';
import { fetchWeatherData, fetchAirQualityData, fetchTrafficData, WeatherData, AirQualityData, TrafficData } from '@/lib/sensorApi';
import { analyzeSmartCityData, CityAnalysis } from '@/lib/aiEngine';
import { airQualityStore, trafficStore, weatherStore, initializeDemoData } from '@/lib/dataStore';
import { ReportIssueDialog } from '@/components/ReportIssueDialog';
import { SOSButton } from '@/components/SOSButton';
import AIPredictivePanel from '@/components/AIPredictivePanel';
import { FloatingCube, ParticleWave, CyberSphere, TechPyramid, BlackHole, Comet, StarField } from '@/components/3d/Animations';
import { ScrollReveal, SpotlightCard } from '@/components/effects/InteractionEffects';
import { DirectionalScrollEffect } from '@/components/effects/ScrollInteractions';

const SmartCityDashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<CityAnalysis | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { playClick, playSuccess } = useSoundEffects();

  // Initialize demo data on mount
  useEffect(() => {
    initializeDemoData();
  }, []);

  // Fetch weather data
  const { data: weather, isLoading: weatherLoading, refetch: refetchWeather } = useQuery({
    queryKey: ['weather'],
    queryFn: fetchWeatherData,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Fetch air quality data
  const { data: airQuality, isLoading: airLoading, refetch: refetchAir } = useQuery({
    queryKey: ['airQuality'],
    queryFn: fetchAirQualityData,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Fetch traffic data
  const { data: traffic, isLoading: trafficLoading, refetch: refetchTraffic } = useQuery({
    queryKey: ['traffic'],
    queryFn: fetchTrafficData,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { data: cityFeed } = useQuery({
    queryKey: ['cityFeed'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/city/feed');
      return res.json();
    },
    refetchInterval: 10000,
  });

  // Store data and run AI analysis when data changes
  useEffect(() => {
    if (weather && airQuality && traffic) {
      // Store to local database
      weatherStore.create({
        temperature: weather.temperature,
        humidity: weather.humidity,
        description: weather.description,
        windSpeed: weather.windSpeed,
      });

      airQualityStore.create({
        aqi: airQuality.aqi,
        pm25: airQuality.pm25,
        pm10: airQuality.pm10,
        o3: airQuality.o3,
        no2: airQuality.no2,
        category: airQuality.category,
      });

      trafficStore.create({
        congestionLevel: traffic.congestionLevel,
        averageSpeed: traffic.averageSpeed,
        incidents: traffic.incidents,
      });

      // Run AI analysis
      const cityAnalysis = analyzeSmartCityData(weather, airQuality, traffic);
      setAnalysis(cityAnalysis);
      setLastUpdate(new Date());
    }
  }, [weather, airQuality, traffic]);

  const handleRefresh = () => {
    playClick();
    refetchWeather();
    refetchAir();
    refetchTraffic();
    setTimeout(() => playSuccess(), 500);
  };

  const isLoading = weatherLoading || airLoading || trafficLoading;

  return (
    <div className="min-h-screen pb-10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10 pt-10 bg-background/40 backdrop-blur-2xl rounded-[3rem] border border-border/10 shadow-2xl my-10 pb-16">
        {/* Header */}
        <ScrollReveal direction="down" delay={0.1}>
          <div className="mb-3 relative">
            <div className="flex items-center justify-between flex-wrap gap-6 p-6 rounded-3xl border border-primary/20 bg-gradient-to-r from-white via-white to-sky-50 dark:bg-gradient-to-br dark:from-slate-900/95 dark:to-slate-800/95 text-foreground dark:text-white shadow-xl dark:shadow-2xl overflow-hidden group">

              <div className="absolute inset-0 opacity-20 dark:opacity-30 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-700 pointer-events-none overflow-hidden">
                <img
                  src="/city_hero.png"
                  className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                  alt="City Background"
                />
              </div>

              <SpotlightCard className="rounded-2xl relative z-10 overflow-hidden">
                <Card className="bg-white dark:bg-slate-900 border-primary/20 shadow-2xl relative group">
                  <div className="absolute top-0 right-0 p-1">
                    <div className={`w-2 h-2 rounded-full animate-ping ${(analysis?.healthScore || 0) > 80 ? 'bg-emerald-500' :
                      (analysis?.healthScore || 0) > 50 ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                  </div>
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="relative">
                      <Zap className={`w-10 h-10 transition-colors duration-500 ${(analysis?.healthScore || 0) > 80 ? 'text-emerald-500' :
                        (analysis?.healthScore || 0) > 50 ? 'text-orange-500' : 'text-red-500'
                        } ${((analysis?.healthScore || 0) < 50) ? 'animate-bounce' : 'animate-pulse'}`} />

                      {/* Neural Pulse Circles */}
                      <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-20 ${(analysis?.healthScore || 0) > 80 ? 'border-emerald-500' : 'border-red-500'
                        }`} style={{ animationDuration: '3s' }} />
                      <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-10 ${(analysis?.healthScore || 0) > 80 ? 'border-emerald-500' : 'border-red-500'
                        }`} style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">City Health Index</div>
                      <div className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                        {analysis?.healthScore || '--'}<span className="text-xl opacity-30">/100</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>


              <div className="relative z-10 flex items-center gap-6">
                <div>
                  <h1 className="text-4xl font-black tracking-tight uppercase flex items-center gap-3">
                    <span className="bg-gradient-to-r from-primary via-cyan-500 to-secondary bg-clip-text text-transparent drop-shadow-sm">Smart Almaty OS</span>
                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] animate-pulse badge-pulse">
                      v5.0-ULTRA
                    </Badge>
                  </h1>
                  <p className="text-slate-600 dark:text-muted-foreground mt-1 max-w-md font-mono text-[10px] uppercase tracking-widest font-black">
                    Neural_Kernel_Integrated_Active
                  </p>
                </div>
              </div>


              <div className="flex items-center gap-4 relative z-10">
                <Link to="/eco-routing">
                  <Button variant="default" className="bg-primary hover:bg-primary/90 text-white border-0 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all active:scale-95">
                    <Navigation className="h-4 w-4 mr-2" />
                    Eco Routing
                  </Button>
                </Link>
                <ReportIssueDialog />
                <SOSButton />
                <Button onClick={handleRefresh} variant="outline" className="bg-muted/50 border-border hover:bg-muted text-foreground/80 dark:text-white" disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>


        <ScrollReveal direction="up" delay={0.2}>
          <div className="flex items-center gap-3 mt-1 mb-4 text-[11px] font-mono uppercase tracking-widest text-foreground/70 dark:text-muted-foreground bg-muted/40 dark:bg-muted/30 w-fit px-4 py-1.5 rounded-full border border-border/80 dark:border-border/60 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <MapPin className="h-3 w-3 text-primary" />
            <span className="font-bold text-foreground">Almaty, Kazakhstan</span>
            <span className="opacity-30">|</span>
            <span className="flex items-center gap-1.5">
              Status: <span className="text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Active</span>
            </span>
            <span className="opacity-30">|</span>
            <span>Last sync: {lastUpdate.toLocaleTimeString()}</span>
            <span className="opacity-30">|</span>
            <span className="text-primary/70">Nodes: 1,242 Online</span>
          </div>
        </ScrollReveal>


        {/* AI Predictive Top Bar */}
        <ScrollReveal direction="down" delay={0.3}>
          <div className="mb-4">
            <AIPredictivePanel />
          </div>
        </ScrollReveal>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content (Left + Center) */}
          <div className="lg:col-span-2 space-y-4">
            {/* 1. Real-time Data Panels (Wide) */}
            <ScrollReveal direction="up" delay={0.4}>
              <RealTimeDataPanels
                weather={weather}
                airQuality={airQuality}
                traffic={traffic}
                isLoading={isLoading}
              />
            </ScrollReveal>

            {/* 2. Interactive Map */}
            <ScrollReveal direction="up" delay={0.5}>
              <div className="rounded-3xl overflow-hidden border border-border/40 shadow-xl bg-card">
                <div className="p-4 border-b border-border/10 flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Interactive Map — District Overview
                  </h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 cursor-help">
                    Live Data
                  </Badge>
                </div>
                <SmartCityMap
                  trafficCongestion={traffic?.congestionLevel || 50}
                  airQualityIndex={airQuality?.aqi || 50}
                />
              </div>
            </ScrollReveal>

            {/* 3. Historical Charts */}
            <ScrollReveal direction="up" delay={0.6}>
              <HistoricalCharts />
            </ScrollReveal>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-4">
            {/* 4. City News */}
            <ScrollReveal direction="right" delay={0.7}>
              <Card className="border-border/50 bg-white dark:bg-primary/5 backdrop-blur-3xl overflow-hidden relative group card-3d shadow-md dark:shadow-none">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Database className="w-20 h-20 text-primary" />
                </div>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    City News
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cityFeed?.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="space-y-1 animate-in slide-in-from-right duration-500">
                      <p className="text-xs font-bold leading-tight line-clamp-2">{item.msg}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black">
                        <span className="text-primary">{item.type}</span> • <span>{item.time}</span>
                      </div>
                    </div>
                  ))}
                  {(!cityFeed || cityFeed.length === 0) && (
                    <div className="text-[10px] text-muted-foreground animate-pulse">Connecting to digital ether...</div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[10px] uppercase font-bold tracking-tighter hover:bg-primary/10 mt-2"
                    onClick={() => toast.info("Full city broadcast center coming soon")}
                  >
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* 5. AI Insights Center */}
            <ScrollReveal direction="right" delay={0.8}>
              <AIInsightsPanel analysis={analysis} isLoading={isLoading} />
            </ScrollReveal>
          </div>
        </div>

        {/* Chatbot removed - now global as NeuralNexusWidget */}
      </div>
    </div>
  );
};

export default SmartCityDashboard;
