
import { MapPin } from "lucide-react";

interface MapboxNavigationProps {
  userLocation: [number, number];
  showRoute: boolean;
  activeRoute: any;
  routeInfo: {distance: string, duration: string} | null;
}

const MapboxNavigation = ({ userLocation, showRoute, activeRoute, routeInfo }: MapboxNavigationProps) => {
  return (
    <>
      {/* User Location Info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md z-[1000]">
        <div className="text-sm font-semibold mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-blue-600" />
          Your Location
        </div>
        <div className="text-xs text-gray-600">
          📍 Lat: {userLocation[0].toFixed(4)}
          <br />
          📍 Lng: {userLocation[1].toFixed(4)}
          <br />
          <span className="text-blue-600">Drag marker to move</span>
        </div>
        {showRoute && activeRoute && routeInfo && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-green-600 font-medium">
              🗺️ Route to {activeRoute.name}
            </div>
            <div className="text-xs text-gray-500">
              📍 {routeInfo.distance} • ⏱️ {routeInfo.duration}
            </div>
          </div>
        )}
      </div>

      {/* Station Types Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md z-[1000]">
        <div className="text-sm font-semibold mb-2">🗺️ Station Types</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs">⚡</div>
            <span>Fast Charging</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs">🔋</div>
            <span>Battery Swapping</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs">🔌</div>
            <span>Standard Charging</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
          💡 Colors change based on real-time usage patterns
          <br />
          🕒 Click stations for navigation options
        </div>
      </div>
    </>
  );
};

export default MapboxNavigation;
