import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import RouteSummaryPanel from './RouteSummaryPanel';
import DestinationSearchModal from './DestinationSearchModal';
import { stationDisplayData } from "@/data/stationData";
import { useSmartEVRouting } from "@/hooks/useSmartEVRouting";
import { useEVBattery } from "@/hooks/useEVBattery";
import { useToast } from "@/hooks/use-toast";
import MapboxContainer from './map/MapboxContainer';
import { 
  Navigation,
  MapPin,
  Zap,
  Battery,
  Clock,
  Route,
  AlertCircle,
  ArrowRight,
  Locate,
  Search,
  Map,
  Eye
} from "lucide-react";

interface RoutePlannerProps {
  onNavigateToMap?: (route: any) => void;
}

const RoutePlanner = ({ onNavigateToMap }: RoutePlannerProps) => {
  const [fromLocation, setFromLocation] = useState("Demo Location (Bangalore)");
  const [fromCoords, setFromCoords] = useState<[number, number]>([12.9716, 77.5946]); // Use map demo location
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  

  // Smart routing and battery management
  const { currentRoute, isCalculating, calculateRouteWithStrategy, clearRoute } = useSmartEVRouting();
  const { batteryData, canReachDestination } = useEVBattery();
  const { toast } = useToast();

  // Mapbox access token for routing
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXNobWlzdGV5IiwiYSI6ImNtZDQ3Z2N2YTBkYjQya3M5NjB3OWdxcjEifQ.6KP8mbUlAPx960akGAqsqw';

  // Get real road route using Mapbox Directions API
  const getMapboxRoute = async (from: [number, number], to: [number, number]) => {
    try {
      const waypoints = `${from[1]},${from[0]};${to[1]},${to[0]}`;
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${waypoints}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }
      
      const route = data.routes[0];
      return {
        distance: route.distance / 1000, // Convert to km
        duration: route.duration / 60, // Convert to minutes
        geometry: route.geometry
      };
    } catch (error) {
      console.error('Error fetching Mapbox route:', error);
      return null;
    }
  };

  // Calculate real distance between two coordinates using Haversine formula
  const calculateRealDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  // Get filtered destination suggestions based on input
  const getDestinationSuggestions = () => {
    if (!destination.trim()) return [];
    return stationDisplayData
      .filter(station => 
        station.name.toLowerCase().includes(destination.toLowerCase()) ||
        station.location.toLowerCase().includes(destination.toLowerCase())
      )
      .map(station => ({
        ...station,
        realDistance: calculateRealDistance(fromCoords[0], fromCoords[1], station.lat, station.lng)
      }))
      .slice(0, 5); // Show top 5 matches
  };

  // For demo purposes - keep using map marker location instead of real GPS
  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         setFromCoords([latitude, longitude]);
  //         setFromLocation(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
  //       },
  //       (error) => {
  //         console.error('Error getting location:', error);
  //         setFromLocation("Bangalore Central, Karnataka");
  //       }
  //     );
  //   } else {
  //     setFromLocation("Bangalore Central, Karnataka");
  //   }
  // }, []);

  const handleDestinationSelect = (station: any) => {
    setDestination(station.name);
    setDestinationCoords([station.lat, station.lng]);
    setShowDestinationSuggestions(false);
  };

  const handleDestinationModalSelect = (destination: any) => {
    setDestination(destination.name);
    setDestinationCoords(destination.coordinates);
    setShowDestinationModal(false);
  };

  const handlePlanRoute = async () => {
    console.log('🚀 Plan route clicked:', { destination: destination.trim(), fromLocation: fromLocation.trim(), destinationCoords });
    if (!destination.trim() || !fromLocation.trim() || !destinationCoords) {
      console.log('❌ Missing required data:', { 
        hasDestination: !!destination.trim(), 
        hasFromLocation: !!fromLocation.trim(), 
        hasDestinationCoords: !!destinationCoords 
      });
      return;
    }

    console.log('📍 Route calculation starting:', {
      from: fromCoords,
      to: destinationCoords,
      strategy: 'fastest',
      stationsCount: stationDisplayData.length
    });

    try {
      const route = await calculateRouteWithStrategy(
        fromCoords,
        destinationCoords,
        stationDisplayData,
        canReachDestination,
        'fastest'
      );

      console.log('📊 Route calculation result:', route);

      if (route) {
        console.log('✅ Route calculated successfully');
        toast({
          title: "🗺️ Route Calculated",
          description: `Route to ${destination} calculated`,
          duration: 3000
        });
        
      } else {
        console.log('❌ Route calculation returned null/undefined');
        toast({
          title: "❌ Route Planning Failed", 
          description: "Unable to calculate route to destination",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('💥 Route calculation failed:', error);
      toast({
        title: "❌ Route Planning Error",
        description: `Failed to calculate route: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 3000
      });
    }
  };

  const getCurrentLocation = () => {
    // For demo - use map marker location instead of real GPS
    setFromCoords([12.9716, 77.5946]);
    setFromLocation("Demo Location (Bangalore)");
    toast({
      title: "Location Set",
      description: "Using demo location (blue marker on map)",
      duration: 2000
    });
  };

  const handleFromLocationChange = (value: string) => {
    setFromLocation(value);
    // For simplicity, if user types a known location, try to match it
    if (value.toLowerCase().includes('bangalore') || value.toLowerCase().includes('bengaluru')) {
      setFromCoords([12.9716, 77.5946]);
    } else if (value.toLowerCase().includes('mumbai')) {
      setFromCoords([19.0760, 72.8777]);
    } else if (value.toLowerCase().includes('delhi')) {
      setFromCoords([28.6139, 77.2090]);
    }
  };

  const handleRouteSummaryClose = () => {
    clearRoute();
  };

  return (
    <section className="py-8 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Smart Route Planner</h2>
          <p className="text-gray-600 text-lg">
            AI-powered routing with optimal charging stops for your journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Route Input */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Route className="w-5 h-5 mr-2 text-green-600" />
                  Plan Your Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">From</label>
                  <div className="flex gap-2">
                    <Input 
                      value={fromLocation}
                      onChange={(e) => handleFromLocationChange(e.target.value)}
                      placeholder="Enter starting location..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={getCurrentLocation}
                      className="px-3"
                    >
                      <Locate className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">To</label>
                   <div className="flex gap-2">
                     <Input 
                       placeholder="Enter destination or search charging stations..."
                       value={destination}
                       onChange={(e) => {
                         setDestination(e.target.value);
                         setShowDestinationSuggestions(e.target.value.length > 0);
                         if (!e.target.value) {
                           setDestinationCoords(null);
                         }
                       }}
                       onFocus={() => setShowDestinationSuggestions(destination.length > 0)}
                       className="flex-1"
                     />
                     <Button
                       type="button"
                       size="sm"
                       variant="outline"
                       onClick={() => setShowDestinationModal(true)}
                       className="px-3"
                     >
                       <Search className="w-4 h-4" />
                     </Button>
                   </div>
                  
                  {/* Destination suggestions */}
                  {showDestinationSuggestions && getDestinationSuggestions().length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                      {getDestinationSuggestions().map((station) => (
                        <button
                          key={station.id}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          onClick={() => handleDestinationSelect(station)}
                        >
                          <div className="font-medium text-sm">{station.name}</div>
                          <div className="text-xs text-gray-600">{station.location}</div>
                          <div className="text-xs text-blue-600 mt-1">
                            📍 {station.realDistance}km away
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                 <Button 
                   className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                   onClick={handlePlanRoute}
                   disabled={!destination.trim() || !fromLocation.trim() || !destinationCoords || isCalculating}
                 >
                   {isCalculating ? (
                     <>
                       <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                       Calculating Route...
                     </>
                   ) : (
                     <>
                       <Navigation className="w-4 h-4 mr-2" />
                       Plan Smart Route
                     </>
                   )}
                 </Button>
                 
                  {currentRoute && onNavigateToMap && (
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-green-600 mt-4"
                      onClick={async () => {
                        // Enhance route with real Mapbox geometry if not already present
                        let enhancedRoute = currentRoute;
                        
                        if (!currentRoute.geometry && destinationCoords) {
                          console.log('🗺️ Fetching real road geometry for navigation...');
                          const mapboxRoute = await getMapboxRoute(fromCoords, destinationCoords);
                          
                          if (mapboxRoute && mapboxRoute.geometry) {
                            enhancedRoute = {
                              ...currentRoute,
                              geometry: mapboxRoute.geometry,
                              totalDistance: mapboxRoute.distance,
                              totalDuration: mapboxRoute.duration
                            };
                            console.log('✅ Enhanced route with real road geometry');
                          }
                        }
                        
                        onNavigateToMap(enhancedRoute);
                      }}
                    >
                      <Map className="w-4 h-4 mr-2" />
                      Navigate on Map
                    </Button>
                  )}
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card className="bg-white/70 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Battery className="w-5 h-5 mr-2 text-blue-600" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Battery Level</span>
                    <span className="font-medium">{batteryData.currentBatteryLevel}%</span>
                  </div>
                  <Progress value={batteryData.currentBatteryLevel} className="h-2" />
                </div>
                <div className="text-sm text-gray-600">
                  Estimated range: {Math.round(batteryData.currentBatteryLevel * batteryData.totalRange / 100)} km
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {fromLocation}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Route Results Display */}
          <div className="lg:col-span-2 space-y-6">
            {!currentRoute ? (
              <Card className="h-[600px] bg-white/70 backdrop-blur-sm border-0">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Route className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Smart Route Planning</h3>
                    <p className="text-gray-500 mb-4">
                      Enter your destination and choose a route strategy to get AI-powered recommendations
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Route Overview Card */}
                <Card className="bg-white/70 backdrop-blur-sm border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                          <Route className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Route Calculated</h3>
                          <p className="text-gray-600">{currentRoute.strategy.charAt(0).toUpperCase() + currentRoute.strategy.slice(1)} route to {destination}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Active
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Route className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Total Distance</p>
                        <p className="text-lg font-semibold text-gray-900">{currentRoute.totalDistance.toFixed(1)} km</p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Estimated Time</p>
                        <p className="text-lg font-semibold text-gray-900">{Math.round(currentRoute.totalDuration)} min</p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Zap className="w-6 h-6 text-yellow-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Charging Stops</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {currentRoute.chargingStops.length === 0 ? 'None' : currentRoute.chargingStops.length}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Eye className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Strategy</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{currentRoute.strategy}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Charging Stops Details */}
                {currentRoute.chargingStops.length > 0 && (
                  <Card className="bg-white/70 backdrop-blur-sm border-0">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                        Recommended Charging Stops
                      </h4>
                      <div className="space-y-3">
                        {currentRoute.chargingStops.map((stop: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-yellow-800">{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{stop.name}</p>
                                <p className="text-sm text-gray-600">{stop.location}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Distance</p>
                              <p className="font-medium text-gray-900">{stop.distance?.toFixed(1) || 'N/A'} km</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>

        {/* Destination Search Modal */}
        <DestinationSearchModal
          isOpen={showDestinationModal}
          onClose={() => setShowDestinationModal(false)}
          onDestinationSelect={handleDestinationModalSelect}
          userLocation={fromCoords}
        />


        {/* Route Summary Panel */}
        {currentRoute && (
          <RouteSummaryPanel
            routeType={currentRoute.strategy || 'fastest'}
            totalDistance={currentRoute.totalDistance}
            estimatedTime={currentRoute.totalDuration}
            chargingStops={currentRoute.chargingStops}
            onClose={handleRouteSummaryClose}
          />
        )}
      </div>
    </section>
  );
};

export default RoutePlanner;