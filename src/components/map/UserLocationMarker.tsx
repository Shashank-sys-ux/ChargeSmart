
import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface UserLocationMarkerProps {
  map: L.Map | null;
  userLocation: [number, number];
  onLocationChange: (location: [number, number]) => void;
}

const UserLocationMarker = ({ map, userLocation, onLocationChange }: UserLocationMarkerProps) => {
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create user location marker
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
          cursor: move;
          position: relative;
        ">
          👤
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid #1d4ed8;
          "></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    const userMarker = L.marker(userLocation, { 
      icon: userIcon,
      draggable: true,
      zIndexOffset: 1000
    }).addTo(map);

    userMarker.on('dragend', (e) => {
      const newPos = e.target.getLatLng();
      const newLocation: [number, number] = [newPos.lat, newPos.lng];
      onLocationChange(newLocation);
      console.log('User location updated:', newPos.lat, newPos.lng);
    });

    userMarkerRef.current = userMarker;

    return () => {
      if (userMarkerRef.current && map) {
        map.removeLayer(userMarkerRef.current);
      }
    };
  }, [map]);

  // Update marker position when userLocation changes
  useEffect(() => {
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userLocation);
    }
  }, [userLocation]);

  return null;
};

export default UserLocationMarker;
