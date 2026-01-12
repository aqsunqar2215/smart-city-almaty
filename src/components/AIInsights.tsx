import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Insight {
  type: 'trend' | 'alert' | 'suggestion';
  title: string;
  description: string;
  icon: typeof TrendingUp;
  color: string;
}

const generateInsights = (stats: any): Insight[] => {
  if (!stats) return [];

  const insights: Insight[] = [];

  // Activity trend insight
  if (stats.activityByDay && stats.activityByDay.length > 0) {
    const recent = stats.activityByDay.slice(-7);
    const avgActivity = recent.reduce((sum: number, day: any) => sum + day.count, 0) / recent.length;
    const lastDay = recent[recent.length - 1].count;
    
    if (lastDay > avgActivity * 1.2) {
      insights.push({
        type: 'trend',
        title: 'Activity Surge Detected',
        description: `User activity is 20% above average. ${lastDay} actions recorded today vs ${Math.round(avgActivity)} average.`,
        icon: TrendingUp,
        color: 'text-green-500',
      });
    }
  }

  // Engagement insight
  if (stats.totalComments > 0 && stats.totalObjects > 0) {
    const engagementRatio = stats.totalComments / stats.totalObjects;
    if (engagementRatio > 2) {
      insights.push({
        type: 'suggestion',
        title: 'High Engagement Rate',
        description: `Average of ${engagementRatio.toFixed(1)} comments per object. Community is highly engaged!`,
        icon: Lightbulb,
        color: 'text-blue-500',
      });
    } else if (engagementRatio < 0.5) {
      insights.push({
        type: 'alert',
        title: 'Low Engagement',
        description: 'Consider creating discussion prompts or featured content to boost community interaction.',
        icon: AlertCircle,
        color: 'text-orange-500',
      });
    }
  }

  // User growth insight
  if (stats.activeUsers > 50) {
    insights.push({
      type: 'trend',
      title: 'Growing Community',
      description: `${stats.activeUsers} active users. Platform reaching critical mass for network effects.`,
      icon: TrendingUp,
      color: 'text-purple-500',
    });
  }

  // Content diversity
  if (stats.totalCategories && stats.totalObjects) {
    const objectsPerCategory = stats.totalObjects / stats.totalCategories;
    if (objectsPerCategory < 5) {
      insights.push({
        type: 'suggestion',
        title: 'Content Diversity Opportunity',
        description: 'Some categories have few items. Consider campaigns to fill gaps and improve discovery.',
        icon: Lightbulb,
        color: 'text-cyan-500',
      });
    }
  }

  return insights;
};

export const AIInsights = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['globalStats'],
    queryFn: () => statsApi.getGlobalStats(),
  });

  const insights = generateInsights(stats);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Not enough data yet. Keep using the platform to generate insights!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI-Powered Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Smart recommendations based on platform analytics
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5", insight.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
