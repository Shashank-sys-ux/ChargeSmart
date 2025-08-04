import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, FastForward, SkipForward, Database } from "lucide-react";
interface ControlPanelProps {
  currentTime: Date;
  isSimulating: boolean;
  simulationSpeed: number;
  isModelReady: boolean;
  onToggleSimulation: () => void;
  onSpeedChange: (speed: number) => void;
}
const ControlPanel = ({
  currentTime,
  isSimulating,
  simulationSpeed,
  isModelReady,
  onToggleSimulation,
  onSpeedChange
}: ControlPanelProps) => {
  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  const getTimeOfDay = (hour: number) => {
    if (hour >= 7 && hour <= 10) return "Morning Rush";
    if (hour >= 17 && hour <= 20) return "Evening Rush";
    if (hour >= 12 && hour <= 14) return "Lunch Peak";
    if (hour >= 22 || hour <= 6) return "Night Hours";
    return "Normal Hours";
  };
  const speedOptions = [{
    value: 1,
    label: "1x",
    icon: Play
  }, {
    value: 5,
    label: "5x",
    icon: FastForward
  }, {
    value: 10,
    label: "10x",
    icon: FastForward
  }, {
    value: 30,
    label: "30x",
    icon: SkipForward
  }];
  return <Card className="bg-white/70 backdrop-blur-sm border-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold text-gray-800">
              Current Time: {formatTime(currentTime)}
            </div>
            <Badge variant="outline" className={`${getTimeOfDay(currentTime.getHours()).includes('Rush') ? 'border-red-200 text-red-700 bg-red-50' : getTimeOfDay(currentTime.getHours()).includes('Peak') ? 'border-orange-200 text-orange-700 bg-orange-50' : getTimeOfDay(currentTime.getHours()).includes('Night') ? 'border-blue-200 text-blue-700 bg-blue-50' : 'border-green-200 text-green-700 bg-green-50'}`}>
              {getTimeOfDay(currentTime.getHours())}
            </Badge>
            <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
              {simulationSpeed}x Speed
            </Badge>
            
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 mr-4">
              {speedOptions.map(option => <Button key={option.value} onClick={() => onSpeedChange(option.value)} variant={simulationSpeed === option.value ? "default" : "outline"} size="sm" className="flex items-center space-x-1">
                  <option.icon className="w-3 h-3" />
                  <span>{option.label}</span>
                </Button>)}
            </div>
            
            <Button onClick={onToggleSimulation} variant="outline" size="sm" className="flex items-center space-x-2">
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isSimulating ? 'Pause' : 'Play'}</span>
            </Button>
          </div>
        </div>
        
      </CardContent>
    </Card>;
};
export default ControlPanel;