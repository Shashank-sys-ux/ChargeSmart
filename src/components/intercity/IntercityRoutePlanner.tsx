import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Navigation, 
  Route, 
  Clock, 
  Zap, 
  Shield, 
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  Car,
  Battery
} from 'lucide-react';
import { useIntercityRouting } from '@/hooks/useIntercityRouting';
import { useEVBattery } from '@/hooks/useEVBattery';
import DestinationSearchModal from '@/components/DestinationSearchModal';

import IntercityBatteryInput from '@/components/intercity/IntercityBatteryInput';
import IntercityRouteMap from '@/components/intercity/IntercityRouteMap';

interface IntercityRoutePlannerProps {
  vehicleData: {
    model: string;
    range: number;
    connectorType: string;
    preference: string;
    batteryLevel?: number;
  };
}

const IntercityRoutePlanner = ({ vehicleData }: IntercityRoutePlannerProps) => {
  const [origin, setOrigin] = useState('Bangalore, Karnataka');
  const [destination, setDestination] = useState('');
  const [destinationInfo, setDestinationInfo] = useState<{
    name: string;
    city: string;
    coordinates: [number, number];
  } | null>(null);
  
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  
  
  const { currentRoute, isCalculating, calculateIntercityRoute, clearRoute } = useIntercityRouting();
  const { batteryData, updateBatteryLevel, canReachDestination, getUsableRange } = useEVBattery();

  // Initialize battery data from vehicle selection
  useState(() => {
    if (vehicleData.batteryLevel !== undefined) {
      updateBatteryLevel(vehicleData.batteryLevel);
    }
  });

  const userLocation: [number, number] = [12.9716, 77.5946]; // Bangalore center

  const handleDestinationSelect = (dest: any) => {
    setDestination(dest.name);
    
    // Extract city name for intercity destinations
    let cityName = dest.name;
    let placeName = dest.name;
    
    if (dest.name.includes(',')) {
      const parts = dest.name.split(',');
      placeName = parts[0].trim();
      cityName = parts[1]?.trim() || parts[0].trim();
    }
    
    setDestinationInfo({
      name: placeName,
      city: cityName,
      coordinates: dest.coordinates
    });
    setShowDestinationModal(false);
  };

  const handlePlanRoute = async () => {
    if (!destinationInfo) return;
    
    // Directly navigate with default strategy instead of showing modal
    await calculateIntercityRoute(
      userLocation,
      destinationInfo.coordinates,
      batteryData.currentBatteryLevel,
      vehicleData.range,
      {
        name: destinationInfo.name,
        city: destinationInfo.city
      },
      'fastest' // Default strategy
    );
  };


  const formatChargingStops = () => {
    if (!currentRoute?.chargingStops.length) return null;
    
    return currentRoute.chargingStops.map((station, index) => (
      <div key={station.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="font-medium text-blue-900">{station.name}</div>
          <div className="text-sm text-blue-700">{station.location}</div>
          <div className="flex gap-4 text-xs text-blue-600 mt-1">
            <span>⚡ {station.chargingPower}kW</span>
            <span>💰 ₹{station.price}/kWh</span>
            <span>⭐ {station.safetyRating}/5</span>
          </div>
        </div>
        <Badge variant="outline" className="text-blue-700 border-blue-300">
          {station.highway}
        </Badge>
      </div>
    ));
  };

  const getSafetyBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 75) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Route className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Intercity EV Route Planner
          </h1>
          <p className="text-gray-600 text-lg">
            Plan safe, efficient long-distance trips with optimal charging stops
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Planning Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Vehicle Info */}
            <Card className="bg-white/70 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Your Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{vehicleData.model}</div>
                  <div className="flex justify-between text-sm">
                    <span>Max Range:</span>
                    <span className="font-medium">{vehicleData.range} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Connector:</span>
                    <span className="font-medium">{vehicleData.connectorType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Battery Input */}
            <IntercityBatteryInput
              vehicleRange={vehicleData.range}
            />

            {/* Route Planning */}
            <Card className="bg-white/70 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Plan Your Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    From
                  </label>
                  <Input
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="bg-white"
                    disabled
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    To
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => setShowDestinationModal(true)}
                    className="w-full justify-start bg-white hover:bg-gray-50"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {destination || 'Select destination...'}
                  </Button>
                </div>

                {destination && (
                  <Button
                    onClick={handlePlanRoute}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Calculating Route...
                      </>
                    ) : (
                      <>
                        <Route className="w-4 h-4 mr-2" />
                        Plan Intercity Route
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Route Results */}
          <div className="lg:col-span-2 space-y-6">
            {!currentRoute ? (
              <Card className="bg-white/70 backdrop-blur-sm border-0 h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Route className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">Plan Your Intercity Journey</h3>
                  <p className="mb-4">Select a destination to get started with smart route planning</p>
                  <div className="flex gap-4 justify-center text-sm">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span>Optimal charging stops</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Safety ratings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span>Real-time routing</span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                {/* Route Summary */}
                <Card className="bg-white/70 backdrop-blur-sm border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Route className="w-5 h-5" />
                        Route to {currentRoute.intercityDestination.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRoute}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Clear Route
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {currentRoute.totalDistance.toFixed(0)} km
                        </div>
                        <p className="text-xs text-blue-600">Total Distance</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-700">
                          {currentRoute.totalDurationHours}
                        </div>
                        <p className="text-xs text-purple-600">Travel Time</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          {currentRoute.chargingStops.length}
                        </div>
                        <p className="text-xs text-green-600">Charging Stops</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-xl font-bold text-yellow-700">
                          ₹{currentRoute.estimatedCost}
                        </div>
                        <p className="text-xs text-yellow-600">Est. Cost</p>
                      </div>
                    </div>

                    {/* Safety Score */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Safety Score:</span>
                      <Badge className={getSafetyBadgeColor(currentRoute.safetyScore)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {currentRoute.safetyScore}/100
                      </Badge>
                    </div>

                    {/* Warnings */}
                    {currentRoute.warnings.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {currentRoute.warnings.map((warning, index) => (
                          <Alert key={index} className="border-yellow-200 bg-yellow-50">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-700">
                              {warning}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}

                    {/* Route Status */}
                    {!currentRoute.needsCharging ? (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                          ✅ Direct route possible! You can reach your destination without charging stops.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="border-blue-200 bg-blue-50">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-700">
                          ⚡ Route optimized with {currentRoute.chargingStops.length} strategic charging stop(s) for maximum safety and efficiency.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Interactive Route Map */}
                <Card className="bg-white/70 backdrop-blur-sm border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Route Visualization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <IntercityRouteMap
                      route={currentRoute}
                      userLocation={userLocation}
                      destination={destinationInfo?.coordinates || [0, 0]}
                      currentBatteryLevel={batteryData.currentBatteryLevel}
                      vehicleRange={vehicleData.range}
                    />
                  </CardContent>
                </Card>

                {/* Charging Stops */}
                {currentRoute.needsCharging && (
                  <Card className="bg-white/70 backdrop-blur-sm border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Recommended Charging Stops
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {formatChargingStops()}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modals */}
        <DestinationSearchModal
          isOpen={showDestinationModal}
          onClose={() => setShowDestinationModal(false)}
          onDestinationSelect={handleDestinationSelect}
          userLocation={userLocation}
        />

      </div>
    </div>
  );
};

export default IntercityRoutePlanner;