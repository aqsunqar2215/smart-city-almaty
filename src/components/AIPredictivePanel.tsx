import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain, Clock, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const AIPredictivePanel = () => {
    const { data: forecast, isLoading } = useQuery({
        queryKey: ['ai-forecast'],
        queryFn: async () => {
            const res = await fetch('http://localhost:8000/api/ai/forecast');
            return res.json();
        },
        refetchInterval: 60000, // Refresh every minute
    });

    if (isLoading) {
        return <Skeleton className="h-64 w-full rounded-3xl" />;
    }

    return (
        <Card className="border-border/50 bg-white/40 dark:bg-card/40 backdrop-blur-xl card-3d overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain size={120} className="text-primary" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary animate-pulse">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black uppercase italic tracking-tight">Neural Forecast</CardTitle>
                            <CardDescription className="text-[10px] font-mono uppercase tracking-widest">Almaty Predictive Engine V5</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black text-[10px]">
                        98.4% PRECISION
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
                <div className="grid grid-cols-1 gap-4">
                    {forecast?.forecasts.map((item: any, idx: number) => (
                        <div
                            key={idx}
                            className="p-3 rounded-2xl bg-muted/20 border border-border/50 hover:bg-muted/40 transition-all cursor-default"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-muted-foreground" />
                                    <span className="text-sm font-black">{item.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Confidence</div>
                                    <span className="text-xs font-mono text-primary">{item.confidence}%</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground">
                                            <span>Expected Traffic</span>
                                            <span className={item.traffic_prediction > 7 ? 'text-red-500' : 'text-emerald-500'}>
                                                {item.traffic_prediction}/10
                                            </span>
                                        </div>
                                        <Progress value={item.traffic_prediction * 10} className="h-1 bg-muted/50" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground">
                                            <span>AQI Forecast</span>
                                            <span className={item.aqi_prediction > 100 ? 'text-orange-500' : 'text-emerald-500'}>
                                                {item.aqi_prediction}
                                            </span>
                                        </div>
                                        <Progress value={(item.aqi_prediction / 200) * 100} className="h-1 bg-muted/50" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-medium text-foreground bg-background/50 p-2 rounded-lg border border-border/5">
                                    {item.traffic_prediction > 7 ? (
                                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                                    ) : (
                                        <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                                    )}
                                    <span className="truncate">{item.insight}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AIPredictivePanel;
