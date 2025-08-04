import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Battery, BatteryLow, Zap } from "lucide-react";
import { useEVBattery } from "@/hooks/useEVBattery";
const BatteryStatusPanel = () => {
  const {
    batteryData,
    updateBatteryLevel,
    updateTotalRange
  } = useEVBattery();
  const getBatteryIcon = () => {
    if (batteryData.currentBatteryLevel <= 20) {
      return <BatteryLow className="w-5 h-5 text-red-500" />;
    }
    return <Battery className="w-5 h-5 text-green-500" />;
  };
  const getBatteryColor = () => {
    if (batteryData.currentBatteryLevel <= 20) return "text-red-500";
    if (batteryData.currentBatteryLevel <= 50) return "text-yellow-500";
    return "text-green-500";
  };
  const getBatteryStatus = () => {
    if (batteryData.currentBatteryLevel <= 20) return "Low Battery";
    if (batteryData.currentBatteryLevel <= 50) return "Moderate Battery";
    if (batteryData.currentBatteryLevel <= 80) return "Good Battery";
    return "Excellent Battery";
  };
  const getCurrentRange = () => {
    return Math.round(batteryData.currentBatteryLevel / 100 * batteryData.totalRange);
  };
  const getSafeRange = () => {
    // 90% of current range for safety buffer  
    return Math.round(getCurrentRange() * 0.9);
  };
  return <Card className="mb-4 bg-white/90 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getBatteryIcon()}
          Battery Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Current Level</span>
          <span className={`font-semibold ${getBatteryColor()}`}>
            {batteryData.currentBatteryLevel}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`text-sm font-medium ${getBatteryColor()}`}>
            {getBatteryStatus()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-lg font-semibold text-blue-700">
              {getCurrentRange()} km
            </div>
            <p className="text-xs text-blue-600">Current Range</p>
          </div>
          
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Battery Level</span>
            <span>{batteryData.currentBatteryLevel}%</span>
          </div>
          <Slider value={[batteryData.currentBatteryLevel]} onValueChange={value => updateBatteryLevel(value[0])} max={100} min={0} step={1} className="w-full" />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => updateBatteryLevel(80)} className="flex-1 text-xs">
            Set 80%
          </Button>
          <Button variant="outline" size="sm" onClick={() => updateBatteryLevel(100)} className="flex-1 text-xs">
            Full Charge
          </Button>
        </div>
      </CardContent>
    </Card>;
};
export default BatteryStatusPanel;