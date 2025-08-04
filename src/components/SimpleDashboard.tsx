
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { 
  MapPin, 
  Zap, 
  Battery, 
  Clock, 
  Navigation,
  Car,
  Info
} from "lucide-react";

interface VehicleData {
  vehicleType: string;
  model: string;
  range: number;
  connectorType: string;
  batteryLevel: number;
  usableRange: number;
}

interface SimpleDashboardProps {
  vehicleData: VehicleData;
}

const SimpleDashboard = ({ vehicleData }: SimpleDashboardProps) => {
  const { user } = useAuth();
  const [selectedStation, setSelectedStation] = useState<any>(null);

  // Mock charging stations data
  const stations = [
    {
      id: 1,
      name: "Koramangala Hub",
      distance: "2.3 km",
      available: 3,
      total: 4,
      price: "₹12/kWh",
      waitTime: "5 min",
      connector: "CCS2",
      status: "available",
      prediction: "2 more ports free in 15 min"
    },
    {
      id: 2,
      name: "Electronic City",
      distance: "4.1 km", 
      available: 0,
      total: 6,
      price: "₹15/kWh",
      waitTime: "25 min",
      connector: "CCS2",
      status: "busy",
      prediction: "3 ports free in 30 min"
    },
    {
      id: 3,
      name: "Whitefield Swap",
      distance: "6.8 km",
      available: 8,
      total: 10,
      price: "₹80/swap",
      waitTime: "2 min",
      connector: "Swap",
      status: "available",
      prediction: "Always available"
    },
    {
      id: 4,
      name: "Indiranagar Plaza",
      distance: "3.2 km",
      available: 1,
      total: 3,
      price: "₹18/kWh",
      waitTime: "12 min",
      connector: "Type 2",
      status: "limited",
      prediction: "1 more port free in 20 min"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'limited': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'limited': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'busy': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hello, {user?.username}! 👋
          </h1>
          <p className="text-gray-600">
            Welcome to your EV dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Status */}
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Car className="w-5 h-5 mr-2 text-blue-600" />
                Your Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{vehicleData.model}</h3>
                <p className="text-sm text-gray-600 capitalize">{vehicleData.vehicleType}</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Battery</span>
                  <span className="font-semibold">{vehicleData.batteryLevel}%</span>
                </div>
                <Progress value={vehicleData.batteryLevel} className="mb-2" />
                <p className="text-sm text-gray-600">
                  {vehicleData.usableRange} km remaining
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connector</span>
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {vehicleData.connectorType}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Map and Stations */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Nearby Stations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simplified Map */}
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-48 flex items-center justify-center mb-4 relative">
                <div className="text-center">
                  <MapPin className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Interactive Map</p>
                  <p className="text-sm text-gray-500">Stations within 10km</p>
                </div>
                
                {/* Station pins */}
                {stations.slice(0,3).map((station, index) => (
                  <div
                    key={station.id}
                    className={`absolute w-3 h-3 rounded-full cursor-pointer ${getStatusColor(station.status)} hover:scale-110 transition-transform`}
                    style={{
                      top: `${25 + index * 20}%`,
                      left: `${30 + index * 25}%`,
                    }}
                    onClick={() => setSelectedStation(station)}
                  />
                ))}
              </div>
              
              {/* Station List */}
              <div className="space-y-2">
                {stations.map((station) => (
                  <div
                    key={station.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => setSelectedStation(station)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(station.status)}`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{station.name}</h4>
                        <p className="text-xs text-gray-600">{station.distance} • {station.price}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusBadge(station.status)} text-xs`}>
                      {station.available}/{station.total}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station Details Modal */}
        {selectedStation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedStation.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStation(null)}
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className={getStatusBadge(selectedStation.status)}>
                    {selectedStation.available}/{selectedStation.total} available
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-medium">{selectedStation.distance}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium">{selectedStation.price}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Wait Time</span>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-medium">{selectedStation.waitTime}</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      <strong>AI Prediction:</strong> {selectedStation.prediction}
                    </p>
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600">
                  <Navigation className="w-4 h-4 mr-2" />
                  Navigate
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDashboard;
