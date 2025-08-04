
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSmartEVRouting } from "@/hooks/useSmartEVRouting";
import { useEVBattery } from "@/hooks/useEVBattery";
import { stationDisplayData } from "@/data/stationData";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Navigation, 
  MapPin, 
  Zap, 
  Clock, 
  Battery,
  Route,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const RouteOptimizer = () => {
  const [destination, setDestination] = useState("");
  const [startLocation, setStartLocation] = useState("Bangalore, Karnataka");
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation] = useState<[number, number]>([12.9716, 77.5946]);
  
  // Use actual hooks
  const { batteryData, updateBatteryLevel, canReachDestination, getUsableRange } = useEVBattery();
  const { currentRoute, isCalculating, calculateSmartRoute, clearRoute } = useSmartEVRouting();

  // Mock destination coordinates for demo (normally would use geocoding)
  const getDestinationCoords = (dest: string): [number, number] => {
    const destinations: Record<string, [number, number]> = {
      "mysore": [12.2958, 76.6394],
      "chennai": [13.0827, 80.2707],
      "mumbai": [19.0760, 72.8777],
      "pune": [18.5204, 73.8567],
      "goa": [15.2993, 74.1240]
    };
    const key = dest.toLowerCase();
    return destinations[key] || [12.8456, 77.6603]; // Default to Electronic City
  };

  // Initialize Mapbox when route is calculated
  useEffect(() => {
    if (currentRoute && mapContainer.current && !map.current) {
      mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: userLocation.slice().reverse() as [number, number],
        zoom: 10
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    if (currentRoute && map.current) {
      visualizeRoute();
    }
  }, [currentRoute]);

  const visualizeRoute = () => {
    if (!map.current || !currentRoute) return;

    console.log('🗺️ Visualizing route:', currentRoute);
    console.log('🔍 Route geometry:', currentRoute.geometry);

    // Clear existing markers and layers
    const existingMarkers = document.querySelectorAll('.custom-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Remove existing route layers
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }

    const destinationCoords = getDestinationCoords(destination);

    // Add start marker (green)
    const startMarker = new mapboxgl.Marker({ 
      color: '#10b981',
      scale: 1.2
    })
      .setLngLat(userLocation.slice().reverse() as [number, number])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Start Location</strong><br>Your current position'))
      .addTo(map.current);

    // Add destination marker (red)
    const destMarker = new mapboxgl.Marker({ 
      color: '#ef4444',
      scale: 1.2
    })
      .setLngLat(destinationCoords.slice().reverse() as [number, number])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>Destination</strong><br>${destination}`))
      .addTo(map.current);

    // Add charging station markers if needed
    if (currentRoute.needsCharging && currentRoute.chargingStops.length > 0) {
      currentRoute.chargingStops.forEach((station, index) => {
        const stationMarker = new mapboxgl.Marker({ 
          color: '#3b82f6',
          scale: 1.0
        })
          .setLngLat([station.lng, station.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <strong>${station.name}</strong><br>
            ${station.location}<br>
            <span style="color: #f59e0b;">⚡ ${station.type}</span><br>
            Status: ${station.status}<br>
            ML Score: ${station.mlScore}/100
          `))
          .addTo(map.current!);
      });
    }

    // Use the geometry from the smart route calculation (which already follows roads)
    if (currentRoute.geometry && currentRoute.geometry.coordinates && currentRoute.geometry.coordinates.length > 0) {
      const routeColor = currentRoute.strategy === 'fastest' ? '#10b981' : 
                        currentRoute.strategy === 'shortest' ? '#3b82f6' : 
                        currentRoute.strategy === 'least-traffic' ? '#8b5cf6' : '#10b981';

      console.log('✅ Using road-following geometry with', currentRoute.geometry.coordinates.length, 'coordinate points');

      // Add the route that already follows roads from the smart routing hook
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: currentRoute.geometry
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': routeColor,
          'line-width': 5,
          'line-opacity': 0.8
        }
      });

      // Fit map to route bounds using the geometry coordinates
      const coordinates = currentRoute.geometry.coordinates;
      const bounds = new mapboxgl.LngLatBounds();
      
      coordinates.forEach((coord: [number, number]) => {
        bounds.extend(coord);
      });

      map.current.fitBounds(bounds, { padding: 50 });
    } else {
      console.warn('❌ No proper geometry found - route will show as straight line');
      console.log('Current route geometry:', currentRoute.geometry);
      
      // If no geometry, create a simple line but log the issue
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(userLocation.slice().reverse() as [number, number]);
      bounds.extend(destinationCoords.slice().reverse() as [number, number]);
      
      if (currentRoute.chargingStops.length > 0) {
        currentRoute.chargingStops.forEach(station => {
          bounds.extend([station.lng, station.lat]);
        });
      }

      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const handleCalculateRoute = async () => {
    if (!destination) return;
    
    const destinationCoords = getDestinationCoords(destination);
    
    await calculateSmartRoute(
      userLocation,
      destinationCoords,
      stationDisplayData,
      canReachDestination
    );
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDistance = (km: number): string => {
    return `${Math.round(km)} km`;
  };

  return (
    <section className="py-8 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Smart Route Optimizer</h2>
          <p className="text-gray-600 text-lg">
            AI-powered routing that considers battery level, traffic, and charging availability
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Route Input */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Route className="w-5 h-5 mr-2 text-green-600" />
                  Trip Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">From</label>
                  <Input 
                    placeholder="Starting location" 
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)} 
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">To</label>
                  <Input 
                    placeholder="Try: Mysore, Chennai, Mumbai, Pune, Goa" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Current Battery Level: {batteryData.currentBatteryLevel}%
                  </label>
                  <Progress value={batteryData.currentBatteryLevel} className="mb-2" />
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={batteryData.currentBatteryLevel}
                    onChange={(e) => updateBatteryLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Vehicle Info</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Max Range: {batteryData.totalRange} km</p>
                    <p>Usable Range: {Math.round(getUsableRange())} km (with 10% buffer)</p>
                    <p>Battery Health: {batteryData.batteryHealth}%</p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCalculateRoute}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled={!destination || isCalculating}
                >
                  {isCalculating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <TrendingUp className="w-4 h-4 mr-2" />
                  )}
                  {isCalculating ? 'AI Planning Route...' : 'AI Plan Route'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Route Results */}
          <div className="lg:col-span-2">
            {isCalculating ? (
              <Card className="h-full bg-white/70 backdrop-blur-sm border-0">
                <CardContent className="h-full flex items-center justify-center">
                  <LoadingSpinner text="Calculating optimal route..." />
                </CardContent>
              </Card>
            ) : currentRoute ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">AI Route Plan</h3>
                  <div className="flex gap-2">
                    {currentRoute.needsCharging && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        <Zap className="w-3 h-3 mr-1" />
                        ML Optimized
                      </Badge>
                    )}
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Smart Route
                    </Badge>
                  </div>
                </div>
                
                {/* ML Recommendation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">{currentRoute.mlRecommendation}</span>
                  </div>
                </div>
                
                {/* Conditions */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Traffic Conditions</div>
                    <div className="font-medium text-gray-900">{currentRoute.trafficConditions}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Weather Impact</div>
                    <div className="font-medium text-gray-900">{currentRoute.weatherImpact}</div>
                  </div>
                </div>
                
                <Card className="bg-white/70 backdrop-blur-sm border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      {currentRoute.needsCharging ? 'Route via Charging Station' : 'Direct Route'}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <Clock className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                        <div className="font-medium">{formatTime(currentRoute.totalDuration)}</div>
                        <div className="text-xs text-gray-500">Total Time</div>
                      </div>
                      <div className="text-center">
                        <Route className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                        <div className="font-medium">{formatDistance(currentRoute.totalDistance)}</div>
                        <div className="text-xs text-gray-500">Distance</div>
                      </div>
                      <div className="text-center">
                        <Battery className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                        <div className="font-medium">
                          {currentRoute.needsCharging ? '90%' : `${Math.max(5, batteryData.currentBatteryLevel - Math.round(currentRoute.totalDistance / batteryData.totalRange * 100))}%`}
                        </div>
                        <div className="text-xs text-gray-500">Battery at Arrival</div>
                      </div>
                    </div>
                    
                    {currentRoute.needsCharging && currentRoute.chargingStops.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Zap className="w-5 h-5 text-orange-600 mr-2" />
                            <h4 className="font-medium text-orange-900">Optimal Charging Stop</h4>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">
                            Score: {currentRoute.chargingStops[0].mlScore}/100
                          </Badge>
                        </div>
                        <div className="text-sm text-orange-700">
                          <p className="font-medium">{currentRoute.chargingStops[0].name}</p>
                          <p>{currentRoute.chargingStops[0].location}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span>Status: {currentRoute.chargingStops[0].status}</span>
                            <span>Charging time: 30 min</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {currentRoute.segments.map((segment, index) => (
                        <div key={segment.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {segment.type === 'charging' ? `Drive to ${segment.chargingStation?.name}` : 
                               segment.type === 'final' ? 'Continue to destination' : 
                               'Direct route to destination'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDistance(segment.distance)} • {formatTime(segment.duration)}
                              {segment.type === 'charging' && ' • Charge for 30min'}
                            </div>
                          </div>
                          {segment.type === 'charging' && (
                            <Zap className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Start Navigation
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={clearRoute}
                      >
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Embedded Mapbox Navigation Map */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Live Route Visualization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      ref={mapContainer} 
                      className="w-full h-96 rounded-lg border border-gray-200"
                      style={{ minHeight: '400px' }}
                    />
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span>Start Location</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span>Charging Stations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span>Destination</span>
                      </div>
                      {currentRoute.strategy && (
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-1 ${
                            currentRoute.strategy === 'fastest' ? 'bg-green-500' : 
                            currentRoute.strategy === 'shortest' ? 'bg-blue-500' : 
                            'bg-purple-500'
                          }`}></div>
                          <span>{currentRoute.strategy} route</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-full bg-white/70 backdrop-blur-sm border-0">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Route className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Enter destination to see your route
                    </h3>
                    <p className="text-gray-500">
                      Our AI will analyze your battery level and find the best route
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RouteOptimizer;
