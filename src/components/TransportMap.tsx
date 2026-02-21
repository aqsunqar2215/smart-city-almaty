import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '@/contexts/ThemeContext';

export interface TransportBus {
  id: number;
  route_number: string;
  vehicle_type: 'BUS' | 'MINIBUS' | string;
  lat: number;
  lng: number;
  occupancy: number;
  has_ac: boolean;
  has_wifi: boolean;
  is_eco: boolean;
  heading?: number;
  speed_kmh?: number;
  last_updated: string;
}

export interface TransportRouteShape {
  route_number: string;
  point_count: number;
  path: Array<{ lat: number; lng: number }>;
}

interface TransportMapProps {
  buses: TransportBus[];
  routes: TransportRouteShape[];
  selectedRoute: string | null;
  selectedBusId?: number | null;
  onlySelectedRoute: boolean;
  showRoutes: boolean;
  showVehicles: boolean;
}

const BASE_CENTER: [number, number] = [43.2389, 76.9286];

const colorPalette = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

const stableHash = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const routeColor = (route: string, isEco: boolean): string => {
  if (isEco) return '#10b981';
  return colorPalette[stableHash(route) % colorPalette.length];
};

const TransportMap: React.FC<TransportMapProps> = ({
  buses,
  routes,
  selectedRoute,
  selectedBusId,
  onlySelectedRoute,
  showRoutes,
  showVehicles,
}) => {
  const { actualTheme } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const vehicleLayerRef = useRef<L.LayerGroup | null>(null);

  const ecoRoutes = useMemo(() => {
    const set = new Set<string>();
    buses.forEach((bus) => {
      if (bus.is_eco) set.add(bus.route_number);
    });
    return set;
  }, [buses]);

  const activeRouteSet = useMemo(() => {
    const set = new Set<string>();
    buses.forEach((bus) => set.add(bus.route_number));
    return set;
  }, [buses]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView(BASE_CENTER, 12);
    mapInstanceRef.current = map;

    routeLayerRef.current = L.layerGroup().addTo(map);
    vehicleLayerRef.current = L.layerGroup().addTo(map);

    const tile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    ).addTo(map);

    tileLayerRef.current = tile;
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!tileLayerRef.current) return;
    tileLayerRef.current.setUrl(
      `https://{s}.basemaps.cartocdn.com/${actualTheme === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`
    );
  }, [actualTheme]);

  useEffect(() => {
    if (!routeLayerRef.current || !vehicleLayerRef.current || !mapInstanceRef.current) return;

    routeLayerRef.current.clearLayers();
    vehicleLayerRef.current.clearLayers();

    const activeRoutes = routes.filter((route) => activeRouteSet.has(route.route_number));
    const routeSource = onlySelectedRoute && selectedRoute
      ? activeRoutes.filter((route) => route.route_number === selectedRoute)
      : activeRoutes;

    if (showRoutes) {
      routeSource.forEach((route) => {
        if (route.path.length < 2) return;
        const isSelected = route.route_number === selectedRoute;
        const color = routeColor(route.route_number, ecoRoutes.has(route.route_number));

        L.polyline(
          route.path.map((point) => [point.lat, point.lng]) as [number, number][],
          {
            color,
            weight: isSelected ? 5 : 3,
            opacity: isSelected ? 0.95 : 0.35,
            lineCap: 'round',
            lineJoin: 'round',
            smoothFactor: 1.0,
          }
        )
          .addTo(routeLayerRef.current!)
          .bindTooltip(`Route ${route.route_number} • ${route.point_count} pts`, { sticky: true });
      });
    }

    const busSource = onlySelectedRoute && selectedRoute
      ? buses.filter((bus) => bus.route_number === selectedRoute)
      : buses;

    if (showVehicles) {
      busSource.forEach((bus) => {
        const isSelectedVehicle = selectedBusId === bus.id;
        const vehicleColor = bus.vehicle_type === 'MINIBUS' ? '#f59e0b' : '#3b82f6';
        const occupancyColor = bus.occupancy > 80 ? '#ef4444' : bus.occupancy > 55 ? '#f59e0b' : '#22c55e';
        const heading = bus.heading ?? 0;

        const icon = L.divIcon({
          className: 'transport-vehicle-marker',
          html: `
            <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
              <div style="width:${isSelectedVehicle ? '21px' : '18px'}; height:${isSelectedVehicle ? '21px' : '18px'}; border-radius:${bus.vehicle_type === 'MINIBUS' ? '50%' : '5px'}; background:${vehicleColor}; border:${isSelectedVehicle ? '3px' : '2px'} solid #fff; color:#fff; font-size:8px; font-weight:900; font-family:monospace; display:flex; align-items:center; justify-content:center; box-shadow:0 0 ${isSelectedVehicle ? '16px' : '10px'} ${vehicleColor}cc;">
                ${bus.route_number}
              </div>
              <div style="width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-top:6px solid #ffffff; transform:rotate(${heading}deg); transform-origin:center;"></div>
              <div style="width:${isSelectedVehicle ? '8px' : '6px'}; height:${isSelectedVehicle ? '8px' : '6px'}; border-radius:50%; background:${occupancyColor}; border:1px solid #fff;"></div>
            </div>
          `,
          iconSize: [22, 30],
          iconAnchor: [11, 26],
        });

        L.marker([bus.lat, bus.lng], { icon })
          .addTo(vehicleLayerRef.current!)
          .bindPopup(`
            <div style="font-family:sans-serif; min-width:180px;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                <b>${bus.vehicle_type === 'MINIBUS' ? 'Marshrutka' : 'Bus'} #${bus.route_number}</b>
                <span style="font-size:10px; padding:2px 6px; border-radius:999px; background:${occupancyColor}20; color:${occupancyColor}; font-weight:700;">${bus.occupancy}%</span>
              </div>
              <div style="font-size:11px; color:#666;">
                GEO: ${bus.lat.toFixed(6)}, ${bus.lng.toFixed(6)}<br/>
                Speed: ${(bus.speed_kmh ?? 0).toFixed(0)} km/h<br/>
                AC: ${bus.has_ac ? 'On' : 'Off'} • WiFi: ${bus.has_wifi ? 'On' : 'Off'}<br/>
                Updated: ${new Date(bus.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          `);
      });
    }
  }, [buses, routes, selectedRoute, selectedBusId, onlySelectedRoute, showRoutes, showVehicles, ecoRoutes, activeRouteSet]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (!selectedRoute) {
      mapInstanceRef.current.setView(BASE_CENTER, 12);
      return;
    }

    const selected = routes.find((route) => route.route_number === selectedRoute);
    if (!selected || selected.path.length < 2) return;

    const bounds = L.latLngBounds(selected.path.map((point) => [point.lat, point.lng] as [number, number]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
  }, [selectedRoute, routes]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedBusId) return;
    const selectedBus = buses.find((bus) => bus.id === selectedBusId);
    if (!selectedBus) return;
    mapInstanceRef.current.panTo([selectedBus.lat, selectedBus.lng], { animate: true });
  }, [selectedBusId, buses]);

  return (
    <div className="relative">
      <div ref={mapRef} className="h-[460px] w-full rounded-none overflow-hidden" />
      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-background/80 border border-border/60 backdrop-blur">
        Transport-only telemetry map
      </div>
      <div className="absolute top-3 left-3 text-[11px] rounded-lg bg-background/80 border border-border/70 px-3 py-2 backdrop-blur space-y-1">
        <div className="font-semibold">Legend</div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" />
          <span>Bus route / vehicle</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
          <span>Minibus vehicle</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
          <span>Low occupancy</span>
        </div>
      </div>
    </div>
  );
};

export default TransportMap;
