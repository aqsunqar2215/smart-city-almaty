import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Wind, Droplets, Gauge, Car, AlertTriangle, Activity, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchWeatherData, fetchAirQualityData, fetchTrafficData } from '@/lib/sensorApi';
import { AIAgentTips } from './AIAgentTips';
import { VisionConsole } from './VisionConsole';

export const SensorDashboard = () => {
  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather'],
    queryFn: fetchWeatherData,
    refetchInterval: 60000,
  });

  const { data: airQuality, isLoading: airLoading } = useQuery({
    queryKey: ['airQuality'],
    queryFn: fetchAirQualityData,
    refetchInterval: 60000,
  });

  const { data: traffic, isLoading: trafficLoading } = useQuery({
    queryKey: ['traffic'],
    queryFn: fetchTrafficData,
    refetchInterval: 60000,
  });

  const isLoading = weatherLoading || airLoading || trafficLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!weather || !airQuality || !traffic) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-destructive text-center">Failed to load sensor data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Weather Card */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weather</CardTitle>
            <Cloud className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(weather.temperature)}°C</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{weather.description}</p>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Wind className="h-3 w-3" />
                <span>{weather.windSpeed.toFixed(1)} m/s</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                <span>{Math.round(weather.humidity)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Air Quality Card */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Air Quality</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{airQuality.aqi}</div>
            <p className="text-xs mt-1" style={{ color: airQuality.color }}>
              {airQuality.category}
            </p>
            <div className="flex gap-3 mt-4 text-xs text-muted-foreground">
              <div>PM2.5: {airQuality.pm25.toFixed(1)}</div>
              <div>PM10: {airQuality.pm10.toFixed(1)}</div>
              <div>O₃: {airQuality.o3.toFixed(1)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Card */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Traffic</CardTitle>
            <Car className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{traffic.congestionLevel}%</div>
            <p className="text-xs text-muted-foreground mt-1">Congestion Level</p>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                <span>{traffic.averageSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{traffic.incidents} incidents</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proactive Intelligence & Vision Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIAgentTips />
        <VisionConsole />
      </div>

      {/* Atmospheric Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Atmospheric Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{Math.round(weather.pressure)}</div>
              <div className="text-xs text-muted-foreground mt-1">hPa Pressure</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{Math.round(weather.humidity)}</div>
              <div className="text-xs text-muted-foreground mt-1">% Humidity</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{airQuality.no2.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground mt-1">NO₂ Level</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{weather.windSpeed.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground mt-1">m/s Wind</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Air Quality Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="text-sm text-muted-foreground">Ozone (O₃)</span>
                <span className="text-sm font-semibold">{airQuality.o3.toFixed(1)} µg/m³</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="text-sm text-muted-foreground">Nitrogen Dioxide (NO₂)</span>
                <span className="text-sm font-semibold">{airQuality.no2.toFixed(1)} µg/m³</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="text-sm text-muted-foreground">PM2.5</span>
                <span className="text-sm font-semibold">{airQuality.pm25.toFixed(1)} µg/m³</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="text-sm text-muted-foreground">PM10</span>
                <span className="text-sm font-semibold">{airQuality.pm10.toFixed(1)} µg/m³</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-500/10 rounded-lg border-l-4 border-blue-500">
                <div className="font-semibold text-sm mb-1">Weather Condition</div>
                <div className="text-xs text-muted-foreground capitalize">{weather.description}</div>
              </div>
              <div className="p-3 rounded-lg border-l-4" style={{
                backgroundColor: `${airQuality.color}20`,
                borderColor: airQuality.color
              }}>
                <div className="font-semibold text-sm mb-1">Air Quality Status</div>
                <div className="text-xs" style={{ color: airQuality.color }}>
                  {airQuality.category}
                </div>
              </div>
              <div className={`p-3 rounded-lg border-l-4 ${traffic.congestionLevel > 60
                ? 'bg-red-500/10 border-red-500'
                : 'bg-green-500/10 border-green-500'
                }`}>
                <div className="font-semibold text-sm mb-1">Traffic Status</div>
                <div className="text-xs text-muted-foreground">
                  {traffic.congestionLevel > 60 ? 'Heavy Traffic' : 'Light Traffic'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
