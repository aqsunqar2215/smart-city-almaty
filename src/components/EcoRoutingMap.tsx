import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Layers, MapPinned, MoonStar, Sun } from 'lucide-react';
import { EcoRoute } from '@/types/ecoRouting';

interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

interface EcoRoutingMapProps {
  routes: EcoRoute[];
  startPoint: RoutePoint | null;
  endPoint: RoutePoint | null;
  showTraffic: boolean;
  showAirQuality: boolean;
  onMapClick?: (point: RoutePoint) => void;
  selectedRouteId?: string;
  onRouteSelect?: (routeId: string) => void;
}

const getAqiColor = (aqi: number): string => {
  if (aqi < 50) return '#22c55e';
  if (aqi < 100) return '#f59e0b';
  return '#ef4444';
};

const TILESETS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
} as const;

const EcoRoutingMap: React.FC<EcoRoutingMapProps> = ({
  routes,
  startPoint,
  endPoint,
  showTraffic,
  showAirQuality,
  onMapClick,
  selectedRouteId,
  onRouteSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const onMapClickRef = useRef<EcoRoutingMapProps['onMapClick']>(onMapClick);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
  const layersRef = useRef<{
    routes: L.LayerGroup;
    markers: L.LayerGroup;
  } | null>(null);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  const getSelectedOrRecommendedRoute = useCallback(() => {
    return routes.find((route) => route.id === selectedRouteId) ?? routes.find((route) => route.type === 'recommended');
  }, [routes, selectedRouteId]);

  const fitToSelectedRoute = useCallback(() => {
    const map = mapInstanceRef.current;
    const route = getSelectedOrRecommendedRoute();
    if (!map || !route || route.polyline.length < 2) return;
    const bounds = L.latLngBounds(route.polyline.map((point) => [point[0], point[1]] as [number, number]));
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
  }, [getSelectedOrRecommendedRoute]);

  const fitToAllRoutes = useCallback(() => {
    const map = mapInstanceRef.current;
    const allPoints = routes.flatMap((route) => route.polyline);
    if (!map || allPoints.length < 2) return;
    const bounds = L.latLngBounds(allPoints.map((point) => [point[0], point[1]] as [number, number]));
    map.fitBounds(bounds, { padding: [65, 65], maxZoom: 14 });
  }, [routes]);

  const fitToPoints = useCallback(() => {
    if (!mapInstanceRef.current || !startPoint || !endPoint) return;
    const bounds = L.latLngBounds([startPoint.lat, startPoint.lng], [endPoint.lat, endPoint.lng]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 });
  }, [startPoint, endPoint]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [43.2389, 76.9286],
      zoom: 12,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    tileLayerRef.current = L.tileLayer(TILESETS[mapTheme], {
      attribution: '&copy; CARTO',
      maxZoom: 20,
    }).addTo(map);

    layersRef.current = {
      routes: L.layerGroup().addTo(map),
      markers: L.layerGroup().addTo(map),
    };

    map.on('click', (e) => {
      if (onMapClickRef.current) {
        onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapTheme]);

  useEffect(() => {
    if (!tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILESETS[mapTheme]);
  }, [mapTheme]);

  useEffect(() => {
    if (!layersRef.current) return;
    layersRef.current.routes.clearLayers();

    const orderedRoutes = [...routes].sort((a, b) => {
      const aSelected = a.id === selectedRouteId || (!selectedRouteId && a.type === 'recommended');
      const bSelected = b.id === selectedRouteId || (!selectedRouteId && b.type === 'recommended');
      if (aSelected === bSelected) return 0;
      return aSelected ? 1 : -1;
    });

    orderedRoutes.forEach((route) => {
      const isSelected = route.id === selectedRouteId || (!selectedRouteId && route.type === 'recommended');
      const isRecommended = route.type === 'recommended';

      const rawPath = route.polyline.map((point) => [point[0], point[1]] as L.LatLngExpression);
      const path = rawPath;
      if (path.length < 2) return;

      const defaultColor = isRecommended ? '#00e5ff' : '#64748b';
      const defaultOpacity = isRecommended ? 0.9 : 0.26;
      const defaultWeight = isRecommended ? 5 : 3;
      const tooltipText = `${Math.round(route.etaS / 60)} min • ${(route.distanceM / 1000).toFixed(1)} km`;

      if (isSelected) {
        L.polyline(path, {
          color: isRecommended ? '#22d3ee' : '#94a3b8',
          weight: isRecommended ? 13 : 10,
          opacity: 0.14,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layersRef.current!.routes);
      }

      const attachRouteEvents = (line: L.Polyline) => {
        line.on('click', () => onRouteSelect?.(route.id));
        line.bindTooltip(tooltipText, { sticky: true });
      };

      if (showAirQuality && isRecommended && isSelected && route.aqiProfile.length > 0) {
        const segments = path.length - 1;
        const baseLine = L.polyline(path, {
          color: defaultColor,
          weight: 4,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layersRef.current!.routes);
        attachRouteEvents(baseLine);

        for (let idx = 0; idx < segments; idx++) {
          const profileIdx = Math.min(
            route.aqiProfile.length - 1,
            Math.floor((idx / Math.max(1, segments)) * route.aqiProfile.length)
          );
          const segmentPath = [path[idx], path[idx + 1]];
          L.polyline(segmentPath, {
            color: getAqiColor(route.aqiProfile[profileIdx]),
            weight: 6,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(layersRef.current!.routes);
        }
        baseLine.bringToBack();
      } else {
        const line = L.polyline(path, {
          color: defaultColor,
          weight: defaultWeight,
          opacity: defaultOpacity,
          dashArray: isRecommended ? undefined : '9, 9',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layersRef.current!.routes);
        attachRouteEvents(line);
        if (isSelected) {
          line.bringToFront();
        }
      }

      if (showTraffic && isSelected && !showAirQuality) {
        const trafficTint = route.avgTraffic > 75 ? '#ef4444' : route.avgTraffic > 50 ? '#f59e0b' : '#22c55e';
        const halo = L.polyline(path, {
          color: trafficTint,
          weight: 8,
          opacity: 0.15,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layersRef.current!.routes);
        halo.bringToBack();
      }
    });
  }, [routes, selectedRouteId, showAirQuality, showTraffic]);

  useEffect(() => {
    if (routes.length === 0) return;
    fitToSelectedRoute();
  }, [routes, selectedRouteId, fitToSelectedRoute]);

  useEffect(() => {
    if (!layersRef.current) return;
    layersRef.current.markers.clearLayers();

    if (startPoint) {
      const startIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">A</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([startPoint.lat, startPoint.lng], { icon: startIcon })
        .bindPopup(`<b>Start:</b> ${startPoint.name || 'Selected location'}`)
        .on('click', () => fitToPoints())
        .addTo(layersRef.current!.markers);
    }

    if (endPoint) {
      const endIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">B</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([endPoint.lat, endPoint.lng], { icon: endIcon })
        .bindPopup(`<b>Destination:</b> ${endPoint.name || 'Selected location'}`)
        .on('click', () => fitToPoints())
        .addTo(layersRef.current!.markers);
    }

    if (startPoint && endPoint && mapInstanceRef.current && routes.length === 0) {
      fitToPoints();
    }
  }, [startPoint, endPoint, routes.length, fitToPoints]);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden" style={{ minHeight: '400px', zIndex: 0 }}>
      <div ref={mapRef} className="h-full w-full" />

      <div className="absolute right-3 top-3 z-[450] flex flex-col gap-2">
        <button
          onClick={fitToSelectedRoute}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/85 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-xl backdrop-blur hover:bg-card"
          title="Focus selected route"
        >
          <Crosshair className="h-3.5 w-3.5" />
          Route
        </button>
        <button
          onClick={fitToAllRoutes}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/85 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-xl backdrop-blur hover:bg-card"
          title="Fit all alternatives"
        >
          <Layers className="h-3.5 w-3.5" />
          All
        </button>
        <button
          onClick={fitToPoints}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/85 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-xl backdrop-blur hover:bg-card"
          title="Fit start and destination"
        >
          <MapPinned className="h-3.5 w-3.5" />
          A-B
        </button>
      </div>

      <button
        onClick={() => setMapTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        className="absolute left-3 top-3 z-[450] inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/85 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-xl backdrop-blur hover:bg-card"
        title="Toggle map theme"
      >
        {mapTheme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <MoonStar className="h-3.5 w-3.5" />}
        {mapTheme === 'dark' ? 'Light' : 'Dark'}
      </button>
    </div>
  );
};

export default EcoRoutingMap;
