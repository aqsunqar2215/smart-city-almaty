import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/StatCard';
import { SensorDashboard } from '@/components/SensorDashboard';
import { AIInsights } from '@/components/AIInsights';
import { CityVisualization } from '@/components/CityVisualization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Building2, MessageSquare, Heart, Users, TrendingUp, Tag } from 'lucide-react';
import { statsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['globalStats'],
    queryFn: () => statsApi.getGlobalStats(),
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }
  
  if (!stats) return null;
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Smart City Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Real-time monitoring and analytics</p>
        </div>
      </div>

      {/* Real-time Sensor Data */}
      {/* Live City Sensors */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Live City Sensors</h2>
        <SensorDashboard />
      </div>

      {/* 3D City Map */}
      <CityVisualization />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Objects"
          value={stats.totalObjects}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon={Tag}
        />
        <StatCard
          title="Comments"
          value={stats.totalComments}
          icon={MessageSquare}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Users}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* AI-Powered Insights */}
      <AIInsights />
      
      {/* Platform Analytics */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Platform Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.activityByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive" />
              Engagement Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Objects', value: stats.totalObjects },
                { name: 'Comments', value: stats.totalComments },
                { name: 'Likes', value: stats.totalLikes },
                { name: 'Users', value: stats.activeUsers },
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#colorGradient)" 
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
