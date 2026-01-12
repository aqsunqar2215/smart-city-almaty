import React from 'react';
import {
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  Car,
  AlertTriangle,
  Gauge,
  Leaf,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WeatherData, AirQualityData, TrafficData } from '@/lib/sensorApi';

interface RealTimeDataPanelsProps {
  weather: WeatherData | null;
  airQuality: AirQualityData | null;
  traffic: TrafficData | null;
  isLoading: boolean;
}

const RealTimeDataPanels: React.FC<RealTimeDataPanelsProps> = ({
  weather,
  airQuality,
  traffic,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="stagger-item overflow-hidden" style={{ animationDelay: `${i * 0.1}s` }}>
            <CardContent className="p-4">
              <div className="h-6 bg-muted/50 shimmer rounded-lg mb-4 w-1/3" />
              <div className="h-12 bg-muted/50 shimmer rounded-lg mb-3" />
              <div className="h-4 bg-muted/50 shimmer rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-400';
    if (aqi <= 100) return 'text-yellow-400';
    if (aqi <= 150) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTrafficColor = (congestion: number) => {
    if (congestion < 30) return 'text-green-400';
    if (congestion < 60) return 'text-yellow-400';
    if (congestion < 80) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Weather Panel */}
      <Card className="overflow-hidden border-blue-500/20 bg-card/40 backdrop-blur-xl shadow-2xl shadow-blue-500/5 group tilt-card stagger-item">
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Cloud className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground/80">Weather</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Live</span>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          {weather ? (
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-start gap-1">
                    <span className="text-4xl font-bold tracking-tighter tabular-nums leading-none">
                      {weather.temperature}
                    </span>
                    <span className="text-xl font-medium text-muted-foreground mt-1">°C</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-blue-400/90">{weather.description}</span>
                    <span className="text-[10px] text-muted-foreground/60 uppercase">{weather.cityName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground/60 uppercase font-bold leading-none mb-1">Feels Like</div>
                  <div className="text-sm font-semibold tabular-nums">{weather.feelsLike}°C</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <Droplets className="h-3.5 w-3.5 text-blue-400" />
                  <div>
                    <div className="text-[9px] text-muted-foreground/60 uppercase font-black leading-none mb-0.5">Humidity</div>
                    <div className="text-xs font-bold tabular-nums">{weather.humidity}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <Wind className="h-3.5 w-3.5 text-cyan-400" />
                  <div>
                    <div className="text-[9px] text-muted-foreground/60 uppercase font-black leading-none mb-0.5">Wind</div>
                    <div className="text-xs font-bold tabular-nums">{weather.windSpeed} <span className="text-[8px] opacity-60">km/h</span></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[104px] flex items-center justify-center text-muted-foreground/40 italic text-sm">Offline</div>
          )}
        </CardContent>
      </Card>

      {/* Air Quality Panel */}
      <Card className="overflow-hidden border-emerald-500/20 bg-card/40 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 group card-3d">
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Leaf className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground/80">Air Quality</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Sensor</span>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          {airQuality ? (
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-4xl font-bold tracking-tighter tabular-nums leading-none ${getAQIColor(airQuality.aqi)}`}>
                    {airQuality.aqi}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider leading-none mb-1" style={{ color: airQuality.color }}>
                      {airQuality.category}
                    </div>
                    <div className="text-[9px] text-muted-foreground/60 uppercase font-bold">AQI Index (EU)</div>
                  </div>
                </div>
                <div className="w-16">
                  <Progress value={Math.min(airQuality.aqi, 300) / 3} className="h-1.5" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'PM2.5', val: airQuality.pm25 },
                  { label: 'PM10', val: airQuality.pm10 },
                  { label: 'O₃', val: airQuality.o3 },
                  { label: 'NO₂', val: airQuality.no2 }
                ].map((item) => (
                  <div key={item.label} className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all text-center">
                    <div className="text-[8px] text-muted-foreground/60 font-black mb-0.5">{item.label}</div>
                    <div className="text-[10px] font-bold tabular-nums leading-none">{item.val.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[104px] flex items-center justify-center text-muted-foreground/40 italic text-sm">Offline</div>
          )}
        </CardContent>
      </Card>

      {/* Traffic Panel */}
      <Card className="overflow-hidden border-orange-500/20 bg-card/40 backdrop-blur-xl shadow-2xl shadow-orange-500/5 group card-3d">
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Car className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground/80">Traffic</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Flow</span>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          {traffic ? (
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-4xl font-bold tracking-tighter tabular-nums leading-none ${getTrafficColor(traffic.congestionLevel)}`}>
                    {traffic.congestionLevel}%
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider leading-none mb-1 text-muted-foreground/80">
                      {traffic.congestionLevel < 30 ? 'Light' :
                        traffic.congestionLevel < 60 ? 'Moderate' :
                          traffic.congestionLevel < 80 ? 'Heavy' : 'Severe'}
                    </div>
                    <div className="text-[9px] text-muted-foreground/60 uppercase font-bold">Congestion</div>
                  </div>
                </div>
                <div className="w-16">
                  <Progress value={traffic.congestionLevel} className="h-1.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400">
                    <Gauge className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground/60 uppercase font-black leading-none mb-0.5">Avg Speed</div>
                    <div className="text-xs font-bold tabular-nums">{traffic.averageSpeed} <span className="text-[8px] opacity-60">km/h</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="p-1 rounded-lg bg-yellow-500/10 text-yellow-400">
                    <AlertTriangle className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground/60 uppercase font-black leading-none mb-0.5">Incidents</div>
                    <div className="text-xs font-bold tabular-nums">{traffic.incidents}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[104px] flex items-center justify-center text-muted-foreground/40 italic text-sm">Offline</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeDataPanels;
