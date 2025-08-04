import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Battery, Brain, Maximize2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMapboxHeatmap } from '@/hooks/useMapboxHeatmap';
import MapboxUserMarker from './MapboxUserMarker';
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXNobWlzdGV5IiwiYSI6ImNtZDQ3Z2N2YTBkYjQya3M5NjB3OWdxcjEifQ.6KP8mbUlAPx960akGAqsqw';
interface MapboxContainerProps {
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
  onRouteChange?: (route: any, routeInfo: {
    distance: string;
    duration: string;
  } | null) => void;
  smartRoute?: any;
}
const MapboxContainer = ({
  stations,
  selectedStation,
  onStationSelect,
  filterType,
  isModelReady,
  currentTime,
  getPredictionData,
  getHeatColor,
  userLocation = [12.9716, 77.5946],
  onUserLocationChange,
  onRouteChange,
  smartRoute
}: MapboxContainerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeLayerRef = useRef<string | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<any>(null);

  // Add heatmap functionality
  const {
    heatmapLayerId
  } = useMapboxHeatmap(mapInstanceRef.current, stations, getPredictionData);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [userLocation[1], userLocation[0]],
        zoom: 12,
        attributionControl: false
      });
      map.on('load', () => {
        setMapLoaded(true);
      });

      // Add minimal navigation controls
      map.addControl(new mapboxgl.NavigationControl({
        showCompass: false,
        visualizePitch: false
      }), 'top-right');
      mapInstanceRef.current = map;
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (error) {
      console.error('Map initialization error:', error);
    }
  }, []);

  // Handle smart route visualization and destination marker
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Clear existing destination marker first
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

    // Clear existing route layers and sources
    if (routeLayerRef.current) {
      try {
        if (mapInstanceRef.current.getLayer(routeLayerRef.current)) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }
        if (mapInstanceRef.current.getLayer(`${routeLayerRef.current}-glow`)) {
          mapInstanceRef.current.removeLayer(`${routeLayerRef.current}-glow`);
        }
        if (mapInstanceRef.current.getSource(routeLayerRef.current)) {
          mapInstanceRef.current.removeSource(routeLayerRef.current);
        }
      } catch (error) {
        console.log('Route cleanup error (expected):', error);
      }
      routeLayerRef.current = null;
    }

    // If no smart route, just clear everything and return
    if (!smartRoute) {
      console.log('🗺️ Clearing route visualization');
      return;
    }
    console.log('🗺️ Displaying smart route:', smartRoute);

    // Clear existing route and glow
    if (routeLayerRef.current) {
      try {
        if (mapInstanceRef.current.getLayer(routeLayerRef.current)) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }
        if (mapInstanceRef.current.getLayer(`${routeLayerRef.current}-glow`)) {
          mapInstanceRef.current.removeLayer(`${routeLayerRef.current}-glow`);
        }
        if (mapInstanceRef.current.getSource(routeLayerRef.current)) {
          mapInstanceRef.current.removeSource(routeLayerRef.current);
        }
      } catch (error) {
        console.log('Route cleanup error (expected):', error);
      }
    }
    try {
      const routeId = `smart-route-${Date.now()}`;

      // Use route geometry as-is from Mapbox (already starts from user location)
      let routeGeometry;
      if (smartRoute.geometry) {
        // Use the existing geometry directly - Mapbox already provides correct route
        routeGeometry = smartRoute.geometry;
      } else if (smartRoute.segments && smartRoute.segments.length > 0) {
        // Build route from segments, ensuring it starts from current user location
        const coordinates: [number, number][] = [];

        // Always start from current user location
        coordinates.push([userLocation[1], userLocation[0]]);

        // Add segment coordinates
        smartRoute.segments.forEach((segment: any) => {
          coordinates.push([segment.to[1], segment.to[0]]);
        });
        routeGeometry = {
          type: 'LineString',
          coordinates
        };
      } else {
        console.warn('No route geometry available');
        return;
      }
      console.log('📍 Route geometry:', routeGeometry);

      // Add smart route to map
      mapInstanceRef.current.addSource(routeId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            strategy: smartRoute.strategy
          },
          geometry: routeGeometry
        }
      });

      // Get color based on route strategy with more vibrant colors
      const getRouteColor = (strategy: string) => {
        switch (strategy) {
          case 'fastest':
            return '#22C55E';
          // Bright Green
          case 'shortest':
            return '#3B82F6';
          // Bright Blue  
          case 'least-traffic':
            return '#8B5CF6';
          // Bright Purple
          default:
            return '#10B981';
          // Default emerald
        }
      };

      // Add route line with glow effect
      mapInstanceRef.current.addLayer({
        id: `${routeId}-glow`,
        type: 'line',
        source: routeId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': getRouteColor(smartRoute.strategy || 'fastest'),
          'line-width': 12,
          'line-opacity': 0.3,
          'line-blur': 2
        }
      });
      mapInstanceRef.current.addLayer({
        id: routeId,
        type: 'line',
        source: routeId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': getRouteColor(smartRoute.strategy || 'fastest'),
          'line-width': 6,
          'line-opacity': 0.9
        }
      });
      routeLayerRef.current = routeId;

      // Add red destination marker at the end of the route
      const coordinates = routeGeometry.coordinates;
      if (coordinates && coordinates.length > 0) {
        const destinationCoord = coordinates[coordinates.length - 1];

        // Create red destination marker element
        const destinationElement = document.createElement('div');
        destinationElement.innerHTML = `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              width: 40px;
              height: 40px;
              background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 70%, transparent 100%);
              border-radius: 50%;
              animation: pulse 2s infinite;
            "></div>
            <div style="
              position: absolute;
              top: 8px;
              left: 8px;
              width: 24px;
              height: 24px;
              background: linear-gradient(45deg, #ef4444, #dc2626);
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              cursor: pointer;
            ">
              📍
            </div>
          </div>
        `;

        // Create destination marker
        const destinationMarker = new mapboxgl.Marker({
          element: destinationElement
        }).setLngLat([destinationCoord[0], destinationCoord[1]]).addTo(mapInstanceRef.current);
        destinationMarkerRef.current = destinationMarker;

        // Fit map to include both user location and route
        const allCoords = [[userLocation[1], userLocation[0]], ...coordinates];
        const bounds = allCoords.reduce((bounds: mapboxgl.LngLatBounds, coord: number[]) => {
          return bounds.extend(coord as [number, number]);
        }, new mapboxgl.LngLatBounds(allCoords[0], allCoords[0]));
        mapInstanceRef.current.fitBounds(bounds, {
          padding: 80,
          maxZoom: 14
        });
      }
      console.log('✅ Route and destination marker displayed successfully');
    } catch (error) {
      console.error('❌ Error displaying smart route:', error);
    }
  }, [smartRoute, mapLoaded, userLocation]);

  // Handle user location changes for routing
  useEffect(() => {
    if (selectedStation && currentRoute) {
      handleSmartRouting(selectedStation);
    }
  }, [userLocation]);

  // Update station markers with distinct icons and vibrant colors
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    stations.forEach(station => {
      const prediction = getPredictionData(station.id);

      // Get station type icon and colors
      const getStationIcon = (type: string) => {
        switch (type) {
          case 'fast-charging':
            return '⚡';
          case 'battery-swap':
            return '🔋';
          default:
            return '🔋';
        }
      };

      // Get vibrant availability colors
      const getAvailabilityColor = (availability: number, usage: number) => {
        if (availability === 0) return '#FF0000'; // Bright red for no availability
        if (usage > 0.8) return '#FF6B00'; // Bright orange for high usage
        if (usage > 0.5) return '#FFD700'; // Bright yellow for medium usage
        return '#00FF00'; // Bright green for low usage
      };
      const availabilityColor = getAvailabilityColor(prediction.availability, prediction.predictedUsage);
      const stationIcon = getStationIcon(station.type);
      const isRectangle = station.type === 'battery-swap';

      // Enhanced marker design with distinct shapes for different types
      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
        <div style="
          position: relative;
          width: 24px;
          height: 24px;
          cursor: pointer;
          transform-origin: center;
          transition: all 0.3s ease;
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 24px;
            height: 24px;
            background: ${availabilityColor};
            border-radius: ${isRectangle ? '4px' : '50%'};
            opacity: 0.3;
            animation: pulse 2s infinite;
          "></div>
          <div style="
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background: white;
            border: 3px solid ${availabilityColor};
            border-radius: ${isRectangle ? '3px' : '50%'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            font-weight: bold;
          ">${stationIcon}</div>
        </div>
      `;

      // Add CSS animation if not already added
      if (!document.getElementById('station-marker-styles')) {
        const style = document.createElement('style');
        style.id = 'station-marker-styles';
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.1; }
            100% { transform: scale(1); opacity: 0.3; }
          }
        `;
        document.head.appendChild(style);
      }

      // Smooth hover effects without interfering with marker visibility
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)';
        markerElement.style.zIndex = '100';
        markerElement.style.transition = 'all 0.2s ease';
      });
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
        markerElement.style.zIndex = '10';
      });
      const marker = new mapboxgl.Marker({
        element: markerElement
      }).setLngLat([station.lng, station.lat]).addTo(mapInstanceRef.current!);

      // Simplified popup with only location name and available ports
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
        className: 'station-popup'
      }).setHTML(`
        <div style="
          padding: 8px 12px; 
          font-size: 13px; 
          min-width: 140px;
          background: white;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 1px solid #e2e8f0;
        ">
          <div style="font-weight: bold; margin-bottom: 4px; color: #1a1a1a;">
            ${station.name}
          </div>
          <div style="color: ${availabilityColor}; font-weight: 600; font-size: 12px;">
            ${prediction.availability} ports available
          </div>
        </div>
      `);

      // Attach popup to marker but don't auto-open
      marker.setPopup(popup);

      // Manual popup control for better stability
      markerElement.addEventListener('mouseenter', () => {
        popup.addTo(mapInstanceRef.current!);
      });
      markerElement.addEventListener('mouseleave', () => {
        popup.remove();
      });
      marker.getElement().addEventListener('click', () => onStationSelect(station));
      markersRef.current.push(marker);
    });
  }, [mapLoaded, stations, getPredictionData, onStationSelect]);

  // Calculate distance using Haversine formula
  const calculateDistance = (from: [number, number], to: [number, number]): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (to[0] - from[0]) * Math.PI / 180;
    const dLon = (to[1] - from[1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(from[0] * Math.PI / 180) * Math.cos(to[0] * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get battery data from parent component (simplified)
  const getBatteryData = () => ({
    currentBatteryLevel: 65,
    // This should come from parent
    totalRange: 312,
    usableRange: Math.round(65 / 100 * 312 * 0.9) // 10% reserve
  });

  // Find charging station on route
  const findChargingStationOnRoute = (from: [number, number], to: [number, number]) => {
    const directDistance = calculateDistance(from, to);
    return stations.filter(station => {
      const toStation = calculateDistance(from, [station.lat, station.lng]);
      const fromStation = calculateDistance([station.lat, station.lng], to);
      return toStation + fromStation <= directDistance * 1.3; // 30% detour max
    }).sort((a, b) => {
      const distA = calculateDistance(from, [a.lat, a.lng]);
      const distB = calculateDistance(from, [b.lat, b.lng]);
      return distA - distB;
    })[0];
  };

  // Smart routing with battery awareness
  const handleSmartRouting = async (destination: any) => {
    if (!mapInstanceRef.current) return;
    const batteryData = getBatteryData();
    const distanceToDestination = calculateDistance(userLocation, [destination.lat, destination.lng]);

    // Clear existing route
    if (routeLayerRef.current && mapInstanceRef.current.getLayer(routeLayerRef.current)) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      mapInstanceRef.current.removeSource(routeLayerRef.current);
    }
    try {
      let waypoints = `${userLocation[1]},${userLocation[0]};${destination.lng},${destination.lat}`;
      let needsCharging = distanceToDestination > batteryData.usableRange;
      if (needsCharging) {
        const chargingStation = findChargingStationOnRoute(userLocation, [destination.lat, destination.lng]);
        if (chargingStation) {
          waypoints = `${userLocation[1]},${userLocation[0]};${chargingStation.lng},${chargingStation.lat};${destination.lng},${destination.lat}`;
          toast({
            title: "⚡ Charging Stop Required",
            description: `Battery low. Routing via ${chargingStation.name} for recharge.`,
            duration: 4000
          });
        }
      }
      const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${MAPBOX_TOKEN}`);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeId = `route-${Date.now()}`;

        // Add route to map
        mapInstanceRef.current.addSource(routeId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });
        mapInstanceRef.current.addLayer({
          id: routeId,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#00FFAB',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });
        routeLayerRef.current = routeId;

        // Fit map to route
        const coordinates = route.geometry.coordinates;
        const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: number[]) => {
          return bounds.extend(coord as [number, number]);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        mapInstanceRef.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
        const distance = (route.distance / 1000).toFixed(1);
        const duration = Math.round(route.duration / 60);
        const routeInfo = {
          distance: `${distance} km`,
          duration: `${duration} min`,
          needsCharging
        };
        setCurrentRoute(routeInfo);

        // Notify parent component about route change
        if (onRouteChange) {
          onRouteChange(destination, {
            distance: `${distance} km`,
            duration: `${duration} min`
          });
        }
      }
    } catch (error) {
      console.error('Routing error:', error);
      toast({
        title: "Route Error",
        description: "Unable to calculate route. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle station selection
  useEffect(() => {
    if (selectedStation) {
      handleSmartRouting(selectedStation);
    }
  }, [selectedStation]);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  return <Card className="bg-white/90 backdrop-blur-sm border-0" style={{
    height: isFullscreen ? '100vh' : '600px'
  }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-sm">
            
            Smart EV Navigation
          </CardTitle>
          <div className="flex gap-2 items-center">
            {/* Heatmap legend */}
            <div className="flex items-center text-xs gap-2 mr-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Med</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>High</span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={toggleFullscreen} className="h-8 px-2">
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {currentRoute && <div className="text-xs text-gray-600 flex gap-4 font-medium">
            <span className="text-blue-600">📍 {currentRoute.distance}</span>
            <span className="text-green-600">⏱️ {currentRoute.duration}</span>
            {currentRoute.needsCharging && <span className="text-orange-600">⚡ Charging stop</span>}
          </div>}
      </CardHeader>
      <CardContent className="p-0 relative" style={{
      height: isFullscreen ? 'calc(100vh - 80px)' : '520px'
    }}>
        {!mapLoaded && <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading heatmap...</p>
            </div>
          </div>}
        
        <div ref={mapRef} className="absolute inset-0 w-full h-full rounded-b-lg" />
        
        {/* User location marker */}
        <MapboxUserMarker map={mapInstanceRef.current} userLocation={userLocation} onLocationChange={onUserLocationChange || (() => {})} />
      </CardContent>
    </Card>;
};
export default MapboxContainer;