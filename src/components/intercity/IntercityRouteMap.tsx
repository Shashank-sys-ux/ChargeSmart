import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IntercityRoute } from '@/hooks/useIntercityRouting';
import { Badge } from '@/components/ui/badge';
import { Zap, MapPin, Battery, AlertTriangle } from 'lucide-react';

interface IntercityRouteMapProps {
  route: IntercityRoute | null;
  userLocation: [number, number];
  destination: [number, number];
  currentBatteryLevel: number;
  vehicleRange: number;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXNobWlzdGV5IiwiYSI6ImNtZDQ3Z2N2YTBkYjQya3M5NjB3OWdxcjEifQ.6KP8mbUlAPx960akGAqsqw';

const IntercityRouteMap = ({ 
  route, 
  userLocation, 
  destination, 
  currentBatteryLevel,
  vehicleRange 
}: IntercityRouteMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const routeSourceId = 'intercity-route';
  const chargingStationsSourceId = 'charging-stations';

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [77.5946, 12.9716], // Bangalore center
      zoom: 6,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location marker
    new mapboxgl.Marker({
      color: '#22c55e',
      scale: 1.2
    })
      .setLngLat([userLocation[1], userLocation[0]])
      .setPopup(new mapboxgl.Popup().setHTML('<div class="text-sm font-medium">📍 Your Location<br/>Bangalore</div>'))
      .addTo(map.current);

    // Add destination marker
    new mapboxgl.Marker({
      color: '#dc2626',
      scale: 1.2
    })
      .setLngLat([destination[1], destination[0]])
      .setPopup(new mapboxgl.Popup().setHTML('<div class="text-sm font-medium">🎯 Destination</div>'))
      .addTo(map.current);

    // Initialize data sources
    map.current.on('load', () => {
      if (!map.current) return;

      // Add route source
      map.current.addSource(routeSourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      // Add charging stations source
      map.current.addSource(chargingStationsSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add route layer
      map.current.addLayer({
        id: 'intercity-route-line',
        type: 'line',
        source: routeSourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Add charging stations layer with enhanced visibility
      map.current.addLayer({
        id: 'charging-stations-circle',
        type: 'circle',
        source: chargingStationsSourceId,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 8,
            8, 14,
            12, 20,
            15, 26
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'type'], 'ultra-fast'], '#f59e0b',
            ['==', ['get', 'type'], 'fast-charging'], '#10b981',
            ['==', ['get', 'type'], 'battery-swap'], '#8b5cf6',
            '#6b7280'
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95
        }
      });

      // Add charging station pulse animation
      map.current.addLayer({
        id: 'charging-stations-pulse',
        type: 'circle',
        source: chargingStationsSourceId,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 12,
            8, 20,
            12, 30,
            15, 40
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'type'], 'ultra-fast'], '#f59e0b',
            ['==', ['get', 'type'], 'fast-charging'], '#10b981',
            ['==', ['get', 'type'], 'battery-swap'], '#8b5cf6',
            '#6b7280'
          ],
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 0.1,
            8, 0.2,
            12, 0.3,
            15, 0.4
          ]
        }
      });

      // Add charging station labels with better visibility
      map.current.addLayer({
        id: 'charging-stations-labels',
        type: 'symbol',
        source: chargingStationsSourceId,
        layout: {
          'text-field': [
            'case',
            ['==', ['get', 'type'], 'ultra-fast'], '⚡',
            ['==', ['get', 'type'], 'fast-charging'], '🔌',
            ['==', ['get', 'type'], 'battery-swap'], '🔋',
            '⚡'
          ],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 12,
            8, 16,
            12, 20,
            15, 24
          ],
          'text-offset': [0, 0],
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      // Add station numbers for route sequence
      map.current.addLayer({
        id: 'charging-stations-numbers',
        type: 'symbol',
        source: chargingStationsSourceId,
        layout: {
          'text-field': ['get', 'stopNumber'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 10,
            8, 12,
            12, 16,
            15, 20
          ],
          'text-offset': [0, 2],
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      });

      // Add click handlers for charging stations
      map.current.on('click', 'charging-stations-circle', (e) => {
        if (!e.features || !e.features[0] || !map.current) return;

        const feature = e.features[0];
        const properties = feature.properties;
        
        if (properties) {
          const popup = new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3 max-w-xs">
                <h3 class="font-semibold text-sm mb-2">${properties.name}</h3>
                  <div class="space-y-1 text-xs">
                  <div class="flex justify-between">
                    <span>Stop:</span>
                    <span class="font-medium text-blue-600">#${properties.stopNumber}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Power:</span>
                    <span class="font-medium">${properties.chargingPower}kW</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Est. Charging:</span>
                    <span class="font-medium">${properties.chargingTime} min</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Price:</span>
                    <span class="font-medium">₹${properties.price}/kWh</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Safety:</span>
                    <span class="font-medium">${properties.safetyRating}/5 ⭐</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Highway:</span>
                    <span class="font-medium">${properties.highway}</span>
                  </div>
                  <div class="text-gray-600">${properties.location}</div>
                  ${properties.distanceFromPrevious > 0 ? `<div class="text-blue-600 text-xs mt-1">📍 ${properties.distanceFromPrevious.toFixed(1)}km from previous</div>` : ''}
                </div>
              </div>
            `)
            .addTo(map.current);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'charging-stations-circle', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'charging-stations-circle', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update route when route data changes
  useEffect(() => {
    if (!map.current || !route) return;

    const mapInstance = map.current;

    const updateRoute = () => {
      if (!mapInstance.getSource(routeSourceId)) return;

      // Update route line
      if (route.geometry) {
        (mapInstance.getSource(routeSourceId) as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        });
      }

      // Update charging stations with enhanced data
      const stationFeatures = route.chargingStops.map((station, index) => ({
        type: 'Feature' as const,
        properties: {
          name: station.name,
          location: station.location,
          type: station.type,
          chargingPower: station.chargingPower,
          price: station.price,
          safetyRating: station.safetyRating,
          highway: station.highway,
          stopNumber: (index + 1).toString(),
          chargingTime: station.chargingTime || 30,
          distanceFromPrevious: station.distanceFromPrevious || 0
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [station.coordinates[1], station.coordinates[0]]
        }
      }));

      (mapInstance.getSource(chargingStationsSourceId) as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: stationFeatures
      });

      // Fit map to show the route
      if (route.geometry && route.geometry.coordinates) {
        let coordinates: number[][];
        
        if (route.geometry.type === 'MultiLineString') {
          coordinates = route.geometry.coordinates.flat();
        } else {
          coordinates = route.geometry.coordinates;
        }

        if (coordinates.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          coordinates.forEach(coord => bounds.extend(coord as [number, number]));
          
          // Add padding for charging stations
          route.chargingStops.forEach(station => {
            bounds.extend([station.coordinates[1], station.coordinates[0]]);
          });

          mapInstance.fitBounds(bounds, {
            padding: 50,
            maxZoom: 10
          });
        }
      }
    };

    if (mapInstance.isStyleLoaded()) {
      updateRoute();
    } else {
      mapInstance.on('load', updateRoute);
    }
  }, [route]);

  const getBatteryStatusColor = () => {
    if (currentBatteryLevel <= 20) return 'text-red-500';
    if (currentBatteryLevel <= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getCurrentRange = () => {
    return Math.round((currentBatteryLevel / 100) * vehicleRange);
  };

  const getSafeRange = () => {
    return Math.round(getCurrentRange() * 0.9);
  };

  return (
    <div className="relative h-96 rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Battery Status Overlay */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Battery className={`w-4 h-4 ${getBatteryStatusColor()}`} />
          <span className="text-sm font-medium">Battery Status</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Current:</span>
            <span className={`font-medium ${getBatteryStatusColor()}`}>
              {currentBatteryLevel}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Range:</span>
            <span className="font-medium">{getCurrentRange()} km</span>
          </div>
          <div className="flex justify-between">
            <span>Safe Range:</span>
            <span className="font-medium text-green-600">{getSafeRange()} km</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm font-medium mb-2">Legend</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span>Ultra-fast Charging</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span>Fast Charging</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Battery Swap</span>
          </div>
        </div>
      </div>

      {/* Route warnings overlay */}
      {route && route.warnings.length > 0 && (
        <div className="absolute top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Warnings</span>
          </div>
          <div className="space-y-1">
            {route.warnings.map((warning, index) => (
              <div key={index} className="text-xs text-yellow-700">
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntercityRouteMap;