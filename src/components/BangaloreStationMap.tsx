import { useState, useMemo } from "react";
import MapboxContainer from './map/MapboxContainer';
import StationList from './map/StationList';
import ControlPanel from './map/ControlPanel';
import MLStatusPanel from './map/MLStatusPanel';
import StationTypeFilter from './map/StationTypeFilter';
import BatteryStatusPanel from './map/BatteryStatusPanel';
import RouteStrategyModal, { RouteStrategy } from './RouteStrategyModal';
import RouteSummaryPanel from './RouteSummaryPanel';
import DestinationSearchModal from './DestinationSearchModal';
import { stationDisplayData, StationType } from "@/data/stationData";
import { useStationFiltering } from "@/hooks/useStationFiltering";
import { useEVBattery } from "@/hooks/useEVBattery";
import { useSmartEVRouting } from "@/hooks/useSmartEVRouting";
import { useToast } from "@/hooks/use-toast";
interface BangaloreStationMapProps {
  currentTime: Date;
  isSimulating: boolean;
  simulationSpeed: number;
  isModelReady: boolean;
  onToggleSimulation: () => void;
  onSpeedChange: (speed: number) => void;
  getPredictionData: (stationId: number) => any;
  getHeatColor: (stationId: number) => string;
  routeFromPlanner?: any;
  onClearRouteFromPlanner?: () => void;
}
const BangaloreStationMap = ({
  currentTime,
  isSimulating,
  simulationSpeed,
  isModelReady,
  onToggleSimulation,
  onSpeedChange,
  getPredictionData,
  getHeatColor,
  routeFromPlanner,
  onClearRouteFromPlanner
}: BangaloreStationMapProps) => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [filterTypes, setFilterTypes] = useState<StationType[]>(["all"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number]>([12.9716, 77.5946]);
  const [mapKey, setMapKey] = useState(0);
  const [hasUserMovedLocation, setHasUserMovedLocation] = useState(false);
  const [activeRoute, setActiveRoute] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  // Route strategy modal states
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<{
    station: any;
    name: string;
  } | null>(null);

  // Destination search modal states
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);

  // EV Battery management
  const {
    batteryData,
    updateBatteryLevel,
    updateTotalRange,
    canReachDestination
  } = useEVBattery();

  // Smart routing system
  const {
    currentRoute,
    isCalculating,
    calculateSmartRoute,
    calculateRouteWithStrategy,
    clearRoute
  } = useSmartEVRouting();
  const {
    toast
  } = useToast();

  // Use route from planner if available, otherwise use current route
  const displayRoute = routeFromPlanner || currentRoute;

  // Enhanced station selection with smart routing
  const handleStationSelect = async (station: any) => {
    setSelectedStation(station);
    console.log('🎯 Station selected:', station.name);
  };

  // Handle navigation request - opens route strategy modal
  const handleNavigateToStation = (station: any) => {
    setPendingDestination({
      station,
      name: station.name
    });
    setShowRouteModal(true);
  };

  // Handle destination selection from search modal
  const handleDestinationSelect = (destination: any) => {
    setSelectedDestination(destination);

    // Create a fake station object for the destination
    const destinationStation = {
      id: `dest-${destination.id}`,
      name: destination.name,
      location: destination.location,
      lat: destination.coordinates[0],
      lng: destination.coordinates[1],
      type: 'destination'
    };

    // Auto-select the destination and prepare for route planning
    setSelectedStation(destinationStation);

    // Trigger route strategy modal
    setPendingDestination({
      station: destinationStation,
      name: destination.name
    });
    setShowRouteModal(true);
    toast({
      title: "🎯 Destination Selected",
      description: `Ready to plan route to ${destination.name}`,
      duration: 2000
    });
  };

  // Handle route strategy selection
  const handleRouteStrategySelect = async (strategy: RouteStrategy) => {
    if (!pendingDestination) return;
    const destination: [number, number] = [pendingDestination.station.lat, pendingDestination.station.lng];
    try {
      const route = await calculateRouteWithStrategy(userLocation, destination, filteredStations, canReachDestination, strategy);
      if (route) {
        toast({
          title: "🗺️ Route Calculated",
          description: `${strategy.charAt(0).toUpperCase() + strategy.slice(1)} route to ${pendingDestination.name}`,
          duration: 3000
        });

        // Clear map route to show the new route
        setActiveRoute(null);
        setRouteInfo(null);
      }
    } catch (error) {
      console.error('Route calculation failed:', error);
    } finally {
      setPendingDestination(null);
    }
  };

  // Handle route summary close
  const handleRouteSummaryClose = () => {
    clearRoute();
    setActiveRoute(null);
    setRouteInfo(null);
    setSelectedStation(null);
    setSelectedDestination(null);
    onClearRouteFromPlanner?.(); // Clear the route from parent
    setMapKey(prev => prev + 1); // Force map re-render
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  // Handle user location changes
  const handleUserLocationChange = (newLocation: [number, number]) => {
    setUserLocation(newLocation);
    setHasUserMovedLocation(true);
  };

  // Smart station filtering with multiple filter support
  const filteredStations = useMemo(() => {
    // First apply basic filtering
    const basicFiltered = stationDisplayData.filter(station => {
      // If "all" is selected, include all station types
      if (filterTypes.includes("all")) {
        const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) || station.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      }

      // For specific types, check if station type matches any selected filter
      const typeFilters = filterTypes.filter(t => t !== "nearby");
      const matchesFilter = typeFilters.length === 0 || typeFilters.some(filter => filter === "fast-charging" && station.type === "fast-charging" || filter === "battery-swap" && station.type === "battery-swap");
      const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) || station.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    }).map(station => ({
      ...station,
      actualDistance: calculateDistance(userLocation[0], userLocation[1], station.lat, station.lng),
      prediction: getPredictionData(station.id)
    }));

    // Handle "nearby" filter - limit to 3 nearest stations
    if (filterTypes.includes("nearby")) {
      const sortedByDistance = basicFiltered.sort((a, b) => a.actualDistance - b.actualDistance);
      const nearbyStations = sortedByDistance.slice(0, 3);
      return nearbyStations.sort((a, b) => {
        const predictionA = getPredictionData(a.id);
        const predictionB = getPredictionData(b.id);

        // Primary sort: availability (higher first)
        if (predictionB.availability !== predictionA.availability) {
          return predictionB.availability - predictionA.availability;
        }

        // Secondary sort: wait time (lower first)
        if (predictionA.waitTime !== predictionB.waitTime) {
          return predictionA.waitTime - predictionB.waitTime;
        }

        // Tertiary sort: distance (closer first)
        return a.actualDistance - b.actualDistance;
      });
    }

    // For all other cases, show filtered stations sorted by smart criteria
    return basicFiltered.sort((a, b) => {
      const predictionA = getPredictionData(a.id);
      const predictionB = getPredictionData(b.id);

      // Primary sort: availability (higher first)
      if (predictionB.availability !== predictionA.availability) {
        return predictionB.availability - predictionA.availability;
      }

      // Secondary sort: wait time (lower first)
      if (predictionA.waitTime !== predictionB.waitTime) {
        return predictionA.waitTime - predictionB.waitTime;
      }

      // Tertiary sort: distance (closer first)
      return a.actualDistance - b.actualDistance;
    });
  }, [stationDisplayData, filterTypes, searchTerm, getPredictionData, userLocation]);
  return <section className="py-8 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4"> Smart EV Navigation & Charging</h2>
            </div>
          </div>
        </div>

        <MLStatusPanel isTraining={false} trainingProgress={1} />

        <BatteryStatusPanel />

        <StationTypeFilter filterTypes={filterTypes} onFilterChange={setFilterTypes} />

        <div className="mb-6">
          <ControlPanel currentTime={currentTime} isSimulating={isSimulating} simulationSpeed={simulationSpeed} isModelReady={isModelReady} onToggleSimulation={onToggleSimulation} onSpeedChange={onSpeedChange} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MapboxContainer key={mapKey} stations={filteredStations} selectedStation={selectedStation} onStationSelect={handleStationSelect} filterType={filterTypes.join(',')} isModelReady={isModelReady} currentTime={currentTime} getPredictionData={getPredictionData} getHeatColor={getHeatColor} userLocation={userLocation} onUserLocationChange={handleUserLocationChange} onRouteChange={(route, info) => {
            setActiveRoute(route);
            setRouteInfo(info);
          }} smartRoute={displayRoute} />
          </div>

          <StationList stations={filteredStations} selectedStation={selectedStation} onStationSelect={handleStationSelect} onNavigateToStation={handleNavigateToStation} searchTerm={searchTerm} onSearchChange={setSearchTerm} getPredictionData={getPredictionData} isModelReady={isModelReady} currentTime={currentTime} simulationSpeed={simulationSpeed} activeRoute={activeRoute} routeInfo={routeInfo} />
        </div>

        {/* Destination Search Modal */}
        <DestinationSearchModal isOpen={showDestinationModal} onClose={() => setShowDestinationModal(false)} onDestinationSelect={handleDestinationSelect} userLocation={userLocation} />

        {/* Route Strategy Modal */}
        <RouteStrategyModal isOpen={showRouteModal} onClose={() => {
        setShowRouteModal(false);
        setPendingDestination(null);
      }} onSelectStrategy={handleRouteStrategySelect} destination={pendingDestination?.name || ''} />

        {/* Route Summary Panel */}
        {displayRoute && <RouteSummaryPanel routeType={displayRoute.strategy || 'fastest'} totalDistance={displayRoute.totalDistance} estimatedTime={displayRoute.totalDuration} chargingStops={displayRoute.chargingStops} onClose={handleRouteSummaryClose} />}
      </div>
    </section>;
};
export default BangaloreStationMap;