import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export const CityVisualization = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?v=weekly&libraries=places';
    script.async = true;
    script.defer = true;

    const initMap = () => {
      if (!mapRef.current || !(window as any).google) return;

      const mapOptions = {
        center: { lat: 43.2389, lng: 76.9286 },
        zoom: 16.5,
        mapTypeId: 'roadmap',
        tilt: 67.5,
        heading: 30,
        mapId: '90f87356969d889c',
        disableDefaultUI: false,
        gestureHandling: 'greedy',
        zoomControl: true,
        rotateControl: true,
        fullscreenControl: false,
      };

      new (window as any).google.maps.Map(mapRef.current, mapOptions);
    };

    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <Card className="overflow-hidden shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Almaty 3D City View
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Interactive 3D map of Almaty city center
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapRef} className="w-full h-96" />
      </CardContent>
    </Card>
  );
};
