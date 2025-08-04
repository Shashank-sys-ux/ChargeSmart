
import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface StationMarkersProps {
  map: L.Map | null;
  stations: any[];
  selectedStation: any;
  onStationSelect: (station: any) => void;
  isModelReady: boolean;
  getPredictionData: (stationId: number) => any;
  userLocation: [number, number];
  activeRoute: any;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

const StationMarkers = ({ 
  map, 
  stations, 
  selectedStation, 
  onStationSelect, 
  isModelReady, 
  getPredictionData,
  userLocation,
  activeRoute,
  calculateDistance
}: StationMarkersProps) => {
  const markersRef = useRef<L.Marker[]>([]);

  // Get heat-mapped color based on usage and station type
  const getHeatMappedStationColor = (station: any, prediction: any) => {
    const usage = prediction.predictedUsage;
    const baseColors = {
      'fast-charging': {
        low: '#fbbf24',    // Amber - available
        medium: '#f59e0b', // Darker amber - moderate
        high: '#d97706',   // Orange - busy
        critical: '#dc2626' // Red - critical/full
      },
      'battery-swap': {
        low: '#34d399',    // Green - available
        medium: '#10b981', // Darker green - moderate
        high: '#059669',   // Emerald - busy
        critical: '#dc2626' // Red - critical/full
      },
      'standard': {
        low: '#60a5fa',    // Blue - available
        medium: '#3b82f6', // Darker blue - moderate
        high: '#2563eb',   // Blue - busy
        critical: '#dc2626' // Red - critical/full
      }
    };

    const typeColors = baseColors[station.type as keyof typeof baseColors] || baseColors.standard;
    
    if (usage >= 0.9) return typeColors.critical;
    if (usage >= 0.7) return typeColors.high;
    if (usage >= 0.4) return typeColors.medium;
    return typeColors.low;
  };

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers with heat-mapped colors
    stations.forEach(station => {
      const prediction = getPredictionData(station.id);
      const heatColor = getHeatMappedStationColor(station, prediction);
      
      // Calculate distance from user location
      const distanceFromUser = calculateDistance(userLocation[0], userLocation[1], station.lat, station.lng);
      
      // Enhanced icon with heat mapping and better visibility
      const getStationTypeDetails = (type: string) => {
        switch (type) {
          case 'fast-charging':
            return {
              icon: '⚡',
              label: 'Fast Charging Station',
              borderColor: '#f59e0b'
            };
          case 'battery-swap':
            return {
              icon: '🔋',
              label: 'Battery Swapping Center',
              borderColor: '#10b981'
            };
          default:
            return {
              icon: '🔌',
              label: 'Standard Charging Station',
              borderColor: '#3b82f6'
            };
        }
      };

      const stationDetails = getStationTypeDetails(station.type);
      
      const icon = L.divIcon({
        className: 'enhanced-station-marker',
        html: `
          <div style="
            background: ${heatColor};
            width: 45px;
            height: 45px;
            border-radius: 50%;
            border: 4px solid ${selectedStation?.id === station.id ? '#16a34a' : '#ffffff'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            position: relative;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          " 
          onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.4)';"
          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)';"
          title="${stationDetails.label}"
          >
            ${stationDetails.icon}
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              width: 18px;
              height: 18px;
              background: ${isModelReady ? '#10b981' : '#f59e0b'};
              border-radius: 50%;
              border: 2px solid white;
              font-size: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">${isModelReady ? '🧠' : '⏳'}</div>
            <div style="
              position: absolute;
              bottom: -30px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0,0,0,0.8);
              color: white;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
              white-space: nowrap;
              opacity: 0;
              pointer-events: none;
              transition: opacity 0.2s ease-in-out;
              z-index: 1000;
              font-weight: 500;
            " class="station-tooltip">${stationDetails.label}<br><small>Usage: ${Math.round(prediction.predictedUsage * 100)}%</small></div>
          </div>
        `,
        iconSize: [45, 45],
        iconAnchor: [22.5, 22.5]
      });

      const marker = L.marker([station.lat, station.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 260px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: ${stationDetails.borderColor};">
              ${stationDetails.icon} ${station.name}
            </h3>
            <div style="
              background: ${heatColor}20;
              color: ${heatColor};
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 8px;
              display: inline-block;
            ">
              ${stationDetails.label}
            </div>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
              ${station.location}
            </p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: ${
                  prediction.status === 'available' ? '#10b981' :
                  prediction.status === 'moderate' ? '#f59e0b' :
                  prediction.status === 'busy' ? '#ef4444' :
                  prediction.status === 'critical' ? '#dc2626' :
                  prediction.status === 'full' ? '#dc2626' : '#7f1d1d'
                };
              "></span>
              <span style="font-size: 12px; text-transform: capitalize; font-weight: 500;">
                ${prediction.status}
              </span>
            </div>
            <div style="font-size: 12px; line-height: 1.4; margin-bottom: 8px;">
              <div>Availability: ${prediction.availability}/8</div>
              <div>Wait time: ${prediction.waitTime}m</div>
              <div>Distance from you: ${distanceFromUser}km</div>
              <div>Rate: ₹${station.price}/hr</div>
            </div>
            <div style="font-size: 11px; color: #666; padding: 4px; background: #f3f4f6; border-radius: 4px; margin-bottom: 8px;">
              🤖 Smart Prediction: ${Math.round(prediction.predictedUsage * 100)}% usage
              <br>📊 Confidence: ${Math.round(prediction.confidence * 100)}%
              <br>🔥 Heat Level: ${
                prediction.predictedUsage >= 0.9 ? 'Critical' :
                prediction.predictedUsage >= 0.7 ? 'High' :
                prediction.predictedUsage >= 0.4 ? 'Moderate' : 'Low'
              }
            </div>
            <button onclick="window.navigateToStation(${station.id})" style="
              width: 100%;
              padding: 8px;
              background: linear-gradient(to right, #4285f4, #1d4ed8);
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 12px;
              cursor: pointer;
              font-weight: 500;
              margin-bottom: 4px;
            ">
              🧭 Navigate Here
            </button>
            ${activeRoute?.id === station.id ? `
              <button onclick="window.clearRoute()" style="
                width: 100%;
                padding: 6px;
                background: #f3f4f6;
                color: #666;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                font-size: 11px;
                cursor: pointer;
              ">
                Clear Route
              </button>
            ` : ''}
          </div>
        `)
        .on('click', () => {
          onStationSelect(station);
        })
        .on('mouseover', function() {
          // Show tooltip on hover
          const tooltipElement = this.getElement()?.querySelector('.station-tooltip');
          if (tooltipElement) {
            (tooltipElement as HTMLElement).style.opacity = '1';
          }
        })
        .on('mouseout', function() {
          // Hide tooltip
          const tooltipElement = this.getElement()?.querySelector('.station-tooltip');
          if (tooltipElement) {
            (tooltipElement as HTMLElement).style.opacity = '0';
          }
        });

      markersRef.current.push(marker);
    });
  }, [map, stations, selectedStation, isModelReady, getPredictionData, userLocation, activeRoute, calculateDistance, onStationSelect]);

  return null;
};

export default StationMarkers;
