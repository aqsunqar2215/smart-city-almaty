import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { TrendingUp, Activity, Zap, Brain, Shield, Rocket, Cpu, BarChart3 } from 'lucide-react';
import { statsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ShaderBackground from '@/components/backgrounds';
import { RotatingRing, TechPyramid, CyberSphere, Comet, StarField } from '@/components/3d/Animations';
import { ScrollReveal, SpotlightCard } from '@/components/effects/InteractionEffects';
import { DirectionalScrollEffect } from '@/components/effects/ScrollInteractions';
import { fetchWeatherData, fetchAirQualityData, fetchTrafficData } from '@/lib/sensorApi';
import { analyzeSmartCityData } from '@/lib/aiEngine';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#10b981', '#f59e0b'];

const Analytics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['globalStats'],
    queryFn: () => statsApi.getGlobalStats(),
  });

  // Fetch real-time sensor data for Health Score consistency
  const { data: weather } = useQuery({ queryKey: ['weather'], queryFn: fetchWeatherData, refetchInterval: 60000 });
  const { data: airQuality } = useQuery({ queryKey: ['airQuality'], queryFn: fetchAirQualityData, refetchInterval: 60000 });
  const { data: traffic } = useQuery({ queryKey: ['traffic'], queryFn: fetchTrafficData, refetchInterval: 30000 });

  // Calculate dynamic health score
  const cityAnalysis = (weather && airQuality && traffic)
    ? analyzeSmartCityData(weather, airQuality, traffic)
    : null;

  const currentHealthScore = cityAnalysis?.healthScore ?? stats?.city_health_score ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-96" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const engagementData = [
    { name: 'Reports', value: stats.totalObjects, color: COLORS[0] },
    { name: 'Residents', value: stats.activeUsers, color: COLORS[1] },
    { name: 'AI Queries', value: stats.ai_metrics?.total_queries || 0, color: COLORS[4] },
    { name: 'Alerts', value: stats.active_emergency_alerts || 0, color: COLORS[2] },
  ];

  return (
    <div className="min-h-screen pb-10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10 pt-10 bg-background/40 backdrop-blur-2xl rounded-[3rem] border border-border/10 shadow-2xl my-10 pb-16 space-y-8 animate-in fade-in duration-1000">

        <ScrollReveal direction="down">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-tighter font-black text-[10px]">
                  System Level: V5.0-Ultra
                </Badge>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-500/80 uppercase">Network Active</span>
              </div>
              <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-cyan-400 to-secondary bg-clip-text text-transparent uppercase italic">
                City Intelligence
              </h1>
              <p className="text-muted-foreground mt-2 max-w-lg">Neural diagnostics and real-time infrastructure metrics aggregated from thousands of distributed edge sensors across Almaty.</p>
            </div>

            <div className="flex items-center gap-6 relative">
              <div className="hidden lg:block">
                <RotatingRing color="rgba(14, 165, 233, 0.4)" />
              </div>
              <div className="absolute -right-20 -top-10 opacity-20 pointer-events-none">
                <TechPyramid />
              </div>

              <SpotlightCard className="rounded-2xl relative z-10 overflow-hidden">
                <Card className="bg-white dark:bg-slate-900 border-primary/20 shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-1">
                    <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                  </div>
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                      <Zap className="w-10 h-10 animate-pulse" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">City Health Index</div>
                      <div className="text-4xl font-black text-primary tabular-nums tracking-tighter">{currentHealthScore}<span className="text-xl text-primary/50">/100</span></div>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </div>
          </div>
        </ScrollReveal>

        {/* Global Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {engagementData.map((metric, idx) => (
            <ScrollReveal key={metric.name} direction="up" delay={idx * 0.1}>
              <Card className="border-border/40 bg-white dark:bg-card/40 backdrop-blur-xl hover:border-primary/40 transition-all group overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    {idx === 0 ? <Activity size={80} /> : idx === 1 ? <Shield size={80} /> : idx === 2 ? <Brain size={80} /> : <Rocket size={80} />}
                  </div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center justify-between">
                    {metric.name}
                    <TrendingUp size={12} className="text-emerald-500" />
                  </div>
                  <div className="text-4xl font-black tabular-nums group-hover:scale-105 transition-transform origin-left">{metric.value}</div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-transparent to-primary" style={{ width: '65%', backgroundColor: metric.color }} />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">72%</span>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI INTELLIGENCE HUB */}
          <Card className="lg:col-span-2 border-border/50 bg-white dark:bg-card/40 backdrop-blur-md shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-primary to-cyan-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <Brain className="w-6 h-6 text-purple-500" />
                    Neural Intelligence Nexus
                  </CardTitle>
                  <CardDescription>AI Knowledge distribution and processing metrics</CardDescription>
                </div>
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">LIVE ENGINE</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.ai_metrics?.topic_distribution}>
                      <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                      <Radar
                        name="AI Capacity"
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Logic Cycles</div>
                      <div className="text-2xl font-black tabular-nums">{stats.ai_metrics?.total_queries.toLocaleString()}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Knowledge Units</div>
                      <div className="text-2xl font-black tabular-nums">{stats.ai_metrics?.kb_entries}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-black uppercase mb-1.5">
                        <span>Intent Detection Accuracy</span>
                        <span className="text-emerald-500">{stats.ai_metrics?.intent_accuracy}%</span>
                      </div>
                      <Progress value={98.2} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-black uppercase mb-1.5">
                        <span>Neural Processing Load</span>
                        <span className="text-primary">14.2%</span>
                      </div>
                      <Progress value={14.2} className="h-2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <Cpu className="text-primary animate-spin-slow" />
                    <div>
                      <div className="text-[10px] font-bold text-primary uppercase">Average Latency</div>
                      <div className="text-lg font-black text-foreground">{stats.ai_metrics?.avg_response_time_ms} ms</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allocation */}
          <Card className="border-border/50 bg-white dark:bg-card/40 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary" />
                Data Resource Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-border/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">System Throughput</span>
                  <span className="font-bold text-emerald-500">OPTIMAL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Stability */}
          <Card className="border-border/50 bg-white dark:bg-card/40 backdrop-blur-md shadow-xl lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-500" />
                Infrastructure Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {stats.infrastructure?.map((item: any) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className={item.trend === 'up' ? 'text-emerald-500' : 'text-primary'}>
                        {item.value}%
                      </span>
                      {item.trend === 'up' && <TrendingUp size={12} className="text-emerald-500" />}
                    </div>
                  </div>
                  <Progress value={item.value} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity Trend */}
          <Card className="lg:col-span-2 border-border/50 bg-white dark:bg-card/40 backdrop-blur-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Citizen Engagement (7-Day Trace)
                </CardTitle>
                <CardDescription>Rolling analysis of user interactions and reports</CardDescription>
              </div>
              <Badge variant="secondary">Neural Smooth</Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.activityByDay}>
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                  <XAxis
                    dataKey="date"
                    className="text-[10px] font-mono"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis className="text-[10px] font-mono" axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      borderRadius: '16px',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fill="url(#activityGradient)"
                    strokeWidth={4}
                    strokeLinecap="round"
                    dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
