
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface HeatmapPoint {
  id: number;
  lng: number;
  lat: number;
  usage: number; // 0-1 scale
}

export const useMapboxHeatmap = (
  map: mapboxgl.Map | null,
  stations: any[],
  getPredictionData: (stationId: number) => any
) => {
  const heatmapLayerId = 'station-heatmap';
  const sourceId = 'station-heatmap-source';

  useEffect(() => {
    if (!map || !stations.length) return;

    // Prepare heatmap data
    const heatmapData: HeatmapPoint[] = stations.map(station => {
      const prediction = getPredictionData(station.id);
      return {
        id: station.id,
        lng: station.lng,
        lat: station.lat,
        usage: prediction.predictedUsage || 0
      };
    });

    // Create GeoJSON for heatmap
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: heatmapData.map(point => ({
        type: 'Feature' as const,
        properties: {
          usage: point.usage,
          weight: Math.max(0.1, point.usage) // Ensure minimum visibility
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [point.lng, point.lat]
        }
      }))
    };

    // Wait for map to load
    if (!map.isStyleLoaded()) {
      map.on('style.load', addHeatmapLayer);
    } else {
      addHeatmapLayer();
    }

    function addHeatmapLayer() {
      if (!map || !map.getStyle()) return;

      try {
        // Remove existing layers and source properly
        if (map.getLayer(`${heatmapLayerId}-circles`)) {
          map.removeLayer(`${heatmapLayerId}-circles`);
        }
        if (map.getLayer(heatmapLayerId)) {
          map.removeLayer(heatmapLayerId);
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      } catch (error) {
        console.warn('Error removing existing heatmap layers:', error);
      }

      // Add source
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData
      });

      // Add heatmap layer with minimal, clean styling
      map.addLayer({
        id: heatmapLayerId,
        type: 'heatmap',
        source: sourceId,
        maxzoom: 15,
        paint: {
          // Increase weight as usage increases
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'weight'],
            0, 0.1,
            1, 1
          ],
          // Intensity increases with zoom
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.5,
            15, 1.5
          ],
          // Color gradient: Blue (low) → Yellow (medium) → Red (high)
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33, 102, 172, 0)',      // Transparent
            0.2, 'rgba(33, 102, 172, 0.6)',  // Blue (low usage)
            0.5, 'rgba(255, 193, 7, 0.7)',   // Yellow (medium usage)
            0.8, 'rgba(220, 38, 38, 0.8)',   // Red (high usage)
            1, 'rgba(153, 27, 27, 0.9)'      // Dark red (critical)
          ],
          // Radius increases with zoom and usage
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, ['*', ['get', 'weight'], 20],
            15, ['*', ['get', 'weight'], 40]
          ],
          // Opacity decreases at higher zoom levels
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 0.8,
            15, 0.3
          ]
        }
      });

      // Add subtle glow circles at higher zoom levels
      map.addLayer({
        id: `${heatmapLayerId}-circles`,
        type: 'circle',
        source: sourceId,
        minzoom: 12,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, ['*', ['get', 'weight'], 8],
            18, ['*', ['get', 'weight'], 15]
          ],
          'circle-color': [
            'case',
            ['<', ['get', 'usage'], 0.3], '#3b82f6',  // Blue for low
            ['<', ['get', 'usage'], 0.7], '#eab308',  // Yellow for medium
            '#dc2626'  // Red for high
          ],
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 0.3,
            18, 0.6
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.8
        }
      });
    }

    return () => {
      try {
        if (map && map.getStyle()) {
          if (map.getLayer(heatmapLayerId)) {
            map.removeLayer(heatmapLayerId);
          }
          if (map.getLayer(`${heatmapLayerId}-circles`)) {
            map.removeLayer(`${heatmapLayerId}-circles`);
          }
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        }
      } catch (error) {
        console.warn('Error cleaning up heatmap layers:', error);
      }
    };
  }, [map, stations, getPredictionData]);

  return { heatmapLayerId, sourceId };
};
