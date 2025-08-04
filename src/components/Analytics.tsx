
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap,
  Clock,
  MapPin,
  Battery,
  DollarSign,
  Calendar,
  Target
} from "lucide-react";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("week");
  
  const stationMetrics = {
    totalRevenue: "₹2,34,567",
    totalSessions: 1247,
    avgSessionTime: "45m",
    utilizationRate: 78,
    peakHours: "6-9 PM",
    topPerformer: "Mumbai Central Hub"
  };

  const hourlyData = [
    { hour: "00", usage: 12, revenue: 480 },
    { hour: "06", usage: 45, revenue: 1800 },
    { hour: "12", usage: 78, revenue: 3120 },
    { hour: "18", usage: 95, revenue: 3800 },
    { hour: "21", usage: 65, revenue: 2600 },
    { hour: "24", usage: 25, revenue: 1000 }
  ];

  const stationPerformance = [
    {
      name: "Mumbai Central Hub",
      sessions: 342,
      revenue: "₹68,400",
      utilization: 85,
      rating: 4.8,
      status: "optimal"
    },
    {
      name: "Delhi Power Station",
      sessions: 298,
      revenue: "₹59,600",
      utilization: 72,
      rating: 4.6,
      status: "good"
    },
    {
      name: "Bangalore Tech Park",
      sessions: 256,
      revenue: "₹51,200",
      utilization: 65,
      rating: 4.4,
      status: "needs-attention"
    },
    {
      name: "Chennai Marina Hub",
      sessions: 234,
      revenue: "₹46,800",
      utilization: 58,
      rating: 4.2,
      status: "underperforming"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "optimal": return "bg-green-100 text-green-700 border-green-200";
      case "good": return "bg-blue-100 text-blue-700 border-blue-200";
      case "needs-attention": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "underperforming": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <section className="py-8 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Station Analytics</h2>
              <p className="text-gray-600 text-lg">
                Real-time insights and performance metrics for station owners
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={timeRange === "day" ? "default" : "outline"}
                onClick={() => setTimeRange("day")}
              >
                Day
              </Button>
              <Button
                size="sm"
                variant={timeRange === "week" ? "default" : "outline"}
                onClick={() => setTimeRange("week")}
              >
                Week
              </Button>
              <Button
                size="sm"
                variant={timeRange === "month" ? "default" : "outline"}
                onClick={() => setTimeRange("month")}
              >
                Month
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <DollarSign className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  +12%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stationMetrics.totalRevenue}
              </div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Zap className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  +8%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stationMetrics.totalSessions.toLocaleString()}
              </div>
              <p className="text-gray-600 text-sm">Charging Sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Clock className="w-8 h-8 text-purple-600" />
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  -5m
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stationMetrics.avgSessionTime}
              </div>
              <p className="text-gray-600 text-sm">Avg Session Time</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Target className="w-8 h-8 text-orange-600" />
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                  +15%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stationMetrics.utilizationRate}%
              </div>
              <p className="text-gray-600 text-sm">Utilization Rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Usage Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Hourly Usage Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hourlyData.map((data, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-12 text-sm text-gray-600">{data.hour}:00</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{data.usage}% Usage</span>
                        <span className="text-sm text-gray-600">₹{data.revenue}</span>
                      </div>
                      <Progress value={data.usage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Peak Hours: {stationMetrics.peakHours}</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Consider increasing capacity during peak hours for maximum revenue
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <h4 className="font-medium text-blue-900">Demand Prediction</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Expected 25% increase in demand this weekend. Consider dynamic pricing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <h4 className="font-medium text-green-900">Optimization Tip</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Station 3 is underutilized. Promote through app notifications.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <h4 className="font-medium text-yellow-900">Maintenance Alert</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Charger #4 showing efficiency drop. Schedule maintenance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <h4 className="font-medium text-purple-900">Revenue Opportunity</h4>
                      <p className="text-purple-700 text-sm mt-1">
                        Add battery swapping to increase revenue by estimated 40%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station Performance Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-600" />
              Station Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stationPerformance.map((station, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{station.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{station.sessions} sessions</span>
                        <span>{station.revenue}</span>
                        <span>⭐ {station.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Utilization</div>
                      <div className="font-medium">{station.utilization}%</div>
                    </div>
                    <div className="w-24">
                      <Progress value={station.utilization} className="h-2" />
                    </div>
                    <Badge className={getStatusColor(station.status)}>
                      {station.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Analytics;
