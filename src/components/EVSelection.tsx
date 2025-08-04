
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Car,
  Battery,
  Zap,
  Settings,
  ArrowRight
} from "lucide-react";

interface EVSelectionProps {
  onComplete: (evData: {
    model: string;
    range: number;
    connectorType: string;
    preference: string;
    batteryLevel: number;
  }) => void;
}

const EVSelection = ({ onComplete }: EVSelectionProps) => {
  const [selectedEV, setSelectedEV] = useState("");
  const [preference, setPreference] = useState("charging");
  const [batteryPercentage, setBatteryPercentage] = useState("65");

  const evModels = [
    {
      id: "tata-nexon",
      name: "Tata Nexon EV",
      range: 312,
      connectorType: "CCS2",
      image: "🚗",
      price: "₹14.99L"
    },
    {
      id: "mg-zs",
      name: "MG ZS EV",
      range: 461,
      connectorType: "CCS2", 
      image: "🚙",
      price: "₹21.99L"
    },
    {
      id: "hyundai-kona",
      name: "Hyundai Kona Electric",
      range: 452,
      connectorType: "CCS2",
      image: "🚐",
      price: "₹23.84L"
    },
    {
      id: "mahindra-e2o",
      name: "Mahindra e2oPlus",
      range: 140,
      connectorType: "Type 2",
      image: "🚕",
      price: "₹8.31L"
    },
    {
      id: "ather-450x",
      name: "Ather 450X",
      range: 146,
      connectorType: "Type 2",
      image: "🛵",
      price: "₹1.39L"
    },
    {
      id: "ola-s1-pro",
      name: "Ola S1 Pro",
      range: 181,
      connectorType: "Type 2",
      image: "🛴",
      price: "₹1.30L"
    }
  ];

  const handleContinue = () => {
    if (!selectedEV) return;
    
    const selectedModel = evModels.find(ev => ev.id === selectedEV);
    if (selectedModel) {
      onComplete({
        model: selectedModel.name,
        range: selectedModel.range,
        connectorType: selectedModel.connectorType,
        preference,
        batteryLevel: parseInt(batteryPercentage) || 65
      });
    }
  };

  const handleIntercityPlanning = () => {
    if (!selectedEV) return;
    
    const selectedModel = evModels.find(ev => ev.id === selectedEV);
    if (selectedModel) {
      // Store in localStorage to access in intercity planner
      localStorage.setItem('selectedEV', JSON.stringify({
        model: selectedModel.name,
        range: selectedModel.range,
        connectorType: selectedModel.connectorType,
        preference,
        batteryLevel: parseInt(batteryPercentage) || 65
      }));
      // Navigate to intercity planner (we'll handle this via route)
      window.location.href = '/intercity-planner';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to ChargeSmart
          </h1>
          <p className="text-gray-600 text-lg">
            Select your EV to get personalized charging recommendations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {evModels.map((ev) => (
            <Card 
              key={ev.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-white/70 backdrop-blur-sm border-0 ${
                selectedEV === ev.id ? 'ring-2 ring-green-500 bg-green-50/50' : ''
              }`}
              onClick={() => setSelectedEV(ev.id)}
            >
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{ev.image}</div>
                <CardTitle className="text-lg">{ev.name}</CardTitle>
                <p className="text-sm text-gray-600">{ev.price}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Range</span>
                    <Badge variant="outline" className="flex items-center">
                      <Battery className="w-3 h-3 mr-1" />
                      {ev.range} km
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connector</span>
                    <Badge variant="outline" className="flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {ev.connectorType}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedEV && (
          <>
            {/* Battery Level Input */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Battery className="w-5 h-5 mr-2 text-green-600" />
                  Current Battery Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Label htmlFor="battery" className="text-sm font-medium">
                      Enter your current battery percentage for accurate planning
                    </Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-32">
                      <Input
                        id="battery"
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        placeholder="65"
                        value={batteryPercentage}
                        onChange={(e) => setBatteryPercentage(e.target.value)}
                        className="text-center pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBatteryPercentage("25")}
                        className="text-xs"
                      >
                        Low (25%)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBatteryPercentage("65")}
                        className="text-xs"
                      >
                        Medium (65%)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBatteryPercentage("90")}
                        className="text-xs"
                      >
                        High (90%)
                      </Button>
                    </div>
                  </div>
                  {batteryPercentage && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estimated Range:</span>
                        <span className="font-semibold text-green-700">
                          {Math.round((parseFloat(batteryPercentage) / 100) * (evModels.find(ev => ev.id === selectedEV)?.range || 0))} km
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Charging Preference */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Charging Preference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant={preference === "charging" ? "default" : "outline"}
                    onClick={() => setPreference("charging")}
                    className="flex-1"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Fast Charging
                  </Button>
                  <Button
                    variant={preference === "swapping" ? "default" : "outline"}
                    onClick={() => setPreference("swapping")}
                    className="flex-1"
                  >
                    <Battery className="w-4 h-4 mr-2" />
                    Battery Swapping
                  </Button>
                  <Button
                    variant={preference === "both" ? "default" : "outline"}
                    onClick={() => setPreference("both")}
                    className="flex-1"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Both Options
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {selectedEV && (
          <div className="text-center space-y-4">
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                onClick={handleContinue}
              >
                City Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                onClick={handleIntercityPlanning}
              >
                Intercity Planner
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Choose City Dashboard for local charging or Intercity Planner for long-distance trips
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EVSelection;
