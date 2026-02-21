import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reportsApi, transportApi } from '@/lib/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Layers, Waves, Activity, AlertCircle, Bus, Info, ChevronRight, Shield } from 'lucide-react';
import { Badge } from './ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

interface District {
  name: string;
  position: [number, number];
  trafficLevel: number;
  airQuality: number;
  population: string;
  density: string;
}

interface SmartCityMapProps {
  trafficCongestion: number;
  airQualityIndex: number;
}

// Almaty districts with more detail
const districts: District[] = [
  { name: 'Almaly', position: [43.2567, 76.9286], trafficLevel: 65, airQuality: 75, population: '215,000', density: 'High' },
  { name: 'Bostandyk', position: [43.2200, 76.9300], trafficLevel: 45, airQuality: 55, population: '343,500', density: 'Modern' },
  { name: 'Medeu', position: [43.1800, 76.9500], trafficLevel: 35, airQuality: 40, population: '210,000', density: 'Eco' },
  { name: 'Auezov', position: [43.2300, 76.8700], trafficLevel: 70, airQuality: 80, population: '295,000', density: 'Urban' },
  { name: 'Turksib', position: [43.3000, 76.9800], trafficLevel: 55, airQuality: 65, population: '235,000', density: 'Industrial' },
  { name: 'Zhetysu', position: [43.2700, 77.0200], trafficLevel: 40, airQuality: 50, population: '166,000', density: 'Suburban' },
  { name: 'Alatau', position: [43.2800, 76.8500], trafficLevel: 30, airQuality: 60, population: '260,000', density: 'Developing' },
  { name: 'Nauryzbay', position: [43.2100, 76.8200], trafficLevel: 25, airQuality: 45, population: '160,000', density: 'Fringe' },
];

const getColorForLevel = (level: number, type: 'traffic' | 'air'): string => {
  if (type === 'traffic') {
    if (level < 30) return '#22c55e';
    if (level < 60) return '#eab308';
    if (level < 80) return '#f97316';
    return '#ef4444';
  } else {
    if (level < 50) return '#22c55e';
    if (level < 100) return '#eab308';
    if (level < 150) return '#f97316';
    return '#ef4444';
  }
};

