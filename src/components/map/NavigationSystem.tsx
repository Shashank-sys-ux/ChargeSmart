
interface NavigationSystemProps {
  map: any;
  userLocation: [number, number];
  onRouteChange: (route: any) => void;
}

const useNavigationSystem = ({ map, userLocation, onRouteChange }: NavigationSystemProps) => {
  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

  // Simple direction calculation
  const getDirection = (start: [number, number], end: [number, number]): string => {
    const latDiff = end[0] - start[0];
    const lngDiff = end[1] - start[1];
    
    const angle = Math.atan2(lngDiff, latDiff) * 180 / Math.PI;
    
    if (angle >= -22.5 && angle < 22.5) return "⬆️ North";
    if (angle >= 22.5 && angle < 67.5) return "↗️ Northeast";
    if (angle >= 67.5 && angle < 112.5) return "➡️ East";
    if (angle >= 112.5 && angle < 157.5) return "↘️ Southeast";
    if (angle >= 157.5 || angle < -157.5) return "⬇️ South";
    if (angle >= -157.5 && angle < -112.5) return "↙️ Southwest";
    if (angle >= -112.5 && angle < -67.5) return "⬅️ West";
    return "↖️ Northwest";
  };

  // Navigation function - now just provides direction info
  const navigateToStation = (station: any) => {
    const distance = calculateDistance(userLocation[0], userLocation[1], station.lat, station.lng);
    const direction = getDirection([userLocation[0], userLocation[1]], [station.lat, station.lng]);
    const estimatedTime = Math.round(distance * 3); // 3 minutes per km in city traffic
    
    onRouteChange(station);
    
    console.log(`🧭 Navigation: Go ${direction} for ${distance}km to reach ${station.name} (~${estimatedTime} min)`);
  };

  // Clear route function
  const clearRoute = () => {
    onRouteChange(null);
  };

  return {
    navigateToStation,
    clearRoute,
    calculateDistance
  };
};

export default useNavigationSystem;
