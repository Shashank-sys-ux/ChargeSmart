
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapboxUserMarkerProps {
  map: mapboxgl.Map | null;
  userLocation: [number, number];
  onLocationChange: (location: [number, number]) => void;
}

const MapboxUserMarker = ({ map, userLocation, onLocationChange }: MapboxUserMarkerProps) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create custom marker element with glowing effect
    const markerElement = document.createElement('div');
    markerElement.className = 'user-location-marker';
    markerElement.innerHTML = `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 40px;
          height: 40px;
          background: radial-gradient(circle, rgba(66, 133, 244, 0.3) 0%, rgba(66, 133, 244, 0.1) 70%, transparent 100%);
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          top: 8px;
          left: 8px;
          width: 24px;
          height: 24px;
          background: linear-gradient(45deg, #4285f4, #1d4ed8);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          cursor: move;
        ">
          👤
        </div>
      </div>
    `;

    // Add CSS animation if not already added
    if (!document.getElementById('user-marker-styles')) {
      const style = document.createElement('style');
      style.id = 'user-marker-styles';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    // Create draggable marker
    const marker = new mapboxgl.Marker({
      element: markerElement,
      draggable: true
    })
    .setLngLat([userLocation[1], userLocation[0]])
    .addTo(map);

    // Handle drag end
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      const newLocation: [number, number] = [lngLat.lat, lngLat.lng];
      onLocationChange(newLocation);
      console.log('User location updated:', lngLat.lat, lngLat.lng);
    });

    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map]);

  // Update marker position when userLocation changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([userLocation[1], userLocation[0]]);
    }
  }, [userLocation]);

  return null;
};

export default MapboxUserMarker;
