import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
    Phone,
    FileText,
    AlertTriangle,
    User as UserIcon,
    ShieldCheck,
    MapPin,
    Calendar,
    Settings,
    LogOut,
    ChevronRight,
    ClipboardList,
    Ambulance,
    Shield,
    Flame,
    Bus,
    Droplets,
    Zap,
    Plus,
    ExternalLink,
    Database,
    Terminal,
    Cpu as CPU
} from 'lucide-react';
import { statsApi, subscriptionsApi, userApi, reportsApi, getCurrentUserId } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ReportIssueDialog } from '@/components/ReportIssueDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ShaderBackground from '@/components/backgrounds';
import { DNAHelix, TechPyramid, CyberSphere, Comet, StarField } from '@/components/3d/Animations';
import { ScrollReveal, SpotlightCard } from '@/components/effects/InteractionEffects';
import { DirectionalScrollEffect } from '@/components/effects/ScrollInteractions';
import { DataContributionDialog } from '@/components/DataContributionDialog';

const Profile = () => {
    const userId = getCurrentUserId();
    const queryClient = useQueryClient();
    const { logout, user: authUser } = useAuth();
    const navigate = useNavigate();
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
    const [nodeProcessing, setNodeProcessing] = useState<string | null>(null);
    const [activeNodes, setActiveNodes] = useState<string[]>([]);
    const [logs, setLogs] = useState<{ msg: string, type: 'info' | 'success' | 'warning', time: string }[]>([]);

    const { data: userStats, isLoading: statsLoading } = useQuery({
        queryKey: ['userStats', userId],
        queryFn: () => statsApi.getUserStats(userId),
    });

    const { data: userReports, isLoading: reportsLoading } = useQuery({
        queryKey: ['userReports', userId],
        queryFn: async () => {
            const reports = await reportsApi.getAll();
            return reports.filter((r: any) => r.user_id === userId);
        },
    });

    const addLog = (msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [{ msg, type, time }, ...prev].slice(0, 5));
    };

    const handleNodeToggle = (nodeId: string, nodeName: string, rate?: string) => {
        if (activeNodes.includes(nodeId)) {
            setNodeProcessing(nodeId);
            addLog(`Terminating ${nodeName} connection...`, 'warning');
            setTimeout(() => {
                setActiveNodes(prev => prev.filter(id => id !== nodeId));
                setNodeProcessing(null);
                addLog(`${nodeName} disconnected from City Grid.`, 'info');
            }, 1500);
        } else {
            setNodeProcessing(nodeId);
            addLog(`Initiating ${nodeName} handshake...`, 'info');
            setTimeout(() => {
                addLog(`Analyzing resource availability...`, 'info');
                setTimeout(() => {
                    setActiveNodes(prev => [...prev, nodeId]);
                    setNodeProcessing(null);
                    addLog(`${nodeName} is now syncronized with Almaty AI Core.`, 'success');
                    addLog(`Estimated yield: ${rate || 'Accumulating...'}`, 'success');
                    toast.success(`${nodeName} active. Earning ${rate || 'credits'}.`);
                }, 1000);
            }, 1000);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    if (statsLoading || reportsLoading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
        );
    }

    // City Utility Score: Trust Index (0-1000)
    const baseScore = 420;
    const contributionPoints = (userStats?.objectsCount || 0) * 25 + (userReports?.length || 0) * 15;
    const nodeBonus = activeNodes.length * 50;
    const trustIndex = Math.min(1000, baseScore + contributionPoints + nodeBonus);

    const getTier = (score: number) => {
        if (score >= 900) return { name: 'ELITE GUARDIAN', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' };
        if (score >= 750) return { name: 'SENIOR CONTRIBUTOR', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' };
        if (score >= 500) return { name: 'TRUSTED CITIZEN', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' };
        return { name: 'NEW APPLICANT', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30' };
    };

    const tier = getTier(trustIndex);

    const infrastructureNodes = [
        { id: 'gpu', name: 'Almaty Compute Base', type: 'GPU Rental', reward: 'High', rate: '2.4 ALMT/hr', details: 'Lease GPU power for Traffic AI simulation.', icon: CPU },
        { id: 'iot', name: 'Environment Node', type: 'Sensor Sharing', reward: 'Medium', rate: '0.8 ALMT/hr', details: 'Share data from private AQI sensors.', icon: Zap },
        { id: 'storage', name: 'City Archival', type: 'Storage Cluster', reward: 'Low', rate: '0.3 ALMT/hr', details: 'Offer unused SSD space for city backups.', icon: Database },
    ];

    return (
        <DirectionalScrollEffect
            downElement={
                <div className="absolute inset-0 hidden dark:block">
                    <StarField count={25} />
                    <div className="absolute top-[20%] left-[10%] opacity-20">
                        <DNAHelix className="scale-150 rotate-45" />
                    </div>
                    <Comet className="absolute top-[40%] right-[20%] rotate-45 opacity-40" />
                </div>
            }
            upElement={
                <div className="absolute inset-0 items-center justify-center hidden dark:flex">
                    <StarField count={20} />
                    <CyberSphere className="scale-[5] opacity-20" />
                </div>
            }
        >
            <div className="space-y-8 animate-in fade-in duration-1000 relative">
                <div className="hidden dark:block">
                    <ShaderBackground variant="fingerprint" opacity={0.1} speed={0.3} />
                </div>

                {/* Report Dialog */}
                <ReportIssueDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen} showTrigger={false} />
                <DataContributionDialog open={contributionDialogOpen} onOpenChange={setContributionDialogOpen} />

                <div className="max-w-7xl mx-auto w-full space-y-8 relative z-10">
                    <ScrollReveal direction="down">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="relative group cursor-pointer" onClick={() => addLog("Accessing biometric identity...", "info")}>
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-[2px] shadow-2xl animate-glow transition-transform group-hover:scale-105 duration-500">
                                        <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center overflow-hidden">
                                            <UserIcon className="w-12 h-12 text-primary group-hover:animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-slate-950 flex items-center justify-center shadow-verified">
                                        <ShieldCheck className="w-4 h-4 text-white" />
                                    </div>
                                </div>

                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 flex-wrap">
                                        <span className="gradient-text">Citizen Digital ID</span>
                                        <Badge className={`${tier.bg} ${tier.color} ${tier.border} font-black tracking-widest text-[10px] px-3 py-1`}>
                                            {tier.name}
                                        </Badge>
                                    </h1>
                                    <p className="text-muted-foreground mt-1 flex items-center gap-2 font-mono text-xs">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        ENCRYPTED_ID: ALMATY-CORE-{userId.toString().padStart(6, '0')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 relative">
                                <div className="hidden lg:block relative">
                                    <div className="opacity-40 hover:opacity-80 transition-opacity">
                                        <DNAHelix />
                                    </div>
                                    <div className="absolute -right-10 -top-10 opacity-30 pointer-events-none">
                                        <TechPyramid />
                                    </div>
                                    <div className="absolute -left-10 -bottom-10 opacity-20 pointer-events-none">
                                        <CyberSphere />
                                    </div>
                                </div>

                                <div className="flex gap-3 relative z-10">
                                    <Button onClick={() => setContributionDialogOpen(true)} className="bg-primary hover:bg-primary/80 text-white rounded-xl shadow-glow h-11 px-6">
                                        <Plus className="w-4 h-4 mr-2" /> Data Contribution
                                    </Button>
                                    <Button variant="outline" onClick={handleLogout} className="rounded-xl h-11 border-destructive/20 text-destructive hover:bg-destructive/10">
                                        <LogOut className="w-4 h-4 mr-2" /> Terminate Session
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Identity & Personal Info */}
                        <div className="lg:col-span-8 space-y-8">
                            <ScrollReveal direction="left">
                                <SpotlightCard className="rounded-3xl overflow-hidden">
                                    <Card className="border-border/50 dark:border-white/5 bg-white dark:bg-slate-950/40 backdrop-blur-3xl text-foreground dark:text-white relative group shadow-lg dark:shadow-none">
                                        <CardContent className="p-8 relative z-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                                                {/* Left Profile Info */}
                                                <div className="space-y-6 p-4 md:p-6 rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-primary/60 font-mono tracking-widest font-bold uppercase">Biometric Persona</p>
                                                        <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic drop-shadow-sm break-words leading-none">
                                                            {authUser?.username || 'Digital Resident'}
                                                        </h2>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2">
                                                        {[
                                                            { label: 'Legal Status', value: 'CERTIFIED', icon: UserIcon, color: 'primary', isBadge: true },
                                                            { label: 'Citizenship', value: 'ALMATY, KZ', icon: FileText, color: 'secondary' },
                                                            { label: 'Sync Date', value: new Date().toLocaleDateString('en-GB'), icon: Calendar, color: 'accent' }
                                                        ].map((item, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group/row">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-xl bg-${item.color}/10 group-hover/row:bg-${item.color}/20 transition-colors`}>
                                                                        <item.icon className={`w-4 h-4 text-${item.color}`} />
                                                                    </div>
                                                                    <span className="text-xs font-bold text-white/50 group-hover/row:text-white/70 transition-colors">{item.label}</span>
                                                                </div>
                                                                {item.isBadge ? (
                                                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0 font-black text-[9px] px-3">
                                                                        {item.value}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-xs font-mono font-bold text-white/90">{item.value}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Right Trust Stats */}
                                                <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-8 relative overflow-hidden group/trust shadow-2xl">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover/trust:bg-primary/20 transition-colors duration-1000" />

                                                    <div className="flex items-center justify-between relative z-10">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-muted-foreground/80 uppercase font-black tracking-widest">Dynamic Trust Index</p>
                                                            <div className="h-1 w-12 bg-primary/50 rounded-full" />
                                                        </div>
                                                        <span className="text-2xl md:text-3xl font-black tracking-tighter trust-gradient">{trustIndex}<span className="text-xs opacity-50 font-mono">/1000</span></span>
                                                    </div>

                                                    <div className="space-y-3 relative z-10">
                                                        <div className="flex justify-between text-[10px] font-mono opacity-50 mb-1">
                                                            <span>MIN_CREDIT</span>
                                                            <span>MAX_PROTOCOL</span>
                                                        </div>
                                                        <Progress value={trustIndex / 10} className="h-2.5 bg-white/5" />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 relative z-10">
                                                        <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all duration-500">
                                                            <p className="text-3xl font-black text-white">{userReports?.length || 0}</p>
                                                            <p className="text-[9px] text-primary/60 uppercase font-black tracking-widest mt-1">Data Packets</p>
                                                        </div>
                                                        <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-secondary/20 transition-all duration-500">
                                                            <p className="text-3xl font-black text-white">{(trustIndex * 0.1).toFixed(1)}</p>
                                                            <p className="text-[9px] text-secondary/60 uppercase font-black tracking-widest mt-1">Network Yield</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </SpotlightCard>
                            </ScrollReveal>

                            {/* Infrastructure Nodes Section */}
                            <ScrollReveal direction="up" delay={0.2}>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                                            <Database className="w-5 h-5 text-primary" />
                                            Infrastructure Resource Nodes
                                        </h3>
                                        <Badge variant="outline" className="bg-primary/10 text-primary font-bold text-[10px] border-0">
                                            {activeNodes.length} ACTIVE
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {infrastructureNodes.map((node) => {
                                            const isActive = activeNodes.includes(node.id);
                                            const isProcessing = nodeProcessing === node.id;
                                            return (
                                                <Card key={node.id} className={`border-border/50 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-sm transition-all duration-500 overflow-hidden relative group shadow-sm ${isActive ? 'ring-1 ring-primary/40' : ''}`}>
                                                    {isActive && (
                                                        <div className="absolute top-0 right-0 w-2 h-2 bg-primary m-2 rounded-full animate-ping" />
                                                    )}
                                                    <CardHeader className="p-4 pb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-glow' : 'bg-muted dark:bg-white/5 text-muted-foreground group-hover:bg-muted/80 dark:group-hover:bg-white/10'}`}>
                                                                <node.icon className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <CardTitle className="text-sm font-black italic">{node.name}</CardTitle>
                                                                <CardDescription className="text-[9px] uppercase font-bold text-primary/60">{node.type}</CardDescription>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-2 space-y-4">
                                                        <p className="text-[10px] text-muted-foreground leading-relaxed h-8">
                                                            {node.details}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] text-muted-foreground uppercase font-bold">{isActive ? 'Current Earning' : 'Reward Tier'}</span>
                                                                <span className={`text-xs font-black ${node.reward === 'High' ? 'text-primary' : (node.reward === 'Medium' ? 'text-emerald-400' : 'text-slate-400')}`}>
                                                                    {isActive ? node.rate : `${node.reward} Yield`}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                disabled={isProcessing}
                                                                onClick={() => handleNodeToggle(node.id, node.name, node.rate)}
                                                                className={`rounded-lg text-[10px] font-black uppercase tracking-widest px-4 h-8 transition-all duration-500 ${isActive
                                                                    ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
                                                                    : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary border-primary hover:text-white'
                                                                    }`}
                                                            >
                                                                {isProcessing ? 'TRANSITIONING...' : (isActive ? 'OFFLINE' : 'SYNCHRONIZE')}
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Sidebar: Logs & Bug Bounty */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Real-time System Logs */}
                            <ScrollReveal direction="right">
                                <Card className="border-border/50 dark:border-white/5 bg-white dark:bg-slate-950/40 backdrop-blur-xl h-64 overflow-hidden rounded-3xl group shadow-md dark:shadow-none">
                                    <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
                                        <CardTitle className="text-xs font-black italic uppercase tracking-widest flex items-center gap-2">
                                            <Terminal className="w-3 h-3 text-primary" />
                                            Core Activity Log
                                        </CardTitle>
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 font-mono text-[10px] space-y-2 overflow-auto h-[calc(100%-3rem)] custom-scrollbar">
                                        {logs.length > 0 ? (
                                            logs.map((log, i) => (
                                                <div key={i} className={`flex gap-2 animate-in slide-in-from-left-2 duration-300 ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>
                                                    <span className="text-muted-foreground">[{log.time}]</span>
                                                    <span className={`
                        ${log.type === 'success' ? 'text-emerald-400' : (log.type === 'warning' ? 'text-amber-400' : 'text-primary')}
                      `}>
                                                        {log.msg}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-muted-foreground opacity-30 italic">No network events recorded...</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </ScrollReveal>

                            {/* Neural Shield Bug Bounty */}
                            <ScrollReveal direction="right" delay={0.1}>
                                <Card className="border-border/50 dark:border-primary/20 bg-white dark:bg-slate-950/40 backdrop-blur-md overflow-hidden relative group rounded-3xl shadow-lg dark:shadow-none">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                                        <Zap size={80} className="text-primary" />
                                    </div>
                                    <CardHeader className="pb-3 pt-8 px-6">
                                        <CardTitle className="flex items-center gap-2 text-xl font-black italic tracking-tighter">
                                            <Zap className="w-5 h-5 text-primary animate-pulse" />
                                            NEURAL SHIELD
                                        </CardTitle>
                                        <CardDescription className="text-[10px] uppercase font-bold text-primary/60 tracking-widest">Digital Infrastructure Oversight</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6 px-6">
                                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                                            <p className="text-[10px] text-muted-foreground uppercase font-black">ACTIVE EXPLOIT REWARD</p>
                                            <div className="flex items-end justify-between">
                                                <span className="text-3xl font-black text-primary">$1,000</span>
                                                <Badge className="bg-primary/20 text-primary border-primary/40 font-black text-[9px]">CRITICAL_LEVEL</Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                                                <span>Target: Traffic-AI v4.2</span>
                                                <span className="text-emerald-500 flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                                                    UNTOUCHED
                                                </span>
                                            </div>
                                            <Progress value={20} className="h-1 bg-muted dark:bg-white/5" />
                                            <p className="text-[9px] text-muted-foreground leading-relaxed italic font-medium">
                                                "Citizens are our ultimate firewall. Identify a logical bypass in the urban AI routing and claim your prize."
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => {
                                                addLog("Initializing secure bounty upload portal...", "info");
                                                toast.info("Security portal opening...");
                                            }}
                                            className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] h-12 transition-all shadow-glow"
                                        >
                                            Initiate Audit
                                        </Button>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>
                        </div>
                    </div>

                    {/* Protocol Logs History Table */}
                    <ScrollReveal direction="up" delay={0.3}>
                        <Card className="border-border/50 dark:border-white/5 bg-white dark:bg-slate-950/20 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl">
                            <CardHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5 text-primary" />
                                        Contribution Ledger
                                    </h3>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70">Historical network participation records</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {userReports && userReports.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {userReports.slice(0, 5).map((report: any) => (
                                            <div key={report.id} className="p-6 flex items-center justify-between hover:bg-muted/30 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-10 h-10 rounded-xl bg-muted dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center font-mono text-[10px] font-bold group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                        #{report.id.toString().slice(-4)}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-sm tracking-tight text-foreground dark:text-white/90 group-hover:text-primary transition-colors">{report.description}</span>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="outline" className="text-[8px] h-4 border-white/10 uppercase tracking-widest">{report.category}</Badge>
                                                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{new Date(report.created_at).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={`
                        font-black text-[9px] tracking-widest uppercase border-0 h-6
                        ${report.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                        ${report.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary' : ''}
                        ${report.status === 'RECEIVED' ? 'bg-white/5 text-muted-foreground' : ''}
                      `}
                                                >
                                                    {report.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-24 px-6 bg-slate-950/20">
                                        <div className="relative inline-block mb-6">
                                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                                            <div className="relative w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10 group-hover:border-primary/30 transition-colors">
                                                <Database className="w-8 h-8 text-primary/40 group-hover:text-primary/60 transition-colors" />
                                            </div>
                                        </div>
                                        <h3 className="font-black italic uppercase text-lg text-white/70 tracking-tight">Ledger Initialized</h3>
                                        <p className="max-w-xs mx-auto text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-3 leading-relaxed opacity-60">
                                            The urban participation ledger is currently empty. Contribute data to the city grid to record your impact.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-8 rounded-xl border-primary/20 text-primary hover:bg-primary/10 font-bold text-[10px] uppercase tracking-widest"
                                            onClick={() => setContributionDialogOpen(true)}
                                        >
                                            <Plus className="w-3 h-3 mr-2" /> Start First Contribution
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </ScrollReveal>
                </div>
            </div>
        </DirectionalScrollEffect>
    );
};

export default Profile;
