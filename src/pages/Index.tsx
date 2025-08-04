import { useState, useEffect, useCallback } from "react";
import { Zap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { vehicleCache, cacheManager } from '@/utils/cacheManager';
import { hybridMLPredictor } from '@/utils/hybridMLPredictor';
import HomePage from "@/components/HomePage";
import SimpleEVSelection from "@/components/SimpleEVSelection";
import RoutePlanner from "@/components/RoutePlanner";
import BangaloreStationMap from "@/components/BangaloreStationMap";
import MobileNavigation from "@/components/MobileNavigation";
import AdminDashboard from "@/components/AdminDashboard";
import MyBookings from "@/components/MyBookings";
import CacheStatus from "@/components/CacheStatus";
const AppContent = () => {
  console.log('AppContent rendering...');
  const {
    user,
    logout,
    isAuthenticated
  } = useAuth();
  console.log('AppContent: auth values:', { user, isAuthenticated });
  const [currentStep, setCurrentStep] = useState("home");
  const [vehicleData, setVehicleData] = useState(() => {
    // Try to load vehicle from cache on initialization
    return vehicleCache.getVehicle();
  });
  const [routeFromPlanner, setRouteFromPlanner] = useState(null);
  const [activeTab, setActiveTab] = useState("map");

  // Shared time simulation state for both map and route planner
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [isModelReady, setIsModelReady] = useState(false);

  // Initialize hybrid ML predictor once for both components
  useEffect(() => {
    console.log('🚀 Initializing shared hybrid ML predictor...');
    setIsModelReady(true);
    console.log('✅ Shared hybrid ML predictor ready!');
  }, []);

  // Shared time simulation that both components use
  useEffect(() => {
    if (!isSimulating) return;

    // Calculate update frequency based on simulation speed for smoother experience
    const updateInterval = Math.max(100, 1000 / Math.min(simulationSpeed, 10)); // Faster updates for higher speeds

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = new Date(prev);
        // For very high speeds, advance more time per update but update more frequently
        const timeAdvance = simulationSpeed > 10 ? simulationSpeed * 2 : simulationSpeed;
        newTime.setMinutes(newTime.getMinutes() + timeAdvance);
        return newTime;
      });
    }, updateInterval);
    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed]);

  // Initialize Supreme Hybrid ML System
  useEffect(() => {
    const initializeHybrid = async () => {
      try {
        await hybridMLPredictor.initializeSupremeHybrid();
      } catch (error) {
        console.warn('Supreme Hybrid initialization failed, using fallback:', error);
      }
    };
    initializeHybrid();
  }, []);

  // Shared prediction function for both components
  const getPredictionData = useCallback((stationId: number) => {
    return hybridMLPredictor.predict(stationId, currentTime);
  }, [currentTime]);

  // Shared heat color function for consistent visualization
  const getHeatColor = useCallback((stationId: number) => {
    const prediction = getPredictionData(stationId);
    const usage = prediction.predictedUsage;
    if (usage >= 0.95) return '#7f1d1d'; // Very dark red
    if (usage >= 0.8) return '#dc2626'; // Dark red
    if (usage >= 0.7) return '#ef4444'; // Red
    if (usage >= 0.6) return '#f97316'; // Orange
    if (usage >= 0.5) return '#f59e0b'; // Amber
    if (usage >= 0.4) return '#eab308'; // Yellow
    if (usage >= 0.3) return '#84cc16'; // Lime
    if (usage >= 0.2) return '#22c55e'; // Green
    return '#16a34a'; // Dark green
  }, [getPredictionData]);
  const handleEVSelection = (evData: any) => {
    setVehicleData(evData);
    vehicleCache.setVehicle(evData); // Cache vehicle selection
    setCurrentStep("map");
  };
  const handleLogout = () => {
    logout();
    setCurrentStep("home");
    setVehicleData(null);
    vehicleCache.clearVehicle(); // Clear cached vehicle
    setActiveTab("map");
  };

  // Show home page if not authenticated
  if (!isAuthenticated) {
    return <HomePage />;
  }

  // Show admin dashboard if user is admin
  if (user?.email === "admin@admin.com") {
    return <AdminDashboard />;
  }

  // Show EV selection if authenticated but no vehicle selected
  if (currentStep === "home" || !vehicleData) {
    return <SimpleEVSelection onComplete={handleEVSelection} />;
  }

  // Show dashboard with tabs
  return <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header with navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent truncate">
                  ChargeSmart Bangalore
                </h1>
                {vehicleData && (
                  <Badge variant="outline" className="mt-1 text-xs hidden sm:inline-flex">
                    {(vehicleData as any)?.model}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-4 xl:space-x-6">
              <button onClick={() => setActiveTab("map")} className={`px-3 py-2 text-sm xl:text-base rounded-lg transition-colors ${activeTab === "map" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:text-green-600"}`}>
                <span className="hidden xl:inline">Bangalore Live Map</span>
                <span className="xl:hidden">Live Map</span>
              </button>
              <button onClick={() => setActiveTab("routing")} className={`px-3 py-2 text-sm xl:text-base rounded-lg transition-colors ${activeTab === "routing" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:text-green-600"}`}>
                <span className="hidden xl:inline">AI Route Planner</span>
                <span className="xl:hidden">Route Planner</span>
              </button>
              <button onClick={() => setActiveTab("bookings")} className={`px-3 py-2 text-sm xl:text-base rounded-lg transition-colors ${activeTab === "bookings" ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:text-green-600"}`}>
                My Bookings
              </button>
            </nav>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            
            {/* User section */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </div>
                <span className="text-gray-700 font-medium text-sm xl:text-base hidden xl:block">{user?.username}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs xl:text-sm">
                <span className="hidden xl:inline">Logout</span>
                <span className="xl:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {activeTab === "map" && <BangaloreStationMap currentTime={currentTime} isSimulating={isSimulating} simulationSpeed={simulationSpeed} isModelReady={isModelReady} onToggleSimulation={() => setIsSimulating(!isSimulating)} onSpeedChange={setSimulationSpeed} getPredictionData={getPredictionData} getHeatColor={getHeatColor} routeFromPlanner={routeFromPlanner} onClearRouteFromPlanner={() => setRouteFromPlanner(null)} />}
        {activeTab === "routing" && <RoutePlanner onNavigateToMap={route => {
        setRouteFromPlanner(route);
        setActiveTab("map");
      }} />}
        {activeTab === "bookings" && <section className="py-4 sm:py-6 md:py-8 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
            <div className="container mx-auto px-3 sm:px-4">
              <div className="mb-4 sm:mb-6 md:mb-8">
                
              </div>
              <div className="max-w-2xl mx-auto">
                <MyBookings currentTime={currentTime} simulationSpeed={simulationSpeed} />
              </div>
            </div>
          </section>}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8 mt-8 sm:mt-12 md:mt-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">ChargeSmart Bangalore</span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              AI-powered EV charging optimization for Bangalore's electric future.
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
              &copy; 2024 ChargeSmart. Powering Bangalore's EV Revolution.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Cache Status - Only visible in localhost */}
      <CacheStatus />
    </div>;
};
const Index = () => {
  return <AppContent />;
};
export default Index;