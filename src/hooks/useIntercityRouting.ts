import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { HIGHWAY_CHARGING_STATIONS, ALL_INTERCITY_STATIONS } from '@/data/intercityData';
import { RouteStrategy } from '@/components/RouteStrategyModal';

export interface IntercityRouteSegment {
  id: string;
  from: [number, number];
  to: [number, number];
  distance: number; // km
  duration: number; // minutes
  type: 'direct' | 'charging' | 'final';
  chargingStation?: any;
  highway?: string;
  safetyRating?: number;
}

export interface IntercityRoute {
  segments: IntercityRouteSegment[];
  totalDistance: number;
  totalDuration: number; // minutes
  totalDurationHours: string; // formatted string
  needsCharging: boolean;
  chargingStops: any[];
  safetyScore: number;
  intercityDestination: {
    name: string;
    city: string;
  };
  strategy?: RouteStrategy;
  geometry?: any;
  warnings: string[];
  estimatedCost: number; // ₹
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXNobWlzdGV5IiwiYSI6ImNtZDQ3Z2N2YTBkYjQya3M5NjB3OWdxcjEifQ.6KP8mbUlAPx960akGAqsqw';

// Helper function to calculate distance using Haversine formula
const calculateDistance = (from: [number, number], to: [number, number]): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (to[0] - from[0]) * Math.PI / 180;
  const dLon = (to[1] - from[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(from[0] * Math.PI / 180) * Math.cos(to[0] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Format duration in hours and minutes
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  return `${mins}min`;
};

export const useIntercityRouting = () => {
  const [currentRoute, setCurrentRoute] = useState<IntercityRoute | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const findOptimalChargingStations = (
    userLocation: [number, number],
    destination: [number, number],
    currentBatteryLevel: number,
    vehicleRange: number,
    strategy: RouteStrategy = 'fastest'
  ): any[] => {
    const directDistance = calculateDistance(userLocation, destination);
    const currentRange = (currentBatteryLevel / 100) * vehicleRange * 0.9; // 90% safety buffer
    
    console.log(`🔋 Current range: ${currentRange}km, Trip distance: ${directDistance}km`);
    console.log(`🚗 Vehicle max range: ${vehicleRange}km, Battery: ${currentBatteryLevel}%`);

    // If we can make it directly with safety buffer
    if (currentRange >= directDistance) {
      console.log('✅ Direct route possible - no charging needed');
      return [];
    }

    console.log('⚡ Charging stops required for this journey');

    // Calculate the bearing (direction) of the main route
    const calculateBearing = (from: [number, number], to: [number, number]): number => {
      const dLon = (to[1] - from[1]) * Math.PI / 180;
      const lat1 = from[0] * Math.PI / 180;
      const lat2 = to[0] * Math.PI / 180;
      
      const y = Math.sin(dLon) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      
      const bearing = Math.atan2(y, x) * 180 / Math.PI;
      return (bearing + 360) % 360;
    };

    // Check if a station is "on route" by checking if it's within a reasonable corridor
    const isStationOnRoute = (station: any): boolean => {
      const stationPos = station.coordinates;
      const distanceToStation = calculateDistance(userLocation, stationPos);
      const distanceFromStationToDest = calculateDistance(stationPos, destination);
      const totalRouteDistance = distanceToStation + distanceFromStationToDest;
      
      // Station should not add more than 15% extra distance
      const detourPercentage = ((totalRouteDistance - directDistance) / directDistance) * 100;
      if (detourPercentage > 15) return false;
      
      // Check if station is roughly in the direction of travel
      const bearingToDestination = calculateBearing(userLocation, destination);
      const bearingToStation = calculateBearing(userLocation, stationPos);
      const bearingDifference = Math.abs(bearingToDestination - bearingToStation);
      const normalizedBearingDiff = Math.min(bearingDifference, 360 - bearingDifference);
      
      // Station should be within 45 degrees of the main route direction
      return normalizedBearingDiff <= 45;
    };

    // Find stations that are actually on the route
    const routeStations = ALL_INTERCITY_STATIONS.filter(station => {
      const distanceToStation = calculateDistance(userLocation, station.coordinates);
      
      // Station should be within current range
      const canReachStation = distanceToStation <= currentRange;
      
      // Station should be on the route
      const onRoute = isStationOnRoute(station);
      
      return canReachStation && onRoute;
    });

    if (routeStations.length === 0) {
      // Fallback: look for any stations within range, even if slightly off route
      console.warn('⚠️ No on-route stations found, looking for nearby alternatives...');
      const nearbyStations = ALL_INTERCITY_STATIONS.filter(station => {
        const distanceToStation = calculateDistance(userLocation, station.coordinates);
        const distanceFromStationToDest = calculateDistance(station.coordinates, destination);
        const totalDetour = distanceToStation + distanceFromStationToDest;
        const maxDetour = directDistance * 1.25; // Allow 25% detour as fallback
        
        return distanceToStation <= currentRange && totalDetour <= maxDetour;
      });
      
      if (nearbyStations.length === 0) {
        console.error('❌ No suitable charging stations found within range!');
        return [];
      }
      
      routeStations.push(...nearbyStations);
    }

    // Enhanced scoring for route-based selection
    const scoredStations = routeStations.map(station => {
      const distanceToStation = calculateDistance(userLocation, station.coordinates);
      const distanceFromStationToDest = calculateDistance(station.coordinates, destination);
      const totalRouteDistance = distanceToStation + distanceFromStationToDest;
      const detourPercentage = ((totalRouteDistance - directDistance) / directDistance) * 100;
      
      // Scoring factors
      const routeEfficiencyScore = Math.max(0, 100 - detourPercentage * 2); // Heavily penalize detours
      const powerScore = (station.chargingPower / 200) * 100;
      const safetyScore = (station.safetyRating / 5) * 100;
      const amenityScore = station.amenities.length * 10;
      const operationalScore = station.operatingHours === '24/7' ? 100 : 70;
      
      // Check if station is at optimal distance (around 80% of current range)
      const optimalDistance = currentRange * 0.8;
      const distanceOptimalityScore = Math.max(0, 100 - Math.abs(distanceToStation - optimalDistance) * 2);
      
      // Strategy-based scoring
      let strategyScore = 50;
      switch (strategy) {
        case 'fastest':
          strategyScore = (powerScore * 0.6) + (operationalScore * 0.4);
          break;
        case 'shortest':
          strategyScore = routeEfficiencyScore;
          break;
        case 'least-traffic':
          strategyScore = (safetyScore * 0.7) + (amenityScore * 0.3);
          break;
      }

      const totalScore = (
        routeEfficiencyScore * 0.35 + // Prioritize route efficiency
        strategyScore * 0.25 +
        distanceOptimalityScore * 0.20 +
        safetyScore * 0.15 +
        amenityScore * 0.05
      );

      return {
        ...station,
        distanceToStation,
        distanceFromStationToDest,
        detourPercentage,
        score: Math.round(totalScore),
        remainingDistanceAfterCharging: distanceFromStationToDest
      };
    });

    // Sort by score and select the best station(s)
    scoredStations.sort((a, b) => b.score - a.score);
    
    // Intelligent multi-stop planning algorithm
    const selectedStations = [];
    let currentPos = userLocation;
    let remainingBatteryRange = currentRange;
    let totalRouteDistance = 0;
    
    // Plan charging stops intelligently
    while (true) {
      const remainingDistanceToDestination = calculateDistance(currentPos, destination);
      
      // Check if we can reach destination with current range
      if (remainingBatteryRange >= remainingDistanceToDestination) {
        console.log(`✅ Can reach destination from current position (${remainingDistanceToDestination.toFixed(1)}km remaining, ${remainingBatteryRange.toFixed(1)}km range)`);
        break;
      }
      
      // Find the best charging station within current range
      const reachableStations = scoredStations.filter(station => {
        const distanceToStation = calculateDistance(currentPos, station.coordinates);
        return distanceToStation <= remainingBatteryRange && 
               !selectedStations.some(selected => selected.id === station.id); // Avoid duplicates
      });
      
      if (reachableStations.length === 0) {
        console.error('❌ No reachable charging stations found!');
        break;
      }
      
      // Select the station that optimizes the journey
      const bestStation = reachableStations.reduce((best, current) => {
        const distanceToBest = calculateDistance(currentPos, best.coordinates);
        const distanceToCurrent = calculateDistance(currentPos, current.coordinates);
        const remainingAfterBest = calculateDistance(best.coordinates, destination);
        const remainingAfterCurrent = calculateDistance(current.coordinates, destination);
        
        // Prefer stations that get us closer to destination while being reachable
        const bestProgress = distanceToBest - remainingAfterBest;
        const currentProgress = distanceToCurrent - remainingAfterCurrent;
        
        return currentProgress > bestProgress ? current : best;
      });
      
      const distanceToStation = calculateDistance(currentPos, bestStation.coordinates);
      selectedStations.push({
        ...bestStation,
        distanceFromPrevious: distanceToStation,
        chargingTime: Math.max(20, Math.min(45, (vehicleRange * 0.8) / bestStation.chargingPower * 60)) // Estimate charging time
      });
      
      // Update position and range after charging
      currentPos = bestStation.coordinates;
      remainingBatteryRange = vehicleRange * 0.85; // Conservative 85% charge for safety
      totalRouteDistance += distanceToStation;
      
      console.log(`⚡ Added charging stop: ${bestStation.name} (${distanceToStation.toFixed(1)}km from previous)`);
      
      // Safety check to prevent infinite loops
      if (selectedStations.length >= 3) {
        console.warn('⚠️ Maximum charging stops reached (3)');
        break;
      }
    }

    console.log(`⚡ Selected ${selectedStations.length} optimal charging stations for ${directDistance.toFixed(0)}km journey`);

    return selectedStations;
  };

  const getIntercityDirections = async (
    from: [number, number], 
    to: [number, number], 
    strategy: RouteStrategy = 'fastest'
  ) => {
    try {
      const waypoints = `${from[1]},${from[0]};${to[1]},${to[0]}`;
      
      // Map strategy to Mapbox routing profile for long distance
      let profile = 'driving-traffic'; // Default for intercity
      let queryParams = '';
      
      switch (strategy) {
        case 'fastest':
          profile = 'driving-traffic';
          queryParams = '&annotations=duration,distance';
          break;
        case 'shortest':
          profile = 'driving';
          queryParams = '&overview=simplified';
          break;
        case 'least-traffic':
          profile = 'driving';
          queryParams = '&alternatives=true&annotations=duration';
          break;
      }
      
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${waypoints}?geometries=geojson&access_token=${MAPBOX_TOKEN}${queryParams}`;
      
      console.log('🗺️ Fetching intercity route from Mapbox API');
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }
      
      // Select best route based on strategy
      let selectedRoute = data.routes[0];
      if (strategy === 'least-traffic' && data.routes.length > 1) {
        selectedRoute = data.routes.reduce((best, current) => 
          current.duration < best.duration ? current : best
        );
      }
      
      const distance = selectedRoute.distance / 1000; // Convert to km
      const duration = selectedRoute.duration / 60; // Convert to minutes
      
      console.log(`📊 Intercity route: ${distance.toFixed(1)}km, ${formatDuration(Math.round(duration))}`);
      
      return {
        distance,
        duration,
        geometry: selectedRoute.geometry
      };
    } catch (error) {
      console.error('Error fetching intercity directions:', error);
      
      // Fallback to simple calculation
      const distance = calculateDistance(from, to);
      const baseDuration = (distance / 80) * 60; // 80 km/h highway speed
      
      return {
        distance,
        duration: baseDuration,
        geometry: {
          type: 'LineString',
          coordinates: [[from[1], from[0]], [to[1], to[0]]]
        }
      };
    }
  };

  const calculateIntercityRoute = async (
    userLocation: [number, number],
    destination: [number, number],
    currentBatteryLevel: number,
    vehicleRange: number,
    destinationInfo: { name: string; city: string },
    strategy: RouteStrategy = 'fastest'
  ): Promise<IntercityRoute | null> => {
    setIsCalculating(true);

    try {
      console.log(`🚗 Planning ${strategy} intercity route to ${destinationInfo.name}, ${destinationInfo.city}`);
      
      // Get direct route first
      const directRoute = await getIntercityDirections(userLocation, destination, strategy);
      
      if (!directRoute) {
        toast({
          title: "Route Error",
          description: "Unable to calculate intercity route",
          variant: "destructive"
        });
        return null;
      }

      const warnings: string[] = [];
      const currentRange = (currentBatteryLevel / 100) * vehicleRange * 0.9;

      // Safety checks for intercity travel
      if (currentBatteryLevel < 30) {
        warnings.push("⚠️ Low battery - consider charging before departure");
      }
      
      if (directRoute.distance > 800) {
        warnings.push("🛣️ Very long journey - plan overnight stops if needed");
      }

      // Check if charging is needed (more precise calculation)
      const needsCharging = currentRange < directRoute.distance;
      console.log(`🔍 Range check: Current=${currentRange.toFixed(1)}km, Needed=${directRoute.distance.toFixed(1)}km, Charging needed: ${needsCharging}`);
      
      if (!needsCharging) {
        // Direct route possible
        const route: IntercityRoute = {
          segments: [{
            id: 'direct-intercity',
            from: userLocation,
            to: destination,
            distance: directRoute.distance,
            duration: directRoute.duration,
            type: 'direct',
            highway: 'Direct Route'
          }],
          totalDistance: directRoute.distance,
          totalDuration: directRoute.duration,
          totalDurationHours: formatDuration(Math.round(directRoute.duration)),
          needsCharging: false,
          chargingStops: [],
          safetyScore: currentBatteryLevel > 50 ? 95 : 80,
          intercityDestination: destinationInfo,
          strategy,
          geometry: directRoute.geometry,
          warnings,
          estimatedCost: Math.round(directRoute.distance * 0.8) // ₹0.8 per km for fuel/electricity
        };

        setCurrentRoute(route);
        
        toast({
          title: "✅ Direct Route Available",
          description: `${route.totalDurationHours} journey without charging stops`,
          duration: 4000
        });

        return route;
      }

      // Find optimal charging stations
      const chargingStations = findOptimalChargingStations(
        userLocation, 
        destination, 
        currentBatteryLevel, 
        vehicleRange, 
        strategy
      );

      if (chargingStations.length === 0) {
        warnings.push("❌ No suitable charging stations found on route");
        toast({
          title: "⚠️ Route Not Feasible",
          description: "No charging stations within range. Consider starting with higher battery level.",
          variant: "destructive"
        });
        return null;
      }

      // Calculate multi-segment route with charging stops
      const segments: IntercityRouteSegment[] = [];
      let totalDuration = 0;
      let totalDistance = 0;
      let currentPosition = userLocation;
      const geometries: any[] = [];

      for (let i = 0; i < chargingStations.length; i++) {
        const station = chargingStations[i];
        const stationPos: [number, number] = station.coordinates;
        
        // Route to charging station
        const segmentRoute = await getIntercityDirections(currentPosition, stationPos, strategy);
        if (segmentRoute) {
          segments.push({
            id: `to-charging-${i}`,
            from: currentPosition,
            to: stationPos,
            distance: segmentRoute.distance,
            duration: segmentRoute.duration + 30, // Add 30min charging time
            type: 'charging',
            chargingStation: station,
            highway: station.highway,
            safetyRating: station.safetyRating
          });
          
          totalDuration += segmentRoute.duration + 30;
          totalDistance += segmentRoute.distance;
          geometries.push(segmentRoute.geometry);
          currentPosition = stationPos;
        }
      }

      // Final segment to destination
      const finalRoute = await getIntercityDirections(currentPosition, destination, strategy);
      if (finalRoute) {
        segments.push({
          id: 'final-intercity',
          from: currentPosition,
          to: destination,
          distance: finalRoute.distance,
          duration: finalRoute.duration,
          type: 'final',
          highway: 'Final Approach'
        });
        
        totalDuration += finalRoute.duration;
        totalDistance += finalRoute.distance;
        geometries.push(finalRoute.geometry);
      }

      // Calculate safety score based on charging infrastructure
      const safetyScore = Math.min(95, 60 + (chargingStations.length * 15) + 
        (chargingStations.reduce((sum, s) => sum + s.safetyRating, 0) / chargingStations.length) * 4);

      // Combine geometries for visualization
      const combinedGeometry = geometries.length > 1 ? {
        type: 'MultiLineString',
        coordinates: geometries.map(g => g.coordinates)
      } : geometries[0];

      const route: IntercityRoute = {
        segments,
        totalDistance,
        totalDuration,
        totalDurationHours: formatDuration(Math.round(totalDuration)),
        needsCharging: true,
        chargingStops: chargingStations,
        safetyScore: Math.round(safetyScore),
        intercityDestination: destinationInfo,
        strategy,
        geometry: combinedGeometry,
        warnings,
        estimatedCost: Math.round(totalDistance * 1.2 + chargingStations.length * 50) // Include charging costs
      };

      setCurrentRoute(route);

      toast({
        title: "⚡ Intercity Route with Charging",
        description: `${route.totalDurationHours} journey with ${chargingStations.length} charging stop(s)`,
        duration: 5000
      });

      return route;

    } catch (error) {
      console.error('Error calculating intercity route:', error);
      toast({
        title: "Route Calculation Failed",
        description: "Unable to calculate intercity route. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }

    return null;
  };

  const clearRoute = () => {
    setCurrentRoute(null);
  };

  return {
    currentRoute,
    isCalculating,
    calculateIntercityRoute,
    clearRoute
  };
};