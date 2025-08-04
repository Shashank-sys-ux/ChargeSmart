import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Battery, BatteryLow, Zap, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEVBattery } from '@/hooks/useEVBattery';

interface IntercityBatteryInputProps {
  vehicleRange: number;
}

const IntercityBatteryInput = ({ 
  vehicleRange
}: IntercityBatteryInputProps) => {
  const { batteryData, updateBatteryLevel } = useEVBattery();
  const [manualInput, setManualInput] = useState(batteryData.currentBatteryLevel.toString());

  // Update manual input when battery level changes from other components
  useEffect(() => {
    setManualInput(batteryData.currentBatteryLevel.toString());
  }, [batteryData.currentBatteryLevel]);

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
    if (batteryData.currentBatteryLevel <= 20) return "Low Battery - Charging Recommended";
    if (batteryData.currentBatteryLevel <= 50) return "Moderate Battery - Plan Charging Stops";
    if (batteryData.currentBatteryLevel <= 80) return "Good Battery Level";
    return "Excellent Battery Level";
  };

  const getCurrentRange = () => {
    return Math.round((batteryData.currentBatteryLevel / 100) * vehicleRange);
  };

  const getSafeRange = () => {
    // 90% of current range for safety buffer
    return Math.round(getCurrentRange() * 0.9);
  };

  const handleSliderChange = (value: number[]) => {
    const newLevel = value[0];
    updateBatteryLevel(newLevel);
    setManualInput(newLevel.toString());
  };

  const handleManualInputChange = (value: string) => {
    setManualInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      updateBatteryLevel(numValue);
    }
  };

  const getRecommendation = () => {
    const safeRange = getSafeRange();
    if (safeRange < 200) {
      return {
        type: 'warning',
        message: 'Consider charging before starting long-distance trip',
        icon: <AlertTriangle className="w-4 h-4" />
      };
    }
    if (safeRange < 400) {
      return {
        type: 'caution',
        message: 'Plan charging stops for intercity travel',
        icon: <Zap className="w-4 h-4" />
      };
    }
    return {
      type: 'good',
      message: 'Good range for intercity travel',
      icon: <Battery className="w-4 h-4 text-green-500" />
    };
  };

  const recommendation = getRecommendation();

  return (
    <Card className="mb-4 bg-white/90 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getBatteryIcon()}
          Current Battery Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Battery Level Display */}
        <div className="text-center space-y-2">
          <div className={`text-3xl font-bold ${getBatteryColor()}`}>
            {batteryData.currentBatteryLevel}%
          </div>
          <p className="text-sm text-gray-600">{getBatteryStatus()}</p>
        </div>

        {/* Range Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-semibold text-blue-700">
              {getCurrentRange()} km
            </div>
            <p className="text-xs text-blue-600">Current Range</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-semibold text-green-700">
              {getSafeRange()} km
            </div>
            <p className="text-xs text-green-600">Safe Range (90%)</p>
          </div>
        </div>

        {/* Battery Level Input */}
        <div className="space-y-4">
          <Label>Adjust Current Battery Level</Label>
          
          {/* Slider */}
          <div className="px-2">
            <Slider
              value={[batteryData.currentBatteryLevel]}
              onValueChange={handleSliderChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Manual Input */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={manualInput}
              onChange={(e) => handleManualInputChange(e.target.value)}
              className="w-20"
            />
            <span className="text-sm text-gray-600">%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateBatteryLevel(80);
                setManualInput("80");
              }}
            >
              Set to 80%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateBatteryLevel(100);
                setManualInput("100");
              }}
            >
              Full Charge
            </Button>
          </div>
        </div>

        {/* Recommendation Alert */}
        <Alert className={`border ${
          recommendation.type === 'warning' ? 'border-red-200 bg-red-50' :
          recommendation.type === 'caution' ? 'border-yellow-200 bg-yellow-50' :
          'border-green-200 bg-green-50'
        }`}>
          <div className="flex items-center gap-2">
            {recommendation.icon}
            <AlertDescription className={
              recommendation.type === 'warning' ? 'text-red-700' :
              recommendation.type === 'caution' ? 'text-yellow-700' :
              'text-green-700'
            }>
              {recommendation.message}
            </AlertDescription>
          </div>
        </Alert>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateBatteryLevel(25);
              setManualInput("25");
            }}
            className="text-xs"
          >
            Low (25%)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateBatteryLevel(65);
              setManualInput("65");
            }}
            className="text-xs"
          >
            Medium (65%)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateBatteryLevel(90);
              setManualInput("90");
            }}
            className="text-xs"
          >
            High (90%)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntercityBatteryInput;