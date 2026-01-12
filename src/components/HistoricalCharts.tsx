import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const HistoricalCharts: React.FC = () => {
  const { data: aqiData, isLoading: aqiLoading } = useQuery({
    queryKey: ['timeseries', 'aqi'],
    queryFn: () => statsApi.getTimeseries('aqi'),
  });

  const { data: trafficData, isLoading: trafficLoading } = useQuery({
    queryKey: ['timeseries', 'traffic'],
    queryFn: () => statsApi.getTimeseries('traffic'),
  });

  if (aqiLoading || trafficLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  // Combine data for charts mapping by hour
  const combinedHourlyData = (aqiData || []).map((aqiEntry: any, index: number) => {
    const trafficEntry = trafficData?.[index] || { value: 0 };
    const date = new Date(aqiEntry.timestamp);
    return {
      hour: `${date.getHours()}:00`,
      aqi: aqiEntry.value,
      congestion: trafficEntry.value,
      speed: Math.max(10, 60 - trafficEntry.value * 5), // Simulated speed inverse to congestion
    };
  });

  return (
    <Card className="border-border/50 shadow-sm bg-white dark:bg-card">
      <CardHeader>
        <CardTitle>Historical Data Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hourly">Hourly Patterns</TabsTrigger>
            <TabsTrigger value="daily">Daily Trends</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="space-y-2">
            {/* AQI by Hour */}
            <div>
              <h4 className="text-sm font-medium mb-2">Air Quality Index by Hour</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedHourlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="aqi"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      name="AQI"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Traffic by Hour */}
            <div>
              <h4 className="text-sm font-medium mb-2">Traffic Congestion by Hour</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedHourlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="congestion"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                      name="Congestion %"
                    />
                    <Line
                      type="monotone"
                      dataKey="speed"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      name="Avg Speed km/h"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="daily" className="space-y-2">
            <div>
              <h4 className="text-sm font-medium mb-2">Recent 24-Hour AQI Trend</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={combinedHourlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="aqi" fill="hsl(var(--primary))" name="AQI" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Recent 24-Hour Traffic Trend</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={combinedHourlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="congestion" fill="#f97316" name="Congestion %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <div>
              <h4 className="text-sm font-medium mb-2">AQI vs Traffic Correlation</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedHourlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="aqi"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      name="AQI"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="congestion"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                      name="Traffic %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Notice how air quality often degrades during peak traffic hours
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HistoricalCharts;
