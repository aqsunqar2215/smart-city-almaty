import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    AlertTriangle,
    CheckCircle2,
    Activity,
    Shield,
    Wrench,
    Lightbulb,
    Trash2,
    LocateFixed,
    Brain,
    Clock,
    Zap,
    History,
    MessageSquare
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReportIssueDialog } from '@/components/ReportIssueDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CitizenReport {
    id: number;
    category: string;
    description: string;
    status: string;
    lat: number;
    lng: number;
    ai_analysis: string;
    created_at: string;
}

const Infrastructure = () => {
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [showMiniMap, setShowMiniMap] = useState(false);

    const { data: reports, isLoading } = useQuery({
        queryKey: ['citizen-reports'],
        queryFn: async () => {
            const res = await fetch('http://localhost:8000/api/reports');
            return res.json();
        },
        refetchInterval: 5000
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toUpperCase()) {
            case 'ROADS': return <Wrench className="w-4 h-4" />;
            case 'LIGHTING': return <Lightbulb className="w-4 h-4" />;
            case 'SANITATION': return <Trash2 className="w-4 h-4" />;
            default: return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const aiLogs = [
        "Analyzing satellite imagery for Almaty district...",
        "Anomaly detected: Structural vibration increase in Subway Line 1",
        "Routing public report #1024 to Public Works Dept...",
        "Prediction: Lighting failure likely in Medeu district (Probability 84%)",
        "Optimizing waste collection routes based on sensor data...",
        "Emergency SOS link established: Monitoring Safe Almaty sensors"
    ];

    return (
        <div className="min-h-screen pb-10 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10 pt-10 bg-background/40 backdrop-blur-2xl rounded-[3rem] border border-border/10 shadow-2xl my-10 pb-16 space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <Activity className="text-primary w-10 h-10" />
                            Infrastructure Hub
                        </h1>
                        <p className="text-muted-foreground">AI-Powered City Diagnostic & Citizen Reporting Hub</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant={showMiniMap ? "default" : "outline"}
                            onClick={() => setShowMiniMap(!showMiniMap)}
                            className={cn(
                                "rounded-xl font-bold uppercase text-[10px] tracking-widest h-12 transition-all",
                                showMiniMap ? "bg-primary shadow-glow" : "border-primary/20 bg-primary/5"
                            )}
                        >
                            <LocateFixed className="mr-2 h-4 w-4" />
                            {showMiniMap ? "Exit Map" : "Mini-Map View"}
                        </Button>
                        <Button onClick={() => setIsReportOpen(true)} className="rounded-xl bg-primary shadow-xl hover:scale-105 transition-transform font-bold h-12 px-6">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Report Issue
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Reports List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
                                <History className="text-primary w-5 h-5" />
                                Live Issues Feed
                            </h2>
                            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                                Updates every 5s
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <Card key={i} className="animate-pulse h-[140px] bg-card/50" />
                                ))
                            ) : (
                                reports?.map((report: CitizenReport) => (
                                    <Card key={report.id} className="group hover:border-primary/50 transition-all border-border/50 bg-card/40 backdrop-blur-md overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                        <CardContent className="p-5">
                                            <div className="justify-between flex items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                        {getCategoryIcon(report.category)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
                                                            {report.category}
                                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                            #{report.id}
                                                        </div>
                                                        <h3 className="font-bold text-lg leading-none mt-1">{report.description}</h3>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`font-black text-[10px] py-1 px-3 rounded-full ${getStatusColor(report.status)}`}>
                                                    {report.status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-border/10">
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase">
                                                    <Clock className="w-3 h-3" />
                                                    Reported 2 hours ago
                                                </div>
                                                <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-lg px-3 py-1.5 max-w-[60%]">
                                                    <Brain className="w-3.5 h-3.5 text-primary shrink-0" />
                                                    <p className="text-[10px] font-medium truncate italic leading-none">{report.ai_analysis}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        <Card className="border-dashed border-2 bg-muted/5 border-muted-foreground/10 p-8 text-center flex flex-col items-center justify-center space-y-4">
                            <div className="text-sm text-muted-foreground font-mono uppercase tracking-widest opacity-50">End of records</div>
                            <Button
                                variant="link"
                                className="text-primary font-bold"
                                onClick={() => {
                                    toast.info("Accessing Almaty Historic Archives...", {
                                        description: "Historical data request sent to central data center.",
                                    });
                                }}
                            >
                                Request Historic Data
                            </Button>
                        </Card>
                    </div>

                    {/* AI Predictive / Sidebar */}
                    <div className="space-y-6">
                        {/* Almaty AI Core */}
                        <Card className="border-border/50 bg-slate-950 dark:bg-card/40 backdrop-blur-xl overflow-hidden relative group shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20 opacity-30 pointer-events-none" />
                            <CardHeader className="relative z-10 text-center pb-2">
                                <CardTitle className="text-lg font-black uppercase italic tracking-tighter text-primary flex items-center justify-center gap-2">
                                    <Zap className="w-5 h-5 animate-pulse" />
                                    Neural Nexus Monitor
                                </CardTitle>
                                <CardDescription className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-60">System Version 5.x</CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10 flex flex-col items-center justify-center py-6 min-h-[280px]">
                                <div className="relative mb-6 w-full flex justify-center">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] animate-pulse scale-150" />
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-b from-primary/20 to-transparent flex items-center justify-center border border-primary/30 relative">
                                        <Brain className="w-16 h-16 text-primary animate-pulse" />
                                        {showMiniMap && (
                                            <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                                        )}
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground uppercase opacity-50">Sync Status:</span>
                                            <span className="text-emerald-500 font-black">STABLE</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground uppercase opacity-50">Neural Synapses:</span>
                                            <span className="text-primary font-black">28,492</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground uppercase opacity-50">GPT Mimicry:</span>
                                            <span className="text-primary font-black">ACTIVE</span>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 font-black uppercase text-[10px] tracking-widest h-10 rounded-xl group/btn transition-all"
                                        onClick={() => {
                                            toast.info("Neural Nexus Assistant Active", {
                                                description: "Use the floating brain icon in the bottom right to communicate.",
                                                icon: <Brain className="w-4 h-4 text-primary" />
                                            });
                                        }}
                                    >
                                        <MessageSquare className="w-3.5 h-3.5 mr-2 group-hover/btn:scale-110 transition-transform" />
                                        Launch AI Interface
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Brain Log */}
                        <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-lg h-[400px] flex flex-col">
                            <CardHeader className="pb-2 border-b border-border/10">
                                <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                    Live AI Neural Stream
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-hidden flex-1">
                                <ScrollArea className="h-full p-4 font-mono text-[10px]">
                                    <div className="space-y-3">
                                        {aiLogs.map((log, i) => (
                                            <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-700" style={{ animationDelay: `${i * 150}ms` }}>
                                                <span className="text-primary font-black shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                                <span className="text-muted-foreground leading-relaxed">{log}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <ReportIssueDialog open={isReportOpen} onOpenChange={setIsReportOpen} showTrigger={false} />
            </div>
        </div>
    );
};

export default Infrastructure;
