
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapboxStationMarkersProps {
  map: mapboxgl.Map | null;
  stations: any[];
  selectedStation: any;
  onStationSelect: (station: any) => void;
  isModelReady: boolean;
  getPredictionData: (stationId: number) => any;
  userLocation: [number, number];
  activeRoute: any;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  onNavigateToStation: (station: any) => void;
}

const MapboxStationMarkers = ({ 
  map, 
  stations, 
  selectedStation, 
  onStationSelect, 
  isModelReady, 
  getPredictionData,
  userLocation,
  activeRoute,
  calculateDistance,
  onNavigateToStation
}: MapboxStationMarkersProps) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Get heat-mapped color based on usage and station type
  const getHeatMappedStationColor = (station: any, prediction: any) => {
    const usage = prediction.predictedUsage;
    const baseColors = {
      'fast-charging': {
        low: '#FFC107',    // Bright yellow
        medium: '#FF9800',  // Orange
        high: '#FF5722',   // Red-orange
        critical: '#F44336' // Bright red
      },
      'battery-swap': {
        low: '#4CAF50',    // Bright green
        medium: '#FF9800', // Orange
        high: '#FF5722',   // Red-orange  
        critical: '#F44336' // Bright red
      }
    };

    const typeColors = baseColors[station.type as keyof typeof baseColors] || baseColors['fast-charging'];
    
    if (usage >= 0.9) return typeColors.critical;
    if (usage >= 0.7) return typeColors.high;
    if (usage >= 0.4) return typeColors.medium;
    return typeColors.low;
  };

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];

    // Add new markers
    stations.forEach(station => {
      const prediction = getPredictionData(station.id);
      const heatColor = getHeatMappedStationColor(station, prediction);
      const distanceFromUser = calculateDistance(userLocation[0], userLocation[1], station.lat, station.lng);
      
      // Get station type details
      const getStationTypeDetails = (type: string) => {
        switch (type) {
          case 'fast-charging':
            return {
              icon: '⚡',
              label: 'Fast Charging Station',
              borderColor: '#f59e0b',
              shape: 'circle'
            };
          case 'battery-swap':
            return {
              icon: '🔋',
              label: 'Battery Swapping Center', 
              borderColor: '#10b981',
              shape: 'rectangle'
            };
          default:
            return {
              icon: '🔌',
              label: 'Standard Charging Station',
              borderColor: '#3b82f6',
              shape: 'circle'
            };
        }
      };

      const stationDetails = getStationTypeDetails(station.type);
      
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'station-marker';
      markerElement.innerHTML = `
        <div style="
          background: ${heatColor};
          width: 45px;
          height: 45px;
          border-radius: ${stationDetails.shape === 'rectangle' ? '8px' : '50%'};
          border: 4px solid ${selectedStation?.id === station.id ? '#16a34a' : '#ffffff'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          position: relative;
        ">
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
        </div>
      `;

      // Add stable hover effects
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.filter = 'brightness(1.1)';
        markerElement.style.zIndex = '1000';
      });

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.filter = 'brightness(1)';
        markerElement.style.zIndex = '1';
      });

      // Create marker
      const marker = new mapboxgl.Marker({
        element: markerElement
      })
      .setLngLat([station.lng, station.lat])
      .addTo(map);

      // Create popup content
      const popupContent = `
        <div style="min-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
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
            ${station.type === 'battery-swap' ? 
              `<div>Batteries available: ${prediction.availability}/8</div>` : 
              `<div>Charging ports: ${prediction.availability}/8</div>`
            }
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
          <button id="navigate-btn-${station.id}" style="
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
            <button id="clear-route-btn-${station.id}" style="
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
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(popupContent);

      marker.setPopup(popup);

      // Handle marker click
      markerElement.addEventListener('click', () => {
        onStationSelect(station);
      });

      // Handle popup open to add event listeners to buttons
      popup.on('open', () => {
        const navigateBtn = document.getElementById(`navigate-btn-${station.id}`);
        const clearRouteBtn = document.getElementById(`clear-route-btn-${station.id}`);
        
        if (navigateBtn) {
          navigateBtn.addEventListener('click', () => {
            onNavigateToStation(station);
          });
        }
        
        if (clearRouteBtn) {
          clearRouteBtn.addEventListener('click', () => {
            // This will be handled by the parent component
            if (map.getSource('route')) {
              map.removeLayer('route');
              map.removeSource('route');
            }
          });
        }
      });

      markersRef.current.push(marker);
    });
  }, [map, stations, selectedStation, isModelReady, getPredictionData, userLocation, activeRoute, calculateDistance, onStationSelect, onNavigateToStation]);

  return null;
};

export default MapboxStationMarkers;
