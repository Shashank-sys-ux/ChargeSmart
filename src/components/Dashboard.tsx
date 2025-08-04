
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Zap, 
  Battery, 
  Clock, 
  Navigation,
  Bell,
  Star,
  TrendingUp
} from "lucide-react";

const Dashboard = () => {
  const [batteryLevel] = useState(65);
  
  const quickStats = {
    nearbyStations: 12,
    fastCharging: 8,
    batterySwap: 4,
    avgWaitTime: "8 min"
  };

  const recentTrips = [
    { destination: "Koramangala Hub", time: "2 hours ago", savings: "15 min" },
    { destination: "Electronic City", time: "Yesterday", savings: "20 min" },
    { destination: "Whitefield Tech Park", time: "3 days ago", savings: "25 min" }
  ];

  const notifications = [
    { id: 1, message: "Station near Koramangala is getting busy", type: "warning", time: "2 min ago" },
    { id: 2, message: "Fast charging available at Indiranagar", type: "info", time: "5 min ago" },
    { id: 3, message: "Battery swap recommended for your route", type: "success", time: "10 min ago" }
  ];

  return (
    <section className="py-8 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Your EV Dashboard</h2>
          <p className="text-gray-600 text-lg">
            Real-time insights for your electric journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Battery Status */}
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Battery className="w-5 h-5 mr-2 text-green-600" />
                Current Battery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{batteryLevel}%</div>
              <Progress value={batteryLevel} className="mb-4" />
              <div className="text-sm text-gray-600">
                Estimated range: {Math.round(batteryLevel * 3.5)} km
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600">
                <Navigation className="w-4 h-4 mr-2" />
                Find Charging Station
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Nearby Stations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{quickStats.nearbyStations}</div>
                  <div className="text-xs text-gray-500">Total Stations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{quickStats.fastCharging}</div>
                  <div className="text-xs text-gray-500">Fast Charging</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{quickStats.batterySwap}</div>
                  <div className="text-xs text-gray-500">Battery Swap</div>
                </div>
                <div className="text-center">
                  <div className="text-sl font-bold text-orange-600">{quickStats.avgWaitTime}</div>
                  <div className="text-xs text-gray-500">Avg Wait</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-orange-600" />
                Smart Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trips */}
        <div className="mt-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Recent Smart Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrips.map((trip, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <Navigation className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{trip.destination}</h4>
                        <p className="text-sm text-gray-600">{trip.time}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Saved {trip.savings}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
