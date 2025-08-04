
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { hybridMLPredictor } from '@/utils/hybridMLPredictor';
import { RouteStrategy } from '@/components/RouteStrategyModal';

export interface RouteSegment {
  id: string;
  from: [number, number];
  to: [number, number];
  distance: number; // km
  duration: number; // minutes
  type: 'direct' | 'charging' | 'final';
  chargingStation?: any;
}

export interface SmartRoute {
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  needsCharging: boolean;
  chargingStops: any[];
  mlRecommendation: string;
  trafficConditions: 'Light' | 'Moderate' | 'Heavy';
  weatherImpact: 'Clear' | 'Moderate' | 'High';
  simulationTime: Date;
  strategy?: RouteStrategy;
  geometry?: any;
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

// Generate realistic route geometry that follows roads
const generateRoadFollowingRoute = (
  start: [number, number], 
  end: [number, number], 
  waypoints: any[] = []
): any => {
  // Create a route that follows main roads in Bangalore
  const startLng = start[1];
  const startLat = start[0];
  const endLng = end[1];
  const endLat = end[0];
  
  // Generate intermediate points that follow major roads
  const coordinates: [number, number][] = [];
  
  // Start point
  coordinates.push([startLng, startLat]);
  
  // Calculate direction and distance
  const deltaLng = endLng - startLng;
  const deltaLat = endLat - startLat;
  const distance = Math.sqrt(deltaLng * deltaLng + deltaLat * deltaLat);
  
  // Add intermediate points to simulate road following
  const numSegments = Math.max(5, Math.floor(distance * 100)); // More points for smoother curves
  
  for (let i = 1; i < numSegments; i++) {
    const progress = i / numSegments;
    
    // Basic interpolation with slight road-like curves
    let lng = startLng + deltaLng * progress;
    let lat = startLat + deltaLat * progress;
    
    // Add slight variations to simulate following roads
    const variation = 0.002; // Small variation for road-like paths
    lng += Math.sin(progress * Math.PI * 3) * variation * Math.random();
    lat += Math.cos(progress * Math.PI * 2) * variation * Math.random();
    
    // Add waypoints if they exist
    if (waypoints.length > 0) {
      for (const waypoint of waypoints) {
        const waypointProgress = calculateDistance([startLat, startLng], [waypoint.lat, waypoint.lng]) / 
                                calculateDistance([startLat, startLng], [endLat, endLng]);
        
        if (Math.abs(progress - waypointProgress) < 0.1) {
          lng = waypoint.lng;
          lat = waypoint.lat;
          break;
        }
      }
    }
    
    coordinates.push([lng, lat]);
  }
  
  // End point
  coordinates.push([endLng, endLat]);
  
  return {
    type: 'LineString',
    coordinates
  };
};

export const useSmartEVRouting = () => {
  const [currentRoute, setCurrentRoute] = useState<SmartRoute | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();


  const getTrafficConditions = (): 'Light' | 'Moderate' | 'Heavy' => {
    const hour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());
    
    if (isWeekend) {
      if (hour >= 10 && hour <= 14) return 'Moderate';
      if (hour >= 19 && hour <= 21) return 'Moderate';
      return 'Light';
    } else {
      if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) return 'Heavy';
      if (hour >= 12 && hour <= 14) return 'Moderate';
      return 'Light';
    }
  };

  const getWeatherImpact = (): 'Clear' | 'Moderate' | 'High' => {
    // Simulate weather conditions
    const conditions = ['sunny', 'cloudy', 'rainy', 'stormy'];
    const weather = conditions[Math.floor(Math.random() * conditions.length)];
    
    switch (weather) {
      case 'stormy': return 'High';
      case 'rainy': return 'Moderate';
      default: return 'Clear';
    }
  };

  const findOptimalChargingStation = (
    userLocation: [number, number],
    destination: [number, number],
    stations: any[]
  ): any | null => {
    const directDistance = calculateDistance(userLocation, destination);
    const currentTime = new Date();
    
    // Filter charging stations that are roughly on the way
    const viableStations = stations.filter(station => {
      const distanceToStation = calculateDistance(userLocation, [station.lat, station.lng]);
      const distanceFromStationToDest = calculateDistance([station.lat, station.lng], destination);
      
      const detourDistance = distanceToStation + distanceFromStationToDest;
      const maxDetour = directDistance * 1.3;
      
      return detourDistance <= maxDetour && distanceToStation < directDistance * 0.8;
    });

    if (viableStations.length === 0) return null;

    // Rank stations using ML predictions and optimization criteria
    const rankedStations = viableStations.map(station => {
      const prediction = hybridMLPredictor.predict(station.id, currentTime);
      const distanceToStation = calculateDistance(userLocation, [station.lat, station.lng]);
      
      // Calculate ML score (0-100)
      const availabilityScore = (prediction.availability / 8) * 100;
      const waitTimeScore = Math.max(0, 100 - prediction.waitTime * 2);
      const distanceScore = Math.max(0, 100 - (distanceToStation / 50) * 100);
      
      const mlScore = Math.round(
        (availabilityScore * 0.5) + 
        (waitTimeScore * 0.3) + 
        (distanceScore * 0.2)
      );

      return {
        ...station,
        prediction,
        distanceToStation,
        mlScore,
        status: prediction.status === 'available' ? 'Excellent' :
               prediction.status === 'moderate' ? 'Moderate' :
               prediction.status === 'busy' ? 'Busy' : 'Critical'
      };
    });

    // Sort by ML score (highest first)
    rankedStations.sort((a, b) => b.mlScore - a.mlScore);
    
    return rankedStations[0];
  };

  const getDirections = async (from: [number, number], to: [number, number], strategy?: RouteStrategy) => {
    try {
      // Use Mapbox Directions API for real road following
      const waypoints = `${from[1]},${from[0]};${to[1]},${to[0]}`;
      
      // Map strategy to Mapbox routing profile
      let profile = 'driving';
      switch (strategy) {
        case 'fastest':
          profile = 'driving-traffic'; // Uses real-time traffic data
          break;
        case 'shortest':
          profile = 'driving'; // Standard driving route
          break;
        case 'least-traffic':
          profile = 'driving'; // We'll use alternatives for this
          break;
        default:
          profile = 'driving';
      }
      
      let url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${waypoints}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
      
      // For least-traffic, request alternatives and pick the best one
      if (strategy === 'least-traffic') {
        url += '&alternatives=true';
      }
      
      console.log('🗺️ Fetching route from Mapbox API:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }
      
      // Select the best route based on strategy
      let selectedRoute = data.routes[0];
      
      if (strategy === 'least-traffic' && data.routes.length > 1) {
        // For least-traffic, pick the route with longest estimated duration (assuming less traffic)
        selectedRoute = data.routes.reduce((best, current) => 
          current.duration < best.duration ? current : best
        );
      }
      
      const distance = selectedRoute.distance / 1000; // Convert to km
      const duration = selectedRoute.duration / 60; // Convert to minutes
      
      console.log(`📊 Mapbox route: ${distance.toFixed(1)}km, ${duration.toFixed(0)}min`);
      
      return {
        distance,
        duration,
        geometry: selectedRoute.geometry
      };
    } catch (error) {
      console.error('Error fetching Mapbox directions:', error);
      
      // Fallback to simple route if Mapbox fails
      console.log('🔄 Falling back to simple route calculation');
      const distance = calculateDistance(from, to);
      const baseDuration = (distance / 25) * 60; // 25 km/h average city speed
      
      // Create a simple straight line geometry as fallback
      const geometry = {
        type: 'LineString',
        coordinates: [[from[1], from[0]], [to[1], to[0]]]
      };
      
      return {
        distance,
        duration: baseDuration,
        geometry
      };
    }
  };

  const calculateRouteWithStrategy = async (
    userLocation: [number, number],
    destination: [number, number],
    stations: any[],
    canReachDestination: (distance: number) => boolean,
    strategy: RouteStrategy
  ): Promise<SmartRoute | null> => {
    setIsCalculating(true);

    try {
      // Get route to destination with specific strategy
      const directRoute = await getDirections(userLocation, destination, strategy);
      
      if (!directRoute) {
        toast({
          title: "Route Error",
          description: "Unable to calculate route to destination",
          variant: "destructive"
        });
        return null;
      }

      console.log(`🔋 Route planning with ${strategy} strategy: ${directRoute.distance.toFixed(1)}km`);

      // Check if we can reach destination directly
      if (canReachDestination(directRoute.distance)) {
        // Direct route is possible
        const trafficConditions = getTrafficConditions();
        const weatherImpact = getWeatherImpact();
        
        // Adjust duration for traffic and weather
        let adjustedDuration = directRoute.duration;
        if (trafficConditions === 'Heavy') adjustedDuration *= 1.3;
        else if (trafficConditions === 'Moderate') adjustedDuration *= 1.15;
        
        if (weatherImpact === 'High') adjustedDuration *= 1.2;
        else if (weatherImpact === 'Moderate') adjustedDuration *= 1.1;

        console.log('✅ Direct route possible without charging');

        const route: SmartRoute = {
          segments: [{
            id: 'direct',
            from: userLocation,
            to: destination,
            distance: directRoute.distance,
            duration: adjustedDuration,
            type: 'direct'
          }],
          totalDistance: directRoute.distance,
          totalDuration: adjustedDuration,
          needsCharging: false,
          chargingStops: [],
          mlRecommendation: `${strategy} route feasible without charging`,
          trafficConditions,
          weatherImpact,
          simulationTime: new Date(),
          strategy,
          geometry: directRoute.geometry
        };

        setCurrentRoute(route);
        return route;
      }

      // Need charging - plan multiple stops if necessary
      console.log('⚡ Need charging stops - calculating multi-station route');
      
      const chargingStops: any[] = [];
      let currentLocation = userLocation;
      let remainingDistance = directRoute.distance;
      let segmentCount = 0;
      const maxSegments = 10; // Safety limit

      // Calculate how much distance we can cover with current range
      const calculateRemainingRange = (currentBattery: number, totalRange: number) => {
        return (currentBattery / 100) * totalRange * 0.8; // Keep 20% safety buffer
      };

      let currentBatteryLevel = 85; // Assume we start with reasonable charge for strategy planning

      while (remainingDistance > 0 && segmentCount < maxSegments) {
        const currentRange = calculateRemainingRange(currentBatteryLevel, 312); // Default EV range
        
        if (currentRange >= remainingDistance) {
          // Can reach destination from current position
          console.log(`🎯 Final segment: ${remainingDistance.toFixed(1)}km to destination`);
          break;
        }

        // Find optimal charging station for current position
        const searchRadius = currentRange * 0.9; // Use 90% of range for safety
        console.log(`🔍 Looking for charging station within ${searchRadius.toFixed(1)}km radius`);

        const suitableStations = stations.filter(station => {
          const distanceToStation = calculateDistance(currentLocation, [station.lat, station.lng]);
          const distanceFromStationToDestination = calculateDistance([station.lat, station.lng], destination);
          
          return distanceToStation <= searchRadius && 
                 distanceFromStationToDestination < remainingDistance &&
                 !chargingStops.some(stop => stop.id === station.id);
        });

        if (suitableStations.length === 0) {
          console.log('❌ No suitable charging stations found - route not possible');
          toast({
            title: "Route Not Possible",
            description: "Cannot find suitable charging stations for this route",
            variant: "destructive"
          });
          return null;
        }

        // Rank stations using ML predictions and strategy preferences
        const rankedStations = suitableStations.map(station => {
          const prediction = hybridMLPredictor.predict(station.id, new Date());
          const distanceToStation = calculateDistance(currentLocation, [station.lat, station.lng]);
          const distanceToDestination = calculateDistance([station.lat, station.lng], destination);
          
          // Strategy-based scoring
          let strategyScore = 0;
          switch (strategy) {
            case 'fastest':
              strategyScore = station.type === 'fast-charging' ? 20 : station.type === 'battery-swap' ? 25 : 10;
              break;
            case 'shortest':
              strategyScore = Math.max(0, 25 - (distanceToStation / 10)); // Prefer closer stations
              break;
            case 'least-traffic':
              strategyScore = prediction.availability > 6 ? 25 : prediction.availability > 4 ? 15 : 5;
              break;
          }

          const availabilityScore = (prediction.availability / 8) * 25;
          const waitTimeScore = Math.max(0, 25 - prediction.waitTime * 2);
          const progressScore = Math.max(0, 25 - (distanceToDestination / remainingDistance) * 25);

          const totalScore = strategyScore + availabilityScore + waitTimeScore + progressScore;

          return {
            ...station,
            prediction,
            distanceToStation,
            totalScore,
            status: prediction.status === 'available' ? 'Excellent' :
                   prediction.status === 'moderate' ? 'Good' :
                   prediction.status === 'busy' ? 'Busy' : 'Critical'
          };
        });

        // Sort by total score (highest first)
        rankedStations.sort((a, b) => b.totalScore - a.totalScore);
        const selectedStation = rankedStations[0];

        console.log(`⚡ Selected charging station: ${selectedStation.name} (Score: ${selectedStation.totalScore.toFixed(1)})`);

        chargingStops.push(selectedStation);
        
        // Update current location and remaining distance
        currentLocation = [selectedStation.lat, selectedStation.lng];
        remainingDistance = calculateDistance(currentLocation, destination);
        currentBatteryLevel = 90; // Assume we charge to 90%
        segmentCount++;

        console.log(`📍 After ${selectedStation.name}: ${remainingDistance.toFixed(1)}km remaining`);
      }

      if (segmentCount >= maxSegments) {
        toast({
          title: "Route Too Complex",
          description: "Route requires too many charging stops",
          variant: "destructive"
        });
        return null;
      }

      // Build route segments
      const segments: RouteSegment[] = [];
      let currentPos = userLocation;

      for (let i = 0; i < chargingStops.length; i++) {
        const station = chargingStops[i];
        const segmentRoute = await getDirections(currentPos, [station.lat, station.lng], strategy);
        
        if (!segmentRoute) {
          toast({
            title: "Route Error",
            description: `Unable to calculate route to ${station.name}`,
            variant: "destructive"
          });
          return null;
        }

        segments.push({
          id: `to-charging-${i}`,
          from: currentPos,
          to: [station.lat, station.lng],
          distance: segmentRoute.distance,
          duration: segmentRoute.duration,
          type: 'charging',
          chargingStation: station
        });

        currentPos = [station.lat, station.lng];
      }

      // Final segment to destination
      const finalRoute = await getDirections(currentPos, destination, strategy);
      if (!finalRoute) {
        toast({
          title: "Route Error",
          description: "Unable to calculate final route segment",
          variant: "destructive"
        });
        return null;
      }

      segments.push({
        id: 'final',
        from: currentPos,
        to: destination,
        distance: finalRoute.distance,
        duration: finalRoute.duration,
        type: 'final'
      });

      const trafficConditions = getTrafficConditions();
      const weatherImpact = getWeatherImpact();

      // Apply traffic and weather adjustments
      segments.forEach(segment => {
        if (trafficConditions === 'Heavy') segment.duration *= 1.3;
        else if (trafficConditions === 'Moderate') segment.duration *= 1.15;
        
        if (weatherImpact === 'High') segment.duration *= 1.2;
        else if (weatherImpact === 'Moderate') segment.duration *= 1.1;
      });

      const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
      const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0) + (chargingStops.length * 30); // Add charging time

      // Create combined geometry for visualization
      const geometries = await Promise.all(
        segments.map(segment => getDirections(segment.from, segment.to, strategy))
      );
      
      const combinedGeometry = {
        type: 'MultiLineString',
        coordinates: geometries.filter(g => g).map(g => g!.geometry.coordinates)
      };

      const route: SmartRoute = {
        segments,
        totalDistance,
        totalDuration,
        needsCharging: true,
        chargingStops,
        mlRecommendation: `${strategy} route with ${chargingStops.length} optimal charging stops`,
        trafficConditions,
        weatherImpact,
        simulationTime: new Date(),
        strategy,
        geometry: combinedGeometry
      };

      // Show route summary
      toast({
        title: `🗺️ ${strategy.charAt(0).toUpperCase() + strategy.slice(1)} Route Planned`,
        description: `${chargingStops.length} charging stops • ${totalDistance.toFixed(1)}km • ${Math.round(totalDuration/60)}h ${Math.round(totalDuration%60)}m`,
        duration: 5000
      });

      setCurrentRoute(route);
      return route;

    } catch (error) {
      console.error('Error calculating smart route:', error);
      toast({
        title: "Route Calculation Failed",
        description: "Unable to calculate route. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }

    return null;
  };

  const calculateSmartRoute = async (
    userLocation: [number, number],
    destination: [number, number],
    stations: any[],
    canReachDestination: (distance: number) => boolean
  ): Promise<SmartRoute | null> => {
    setIsCalculating(true);

    try {
      // First, get direct route to check if we can reach destination
      const directRoute = await getDirections(userLocation, destination);
      
      if (!directRoute) {
        toast({
          title: "Route Error",
          description: "Unable to calculate route to destination",
          variant: "destructive"
        });
        return null;
      }

      // Check if we can reach destination directly
      if (canReachDestination(directRoute.distance)) {
        // Direct route is possible
        const trafficConditions = getTrafficConditions();
        const weatherImpact = getWeatherImpact();
        
        // Adjust duration for traffic and weather
        let adjustedDuration = directRoute.duration;
        if (trafficConditions === 'Heavy') adjustedDuration *= 1.3;
        else if (trafficConditions === 'Moderate') adjustedDuration *= 1.15;
        
        if (weatherImpact === 'High') adjustedDuration *= 1.2;
        else if (weatherImpact === 'Moderate') adjustedDuration *= 1.1;

        const route: SmartRoute = {
          segments: [{
            id: 'direct',
            from: userLocation,
            to: destination,
            distance: directRoute.distance,
            duration: adjustedDuration,
            type: 'direct'
          }],
          totalDistance: directRoute.distance,
          totalDuration: adjustedDuration,
          needsCharging: false,
          chargingStops: [],
          mlRecommendation: "Route feasible without charging",
          trafficConditions,
          weatherImpact,
          simulationTime: new Date()
        };

        setCurrentRoute(route);
        return route;
      }

      // Need charging - find optimal charging station using ML
      const chargingStation = findOptimalChargingStation(userLocation, destination, stations);
      
      if (!chargingStation) {
        toast({
          title: "No Charging Station Found",
          description: "No suitable charging stations found on your route",
          variant: "destructive"
        });
        return null;
      }

      const trafficConditions = getTrafficConditions();
      const weatherImpact = getWeatherImpact();

      // Get route segments
      const toChargingRoute = await getDirections(userLocation, [chargingStation.lat, chargingStation.lng]);
      const fromChargingRoute = await getDirections([chargingStation.lat, chargingStation.lng], destination);

      if (!toChargingRoute || !fromChargingRoute) {
        toast({
          title: "Route Error",
          description: "Unable to calculate route via charging station",
          variant: "destructive"
        });
        return null;
      }

      // Adjust durations for traffic and weather
      let adjustedToChargingDuration = toChargingRoute.duration;
      let adjustedFromChargingDuration = fromChargingRoute.duration;
      
      if (trafficConditions === 'Heavy') {
        adjustedToChargingDuration *= 1.3;
        adjustedFromChargingDuration *= 1.3;
      } else if (trafficConditions === 'Moderate') {
        adjustedToChargingDuration *= 1.15;
        adjustedFromChargingDuration *= 1.15;
      }
      
      if (weatherImpact === 'High') {
        adjustedToChargingDuration *= 1.2;
        adjustedFromChargingDuration *= 1.2;
      } else if (weatherImpact === 'Moderate') {
        adjustedToChargingDuration *= 1.1;
        adjustedFromChargingDuration *= 1.1;
      }

      // Combine geometries for the complete route
      const completeGeometry = {
        type: 'LineString',
        coordinates: [
          ...toChargingRoute.geometry.coordinates,
          ...fromChargingRoute.geometry.coordinates
        ]
      };

      const route: SmartRoute = {
        segments: [
          {
            id: 'to-charging',
            from: userLocation,
            to: [chargingStation.lat, chargingStation.lng],
            distance: toChargingRoute.distance,
            duration: adjustedToChargingDuration,
            type: 'charging',
            chargingStation: {
              ...chargingStation,
              mlScore: chargingStation.mlScore,
              status: chargingStation.status
            }
          },
          {
            id: 'from-charging',
            from: [chargingStation.lat, chargingStation.lng],
            to: destination,
            distance: fromChargingRoute.distance,
            duration: adjustedFromChargingDuration,
            type: 'final'
          }
        ],
        totalDistance: toChargingRoute.distance + fromChargingRoute.distance,
        totalDuration: adjustedToChargingDuration + adjustedFromChargingDuration + 30, // Add 30min charging time
        needsCharging: true,
        chargingStops: [chargingStation],
        mlRecommendation: "ML recommends charging before journey for optimal route efficiency",
        trafficConditions,
        weatherImpact,
        simulationTime: new Date(),
        geometry: completeGeometry
      };

      // Show ML-powered charging recommendation
      toast({
        title: "⚡ Smart Charging Stop",
        description: `ML recommends ${chargingStation.name} (Score: ${chargingStation.mlScore}/100, Status: ${chargingStation.status})`,
        duration: 5000
      });

      setCurrentRoute(route);
      return route;

    } catch (error) {
      console.error('Error calculating smart route:', error);
      toast({
        title: "Route Calculation Failed",
        description: "Unable to calculate route. Please try again.",
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
    calculateSmartRoute,
    calculateRouteWithStrategy,
    clearRoute
  };
};
