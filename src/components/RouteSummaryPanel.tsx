import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Route, Zap, X } from 'lucide-react';
import { RouteStrategy } from './RouteStrategyModal';
interface RouteSummaryPanelProps {
  routeType: RouteStrategy;
  totalDistance: number;
  estimatedTime: number;
  chargingStops: any[];
  onClose: () => void;
}
const RouteSummaryPanel = ({
  routeType,
  totalDistance,
  estimatedTime,
  chargingStops,
  onClose
}: RouteSummaryPanelProps) => {
  const getRouteTypeDisplay = (type: RouteStrategy) => {
    switch (type) {
      case 'fastest':
        return {
          label: 'Fastest Route',
          color: 'text-green-600',
          bg: 'bg-green-100'
        };
      case 'shortest':
        return {
          label: 'Shortest Route',
          color: 'text-blue-600',
          bg: 'bg-blue-100'
        };
      case 'least-traffic':
        return {
          label: 'Least Traffic',
          color: 'text-purple-600',
          bg: 'bg-purple-100'
        };
    }
  };
  const routeDisplay = getRouteTypeDisplay(routeType);
  return <Card className="fixed bottom-4 left-4 w-1/2 z-50 shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-full ${routeDisplay.bg}`}>
              <span className={`text-xs font-medium ${routeDisplay.color}`}>
                {routeDisplay.label}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Distance</p>
              <p className="font-medium">{totalDistance.toFixed(1)} km</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Time</p>
              <p className="font-medium">{Math.round(estimatedTime)} min</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Charging</p>
              <p className="font-medium">
                {chargingStops.length === 0 ? 'None' : `${chargingStops.length} stop${chargingStops.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <p className="font-medium text-green-600">Active</p>
            </div>
          </div>
        </div>

        {chargingStops.length > 0 && <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Charging Stops:</p>
            <div className="flex flex-wrap gap-1">
              {chargingStops.map((stop, index) => <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {stop.name}
                </span>)}
            </div>
          </div>}
      </CardContent>
    </Card>;
};
export default RouteSummaryPanel;