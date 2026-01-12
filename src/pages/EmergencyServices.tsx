import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    Flame,
    Stethoscope,
    Shield,
    MapPin,
    PhoneCall,
    Zap,
    ChevronRight,
    Send,
    Loader2,
    Activity
} from 'lucide-react';
import { emergencyApi, getCurrentUserId } from '@/lib/api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollReveal, SpotlightCard } from '@/components/effects/InteractionEffects';
import { cn } from '@/lib/utils';

const EmergencyServices = () => {
    const userId = getCurrentUserId();
    const [sosMessage, setSosMessage] = useState('Emergency help needed at my location');

    const { data: status } = useQuery({
        queryKey: ['emergencyStatus'],
        queryFn: emergencyApi.getStatus,
        refetchInterval: 5000,
    });

    const { data: units } = useQuery({
        queryKey: ['emergencyUnits'],
        queryFn: emergencyApi.getUnits,
        refetchInterval: 3000,
    });

    const { data: incidents, isLoading, refetch } = useQuery({
        queryKey: ['emergencyIncidents'],
        queryFn: emergencyApi.getIncidents,
        refetchInterval: 10000,
    });

    const sosMutation = useMutation({
        mutationFn: (location: { lat: number, lng: number }) =>
            emergencyApi.sendSOS({
                user_id: userId,
                lat: location.lat,
                lng: location.lng,
                message: sosMessage
            }),
        onSuccess: () => {
            toast.success('SOS Broadcasted to Emergency Command');
            refetch();
        },
        onError: () => {
            toast.error('Failed to broadcast SOS');
        }
    });

    const handleSOS = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                sosMutation.mutate({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, () => {
                sosMutation.mutate({ lat: 43.238, lng: 76.889 });
            });
        } else {
            sosMutation.mutate({ lat: 43.238, lng: 76.889 });
        }
    };


    return (
        <div className="min-h-screen pb-10 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10 pt-10 bg-background/40 backdrop-blur-2xl rounded-[3rem] border border-border/10 shadow-2xl my-10 pb-16 space-y-8 animate-in fade-in duration-700">

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <AlertTriangle className="text-red-500 w-10 h-10 animate-pulse" />
                            Crisis Command Center
                        </h1>
                        <p className="text-muted-foreground">Unified Incident Response Interface • Almaty V5.0</p>
                    </div>

                    {status && (
                        <div className="flex items-center gap-6 bg-white/50 dark:bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-xl card-3d">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City Safety Pulse</span>
                                <span className={`text-2xl font-black ${status.safety_score > 80 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {status.safety_score}%
                                </span>
                            </div>
                            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center animate-pulse ${status.safety_score > 80 ? 'border-emerald-500/30 text-emerald-500' : 'border-red-500/30 text-red-500'}`}>
                                <Activity size={24} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: SOS & Contacts */}
                    <div className="space-y-8">
                        <Card className="border-red-500/30 bg-red-500/5 relative overflow-hidden group card-3d shadow-2xl">
                            <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
                            <CardHeader className="relative z-10">
                                <CardTitle className="text-red-500 flex items-center gap-2">
                                    <Zap className="w-5 h-5 fill-red-500" />
                                    Critical SOS
                                </CardTitle>
                                <CardDescription>Broadcast your location to all services</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <button
                                    onClick={handleSOS}
                                    disabled={sosMutation.isPending}
                                    className="w-full aspect-square rounded-full bg-red-500 hover:bg-red-600 active:scale-90 transition-all shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center text-white border-8 border-red-400/20 group-hover:shadow-[0_0_70px_rgba(239,68,68,0.6)]"
                                >
                                    {sosMutation.isPending ? (
                                        <Loader2 className="w-16 h-16 animate-spin" />
                                    ) : (
                                        <>
                                            <PhoneCall className="w-16 h-16 mb-2 group-hover:animate-bounce" />
                                            <span className="text-4xl font-black tracking-tighter uppercase">SOS</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-center text-red-700/70 font-medium uppercase tracking-widest animate-pulse">
                                    Click to broadcast emergency signal
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 card-3d bg-white/5 dark:bg-card/40 backdrop-blur-md overflow-hidden shadow-xl">
                            <CardHeader className="pb-3 border-b border-border/5">
                                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                                    <PhoneCall className="w-3.5 h-3.5 text-primary" />
                                    First-Order Emergency
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Primary Unified Number */}
                                    <a
                                        href="tel:112"
                                        className="col-span-2 flex items-center justify-between p-4 rounded-xl bg-red-600 hover:bg-red-700 transition-all group relative overflow-hidden shadow-lg shadow-red-600/20"
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-white/70 tracking-widest">Unified Emergency</div>
                                                <div className="text-3xl font-black text-white leading-none">112</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-white/50 group-hover:translate-x-1 transition-transform" />
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                                    </a>

                                    {/* Secondary Numbers */}
                                    {[
                                        { name: 'Fire', number: '101', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                        { name: 'Police', number: '102', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                        { name: 'Medical', number: '103', icon: Stethoscope, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                        { name: 'Gas', number: '104', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                                    ].map((contact) => (
                                        <a
                                            key={contact.number}
                                            href={`tel:${contact.number}`}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 transition-all hover:border-primary/50 group relative overflow-hidden h-28",
                                                contact.bg
                                            )}
                                        >
                                            <contact.icon className={cn("w-6 h-6 mb-2 transition-transform group-hover:scale-110", contact.color)} />
                                            <span className="text-xl font-black tracking-tighter">{contact.number}</span>
                                            <span className="text-[9px] font-bold uppercase opacity-60">{contact.name}</span>
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 card-3d bg-card/40 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    Active Responders
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {units ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                <div className="text-xl font-black text-blue-500">{units.filter((u: any) => u.type === 'POLICE').length}</div>
                                                <div className="text-[8px] uppercase font-bold">Police</div>
                                            </div>
                                            <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                                <div className="text-xl font-black text-red-500">{units.filter((u: any) => u.type === 'AMBULANCE').length}</div>
                                                <div className="text-[8px] uppercase font-bold">Med</div>
                                            </div>
                                            <div className="text-center p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                <div className="text-xl font-black text-orange-500">{units.filter((u: any) => u.type === 'FIRE').length}</div>
                                                <div className="text-[8px] uppercase font-bold">Fire</div>
                                            </div>
                                        </div>
                                        <div className="max-h-[250px] overflow-y-auto pr-2 space-y-2">
                                            {units.slice(0, 6).map((unit: any) => (
                                                <div key={unit.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/10 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full animate-pulse ${unit.status === 'ON_SCENE' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                                        <span className="font-bold">{unit.id.toUpperCase()}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="text-[8px]">{unit.status}</Badge>
                                                </div>
                                            ))}
                                            <div className="text-[10px] text-center text-muted-foreground pt-2 italic">
                                                + {units.length - 6} more units on patrol
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Skeleton className="h-48 w-full rounded-xl" />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Live Incidents */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-border/50 shadow-md dark:shadow-sm overflow-hidden card-3d bg-white dark:bg-card/40 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b border-border/10">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary" />
                                        Live Incident Command
                                    </CardTitle>
                                    <CardDescription>Real-time situation awareness & dispatch</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => refetch()} className="hover:bg-primary/10">Refresh Stream</Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="p-8 space-y-4">
                                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                                    </div>
                                ) : incidents && incidents.length > 0 ? (
                                    <div className="divide-y divide-border/10">
                                        {incidents.map((incident: any) => (
                                            <div key={incident.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-muted/30 transition-all group">
                                                <div className="flex gap-4">
                                                    <div className={`mt-1 p-3 rounded-2xl ${incident.type === 'FIRE' ? 'bg-orange-500/10 text-orange-500' :
                                                        incident.type === 'ACCIDENT' ? 'bg-red-500/10 text-red-500' :
                                                            incident.type === 'POLICE' ? 'bg-indigo-500/10 text-indigo-500' :
                                                                'bg-blue-500/10 text-blue-500'
                                                        }`}>
                                                        {incident.type === 'FIRE' ? <Flame size={24} /> :
                                                            incident.type === 'ACCIDENT' ? <AlertTriangle size={24} /> :
                                                                incident.type === 'POLICE' ? <Shield size={24} /> :
                                                                    <Stethoscope size={24} />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="font-bold text-lg">{incident.type}</h4>
                                                            <Badge className={
                                                                incident.severity === 'CRITICAL' ? 'bg-red-600' :
                                                                    incident.severity === 'HIGH' ? 'bg-orange-500' :
                                                                        'bg-blue-500'
                                                            }>
                                                                {incident.severity}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{incident.description}</p>
                                                        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mt-3">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3 text-red-500" /> {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
                                                            </span>
                                                            <span className="bg-muted/50 px-2 py-0.5 rounded border border-border/10">
                                                                REPORTED: {new Date(incident.reported_at).toLocaleTimeString()}
                                                            </span>
                                                            {incident.assigned_units?.length > 0 && (
                                                                <span className="flex items-center gap-1.5 text-blue-500 font-bold">
                                                                    <Activity size={12} className="animate-pulse" /> DISPATCHED: {incident.assigned_units.join(', ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 md:mt-0 flex items-center gap-3">
                                                    <Badge variant="outline" className={`font-bold ${incident.status === 'LIVE_NW'
                                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/30 animate-pulse'
                                                        : 'border-muted-foreground/30'
                                                        }`}>
                                                        {incident.status === 'LIVE_NW' ? 'LIVE NEWS' : incident.status}
                                                    </Badge>
                                                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                                        <h3 className="text-xl font-bold mb-1 text-muted-foreground">All Clear</h3>
                                        <p className="text-muted-foreground">No active emergency incidents detected.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Guidance */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-blue-500/5 border-blue-500/20">
                                <CardContent className="p-4 flex gap-4">
                                    <Shield className="w-10 h-10 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold">First Aid Registry</h4>
                                        <p className="text-xs text-muted-foreground">Access interactive CPR and first-aid instructions for common emergencies.</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-emerald-500/5 border-emerald-500/20">
                                <CardContent className="p-4 flex gap-4">
                                    <AlertTriangle className="text-emerald-500 w-10 h-10 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold">Safe Zones</h4>
                                        <p className="text-xs text-muted-foreground">Find the nearest bunkers, medical centers and fire stations based on GPS.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyServices;
