import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Route,
  RoutePoint,
  getTrafficHeatmapData,
  getAirQualityHeatmapData,
  calculateDistance
} from '@/lib/routingEngine';

interface EcoRoutingMapProps {
  routes: Route[];
  startPoint: RoutePoint | null;
  endPoint: RoutePoint | null;
  showTraffic: boolean;
  showAirQuality: boolean;
  onMapClick?: (point: RoutePoint) => void;
  selectedRouteId?: string;
}

const EcoRoutingMap: React.FC<EcoRoutingMapProps> = ({
  routes,
  startPoint,
  endPoint,
  showTraffic,
  showAirQuality,
  onMapClick,
  selectedRouteId,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    traffic: L.LayerGroup;
    airQuality: L.LayerGroup;
    routes: L.LayerGroup;
    markers: L.LayerGroup;
  } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [43.2389, 76.9286],
      zoom: 12,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    // Add dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      maxZoom: 20,
    }).addTo(map);

    // Initialize layer groups
    layersRef.current = {
      traffic: L.layerGroup().addTo(map),
      airQuality: L.layerGroup().addTo(map),
      routes: L.layerGroup().addTo(map),
      markers: L.layerGroup().addTo(map),
    };

    // Click handler
    map.on('click', (e) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update traffic heatmap
  useEffect(() => {
    if (!layersRef.current) return;
    layersRef.current.traffic.clearLayers();
  }, [showTraffic]);

  // Update air quality overlay
  useEffect(() => {
    if (!layersRef.current) return;
    layersRef.current.airQuality.clearLayers();
  }, [showAirQuality]);

  // Update routes
  useEffect(() => {
    if (!layersRef.current) return;

    layersRef.current.routes.clearLayers();

    routes.forEach((route, index) => {
      const isSelected = route.id === selectedRouteId || (!selectedRouteId && route.type === 'recommended');
      const isRecommended = route.type === 'recommended';

      // Build path from segments
      const path: L.LatLngExpression[] = [];
      route.segments.forEach((segment, segIndex) => {
        if (segIndex === 0) {
          path.push([segment.start.lat, segment.start.lng]);
        }
        path.push([segment.end.lat, segment.end.lng]);
      });

      // Route line styling - shadow/glow
      if (isSelected) {
        L.polyline(path, {
          color: isRecommended ? '#00e5ff' : '#94a3b8',
          weight: 15,
          opacity: 0.2,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layersRef.current!.routes);
      }

      const polyline = L.polyline(path, {
        color: isRecommended ? '#00e5ff' : '#64748b',
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 1 : 0.4,
        dashArray: isRecommended ? undefined : '10, 10',
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Add tooltip with segment info
      const timeMin = Math.round(route.totalTime / 60);
      const distKm = (route.totalDistance / 1000).toFixed(1);

      polyline.bindTooltip(`
        <div style="padding: 10px; min-width: 160px; color: #1e293b; background: white; border-radius: 12px; font-family: sans-serif;">
          <div style="font-weight: 800; margin-bottom: 6px; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
            ${isRecommended ? '✨ OPTIMAL' : 'ALTERNATIVE'} PATH
          </div>
          <div style="font-size: 11px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between;"><span>📍 Distance:</span> <b>${distKm} km</b></div>
            <div style="display: flex; justify-content: space-between;"><span>⏱️ Est. Time:</span> <b>~${timeMin} min</b></div>
            <div style="display: flex; justify-content: space-between;"><span>🚗 Traffic:</span> <b>${route.avgTraffic}%</b></div>
            <div style="display: flex; justify-content: space-between;"><span>💨 AQI Index:</span> <b>${route.avgAirQuality}</b></div>
          </div>
        </div>
      `, {
        sticky: true,
        className: 'route-tooltip',
      });

      polyline.addTo(layersRef.current!.routes);

      // Segment indicators removed for cleanliness as requested
    });
  }, [routes, selectedRouteId]);

  // Update markers
  useEffect(() => {
    if (!layersRef.current) return;

    layersRef.current.markers.clearLayers();

    // Start marker
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
        .addTo(layersRef.current!.markers);
    }

    // End marker
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
        .addTo(layersRef.current!.markers);
    }

    // Fit bounds if both points exist
    if (startPoint && endPoint && mapInstanceRef.current) {
      const bounds = L.latLngBounds(
        [startPoint.lat, startPoint.lng],
        [endPoint.lat, endPoint.lng]
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [startPoint, endPoint]);

  return (
    <div
      ref={mapRef}
      className="h-full w-full rounded-lg overflow-hidden"
      style={{ minHeight: '400px', zIndex: 0 }}
    />
  );
};

export default EcoRoutingMap;
