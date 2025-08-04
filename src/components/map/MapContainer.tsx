
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Battery, Brain } from "lucide-react";
import UserLocationMarker from './UserLocationMarker';
import StationMarkers from './StationMarkers';
import useNavigationSystem from './NavigationSystem';
import MapLegend from './MapLegend';

interface MapContainerProps {
  stations: any[];
  selectedStation: any;
  onStationSelect: (station: any) => void;
  filterType: string;
  isModelReady: boolean;
  currentTime: Date;
  getPredictionData: (stationId: number) => any;
  getHeatColor: (stationId: number) => string;
  userLocation?: [number, number];
  onUserLocationChange?: (location: [number, number]) => void;
}

const MapContainer = ({ 
  stations, 
  selectedStation, 
  onStationSelect, 
  filterType, 
  isModelReady, 
  currentTime,
  getPredictionData,
  getHeatColor,
  userLocation: externalUserLocation = [12.9716, 77.5946],
  onUserLocationChange
}: MapContainerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  const [userLocation, setUserLocation] = useState<[number, number]>(externalUserLocation);
  const [showRoute, setShowRoute] = useState(false);
  const [activeRoute, setActiveRoute] = useState<any>(null);

  // Initialize navigation system
  const { navigateToStation, clearRoute, calculateDistance } = useNavigationSystem({
    map: mapInstanceRef.current,
    userLocation,
    onRouteChange: (route) => {
      setActiveRoute(route);
      setShowRoute(!!route);
    }
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([12.9716, 77.5946], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync external userLocation changes with internal state
  useEffect(() => {
    setUserLocation(externalUserLocation);
  }, [externalUserLocation]);

  // Handle user location changes
  const handleUserLocationChange = (newLocation: [number, number]) => {
    setUserLocation(newLocation);
    
    // Notify parent component about location change
    if (onUserLocationChange) {
      onUserLocationChange(newLocation);
    }
    
    // Update route if one is active
    if (activeRoute) {
      navigateToStation(activeRoute);
    }
  };

  // Handle route clearing
  const handleClearRoute = () => {
    clearRoute();
    setShowRoute(false);
    setActiveRoute(null);
  };

  // Expose navigation functions globally for popup buttons
  useEffect(() => {
    (window as any).navigateToStation = (stationId: number) => {
      const station = stations.find(s => s.id === stationId);
      if (station) {
        navigateToStation(station);
        onStationSelect(station);
      }
    };

    (window as any).clearRoute = () => {
      handleClearRoute();
    };

    // Add Google Maps integration with proper from/to coordinates
    (window as any).openInGoogleMaps = (lat: number, lng: number, name: string) => {
      const fromLat = userLocation[0];
      const fromLng = userLocation[1];
      const url = `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}&travelmode=driving`;
      window.open(url, '_blank');
    };
  }, [stations, navigateToStation, onStationSelect, userLocation]);

  return (
    <Card className="h-[600px] bg-white/70 backdrop-blur-sm border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-green-600" />
            Smart Prediction Map
          </CardTitle>
          <div className="flex gap-2">
            {showRoute && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearRoute}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Clear Route
              </Button>
            )}
            <Button
              size="sm"
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => console.log('Filter: all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterType === "fast-charging" ? "default" : "outline"}
              onClick={() => console.log('Filter: fast-charging')}
            >
              <Zap className="w-4 h-4 mr-1" />
              Fast
            </Button>
            <Button
              size="sm"
              variant={filterType === "battery-swap" ? "default" : "outline"}
              onClick={() => console.log('Filter: battery-swap')}
            >
              <Battery className="w-4 h-4 mr-1" />
              Swap
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full p-4">
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          <div
            ref={mapRef}
            className="absolute inset-0 w-full h-full"
            style={{ height: '100%' }}
          />
          
          <UserLocationMarker
            map={mapInstanceRef.current}
            userLocation={userLocation}
            onLocationChange={handleUserLocationChange}
          />

          <StationMarkers
            map={mapInstanceRef.current}
            stations={stations}
            selectedStation={selectedStation}
            onStationSelect={onStationSelect}
            isModelReady={isModelReady}
            getPredictionData={getPredictionData}
            userLocation={userLocation}
            activeRoute={activeRoute}
            calculateDistance={calculateDistance}
          />

          <MapLegend
            userLocation={userLocation}
            showRoute={showRoute}
            activeRoute={activeRoute}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MapContainer;
