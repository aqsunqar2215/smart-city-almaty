import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { transportApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bus,
  Truck,
  Search,
  Eye,
  EyeOff,
  Route,
  Layers,
  Users,
  Wind,
  Wifi,
  Filter,
  Navigation,
  MapPinned,
  Clock3,
  RefreshCcw,
  LocateFixed,
  Gauge,
} from 'lucide-react';
import TransportMap, { TransportBus, TransportRouteShape } from '@/components/TransportMap';

type VehicleFilter = 'ALL' | 'BUS' | 'MINIBUS';
type RouteSort = 'NUMBER' | 'LOAD' | 'VEHICLES';
type FleetSort = 'UPDATED' | 'LOAD' | 'SPEED';

interface RouteSummary {
  routeNumber: string;
  vehicles: number;
  avgOccupancy: number;
  eco: boolean;
  buses: number;
  minibuses: number;
}

const PublicTransport = () => {
  const [search, setSearch] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>('ALL');
  const [routeSort, setRouteSort] = useState<RouteSort>('NUMBER');
  const [fleetSort, setFleetSort] = useState<FleetSort>('UPDATED');
  const [ecoOnly, setEcoOnly] = useState(false);
  const [onlySelectedRouteOnMap, setOnlySelectedRouteOnMap] = useState(true);
  const [showRoutesLayer, setShowRoutesLayer] = useState(true);
  const [showVehiclesLayer, setShowVehiclesLayer] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const { data: buses = [], isLoading, error } = useQuery<TransportBus[]>({
    queryKey: ['busLocations', 'transport-v2'],
    queryFn: transportApi.getBuses,
    refetchInterval: 5000,
  });

  const { data: routes = [] } = useQuery<TransportRouteShape[]>({
    queryKey: ['transport-routes-v2'],
    queryFn: transportApi.getRoutes,
    refetchInterval: 10 * 60 * 1000,
  });

  const { data: ecoStats } = useQuery({
    queryKey: ['transport-eco-stats'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/transport/eco-stats');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const routeMatches = search.trim() === '' || bus.route_number.includes(search.trim());
      const vehicleMatches = vehicleFilter === 'ALL' || bus.vehicle_type === vehicleFilter;
      const ecoMatches = !ecoOnly || bus.is_eco;
      return routeMatches && vehicleMatches && ecoMatches;
    });
  }, [buses, search, vehicleFilter, ecoOnly]);

  const routeSummaries = useMemo<RouteSummary[]>(() => {
    const grouped = new Map<string, TransportBus[]>();

    filteredBuses.forEach((bus) => {
      if (!grouped.has(bus.route_number)) grouped.set(bus.route_number, []);
      grouped.get(bus.route_number)!.push(bus);
    });

    const summaries = Array.from(grouped.entries()).map(([routeNumber, routeBuses]) => {
      const vehicles = routeBuses.length;
      const avgOccupancy = Math.round(routeBuses.reduce((acc, bus) => acc + bus.occupancy, 0) / Math.max(1, vehicles));
      const busesCount = routeBuses.filter((bus) => bus.vehicle_type === 'BUS').length;
      const minibusesCount = routeBuses.filter((bus) => bus.vehicle_type === 'MINIBUS').length;
      const eco = routeBuses.some((bus) => bus.is_eco);
      return {
        routeNumber,
        vehicles,
        avgOccupancy,
        eco,
        buses: busesCount,
        minibuses: minibusesCount,
      };
    });

    return summaries.sort((a, b) => {
      if (routeSort === 'LOAD') return b.avgOccupancy - a.avgOccupancy;
      if (routeSort === 'VEHICLES') return b.vehicles - a.vehicles;
      const aNum = Number(a.routeNumber);
      const bNum = Number(b.routeNumber);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
      if (!Number.isNaN(aNum)) return -1;
      if (!Number.isNaN(bNum)) return 1;
      return a.routeNumber.localeCompare(b.routeNumber);
    });
  }, [filteredBuses, routeSort]);

  useEffect(() => {
    if (routeSummaries.length === 0) {
      setSelectedRoute(null);
      return;
    }

    const selectedStillExists = selectedRoute && routeSummaries.some((route) => route.routeNumber === selectedRoute);
    if (!selectedStillExists) {
      setSelectedRoute(routeSummaries[0].routeNumber);
    }
  }, [routeSummaries, selectedRoute]);

  const selectedRouteBuses = useMemo(() => {
    const source = selectedRoute
      ? filteredBuses.filter((bus) => bus.route_number === selectedRoute)
      : filteredBuses;

    const byUpdated = (a: TransportBus, b: TransportBus) =>
      new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
    const byLoad = (a: TransportBus, b: TransportBus) => b.occupancy - a.occupancy;
    const bySpeed = (a: TransportBus, b: TransportBus) => (b.speed_kmh ?? 0) - (a.speed_kmh ?? 0);

    if (fleetSort === 'LOAD') return [...source].sort(byLoad);
    if (fleetSort === 'SPEED') return [...source].sort(bySpeed);
    return [...source].sort(byUpdated);
  }, [filteredBuses, selectedRoute, fleetSort]);

  useEffect(() => {
    if (selectedRouteBuses.length === 0) {
      setSelectedVehicleId(null);
      return;
    }
    if (!selectedVehicleId || !selectedRouteBuses.some((bus) => bus.id === selectedVehicleId)) {
      setSelectedVehicleId(selectedRouteBuses[0].id);
    }
  }, [selectedRouteBuses, selectedVehicleId]);

  const totalVehicles = filteredBuses.length;
  const activeRoutesCount = routeSummaries.length;
  const avgFleetOccupancy = totalVehicles > 0
    ? Math.round(filteredBuses.reduce((acc, bus) => acc + bus.occupancy, 0) / totalVehicles)
    : 0;
  const ecoVehicles = filteredBuses.filter((bus) => bus.is_eco).length;
  const selectedRouteSummary = routeSummaries.find((route) => route.routeNumber === selectedRoute) ?? null;
  const latestBusUpdate = useMemo(() => {
    if (filteredBuses.length === 0) return null;
    return filteredBuses.reduce((latest, bus) => {
      return new Date(bus.last_updated).getTime() > new Date(latest.last_updated).getTime() ? bus : latest;
    }).last_updated;
  }, [filteredBuses]);

  const resetFilters = () => {
    setSearch('');
    setVehicleFilter('ALL');
    setRouteSort('NUMBER');
    setFleetSort('UPDATED');
    setEcoOnly(false);
    setOnlySelectedRouteOnMap(true);
    setShowRoutesLayer(true);
    setShowVehiclesLayer(true);
  };

  return (
    <div className="min-h-screen pb-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 pt-8 bg-background/40 backdrop-blur-2xl rounded-[2rem] border border-border/10 shadow-2xl my-8 pb-10 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <span className="gradient-text">Transport Control</span>
              <Badge className="bg-primary/20 text-primary border-primary/30">REAL-TIME</Badge>
            </h1>
            <p className="text-muted-foreground font-medium">
              Dedicated transport service: routes, live fleet telemetry, occupancy and eco signals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Route number..."
                className="pl-10 w-56"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <Button
              variant={vehicleFilter === 'ALL' ? 'default' : 'outline'}
              onClick={() => setVehicleFilter('ALL')}
              className="h-10"
            >
              All
            </Button>
            <Button
              variant={vehicleFilter === 'BUS' ? 'default' : 'outline'}
              onClick={() => setVehicleFilter('BUS')}
              className="h-10"
            >
              <Bus className="w-4 h-4 mr-2" /> Bus
            </Button>
            <Button
              variant={vehicleFilter === 'MINIBUS' ? 'default' : 'outline'}
              onClick={() => setVehicleFilter('MINIBUS')}
              className="h-10"
            >
              <Truck className="w-4 h-4 mr-2" /> Minibus
            </Button>
            <Button
              variant={ecoOnly ? 'default' : 'outline'}
              onClick={() => setEcoOnly((value) => !value)}
              className="h-10"
            >
              <Wind className="w-4 h-4 mr-2" /> Eco only
            </Button>

            <Button
              variant={showMap ? 'default' : 'outline'}
              onClick={() => setShowMap((value) => !value)}
              className="h-10"
            >
              {showMap ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
            <Button variant="outline" onClick={resetFilters} className="h-10">
              <RefreshCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock3 className="w-3.5 h-3.5" />
            {latestBusUpdate
              ? `Live update: ${new Date(latestBusUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : 'Live update: no data'}
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5" />
            {selectedRouteSummary
              ? `Selected #${selectedRouteSummary.routeNumber} • ${selectedRouteSummary.vehicles} vehicles • ${selectedRouteSummary.avgOccupancy}% load`
              : 'Select route to inspect fleet details'}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="text-[11px] uppercase text-muted-foreground font-bold tracking-widest">Active Routes</div>
              <div className="text-2xl font-black mt-1">{activeRoutesCount}</div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="text-[11px] uppercase text-muted-foreground font-bold tracking-widest">Vehicles Online</div>
              <div className="text-2xl font-black mt-1">{totalVehicles}</div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="text-[11px] uppercase text-muted-foreground font-bold tracking-widest">Fleet Load</div>
              <div className="text-2xl font-black mt-1">{avgFleetOccupancy}%</div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/25 bg-emerald-500/5">
            <CardContent className="p-4">
              <div className="text-[11px] uppercase text-emerald-700 dark:text-emerald-400 font-bold tracking-widest">Eco Fleet</div>
              <div className="text-2xl font-black mt-1 text-emerald-700 dark:text-emerald-400">{ecoVehicles}</div>
              {ecoStats && (
                <div className="text-[10px] text-muted-foreground mt-1">
                  CO2 saved: {Math.floor(ecoStats.co2_saved_kg)} kg
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showMap && (
          <Card className="overflow-hidden border-primary/20 shadow-lg">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPinned className="w-5 h-5 text-primary" />
                  Transport Map (Routes + Fleet)
                </CardTitle>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={showRoutesLayer ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowRoutesLayer((value) => !value)}
                  >
                    <Route className="w-4 h-4 mr-2" /> Routes
                  </Button>
                  <Button
                    variant={showVehiclesLayer ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowVehiclesLayer((value) => !value)}
                  >
                    <Navigation className="w-4 h-4 mr-2" /> Vehicles
                  </Button>
                  <Button
                    variant={onlySelectedRouteOnMap ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOnlySelectedRouteOnMap((value) => !value)}
                  >
                    <Filter className="w-4 h-4 mr-2" /> Selected Route Only
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowMap(true);
                      setOnlySelectedRouteOnMap(true);
                    }}
                  >
                    <LocateFixed className="w-4 h-4 mr-2" /> Focus Route
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TransportMap
                buses={filteredBuses}
                routes={routes}
                selectedRoute={selectedRoute}
                selectedBusId={selectedVehicleId}
                onlySelectedRoute={onlySelectedRouteOnMap}
                showRoutes={showRoutesLayer}
                showVehicles={showVehiclesLayer}
              />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <Card className="xl:col-span-4 border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Route Directory
                </CardTitle>
                <Badge variant="outline">{routeSummaries.length}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button size="sm" variant={routeSort === 'NUMBER' ? 'default' : 'outline'} onClick={() => setRouteSort('NUMBER')}>
                  By number
                </Button>
                <Button size="sm" variant={routeSort === 'LOAD' ? 'default' : 'outline'} onClick={() => setRouteSort('LOAD')}>
                  By load
                </Button>
                <Button size="sm" variant={routeSort === 'VEHICLES' ? 'default' : 'outline'} onClick={() => setRouteSort('VEHICLES')}>
                  By fleet
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[520px] overflow-auto">
              {isLoading ? (
                <>
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </>
              ) : routeSummaries.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  No routes found for current filters.
                </div>
              ) : (
                routeSummaries.map((route) => {
                  const active = route.routeNumber === selectedRoute;
                  return (
                    <button
                      key={route.routeNumber}
                      type="button"
                      onClick={() => setSelectedRoute(route.routeNumber)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        active
                          ? 'border-primary bg-primary/10'
                          : 'border-border/70 hover:border-primary/40 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-black text-lg">#{route.routeNumber}</div>
                        <div className="flex items-center gap-1">
                          {route.eco && (
                            <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                              <Wind className="w-3 h-3 mr-1" /> ECO
                            </Badge>
                          )}
                          <Badge variant="outline">{route.vehicles}</Badge>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                        <span>Load: {route.avgOccupancy}%</span>
                        <span>Bus {route.buses} • Minibus {route.minibuses}</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${
                            route.avgOccupancy > 80 ? 'bg-red-500' : route.avgOccupancy > 55 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${route.avgOccupancy}%` }}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="xl:col-span-8 border-border/60">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {selectedRoute ? `Live Fleet • Route #${selectedRoute}` : 'Live Fleet'}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant={fleetSort === 'UPDATED' ? 'default' : 'outline'} onClick={() => setFleetSort('UPDATED')}>
                    Latest
                  </Button>
                  <Button size="sm" variant={fleetSort === 'LOAD' ? 'default' : 'outline'} onClick={() => setFleetSort('LOAD')}>
                    Load
                  </Button>
                  <Button size="sm" variant={fleetSort === 'SPEED' ? 'default' : 'outline'} onClick={() => setFleetSort('SPEED')}>
                    Speed
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                </div>
              ) : error ? (
                <div className="text-sm text-red-500 py-8">
                  Transport telemetry API unavailable.
                </div>
              ) : selectedRouteBuses.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8">
                  No active vehicles for selected route and filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRouteBuses.map((bus) => {
                    const occupancyState = bus.occupancy > 80 ? 'Crowded' : bus.occupancy > 55 ? 'Normal' : 'Free';
                    const occupancyColor = bus.occupancy > 80 ? 'text-red-500' : bus.occupancy > 55 ? 'text-orange-500' : 'text-emerald-500';
                    const isActiveBus = selectedVehicleId === bus.id;

                    return (
                      <button
                        type="button"
                        key={bus.id}
                        onClick={() => setSelectedVehicleId(bus.id)}
                        className={`p-4 rounded-xl border bg-card/70 text-left transition-colors ${
                          isActiveBus ? 'border-primary shadow-[0_0_0_1px_rgba(59,130,246,0.35)]' : 'border-border/70 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${bus.vehicle_type === 'MINIBUS' ? 'bg-amber-500/15 text-amber-600' : 'bg-blue-500/15 text-blue-600'}`}>
                              {bus.vehicle_type === 'MINIBUS' ? <Truck className="w-4 h-4" /> : <Bus className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-bold">
                                {bus.vehicle_type === 'MINIBUS' ? 'Marshrutka' : 'Bus'} #{bus.route_number}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {bus.lat.toFixed(6)}, {bus.lng.toFixed(6)}
                              </div>
                            </div>
                          </div>
                          {bus.is_eco && <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">ECO</Badge>}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className={`font-bold ${occupancyColor}`}>{occupancyState} • {bus.occupancy}%</span>
                          <span className="text-muted-foreground">
                            {new Date(bus.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full ${bus.occupancy > 80 ? 'bg-red-500' : bus.occupancy > 55 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                            style={{ width: `${bus.occupancy}%` }}
                          />
                        </div>

                        <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Wind className={`w-3 h-3 ${bus.has_ac ? 'text-primary' : 'text-muted-foreground'}`} />
                            AC {bus.has_ac ? 'On' : 'Off'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Wifi className={`w-3 h-3 ${bus.has_wifi ? 'text-primary' : 'text-muted-foreground'}`} />
                            WiFi {bus.has_wifi ? 'On' : 'Off'}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            {(bus.speed_kmh ?? 0).toFixed(0)} km/h
                          </span>
                          <span>Heading {Math.round(bus.heading ?? 0)}°</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicTransport;
