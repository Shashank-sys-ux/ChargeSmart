import { Zap } from "lucide-react";
import { StationType } from "@/data/stationData";

interface StationTypeFilterProps {
  filterTypes: StationType[];
  onFilterChange: (types: StationType[]) => void;
}

const StationTypeFilter = ({ filterTypes, onFilterChange }: StationTypeFilterProps) => {
  const toggleFilter = (type: StationType) => {
    if (type === "all") {
      // If "all" is clicked, clear all other filters and set only "all"
      onFilterChange(["all"]);
    } else {
      // Remove "all" if it exists and toggle the specific type
      const withoutAll = filterTypes.filter(t => t !== "all");
      if (withoutAll.includes(type)) {
        // Remove the type if it's already selected
        const newFilters = withoutAll.filter(t => t !== type);
        // If no filters left, default to "all"
        onFilterChange(newFilters.length > 0 ? newFilters : ["all"]);
      } else {
        // Add the type to existing filters (without "all")
        onFilterChange([...withoutAll, type]);
      }
    }
  };

  const isActive = (type: StationType) => filterTypes.includes(type);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-lg border-0">
        <h3 className="text-lg font-semibold text-gray-900">Smart Prediction Map</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => toggleFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive("all")
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => toggleFilter("fast-charging")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isActive("fast-charging")
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <Zap className="w-4 h-4" />
            Fast
          </button>
          <button
            onClick={() => toggleFilter("battery-swap")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive("battery-swap")
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Swap
          </button>
          <button
            onClick={() => toggleFilter("nearby")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive("nearby")
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Nearby
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationTypeFilter;