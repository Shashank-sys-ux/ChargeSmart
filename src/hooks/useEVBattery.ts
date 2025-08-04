import { useState, useEffect } from 'react';

export interface EVBatteryData {
  currentBatteryLevel: number; // percentage (0-100)
  totalRange: number; // km
  usableRange: number; // km based on current battery
  batteryHealth: number; // percentage (0-100)
}

export const useEVBattery = () => {
  const [batteryData, setBatteryData] = useState<EVBatteryData>(() => {
    // Try to get initial data from localStorage
    const storedEV = localStorage.getItem('selectedEV');
    let initialBattery = 65;
    let initialRange = 312;
    
    if (storedEV) {
      try {
        const parsed = JSON.parse(storedEV);
        // Use the exact battery level and range from user selection
        initialBattery = parsed.batteryLevel || 65;
        initialRange = parsed.range || 312;
        console.log('Loaded EV data from localStorage:', { batteryLevel: initialBattery, range: initialRange });
      } catch (error) {
        console.error('Error parsing stored EV data:', error);
      }
    }
    
    return {
      currentBatteryLevel: initialBattery,
      totalRange: initialRange,
      usableRange: Math.round((initialBattery / 100) * initialRange),
      batteryHealth: 95
    };
  });

  // Calculate usable range based on current battery level
  useEffect(() => {
    const usableRange = (batteryData.currentBatteryLevel / 100) * batteryData.totalRange;
    setBatteryData(prev => ({
      ...prev,
      usableRange: Math.round(usableRange)
    }));
  }, [batteryData.currentBatteryLevel, batteryData.totalRange]);

  const updateBatteryLevel = (level: number) => {
    const newLevel = Math.max(0, Math.min(100, level));
    setBatteryData(prev => ({
      ...prev,
      currentBatteryLevel: newLevel
    }));
    
    // Persist to localStorage for consistency across components
    const storedEV = localStorage.getItem('selectedEV');
    if (storedEV) {
      try {
        const parsed = JSON.parse(storedEV);
        parsed.batteryLevel = newLevel;
        localStorage.setItem('selectedEV', JSON.stringify(parsed));
      } catch (error) {
        console.error('Error updating stored EV data:', error);
      }
    } else {
      // Create new entry if none exists
      localStorage.setItem('selectedEV', JSON.stringify({
        batteryLevel: newLevel,
        range: batteryData.totalRange
      }));
    }
  };

  const updateTotalRange = (range: number) => {
    const newRange = Math.max(0, range);
    setBatteryData(prev => ({
      ...prev,
      totalRange: newRange
    }));
    
    // Persist to localStorage for consistency across components
    const storedEV = localStorage.getItem('selectedEV');
    if (storedEV) {
      try {
        const parsed = JSON.parse(storedEV);
        parsed.range = newRange;
        localStorage.setItem('selectedEV', JSON.stringify(parsed));
      } catch (error) {
        console.error('Error updating stored EV data:', error);
      }
    } else {
      // Create new entry if none exists
      localStorage.setItem('selectedEV', JSON.stringify({
        batteryLevel: batteryData.currentBatteryLevel,
        range: newRange
      }));
    }
  };

  const canReachDestination = (distanceKm: number) => {
    // Keep 10% buffer for safety - proper calculation as per specs
    const usableRangeKm = (batteryData.currentBatteryLevel / 100) * batteryData.totalRange * 0.9;
    return distanceKm <= usableRangeKm;
  };

  const getUsableRange = () => {
    return (batteryData.currentBatteryLevel / 100) * batteryData.totalRange * 0.9;
  };

  return {
    batteryData,
    updateBatteryLevel,
    updateTotalRange,
    canReachDestination,
    getUsableRange
  };
};