const SmartCityMap: React.FC<SmartCityMapProps> = ({ trafficCongestion, airQualityIndex }) => {
  const { actualTheme } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const districtLayerRef = useRef<L.LayerGroup | null>(null);
  const reportLayerRef = useRef<L.LayerGroup | null>(null);
  const busLayerRef = useRef<L.LayerGroup | null>(null);
  const emergencyLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  const [layers, setLayers] = useState({
    districts: true,
    reports: true,
    buses: true,
    emergency: true,
    heatmap: false
  });

  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([43.2389, 76.9286], 12);

    mapInstanceRef.current = map;
    districtLayerRef.current = L.layerGroup().addTo(map);
    reportLayerRef.current = L.layerGroup().addTo(map);
    busLayerRef.current = L.layerGroup().addTo(map);
    emergencyLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);

    const tileLayer = L.tileLayer(`https://{s}.basemaps.cartocdn.com/${actualTheme === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`, {
      attribution: '&copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer and Layers visibility
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const newUrl = `https://{s}.basemaps.cartocdn.com/${actualTheme === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`;
    tileLayerRef.current.setUrl(newUrl);

    if (layers.districts) districtLayerRef.current?.addTo(mapInstanceRef.current); else districtLayerRef.current?.remove();
    if (layers.reports) reportLayerRef.current?.addTo(mapInstanceRef.current); else reportLayerRef.current?.remove();
    if (layers.buses) busLayerRef.current?.addTo(mapInstanceRef.current); else busLayerRef.current?.remove();
    if (layers.emergency) emergencyLayerRef.current?.addTo(mapInstanceRef.current); else emergencyLayerRef.current?.remove();
    if (layers.heatmap) heatmapLayerRef.current?.addTo(mapInstanceRef.current); else heatmapLayerRef.current?.remove();
  }, [actualTheme, layers]);

  // Update Districts & Reports & Buses
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 1. Districts
    districtLayerRef.current!.clearLayers();
    districts.forEach((district) => {
      const realTraffic = Math.min(100, Math.max(0, district.trafficLevel + (trafficCongestion - 50) * 0.3));
      const realAir = Math.min(150, Math.max(0, district.airQuality + (airQualityIndex - 50) * 0.3));

      const circle = L.circle(district.position as [number, number], {
        color: getColorForLevel(realTraffic, 'traffic'),
        fillColor: getColorForLevel(realTraffic, 'traffic'),
        fillOpacity: 0.1,
        radius: 2000,
        weight: 1,
      });

      circle.on('click', () => setSelectedDistrict(district));
      circle.addTo(districtLayerRef.current!);

      const labelIcon = L.divIcon({
        className: 'district-label',
        html: `<div style="color:${actualTheme === 'dark' ? 'white' : 'black'}; font-size:10px; font-weight:bold; text-shadow:${actualTheme === 'dark' ? '0 0 4px black' : '0 0 4px white'}; opacity:0.6">${district.name}</div>`,
        iconSize: [40, 10],
        iconAnchor: [20, 5]
      });
      L.marker(district.position as [number, number], { icon: labelIcon, interactive: false }).addTo(districtLayerRef.current!);
    });

    // 2. Reports
    const loadReports = async () => {
      try {
        const reports = await reportsApi.getAll();
        reportLayerRef.current!.clearLayers();
        reports.forEach((r: any) => {
          if (r.lat && r.lng) {
            const icon = L.divIcon({
              className: 'report-marker',
              html: `<div style="background:#ef4444; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(239, 68, 68, 0.4); animation: pulse 2s infinite;"></div>`,
              iconSize: [12, 12]
            });

            L.marker([r.lat, r.lng], { icon })
              .addTo(reportLayerRef.current!)
              .bindPopup(`
                <div style="font-family:sans-serif; min-width:150px">
                  <b style="color:#ef4444">${r.category}</b><br/>
                  <p style="margin:4px 0">${r.description}</p>
                  <small style="color:gray">${new Date(r.created_at).toLocaleDateString()}</small>
                </div>
              `);
          }
        });
      } catch (e) { }
    };

    // 3. Buses
    const loadBuses = async () => {
      try {
        const buses = await transportApi.getBuses();
        busLayerRef.current!.clearLayers();
        buses.forEach((bus: any) => {
          const occupancyColor = bus.occupancy > 80 ? '#ef4444' : bus.occupancy > 50 ? '#f97316' : '#22c55e';
          const vehicleColor = bus.vehicle_type === 'MINIBUS' ? '#f59e0b' : '#3b82f6';

          const icon = L.divIcon({
            className: 'vehicle-marker',
            html: `
              <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                <div style="background:${vehicleColor}; width:18px; height:18px; border-radius:${bus.vehicle_type === 'MINIBUS' ? '50%' : '4px'}; border:2px solid white; box-shadow:0 0 10px ${vehicleColor}80; display:flex; align-items:center; justify-center; color:white; font-size:8px; font-weight:900; font-family:monospace;">
                  ${bus.route_number}
                </div>
                <div style="width:2px; height:2px; background:${occupancyColor}; border-radius:50%; position:absolute; top:-4px; right:-4px; border:1px solid white;"></div>
                <div style="width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-top:4px solid white;"></div>
              </div>
            `,
            iconSize: [20, 25],
            iconAnchor: [10, 25]
          });
          L.marker([bus.lat, bus.lng], { icon })
            .addTo(busLayerRef.current!)
            .bindPopup(`
              <div style="font-family:sans-serif; padding:4px">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:4px">
                  <b style="font-size:14px">${bus.vehicle_type === 'MINIBUS' ? 'Marshrutka' : 'Bus'} #${bus.route_number}</b>
                  <span style="background:${occupancyColor}20; color:${occupancyColor}; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold">
                    ${bus.occupancy}% LOAD
                  </span>
                </div>
                <div style="font-size:11px; color:#666">
                  📍 GEO: ${bus.lat.toFixed(6)}, ${bus.lng.toFixed(6)}<br/>
                  ❄️ AC: ${bus.has_ac ? 'Active' : 'Offline'}<br/>
                  📡 WiFi: ${bus.has_wifi ? 'Connected' : 'N/A'}<br/>
                  🔋 Type: ${bus.is_eco ? 'Electric' : 'Diesel'}
                </div>
              </div>
            `);
        });
      } catch (e) { }
    };

    // 4. Emergency Units
    const loadEmergencyUnits = async () => {
      try {
        const units = await fetch('http://localhost:8000/api/emergency/units').then(r => r.json());
        emergencyLayerRef.current!.clearLayers();
        units.forEach((unit: any) => {
          const color = unit.type === 'POLICE' ? '#4f46e5' : unit.type === 'FIRE' ? '#f97316' : '#ef4444';
          const icon = L.divIcon({
            className: 'emergency-marker',
            html: `
              <div style="background:${color}; width:24px; height:24px; border-radius:50%; border:2px solid white; box-shadow:0 0 15px ${color}80; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; animation: pulse 1s infinite alternate;">
                ${unit.type[0]}
              </div>
            `,
            iconSize: [24, 24]
          });
          L.marker([unit.lat, unit.lng], { icon })
            .addTo(emergencyLayerRef.current!)
            .bindPopup(`<b>${unit.type} UNIT</b><br/>Status: ${unit.status}`);
        });
      } catch (e) { }
    };

    const loadHeatmap = () => {
      heatmapLayerRef.current!.clearLayers();
      // Simulation: 10 predictive "risk zones"
      for (let i = 0; i < 10; i++) {
        const lat = 43.18 + Math.random() * 0.12;
        const lng = 76.82 + Math.random() * 0.18;
        L.circle([lat, lng], {
          radius: 1200 + Math.random() * 800,
          fillColor: '#ef4444',
          fillOpacity: 0.15,
          color: 'transparent',
          interactive: false,
          className: 'heatmap-pulse'
        }).addTo(heatmapLayerRef.current!);
      }
    };

    loadReports();
    loadBuses();
    loadEmergencyUnits();
    loadHeatmap();

    const interval = setInterval(() => {
      loadBuses();
      loadEmergencyUnits();
    }, 4000);

    return () => clearInterval(interval);

  }, [trafficCongestion, airQualityIndex]);

  return (
    <div className="relative group">
      <div
        ref={mapRef}
        className="h-[400px] w-full rounded-none overflow-hidden"
        style={{ zIndex: 0 }}
      />

      {/* Map Control UI Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <Card className="p-2 glass border-white/10 flex flex-col gap-1 backdrop-blur-md">
          <Button
            variant={layers.districts ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setLayers(l => ({ ...l, districts: !l.districts }))}
            title="Toggle Districts"
          >
            <Layers className="h-4 w-4" />
          </Button>
          <Button
            variant={layers.reports ? "destructive" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setLayers(l => ({ ...l, reports: !l.reports }))}
            title="Toggle Reports"
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
          <Button
            variant={layers.buses ? "default" : "ghost"}
            size="icon"
            className={`h-8 w-8 ${layers.buses ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            onClick={() => setLayers(l => ({ ...l, buses: !l.buses }))}
            title="Toggle Transport Fleet"
          >
            <Bus className="h-4 w-4" />
          </Button>
          <Button
            variant={layers.emergency ? "default" : "ghost"}
            size="icon"
            className={`h-8 w-8 ${layers.emergency ? 'bg-red-600 hover:bg-red-700' : ''}`}
            onClick={() => setLayers(l => ({ ...l, emergency: !l.emergency }))}
            title="Toggle Emergency Units"
          >
            <Shield className="h-4 w-4" />
          </Button>
          <Button
            variant={layers.heatmap ? "default" : "ghost"}
            size="icon"
            className={`h-8 w-8 ${layers.heatmap ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}`}
            onClick={() => setLayers(l => ({ ...l, heatmap: !l.heatmap }))}
            title="Predictive Risk Heatmap"
          >
            <Waves className="h-4 w-4" />
          </Button>
        </Card>
      </div>

      {selectedDistrict && (
        <div className="absolute bottom-4 right-4 z-[1000] w-64 animate-in slide-in-from-right duration-300">
          <Card className="glass border-border p-4 relative overflow-hidden card-3d">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => setSelectedDistrict(null)}
            >
              <Activity className="h-3 w-3" />
            </Button>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-sm tracking-tight">{selectedDistrict.name} District</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-muted-foreground">
              <div className="bg-muted/50 p-2 rounded-lg">
                <div className="opacity-50 mb-1">Pop. Size</div>
                <div className="text-foreground">{selectedDistrict.population}</div>
              </div>
              <div className="bg-muted/50 p-2 rounded-lg">
                <div className="opacity-50 mb-1">Density</div>
                <div className="text-foreground">{selectedDistrict.density}</div>
              </div>
            </div>
            <Button className="w-full mt-3 h-8 text-[10px] uppercase tracking-widest" variant="outline">Detailed Stats</Button>
          </Card>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass px-3 py-1.5 rounded-lg border border-border text-[9px] font-mono text-muted-foreground uppercase tracking-tighter pointer-events-none">
        Live Almaty Sensor Network V5.0
      </div>
    </div>
  );
};

export default SmartCityMap;
