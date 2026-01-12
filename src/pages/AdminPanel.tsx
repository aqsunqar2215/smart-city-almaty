import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Users,
    Activity,
    ShieldAlert,
    BarChart3,
    Search,
    ArrowRight,
    Database,
    Terminal,
    UserCheck,
    Settings
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ShaderBackground from '@/components/backgrounds';
import { GlowingGlobe } from '@/components/3d/Animations';
import { ScrollReveal, SpotlightCard } from '@/components/effects/InteractionEffects';

const AdminPanel = () => {
    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: adminApi.getUsers,
    });

    const { data: logs, isLoading: logsLoading } = useQuery({
        queryKey: ['adminLogs'],
        queryFn: adminApi.getLogs,
    });

    if (usersLoading || logsLoading) {
        return (
            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
                <Skeleton className="h-[500px] w-full" />
            </div>
        );
    }

    const stats = [
        { title: 'Total Citizens', value: users?.length || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Active Reports', value: users?.reduce((acc: number, u: any) => acc + u.reports_count, 0) || 0, icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { title: 'System Logs', value: logs?.length || 0, icon: Terminal, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Daily Actions', value: users?.reduce((acc: number, u: any) => acc + u.actions_count, 0) || 0, icon: BarChart3, color: 'text-green-500', bg: 'bg-green-500/10' },
    ];

    return (
        <div className="min-h-screen pb-10 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10 pt-10 bg-background/40 backdrop-blur-2xl rounded-[3rem] border border-border/10 shadow-2xl my-10 pb-16 space-y-8 animate-in fade-in duration-1000">

                <ScrollReveal direction="down">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-glow">
                                <ShieldAlert className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                    <span className="gradient-text">OS Core Administration</span>
                                    <Badge className="bg-primary/20 text-primary border-primary/40">SYSTEM ROOT</Badge>
                                </h1>
                                <p className="text-muted-foreground mt-1 font-medium italic">
                                    Critical system infrastructure and citizen oversight dashboard
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">

                            <div className="flex gap-3">
                                <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 shadow-glow">
                                    <Terminal className="w-4 h-4 mr-2" /> System Console
                                </Button>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input placeholder="Search logs or users..." className="pl-10 w-64 bg-background/50 backdrop-blur-sm border-primary/20" />
                                </div>
                                <Button onClick={() => toast.success("Audit report exported to CSV")}>Export Audit</Button>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <Card key={i} className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg card-3d group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">{stat.title}</p>
                                        <h3 className="text-3xl font-bold mt-1 tabular-nums">{stat.value}</h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Management */}
                    <Card className="lg:col-span-2 border-border/50 card-3d overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 bg-muted/20">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-primary" />
                                    Citizen Directory
                                </CardTitle>
                                <CardDescription>Manage verified city participants</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => toast.info("Full directory expanded")}>View All Citizens</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                                            <th className="px-6 py-4">Citizen</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Contributions</th>
                                            <th className="px-6 py-4 text-right">Access</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/10">
                                        {users?.slice(0, 6).map((user: any) => (
                                            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:animate-pulse">
                                                            {user.username?.[0] || 'C'}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm">{user.username}</div>
                                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col text-xs font-mono">
                                                        <span>📊 {user.reports_count} Reports</span>
                                                        <span>📝 {user.actions_count} Actions</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => toast.info(`Managing settings for ${user.username}`)}>
                                                        <Settings className="w-4 h-4 text-muted-foreground" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Live Stream */}
                    <Card className="border-border/50 bg-card dark:bg-slate-950 text-foreground dark:text-slate-200 overflow-hidden card-3d shadow-2xl relative">
                        {/* Retro Terminal Scanlines Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                            style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }} />

                        <CardHeader className="border-b border-border bg-muted/20 relative z-10">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-primary animate-pulse" />
                                    <span className="tracking-tighter font-mono italic">SYSLOG_ALMATY_OS_V5.0</span>
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                    <div className="text-[10px] font-mono text-slate-500 animate-pulse">ENCRYPTION: AES-256</div>
                                    <Badge variant="outline" className="animate-pulse border-primary text-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] bg-primary/5">LIVE_LINK</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 h-[540px] overflow-y-auto font-mono text-xs relative z-10 scrollbar-hide">
                            <div className="space-y-3">
                                {logs?.map((l: any, i: number) => (
                                    <div key={l.id}
                                        className="group border-l-2 border-primary/20 pl-4 py-2 hover:border-primary hover:bg-muted/30 transition-all duration-300 relative overflow-hidden animate-in slide-in-from-left"
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-primary/70 font-bold uppercase tracking-tighter">{l.action}</span>
                                            <span className="text-slate-600 text-[10px]">{new Date(l.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-slate-400 break-all leading-relaxed relative z-10">{l.details}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="text-[9px] text-muted-foreground uppercase px-1.5 py-0.5 border border-border rounded">SEC_LVL_4</div>
                                            <div className="text-[9px] text-slate-700 uppercase">TRACE_ID: {l.user_id}</div>
                                        </div>
                                        {/* Hover background glitch effect */}
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                                {logs?.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-30 italic space-y-2">
                                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-500 animate-spin" />
                                        <p>Intercepting packet stream...</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <div className="p-2 bg-muted/50 border-t border-border text-[9px] flex justify-between items-center text-muted-foreground relative z-10 font-mono">
                            <span className="flex items-center gap-1">
                                <Database className="w-3 h-3" /> sqlite://smart_city.db
                            </span>
                            <span>SYSTEM_STABLE_V2</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
