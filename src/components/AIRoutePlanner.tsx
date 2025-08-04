import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Route, Clock, Zap, Navigation, Battery, Car } from 'lucide-react';
import { cityData, popularRoutes, stationDisplayData, CityData } from '@/data/stationData';
import { useEVBattery } from '@/hooks/useEVBattery';

interface RouteStep {
  type: 'start' | 'station' | 'destination';
  location: string;
  stationId?: number;
  distance?: number;
  chargingTime?: number;
  batteryLevel?: number;
}

interface AIRouteProps {
  onRouteSelect?: (route: any) => void;
}

const AIRoutePlanner: React.FC<AIRouteProps> = ({ onRouteSelect }) => {
  const [fromCity, setFromCity] = useState<string>('');
  const [toCity, setToCity] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  
  // Use actual battery data from the EV battery hook
  const { batteryData, canReachDestination, getUsableRange } = useEVBattery();

  // Group cities by state for better UX
  const citiesByState = useMemo(() => {
    const grouped = cityData.reduce((acc, city) => {
      if (!acc[city.state]) {
        acc[city.state] = [];
      }
      acc[city.state].push(city);
      return acc;
    }, {} as Record<string, CityData[]>);
    return grouped;
  }, []);

  const planRoute = async () => {
    if (!fromCity || !toCity) return;
    
    setIsPlanning(true);
    
    // Simulate AI planning delay
    setTimeout(() => {
      // Find existing popular route or create a smart route
      const existingRoute = popularRoutes.find(
        route => route.from === fromCity && route.to === toCity
      );
      
      if (existingRoute) {
        const route = generateDetailedRoute(existingRoute);
        setSelectedRoute(route);
        onRouteSelect?.(route);
      } else {
        // Generate smart route using AI logic
        const smartRoute = generateSmartRoute(fromCity, toCity);
        setSelectedRoute(smartRoute);
        onRouteSelect?.(smartRoute);
      }
      
      setIsPlanning(false);
    }, 2000);
  };

  const generateDetailedRoute = (route: any) => {
    const fromCityData = cityData.find(c => c.id === route.from);
    const toCityData = cityData.find(c => c.id === route.to);
    
    console.log(`🗺️ Generating detailed route using actual battery: ${batteryData.currentBatteryLevel}%`);
    
    const steps: RouteStep[] = [
      {
        type: 'start',
        location: fromCityData?.name || route.from,
        batteryLevel: batteryData.currentBatteryLevel
      }
    ];

    // Check if we can reach destination with current battery
    const canReachDirectly = canReachDestination(route.distance);
    const actualUsableRange = getUsableRange();
    console.log(`🔋 Can reach directly: ${canReachDirectly ? 'Yes' : 'No'} (${route.distance}km vs ${actualUsableRange.toFixed(1)}km usable)`);

    let stationsToUse: number[] = [];
    let currentBattery = batteryData.currentBatteryLevel;
    let remainingDistance = route.distance;

    if (!canReachDirectly) {
      console.log('⚡ Insufficient battery - need charging stops');
      // Force recalculation for low battery scenarios
      const smartRoute = generateSmartRoute(route.from, route.to);
      if (smartRoute && smartRoute.viaStations.length > 0) {
        stationsToUse = smartRoute.viaStations;
      }
    } else if (route.viaStations.length > 0) {
      // Use predefined stations only if we actually need them
      console.log('⚡ Using predefined route stations');
      stationsToUse = route.viaStations;
    }

    // Process charging stations if any
    if (stationsToUse.length > 0) {
      stationsToUse.forEach((stationId: number, index: number) => {
        const station = stationDisplayData.find(s => s.id === stationId);
        if (station) {
          const segmentDistance = index === 0 ? 
            Math.round(route.distance / (stationsToUse.length + 1)) : 
            Math.round(remainingDistance / (stationsToUse.length - index));

          steps.push({
            type: 'station',
            location: station.name,
            stationId: station.id,
            distance: segmentDistance,
            chargingTime: station.type === 'fast-charging' ? 25 : station.type === 'battery-swap' ? 8 : 35,
            batteryLevel: 90
          });

          currentBattery = 90; // After charging
          remainingDistance -= segmentDistance;
        }
      });
    }

    // Final destination
    const finalDistance = steps.length > 1 ? 
      route.distance - steps.slice(1, -1).reduce((sum: number, step: RouteStep) => sum + (step.distance || 0), 0) :
      route.distance;
    
    const finalBatteryLevel = steps.length > 1 ? 
      Math.max(5, 90 - Math.round((finalDistance / batteryData.totalRange) * 100)) :
      Math.max(5, batteryData.currentBatteryLevel - Math.round((route.distance / batteryData.totalRange) * 100));

    steps.push({
      type: 'destination',
      location: toCityData?.name || route.to,
      distance: Math.round(finalDistance),
      batteryLevel: finalBatteryLevel
    });

    const chargingStops = steps.filter(step => step.type === 'station');

    return {
      ...route,
      steps,
      totalStations: chargingStops.length,
      totalChargingTime: chargingStops.reduce((total, step) => total + (step.chargingTime || 0), 0),
      estimatedCost: chargingStops.length * 200,
      needsCharging: chargingStops.length > 0,
      currentBatteryLevel: batteryData.currentBatteryLevel,
      usableRange: Math.round(getUsableRange())
    };
  };

  const generateSmartRoute = (from: string, to: string) => {
    const fromCityData = cityData.find(c => c.id === from);
    const toCityData = cityData.find(c => c.id === to);
    
    if (!fromCityData || !toCityData) return null;

    // Calculate straight-line distance (simplified)
    const totalDistance = Math.sqrt(
      Math.pow((toCityData.lat - fromCityData.lat) * 111, 2) +
      Math.pow((toCityData.lng - fromCityData.lng) * 111, 2)
    );

    console.log(`🔋 Planning route from ${fromCityData.name} to ${toCityData.name}`);
    console.log(`📏 Total distance: ${totalDistance.toFixed(1)}km`);
    console.log(`🔋 Current battery: ${batteryData.currentBatteryLevel}% (${getUsableRange().toFixed(1)}km usable range)`);

    const usableRange = getUsableRange();
    const steps: RouteStep[] = [];
    const chargingStops: number[] = [];
    
    // Start point
    steps.push({
      type: 'start',
      location: fromCityData.name,
      batteryLevel: batteryData.currentBatteryLevel
    });

    // Check if we can reach destination directly
    if (canReachDestination(totalDistance)) {
      console.log('✅ Can reach destination directly without charging');
      steps.push({
        type: 'destination',
        location: toCityData.name,
        distance: Math.round(totalDistance),
        batteryLevel: Math.max(5, batteryData.currentBatteryLevel - Math.round((totalDistance / batteryData.totalRange) * 100))
      });
    } else {
      console.log('⚡ Need charging stops - calculating optimal stations');
      
      let currentLat = fromCityData.lat;
      let currentLng = fromCityData.lng;
      let remainingDistance = totalDistance;
      let currentBattery = batteryData.currentBatteryLevel;
      let segmentCount = 0;
      
      while (remainingDistance > 0 && segmentCount < 10) { // Safety limit
        const distanceWeCanTravel = (currentBattery / 100) * batteryData.totalRange * 0.9; // Keep 10% safety buffer - matching useEVBattery logic
        
        if (distanceWeCanTravel >= remainingDistance) {
          // Can reach destination
          console.log(`🎯 Final segment: ${remainingDistance.toFixed(1)}km to destination`);
          steps.push({
            type: 'destination',
            location: toCityData.name,
            distance: Math.round(remainingDistance),
            batteryLevel: Math.max(5, currentBattery - Math.round((remainingDistance / batteryData.totalRange) * 100))
          });
          break;
        } else {
          // Need charging station
          const searchRadius = Math.min(distanceWeCanTravel * 0.9, remainingDistance * 0.7);
          console.log(`🔍 Looking for charging station within ${searchRadius.toFixed(1)}km radius`);
          
          // Find suitable charging stations within reachable distance
          const suitableStations = stationDisplayData.filter(station => {
            const distanceToStation = Math.sqrt(
              Math.pow((station.lat - currentLat) * 111, 2) +
              Math.pow((station.lng - currentLng) * 111, 2)
            );
            
            const distanceFromStationToDestination = Math.sqrt(
              Math.pow((toCityData.lat - station.lat) * 111, 2) +
              Math.pow((toCityData.lng - station.lng) * 111, 2)
            );
            
            // Station should be reachable and closer to destination
            return distanceToStation <= searchRadius && 
                   distanceFromStationToDestination < remainingDistance &&
                   !chargingStops.includes(station.id);
          });

          if (suitableStations.length === 0) {
            console.log('❌ No suitable charging stations found');
            break;
          }

          // Sort by distance to destination (prefer stations that get us closer)
          suitableStations.sort((a, b) => {
            const distA = Math.sqrt(
              Math.pow((toCityData.lat - a.lat) * 111, 2) +
              Math.pow((toCityData.lng - a.lng) * 111, 2)
            );
            const distB = Math.sqrt(
              Math.pow((toCityData.lat - b.lat) * 111, 2) +
              Math.pow((toCityData.lng - b.lng) * 111, 2)
            );
            return distA - distB;
          });

          const selectedStation = suitableStations[0];
          const distanceToStation = Math.sqrt(
            Math.pow((selectedStation.lat - currentLat) * 111, 2) +
            Math.pow((selectedStation.lng - currentLng) * 111, 2)
          );

          console.log(`⚡ Selected charging station: ${selectedStation.name} (${distanceToStation.toFixed(1)}km away)`);

          steps.push({
            type: 'station',
            location: selectedStation.name,
            stationId: selectedStation.id,
            distance: Math.round(distanceToStation),
            chargingTime: selectedStation.type === 'fast-charging' ? 25 : selectedStation.type === 'battery-swap' ? 8 : 35,
            batteryLevel: 90 // Assume we charge to 90%
          });

          chargingStops.push(selectedStation.id);
          
          // Update position and remaining distance
          currentLat = selectedStation.lat;
          currentLng = selectedStation.lng;
          remainingDistance = Math.sqrt(
            Math.pow((toCityData.lat - currentLat) * 111, 2) +
            Math.pow((toCityData.lng - currentLng) * 111, 2)
          );
          currentBattery = 90; // After charging
          segmentCount++;
          
          console.log(`📍 After charging at ${selectedStation.name}: ${remainingDistance.toFixed(1)}km remaining`);
        }
      }
    }

    const totalChargingTime = chargingStops.reduce((total, stationId) => {
      const station = stationDisplayData.find(s => s.id === stationId);
      if (!station) return total;
      return total + (station.type === 'fast-charging' ? 25 : station.type === 'battery-swap' ? 8 : 35);
    }, 0);

    return {
      from,
      to,
      distance: Math.round(totalDistance),
      estimatedTime: `${Math.floor(totalDistance / 60)}h ${Math.round((totalDistance / 60 % 1) * 60)}m`,
      viaStations: chargingStops,
      steps,
      totalStations: chargingStops.length,
      totalChargingTime,
      estimatedCost: chargingStops.length * 200,
      needsCharging: chargingStops.length > 0,
      batteryUsed: totalDistance,
      currentBatteryLevel: batteryData.currentBatteryLevel,
      usableRange: Math.round(getUsableRange())
    };
  };

  const resetRoute = () => {
    setSelectedRoute(null);
    setFromCity('');
    setToCity('');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          AI Route Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Route Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <Select value={fromCity} onValueChange={setFromCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select origin city" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(citiesByState).map(([state, cities]) => (
                  <div key={state}>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                      {state}
                    </div>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {city.name}
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <Select value={toCity} onValueChange={setToCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination city" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(citiesByState).map(([state, cities]) => (
                  <div key={state}>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                      {state}
                    </div>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {city.name}
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={planRoute} 
            disabled={!fromCity || !toCity || isPlanning}
            className="flex items-center gap-2"
          >
            <Route className="h-4 w-4" />
            {isPlanning ? 'Planning Route...' : 'Plan Smart Route'}
          </Button>
          {selectedRoute && (
            <Button variant="outline" onClick={resetRoute}>
              Reset
            </Button>
          )}
        </div>

        {/* Popular Routes Quick Access */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Popular Routes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {popularRoutes.slice(0, 4).map((route, index) => {
              const fromCityData = cityData.find(c => c.id === route.from);
              const toCityData = cityData.find(c => c.id === route.to);
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFromCity(route.from);
                    setToCity(route.to);
                  }}
                  className="justify-start text-left h-auto p-3"
                >
                  <div className="flex flex-col items-start">
                    <div className="font-medium">
                      {fromCityData?.name} → {toCityData?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {route.distance}km • {route.estimatedTime}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Route Details */}
        {selectedRoute && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-4">
              {/* Route Summary */}
              <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  <span className="text-sm font-medium">{selectedRoute.distance}km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{selectedRoute.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">{selectedRoute.totalStations} charging stops</span>
                </div>
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4" />
                  <span className="text-sm">Start: {selectedRoute.currentBatteryLevel || batteryData.currentBatteryLevel}% ({selectedRoute.usableRange || Math.round(getUsableRange())}km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span className="text-sm">₹{selectedRoute.estimatedCost} estimated cost</span>
                </div>
              </div>

              {/* Route Steps */}
              <div className="space-y-3">
                <h4 className="font-medium">Route Details</h4>
                <div className="space-y-2">
                  {selectedRoute.steps.map((step: RouteStep, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {step.type === 'start' && (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        {step.type === 'station' && (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        {step.type === 'destination' && (
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{step.location}</div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {step.distance && <span>{step.distance}km</span>}
                          {step.chargingTime && <span>{step.chargingTime}min charging</span>}
                          {step.batteryLevel && (
                            <div className="flex items-center gap-1">
                              <Battery className="h-3 w-3" />
                              <span>{step.batteryLevel}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {step.type === 'station' && (
                        <Badge variant="secondary">
                          {stationDisplayData.find(s => s.id === step.stationId)?.type}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRoutePlanner;