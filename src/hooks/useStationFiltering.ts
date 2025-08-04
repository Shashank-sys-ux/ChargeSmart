import { useMemo } from "react";
import { StationData, StationType } from "@/data/stationData";

interface UseStationFilteringProps {
  stations: StationData[];
  filterType: StationType;
  searchTerm: string;
  getPredictionData: (stationId: number) => any;
}

export const useStationFiltering = ({
  stations,
  filterType,
  searchTerm,
  getPredictionData
}: UseStationFilteringProps) => {
  const filteredStations = useMemo(() => {
    return stations
      .filter(station => {
        const matchesFilter = filterType === "all" || station.type === filterType;
        const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            station.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        // Sort by availability (descending) - most available first
        const predictionA = getPredictionData(a.id);
        const predictionB = getPredictionData(b.id);
        
        // Primary sort: availability (higher first)
        if (predictionB.availability !== predictionA.availability) {
          return predictionB.availability - predictionA.availability;
        }
        
        // Secondary sort: wait time (lower first)
        if (predictionA.waitTime !== predictionB.waitTime) {
          return predictionA.waitTime - predictionB.waitTime;
        }
        
        // Tertiary sort: distance (closer first)
        return a.distance - b.distance;
      });
  }, [stations, filterType, searchTerm, getPredictionData]);

  return { filteredStations };
};