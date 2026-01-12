import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { transportApi } from '@/lib/api';
import {
    Bus,
    Truck,
    Clock,
    Map as MapIcon,
    Search,
    Navigation,
    Wind,
    Wifi,
    Users,
    AlertCircle,
    MoveUpRight,
    Route,
    MapPin,
    Eye,
    EyeOff,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SmartCityMap from '@/components/SmartCityMap';
import ShaderBackground from '@/components/backgrounds';
import { MetroTrack, TechPyramid, CyberSphere, Comet, StarField } from '@/components/3d/Animations';
import { ScrollReveal, SpotlightCard } from '@/components/effects/InteractionEffects';
import { DirectionalScrollEffect } from '@/components/effects/ScrollInteractions';

const PublicTransport = () => {
    const [search, setSearch] = useState('');
    const [showMap, setShowMap] = useState(false);

    const { data: buses, isLoading, error } = useQuery({
        queryKey: ['busLocations'],
        queryFn: transportApi.getBuses,
        refetchInterval: 5000,
    });

    const { data: getEcoStats } = useQuery({
        queryKey: ['transport-eco-stats'],
        queryFn: async () => {
            const res = await fetch('http://localhost:8000/api/transport/eco-stats');
            return res.json();
        },
        refetchInterval: 60000,
    });

    const filteredBuses = buses?.filter((b: any) =>
        b.route_number.includes(search)
    );

    return (
        <div className="min-h-screen pb-10 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10 pt-10 bg-background/40 backdrop-blur-2xl rounded-[3rem] border border-border/10 shadow-2xl my-10 pb-16 space-y-8 animate-in fade-in duration-700">

                <ScrollReveal direction="down">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                <span className="gradient-text">City Transit Network</span>
                                <Badge className="bg-primary/20 text-primary border-primary/30">REAL-TIME</Badge>
                            </h1>
                            <p className="text-muted-foreground font-medium">Live monitoring through the Almaty public transport grid</p>
                        </div>

                        <div className="flex items-center gap-8 relative">
                            <div className="hidden lg:block relative">
                                <MetroTrack />
                                <div className="absolute -right-10 -top-10 opacity-20 pointer-events-none">
                                    <TechPyramid />
                                </div>
                                <div className="absolute -left-10 -bottom-10 opacity-15 pointer-events-none">
                                    <CyberSphere />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search route..."
                                        className="pl-10 w-64 glass border-primary/20"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant={showMap ? "default" : "outline"}
                                    onClick={() => setShowMap(!showMap)}
                                    className="rounded-xl h-11"
                                >
                                    {showMap ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                    {showMap ? 'Hide Map' : 'Show Viewport'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {showMap && (
                    <ScrollReveal direction="up">
                        <Card className="overflow-hidden border-primary/20 shadow-2xl animate-in slide-in-from-top duration-500 card-3d">
                            <div className="h-[400px] w-full relative">
                                <SmartCityMap trafficCongestion={50} airQualityIndex={50} />
                                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                                    <Button size="icon" variant="secondary" className="glass shadow-lg">
                                        <Maximize2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </ScrollReveal>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar: Routes & Quick Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <ScrollReveal direction="left" delay={0.1}>
                            {getEcoStats && (
                                <ScrollReveal direction="left" delay={0.15}>
                                    <Card className="bg-emerald-500/10 border-emerald-500/20 card-3d overflow-hidden relative group">
                                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Wind size={100} className="text-emerald-500" />
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                                <Wind className="w-4 h-4" />
                                                Eco Tracker
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <div className="text-3xl font-black text-emerald-600 tabular-nums">-{Math.floor(getEcoStats.co2_saved_kg)}kg</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase">CO2 Emissions Saved Today</div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/5">
                                                <div className="p-1 rounded bg-emerald-500 text-white">
                                                    <Route size={12} />
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-700 uppercase">{getEcoStats.trees_equivalent} trees saved</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </ScrollReveal>
                            )}

                            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 card-3d">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                            <Clock className="text-primary w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">14 mins</div>
                                            <div className="text-xs text-muted-foreground">Avg. Wait Time</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Network Load</span>
                                                <span className="text-orange-500 font-bold">Normal</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary w-[65%] animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    </div>

                    {/* Main Content: Real-time Bus Grid */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isLoading ? (
                                [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
                            ) : error ? (
                                <div className="col-span-full py-20 text-center glass-card">
                                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-muted-foreground">Connectivity Interrupted</h3>
                                    <p className="text-muted-foreground">Unable to fetch bus telemetry. Retrying...</p>
                                </div>
                            ) : filteredBuses && filteredBuses.length > 0 ? (
                                filteredBuses.map((bus: any, index: number) => (
                                    <ScrollReveal key={bus.id} direction="up" delay={index * 0.1}>
                                        <SpotlightCard className="rounded-2xl">
                                            <Card className="border-border/50 overflow-hidden group hover:border-primary/50 transition-all hover:shadow-2xl card-3d bg-white dark:bg-card/40 backdrop-blur-sm">
                                                <div className={`h-1 animate-shimmer bg-[length:200%_100%] ${bus.is_eco ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500' : bus.vehicle_type === 'MINIBUS' ? 'bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-500' : 'bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50'}`} />
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${bus.is_eco ? 'bg-emerald-500/10 text-emerald-600' : bus.vehicle_type === 'MINIBUS' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-primary/10 text-primary'}`}>
                                                            {bus.vehicle_type === 'MINIBUS' ? <Truck className="w-6 h-6" /> : <Bus className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <CardTitle className="text-lg">{bus.vehicle_type === 'MINIBUS' ? 'Marshrutka' : 'Route'} {bus.route_number}</CardTitle>
                                                                {bus.is_eco && <Badge className="bg-emerald-500 text-white text-[8px] h-4">ECO BUS</Badge>}
                                                                {bus.vehicle_type === 'MINIBUS' && <Badge variant="outline" className="text-yellow-600 border-yellow-200 text-[8px] h-4">MINIBUS</Badge>}
                                                            </div>
                                                            <CardDescription className="flex items-center gap-1">
                                                                <Navigation className="w-3 h-3 animate-pulse" /> Last updated: {new Date(bus.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className={`${bus.occupancy > 80 ? 'bg-red-500/10 text-red-500 border-red-200' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                                        {bus.occupancy > 80 ? 'CROWDED' : 'ON SCHEDULE'}
                                                    </Badge>
                                                </CardHeader>
                                                <CardContent className="pt-2">
                                                    <div className="flex justify-between items-end">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Users className={`w-4 h-4 ${bus.occupancy > 80 ? 'text-red-500' : 'text-blue-500'}`} />
                                                                    <span className="text-xs font-bold">{bus.occupancy}% Load</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 opacity-80">
                                                                    <Wind className={`w-4 h-4 ${bus.has_ac ? 'text-primary' : 'text-muted-foreground'}`} />
                                                                    <span className="text-[10px] font-bold uppercase">{bus.has_ac ? 'A/C ACTIVE' : 'NO A/C'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 opacity-80">
                                                                    <Wifi className={`w-4 h-4 ${bus.has_wifi ? 'text-primary' : 'text-muted-foreground'}`} />
                                                                    <span className="text-[10px] font-bold uppercase">{bus.has_wifi ? 'WIFI' : 'OFFLINE'}</span>
                                                                </div>
                                                            </div>

                                                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 ${bus.occupancy > 80 ? 'bg-red-500' : bus.occupancy > 50 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                                                    style={{ width: `${bus.occupancy}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-black text-muted-foreground flex items-center justify-end gap-1">
                                                                <MapPin className="w-3 h-3" /> {bus.lat.toFixed(3)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </SpotlightCard>
                                    </ScrollReveal>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center glass-card">
                                    <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold text-muted-foreground">No telemetry found</h3>
                                    <p className="text-muted-foreground">Fleet might be in maintenance during this hour.</p>
                                </div>
                            )}
                        </div>

                        {/* Network Alerts */}
                        <ScrollReveal direction="up" delay={0.4}>
                            <Card className="border-orange-500/20 bg-orange-500/5 card-3d">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-orange-500" />
                                        Network Advisory
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 rounded-xl bg-background/50 border border-orange-500/10 text-orange-700 dark:text-orange-400 text-sm flex gap-3">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p><strong>Route 92:</strong> 10-minute delay due to infrastructure optimization on Satpayev St. Real-time arrival estimated at 10:42 AM.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicTransport;
