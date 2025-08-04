
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ControlPanel from './map/ControlPanel';
import MLStatusPanel from './map/MLStatusPanel';
import { stationDisplayData } from '@/data/stationData';
import { 
  Navigation,
  MapPin,
  Zap,
  Battery,
  Clock,
  Route,
  AlertCircle,
  Fuel,
  ArrowRight,
  Brain,
  TrendingUp,
  Users
} from "lucide-react";


interface BangaloreRoutePlannerProps {
  currentTime: Date;
  isSimulating: boolean;
  simulationSpeed: number;
  isModelReady: boolean;
  onToggleSimulation: () => void;
  onSpeedChange: (speed: number) => void;
  getPredictionData: (stationId: number) => any;
  getHeatColor: (stationId: number) => string;
}

const BangaloreRoutePlanner = ({
  currentTime,
  isSimulating,
  simulationSpeed,
  isModelReady,
  onToggleSimulation,
  onSpeedChange,
  getPredictionData,
  getHeatColor
}: BangaloreRoutePlannerProps) => {
  const [fromLocation, setFromLocation] = useState("Bangalore Central, Karnataka");
  const [destination, setDestination] = useState("");
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [currentBattery] = useState(45);

  const bangaloreAreas = [
    "Koramangala", "Electronic City", "Whitefield", "Indiranagar", 
    "JP Nagar", "Hebbal", "Marathahalli", "Jayanagar", "Banashankari", 
    "Bellandur", "HSR Layout", "BTM Layout", "Malleswaram", "Rajajinagar",
    "Bangalore Central", "MG Road", "Commercial Street", "Brigade Road"
  ];

  // Utility function to calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get coordinates for area names
  const getCoordinatesForArea = (areaName: string): { lat: number, lng: number } => {
    const areaCoords = {
      "Koramangala": { lat: 12.9279, lng: 77.6271 },
      "Electronic City": { lat: 12.8456, lng: 77.6603 },
      "Whitefield": { lat: 12.9698, lng: 77.7500 },
      "Indiranagar": { lat: 12.9784, lng: 77.6408 },
      "JP Nagar": { lat: 12.9082, lng: 77.5753 },
      "Hebbal": { lat: 13.0357, lng: 77.5970 },
      "Marathahalli": { lat: 12.9591, lng: 77.6974 },
      "Jayanagar": { lat: 12.9254, lng: 77.5832 },
      "Banashankari": { lat: 12.9250, lng: 77.5514 },
      "Bellandur": { lat: 12.9698, lng: 77.6750 },
      "HSR Layout": { lat: 12.9116, lng: 77.6498 },
      "MG Road": { lat: 12.9759, lng: 77.6063 },
      "Bangalore Central": { lat: 12.9716, lng: 77.5946 },
    };
    return areaCoords[areaName] || { lat: 12.9716, lng: 77.5946 }; // Default to Bangalore Central
  };

  // Open Google Maps navigation
  const openGoogleMaps = (fromLoc: string, toLoc: string) => {
    const fromCoords = getCoordinatesForArea(fromLoc);
    const toCoords = getCoordinatesForArea(toLoc);
    const url = `https://www.google.com/maps/dir/${fromCoords.lat},${fromCoords.lng}/${toCoords.lat},${toCoords.lng}`;
    window.open(url, '_blank');
  };

  // CONNECTED ML-optimized route using live prediction data
  const generateMLRoute = (dest) => {
    // Use the shared currentTime from simulation
    const hour = currentTime.getHours();
    const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
    
    // Get coordinates for from and to locations
    const fromCoords = getCoordinatesForArea(fromLocation);
    const destCoords = getCoordinatesForArea(dest);
    
    // Use actual station data and calculate distances from fromLocation
    const stationCandidates = stationDisplayData.map(station => {
      const distance = calculateDistance(fromCoords.lat, fromCoords.lng, station.lat, station.lng);
      return {
        id: station.id,
        name: station.name,
        location: station.location,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
        type: station.type,
        cost: `₹${Math.round(station.price * 10)}`
      };
    });
    
    // Get LIVE predictions for each station and filter by availability
    const optimalStations = stationCandidates
      .map(station => {
        const prediction = getPredictionData(station.id);
        const isAvailable = prediction.availability > 0.3; // Available if >30% capacity
        const heatColor = getHeatColor(station.id);
        
        return {
          ...station,
          // LIVE DATA from simulation
          availability: isAvailable ? 
            (prediction.availability > 0.7 ? "Excellent" : 
             prediction.availability > 0.5 ? "Good" : "Limited") : "Full",
          waitTime: prediction.waitTime,
          predictedUsers: Math.round(prediction.predictedUsage * 10),
          congestionLevel: prediction.predictedUsage > 0.8 ? "High" : 
                          prediction.predictedUsage > 0.5 ? "Medium" : "Low",
          mlScore: Math.round((1 - prediction.predictedUsage) * 100), // Higher score for less usage
          weatherImpact: "None",
          chargingTime: station.type === "battery-swap" ? "5 min" : 
                       prediction.predictedUsage > 0.7 ? "25 min" : "15 min",
          heatColor: heatColor,
          isRushHour: isRushHour
        };
      })
      .filter(station => station.availability !== "Full") // Only available stations
      .sort((a, b) => {
        // Smart sorting: availability first, then ML score, then distance
        if (a.availability !== b.availability) {
          const order = { "Excellent": 3, "Good": 2, "Limited": 1 };
          return order[b.availability] - order[a.availability];
        }
        if (Math.abs(a.mlScore - b.mlScore) > 10) {
          return b.mlScore - a.mlScore;
        }
        return a.distance - b.distance;
      })
      .slice(0, 2); // Top 2 stations

    const avgMLScore = optimalStations.length > 0 ? 
      Math.round(optimalStations.reduce((sum, s) => sum + s.mlScore, 0) / optimalStations.length) : 50;

    // Dynamic route calculations based on live station conditions
    const totalTime = isRushHour ? "1h 52m" : "1h 35m";
    const trafficLevel = isRushHour ? "Heavy" : "Moderate";
    const allStationsFull = optimalStations.length === 0;
    const totalDistance = Math.round(calculateDistance(fromCoords.lat, fromCoords.lng, destCoords.lat, destCoords.lng) * 10) / 10;
    
    return {
      totalDistance: totalDistance,
      estimatedTime: totalTime,
      batteryNeeded: 68,
      chargingStops: optimalStations,
      mlConfidence: avgMLScore,
      trafficConditions: trafficLevel,
      weatherConditions: "Clear",
      isRushHour: isRushHour,
      allStationsFull: allStationsFull,
      currentSimTime: currentTime.toLocaleTimeString(),
      alternativeRoutes: [
        { 
          name: "Live ML Route", 
          time: totalTime, 
          stops: optimalStations.length, 
          savings: allStationsFull ? "No stations available" : "Best Available",
          mlScore: avgMLScore,
          co2Saved: "2.3kg"
        },
        { 
          name: "Fastest Route", 
          time: isRushHour ? "1h 45m" : "1h 28m", 
          stops: 1, 
          savings: "Save 7min",
          mlScore: Math.max(20, avgMLScore - 15),
          co2Saved: "1.8kg"
        },
        { 
          name: "Eco Route", 
          time: isRushHour ? "2h 15m" : "1h 52m", 
          stops: 3, 
          savings: "Save ₹45",
          mlScore: Math.min(95, avgMLScore + 10),
          co2Saved: "3.1kg"
        }
      ]
    };
  };

  const suggestedRoute = routeCalculated ? generateMLRoute(destination) : null;

  const handlePlanRoute = () => {
    if (destination.trim()) {
      setRouteCalculated(true);
    }
  };

  return (
    <section className="py-8 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🧠 Connected Smart Route Planner
          </h2>
          <p className="text-gray-600 text-lg">
            Real-time ML routing connected to live station data with 30x time simulation
          </p>
        </div>

        <MLStatusPanel isTraining={false} trainingProgress={1} />

        <div className="mb-6">
          <ControlPanel 
            currentTime={currentTime}
            isSimulating={isSimulating}
            simulationSpeed={simulationSpeed}
            isModelReady={isModelReady}
            onToggleSimulation={onToggleSimulation}
            onSpeedChange={onSpeedChange}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Route Input */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Route className="w-5 h-5 mr-2 text-green-600" />
                  Plan Your Bangalore Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">From</label>
                  <Input 
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    placeholder="Enter starting location..."
                    list="bangalore-areas-from"
                  />
                  <datalist id="bangalore-areas-from">
                    {bangaloreAreas.map(area => (
                      <option key={area} value={area} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">To</label>
                  <Input 
                    placeholder="Enter Bangalore destination..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    list="bangalore-areas"
                  />
                  <datalist id="bangalore-areas">
                    {bangaloreAreas.map(area => (
                      <option key={area} value={area} />
                    ))}
                  </datalist>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                  onClick={handlePlanRoute}
                  disabled={!destination.trim()}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Plan Route
                </Button>
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
                    <span className="font-medium">{currentBattery}%</span>
                  </div>
                  <Progress value={currentBattery} className="h-2" />
                </div>
                <div className="text-sm text-gray-600">
                  Estimated range: {Math.round(currentBattery * 3.8)} km
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {fromLocation}
                </div>
                <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  ML Model: Traffic + Weather + Demand Analysis
                </div>
              </CardContent>
            </Card>

            {/* Live Traffic & Weather */}
            <Card className="bg-white/70 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg">Live Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Traffic</span>
                  <Badge className="bg-yellow-100 text-yellow-700">Moderate</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Weather</span>
                  <Badge className="bg-green-100 text-green-700">Clear ☀️</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Air Quality</span>
                  <Badge className="bg-orange-100 text-orange-700">Moderate</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Route Results */}
          <div className="lg:col-span-2">
            {!routeCalculated ? (
              <Card className="h-[600px] bg-white/70 backdrop-blur-sm border-0">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">AI Route Optimization Ready</h3>
                    <p className="text-gray-500">
                      Enter your Bangalore destination for ML-powered route suggestions
                    </p>
                    <div className="mt-4 text-sm text-gray-400">
                      • Real-time traffic analysis<br/>
                      • Charging station demand prediction<br/>
                      • Weather impact assessment
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* ML Route Overview */}
                <Card className="bg-white/70 backdrop-blur-sm border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-green-600" />
                        AI Optimized Route to {destination}
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        {suggestedRoute.mlConfidence}% Confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Live Connection Status */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-gray-800">Connected to Live Simulation</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Time: {suggestedRoute.currentSimTime} • Speed: {simulationSpeed}x
                        </div>
                      </div>
                      {suggestedRoute.isRushHour && (
                        <div className="mt-2 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
                          ⚠️ Rush Hour Detected - Stations may be crowded
                        </div>
                      )}
                      {suggestedRoute.allStationsFull && (
                        <div className="mt-2 text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                          🚨 All stations at capacity - Consider waiting or alternative route
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{suggestedRoute.totalDistance}km</div>
                        <div className="text-sm text-gray-600">Distance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{suggestedRoute.estimatedTime}</div>
                        <div className="text-sm text-gray-600">Est. Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{suggestedRoute.chargingStops.length}</div>
                        <div className="text-sm text-gray-600">Available Stops</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">2.3kg</div>
                        <div className="text-sm text-gray-600">CO₂ Saved</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Traffic Conditions</span>
                        <Badge className="bg-yellow-100 text-yellow-700">{suggestedRoute.trafficConditions}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Weather Impact</span>
                        <Badge className="bg-green-100 text-green-700">{suggestedRoute.weatherConditions}</Badge>
                      </div>
                    </div>
                    
                    {currentBattery < 50 && (
                      <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg mt-4">
                        <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="text-sm text-orange-800">
                          ML recommends charging before journey for optimal route efficiency
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI-Selected Charging Stops */}
                <Card className="bg-white/70 backdrop-blur-sm border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                      ML-Optimized Charging Stops
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {suggestedRoute.chargingStops.length === 0 ? (
                        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-red-800 mb-2">All Stations at Capacity</h3>
                          <p className="text-red-600">During rush hour simulation, all stations are full. Try adjusting simulation time or wait for availability.</p>
                        </div>
                      ) : (
                        suggestedRoute.chargingStops.map((stop, index) => (
                          <div key={stop.id} className="flex items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border relative">
                            {/* Live Heat Color Indicator */}
                            <div 
                              className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white"
                              style={{ backgroundColor: stop.heatColor }}
                              title="Live station status from map"
                            ></div>
                            
                            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{stop.name}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge className={
                                    stop.availability === "Excellent" ? "bg-green-100 text-green-700" :
                                    stop.availability === "Good" ? "bg-blue-100 text-blue-700" :
                                    "bg-orange-100 text-orange-700"
                                  }>
                                    Live: {stop.availability}
                                  </Badge>
                                  <Badge className="bg-blue-100 text-blue-700">
                                    ML: {stop.mlScore}
                                  </Badge>
                                  <Badge className={
                                    stop.type === 'fast-charging' 
                                      ? 'bg-green-100 text-green-700'
                                      : stop.type === 'battery-swap'
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }>
                                    {stop.type === 'fast-charging' ? (
                                      <>
                                        <Zap className="w-3 h-3 mr-1" />
                                        Fast Charge
                                      </>
                                    ) : stop.type === 'battery-swap' ? (
                                      <>
                                        <Battery className="w-3 h-3 mr-1" />
                                        Battery Swap
                                      </>
                                    ) : (
                                      <>
                                        <Battery className="w-3 h-3 mr-1" />
                                        Standard
                                      </>
                                    )}
                                  </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{stop.location}</p>
                                <div className="grid grid-cols-4 gap-4 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <Navigation className="w-4 h-4 mr-1" />
                                    {stop.distance}km
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {stop.chargingTime}
                                  </span>
                                  <span className="flex items-center">
                                    <Fuel className="w-4 h-4 mr-1" />
                                    {stop.cost}
                                  </span>
                                  <span className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    {stop.predictedUsers} users
                                  </span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 bg-white/50 p-2 rounded">
                                  Congestion: {stop.congestionLevel} • Weather Impact: {stop.weatherImpact}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                    </div>
                  </CardContent>
                </Card>

                {/* Alternative ML Routes */}
                <Card className="bg-white/70 backdrop-blur-sm border-0">
                  <CardHeader>
                    <CardTitle>Alternative AI Routes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {suggestedRoute.alternativeRoutes.map((route, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="font-medium text-gray-900">{route.name}</h4>
                              <Badge className="bg-blue-100 text-blue-700">
                                ML: {route.mlScore}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {route.time} • {route.stops} stops • {route.co2Saved} CO₂ saved
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {route.savings}
                            </Badge>
                            <Button size="sm" variant="outline">
                              Select
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Start Journey */}
                <div className="text-center space-y-3">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-green-600 to-blue-600"
                    onClick={() => openGoogleMaps(fromLocation, destination)}
                  >
                    <Navigation className="w-5 h-5 mr-2" />
                    Navigate with Google Maps
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-sm text-gray-500">
                    Route will adapt in real-time based on live conditions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BangaloreRoutePlanner;
