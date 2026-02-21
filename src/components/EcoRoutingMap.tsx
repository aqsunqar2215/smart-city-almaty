import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Crosshair, Expand, Layers, MapPinned, Minimize, MoonStar, Sun } from 'lucide-react';
import { AvoidArea, EcoRoute } from '@/types/ecoRouting';
import { ECO_ROUTING_TEXT } from '@/lib/ecoRoutingTexts';

interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

interface EcoRoutingMapProps {
  routes: EcoRoute[];
  startPoint: RoutePoint | null;
  endPoint: RoutePoint | null;
  avoidAreas: AvoidArea[];
  showTraffic: boolean;
  showAirQuality: boolean;
  isAddingAvoidArea?: boolean;
  selectedAvoidAreaId?: string | null;
  onMapClick?: (point: RoutePoint) => void;
  onRouteSelect?: (routeId: string) => void;
  onAddAvoidArea?: (point: RoutePoint) => void;
  onAvoidAreaMove?: (id: string, point: RoutePoint) => void;
  onAvoidAreaSelect?: (id: string) => void;
  selectedRouteId?: string;
  onStartPointChange?: (point: RoutePoint) => void;
  onEndPointChange?: (point: RoutePoint) => void;
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
  avoidAreas,
  showTraffic,
  showAirQuality,
  isAddingAvoidArea = false,
  selectedAvoidAreaId,
  onMapClick,
  onRouteSelect,
  onAddAvoidArea,
  onAvoidAreaMove,
  onAvoidAreaSelect,
  selectedRouteId,
  onStartPointChange,
  onEndPointChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const scaleControlRef = useRef<L.Control.Scale | null>(null);
  const onMapClickRef = useRef<EcoRoutingMapProps['onMapClick']>(onMapClick);
  const onRouteSelectRef = useRef<EcoRoutingMapProps['onRouteSelect']>(onRouteSelect);
  const onAddAvoidAreaRef = useRef<EcoRoutingMapProps['onAddAvoidArea']>(onAddAvoidArea);
  const onAvoidAreaMoveRef = useRef<EcoRoutingMapProps['onAvoidAreaMove']>(onAvoidAreaMove);
  const onAvoidAreaSelectRef = useRef<EcoRoutingMapProps['onAvoidAreaSelect']>(onAvoidAreaSelect);
  const onStartPointChangeRef = useRef<EcoRoutingMapProps['onStartPointChange']>(onStartPointChange);
  const onEndPointChangeRef = useRef<EcoRoutingMapProps['onEndPointChange']>(onEndPointChange);
  const isAddingAvoidAreaRef = useRef<boolean>(isAddingAvoidArea);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const layersRef = useRef<{
    routes: L.LayerGroup;
    markers: L.LayerGroup;
    avoid: L.LayerGroup;
  } | null>(null);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
    onRouteSelectRef.current = onRouteSelect;
    onAddAvoidAreaRef.current = onAddAvoidArea;
    onAvoidAreaMoveRef.current = onAvoidAreaMove;
    onAvoidAreaSelectRef.current = onAvoidAreaSelect;
    onStartPointChangeRef.current = onStartPointChange;
    onEndPointChangeRef.current = onEndPointChange;
    isAddingAvoidAreaRef.current = isAddingAvoidArea;
  }, [
    onMapClick,
    onRouteSelect,
    onAddAvoidArea,
    onAvoidAreaMove,
    onAvoidAreaSelect,
    onStartPointChange,
    onEndPointChange,
    isAddingAvoidArea,
  ]);

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

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  }, []);

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

    scaleControlRef.current = L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    layersRef.current = {
      routes: L.layerGroup().addTo(map),
      markers: L.layerGroup().addTo(map),
      avoid: L.layerGroup().addTo(map),
    };

    map.on('click', (e) => {
      const point = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (isAddingAvoidAreaRef.current && onAddAvoidAreaRef.current) {
        onAddAvoidAreaRef.current(point);
        return;
      }
      if (onMapClickRef.current) {
        onMapClickRef.current(point);
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
    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      window.setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 80);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

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
      const path = route.polyline.map((point) => [point[0], point[1]] as L.LatLngExpression);
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
        line.on('click', () => onRouteSelectRef.current?.(route.id));
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
          L.polyline([path[idx], path[idx + 1]], {
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
        if (isSelected) line.bringToFront();
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
          cursor: grab;
        ">A</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([startPoint.lat, startPoint.lng], { icon: startIcon, draggable: true })
        .bindPopup(`<b>Start:</b> ${startPoint.name || 'Selected location'}`)
        .on('click', () => fitToPoints())
        .on('dragend', (event) => {
          const ll = event.target.getLatLng();
          onStartPointChangeRef.current?.({ lat: ll.lat, lng: ll.lng, name: startPoint.name || 'Start point' });
        })
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
          cursor: grab;
        ">B</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([endPoint.lat, endPoint.lng], { icon: endIcon, draggable: true })
        .bindPopup(`<b>Destination:</b> ${endPoint.name || 'Selected location'}`)
        .on('click', () => fitToPoints())
        .on('dragend', (event) => {
          const ll = event.target.getLatLng();
          onEndPointChangeRef.current?.({ lat: ll.lat, lng: ll.lng, name: endPoint.name || 'Destination' });
        })
        .addTo(layersRef.current!.markers);
    }

    if (startPoint && endPoint && mapInstanceRef.current && routes.length === 0) {
      fitToPoints();
    }
  }, [startPoint, endPoint, routes.length, fitToPoints]);

  useEffect(() => {
    if (!layersRef.current) return;
    layersRef.current.avoid.clearLayers();

    avoidAreas.forEach((area) => {
      const selected = area.id === selectedAvoidAreaId;
      const active = area.enabled;
      const stroke = active ? (selected ? '#f43f5e' : '#ef4444') : '#6b7280';
      const fill = active ? '#ef4444' : '#6b7280';

      const circle = L.circle([area.lat, area.lng], {
        radius: area.radiusM,
        color: stroke,
        weight: selected ? 2.8 : 2,
        dashArray: active ? undefined : '5,5',
        opacity: active ? 0.95 : 0.7,
        fillColor: fill,
        fillOpacity: active ? 0.14 : 0.08,
      }).addTo(layersRef.current!.avoid);
      circle.bindTooltip(`${Math.round(area.radiusM)} m`, { permanent: false, direction: 'center' });
      circle.on('click', () => onAvoidAreaSelectRef.current?.(area.id));

      const avoidIcon = L.divIcon({
        className: 'avoid-area-marker',
        html: `<div style="
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #fff;
          background: ${active ? '#ef4444' : '#6b7280'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: grab;
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([area.lat, area.lng], { icon: avoidIcon, draggable: true })
        .on('click', () => onAvoidAreaSelectRef.current?.(area.id))
        .on('dragend', (event) => {
          const ll = event.target.getLatLng();
          onAvoidAreaMoveRef.current?.(area.id, { lat: ll.lat, lng: ll.lng });
        })
        .addTo(layersRef.current!.avoid);
    });
  }, [avoidAreas, selectedAvoidAreaId]);

  useEffect(() => {
    if (routes.length === 0) return;
    fitToSelectedRoute();
  }, [routes, selectedRouteId, fitToSelectedRoute]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${isFullscreen ? 'rounded-none' : 'rounded-lg'}`}
      style={{ minHeight: isFullscreen ? '100vh' : '400px', zIndex: 0 }}
    >
      <div ref={mapRef} className="h-full w-full" />

      <div className="absolute right-3 top-3 z-[450] flex flex-col gap-2">
        <button
          onClick={fitToSelectedRoute}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/85 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-xl backdrop-blur hover:bg-card"
          title={ECO_ROUTING_TEXT.map.focusRouteTitle}
        >
          <Crosshair className="h-3.5 w-3.5" />
          {ECO_ROUTING_TEXT.map.focusRoute}
        </button>
        <button
          onClick={fitToAllRoutes}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/85 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-xl backdrop-blur hover:bg-card"
          title={ECO_ROUTING_TEXT.map.focusAllTitle}
        >
          <Layers className="h-3.5 w-3.5" />
          {ECO_ROUTING_TEXT.map.focusAll}
        </button>
        <button
          onClick={fitToPoints}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/85 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-xl backdrop-blur hover:bg-card"
          title={ECO_ROUTING_TEXT.map.focusPointsTitle}
        >
          <MapPinned className="h-3.5 w-3.5" />
          {ECO_ROUTING_TEXT.map.focusPoints}
        </button>
      </div>

      <div className="absolute left-3 top-3 z-[450] flex flex-col gap-2">
        <button
          onClick={() => setMapTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/85 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-xl backdrop-blur hover:bg-card"
          title={ECO_ROUTING_TEXT.map.toggleThemeTitle}
        >
          {mapTheme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <MoonStar className="h-3.5 w-3.5" />}
          {mapTheme === 'dark' ? ECO_ROUTING_TEXT.map.lightMode : ECO_ROUTING_TEXT.map.darkMode}
        </button>
        <button
          onClick={() => void toggleFullscreen()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/85 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-xl backdrop-blur hover:bg-card"
          title={ECO_ROUTING_TEXT.map.fullscreenTitle}
        >
          {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Expand className="h-3.5 w-3.5" />}
          {isFullscreen ? ECO_ROUTING_TEXT.map.fullscreenExit : ECO_ROUTING_TEXT.map.fullscreenEnter}
        </button>
      </div>

      <div className="absolute left-3 bottom-3 z-[450] inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/85 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-xl backdrop-blur">
        <Compass className="h-3.5 w-3.5 text-primary" />
        <span>{ECO_ROUTING_TEXT.map.compassNorth}</span>
        <span className="opacity-70">|</span>
        <span>{ECO_ROUTING_TEXT.map.scaleTitle}</span>
      </div>

      <div className="absolute right-3 bottom-3 z-[450] rounded-xl border border-border/70 bg-card/85 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-xl backdrop-blur">
        {ECO_ROUTING_TEXT.map.dragHint}
      </div>
    </div>
  );
};

export default EcoRoutingMap;
