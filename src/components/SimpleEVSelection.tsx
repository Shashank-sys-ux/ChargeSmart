
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
  ArrowRight,
  Bike,
  Smartphone
} from "lucide-react";

interface EVSelectionProps {
  onComplete: (evData: {
    vehicleType: string;
    model: string;
    range: number;
    connectorType: string;
    batteryLevel: number;
    usableRange: number;
  }) => void;
}

const SimpleEVSelection = ({ onComplete }: EVSelectionProps) => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [batteryPercentage, setBatteryPercentage] = useState("");

  const vehicleTypes = [
    { id: "car", name: "Car", icon: Car, emoji: "🚗" },
    { id: "scooter", name: "Scooter", icon: Smartphone, emoji: "🛵" },
    { id: "bike", name: "Bike", icon: Bike, emoji: "🏍️" }
  ];

  const vehicleModels = {
    car: [
      { id: "tata-nexon", name: "Tata Nexon EV", range: 312, connector: "CCS2", price: "₹14.99L" },
      { id: "mg-zs", name: "MG ZS EV", range: 461, connector: "CCS2", price: "₹21.99L" },
      { id: "hyundai-kona", name: "Hyundai Kona Electric", range: 452, connector: "CCS2", price: "₹23.84L" },
      { id: "mahindra-e2o", name: "Mahindra e2oPlus", range: 140, connector: "Type 2", price: "₹8.31L" }
    ],
    scooter: [
      { id: "ather-450x", name: "Ather 450X", range: 146, connector: "Type 2", price: "₹1.39L" },
      { id: "ola-s1-pro", name: "Ola S1 Pro", range: 181, connector: "Type 2", price: "₹1.30L" },
      { id: "tvs-iqube", name: "TVS iQube Electric", range: 140, connector: "Type 2", price: "₹1.15L" },
      { id: "bajaj-chetak", name: "Bajaj Chetak", range: 108, connector: "Type 2", price: "₹1.20L" }
    ],
    bike: [
      { id: "hero-electric", name: "Hero Electric Optima", range: 82, connector: "Type 2", price: "₹48K" },
      { id: "okinawa-praise", name: "Okinawa Praise Pro", range: 88, connector: "Type 2", price: "₹58K" },
      { id: "ampere-zeal", name: "Ampere Zeal Ex", range: 121, connector: "Type 2", price: "₹68K" },
      { id: "revolt-rv400", name: "Revolt RV400", range: 156, connector: "Type 2", price: "₹1.38L" }
    ]
  };

  const handleContinue = () => {
    if (!selectedType || !selectedModel || !batteryPercentage) return;
    
    const selectedVehicle = vehicleModels[selectedType as keyof typeof vehicleModels]?.find(
      model => model.id === selectedModel
    );
    
    if (selectedVehicle) {
      const batteryLevel = parseInt(batteryPercentage);
      const usableRange = Math.floor((batteryLevel / 100) * selectedVehicle.range);
      
      // Store the complete EV data in localStorage for global access
      const evData = {
        vehicleType: selectedType,
        model: selectedVehicle.name,
        range: selectedVehicle.range,
        connectorType: selectedVehicle.connector,
        batteryLevel,
        usableRange
      };
      
      localStorage.setItem('selectedEV', JSON.stringify(evData));
      
      onComplete(evData);
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
            Select Your Vehicle
          </h1>
          <p className="text-gray-600 text-lg">
            Choose your electric vehicle to get personalized recommendations
          </p>
        </div>

        {/* Vehicle Type Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vehicle Type</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {vehicleTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-white/70 backdrop-blur-sm border-0 ${
                    selectedType === type.id ? 'ring-2 ring-green-500 bg-green-50/50' : ''
                  }`}
                  onClick={() => {
                    setSelectedType(type.id);
                    setSelectedModel(""); // Reset model when type changes
                  }}
                >
                  <CardContent className="text-center p-6">
                    <div className="text-8xl mb-4">{type.emoji}</div>
                    <h3 className="text-lg font-semibold">{type.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Vehicle Model Selection */}
        {selectedType && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Select Model</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
              {vehicleModels[selectedType as keyof typeof vehicleModels]?.map((model) => (
                <Card 
                  key={model.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-white/70 backdrop-blur-sm border-0 ${
                    selectedModel === model.id ? 'ring-2 ring-green-500 bg-green-50/50' : ''
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Range</span>
                        <Badge variant="outline" className="flex items-center">
                          <Battery className="w-3 h-3 mr-1" />
                          {model.range} km
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Connector</span>
                        <Badge variant="outline" className="flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          {model.connector}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Battery Percentage Input */}
        {selectedType && selectedModel && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Current Battery Level</h2>
            <Card className="bg-white/70 backdrop-blur-sm border-0 max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Battery className="w-5 h-5 text-green-600" />
                    <Label htmlFor="battery" className="text-lg font-medium">
                      Enter your current battery percentage
                    </Label>
                  </div>
                  <div className="relative">
                     <Input
                       id="battery"
                       type="number"
                       min="1"
                       max="100"
                       step="1"
                       placeholder="e.g., 75"
                       value={batteryPercentage}
                       onChange={(e) => setBatteryPercentage(e.target.value)}
                       className="text-lg text-center"
                     />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  {batteryPercentage && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estimated Range:</span>
                         <span className="font-semibold text-green-700">
                           {Math.round((parseFloat(batteryPercentage) / 100) * vehicleModels[selectedType as keyof typeof vehicleModels]?.find(m => m.id === selectedModel)?.range || 0)} km
                         </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedType && selectedModel && batteryPercentage && parseInt(batteryPercentage) >= 1 && parseInt(batteryPercentage) <= 100 && (
          <div className="text-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              onClick={handleContinue}
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleEVSelection;
