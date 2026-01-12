import React from 'react';
import { AlertTriangle, TrendingUp, Lightbulb, Bell, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIInsight, CityAnalysis } from '@/lib/aiEngine';

interface AIInsightsPanelProps {
  analysis: CityAnalysis | null;
  isLoading?: boolean;
}

const getInsightIcon = (type: AIInsight['type']) => {
  switch (type) {
    case 'alert':
      return <AlertTriangle className="h-4 w-4" />;
    case 'prediction':
      return <TrendingUp className="h-4 w-4" />;
    case 'recommendation':
      return <Lightbulb className="h-4 w-4" />;
    case 'trend':
      return <Activity className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: AIInsight['priority']) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'high':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'low':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
};

const getScoreGradient = (score: number) => {
  if (score >= 80) return 'from-green-500 to-green-400';
  if (score >= 60) return 'from-yellow-500 to-yellow-400';
  if (score >= 40) return 'from-orange-500 to-orange-400';
  return 'from-red-500 to-red-400';
};

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ analysis, isLoading }) => {
  if (isLoading || !analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            AI Analyzing City Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* City Health Score */}
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-white to-sky-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 text-foreground dark:text-white shadow-lg shadow-primary/10 dark:shadow-xl relative group">
        <div className="absolute inset-0 bg-primary/5 opacity-0 dark:opacity-100 group-hover:opacity-10 dark:group-hover:opacity-100 transition-opacity pointer-events-none" />
        <CardHeader className="pb-2 border-b border-border/10 relative z-10">
          <CardTitle className="text-lg flex items-center gap-2 uppercase tracking-widest text-primary">
            <Activity className="h-5 w-5" />
            City Health Index
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className={`text-6xl font-black tabular-nums tracking-tighter ${getScoreColor(analysis.overallScore)} drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]`}>
              {analysis.overallScore}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter opacity-70">
                <span>Overall Efficiency</span>
                <span>Goal: 100</span>
              </div>
              <Progress
                value={analysis.overallScore}
                className="h-2.5 bg-muted"
              />
              <div className="grid grid-cols-1 gap-1 mt-2 text-[10px] font-medium text-muted-foreground">
                <div className="flex justify-between">
                  <span>Traffic:</span>
                  <span className="text-foreground dark:text-white uppercase font-bold">{analysis.trafficStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Air:</span>
                  <span className="text-foreground dark:text-white uppercase font-bold">{analysis.airStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weather:</span>
                  <span className="text-foreground dark:text-white uppercase font-bold">{analysis.weatherStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      {
        analysis.predictions.length > 0 && (
          <Card className="border-border/50 bg-white dark:bg-card/40 backdrop-blur-sm shadow-sm dark:shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                AI Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.predictions.map((prediction, index) => (
                  <li key={index} className="flex items-start gap-3 text-xs leading-relaxed group">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{prediction}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      }

      {/* Active Insights */}
      <Card className="border-border/50 bg-white dark:bg-card shadow-sm dark:shadow-none">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Real-time Insights
          </CardTitle>
          {analysis.insights.length > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
              {analysis.insights.length}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {analysis.insights.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs text-muted-foreground">No active alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {analysis.insights.slice(0, 5).map((insight) => (
                <div
                  key={insight.id}
                  className={`p-3 rounded-2xl border transition-all hover:scale-[1.02] cursor-default ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 bg-background/50 rounded-lg">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-bold text-xs uppercase tracking-tight">{insight.title}</h4>
                      </div>
                      <p className="text-[11px] leading-snug opacity-80">{insight.description}</p>
                      <div className="flex items-center justify-between mt-3 text-[10px] font-mono opacity-50">
                        <span>Accuracy: {Math.round(insight.confidence * 100)}%</span>
                        <span className="uppercase">{insight.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div >
  );
};

export default AIInsightsPanel;
