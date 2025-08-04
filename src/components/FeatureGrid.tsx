
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Route, 
  Battery, 
  BarChart3, 
  Zap, 
  Clock,
  MapPin,
  Users,
  TrendingUp
} from "lucide-react";

const FeatureGrid = () => {
  const features = [
    {
      icon: Brain,
      title: "Predictive AI",
      description: "Machine learning forecasts station availability 30 minutes ahead",
      badge: "Core Feature",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Route,
      title: "Smart Routing",
      description: "Optimal paths considering range, traffic, and predicted wait times",
      badge: "Navigation",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Battery,
      title: "Battery Swapping",
      description: "Integrated network of charging and swapping stations",
      badge: "Innovation",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Station Analytics",
      description: "Real-time insights for station owners to optimize operations",
      badge: "Business",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Clock,
      title: "Wait Time Prediction",
      description: "AI-powered queue management reduces charging delays",
      badge: "Efficiency",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: MapPin,
      title: "Live Station Map",
      description: "Real-time availability across India's EV charging network",
      badge: "Real-time",
      color: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <section className="py-20 bg-white/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Intelligent Features for Modern EVs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform brings together cutting-edge technology to solve 
            real-world EV charging challenges across India
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:scale-105"
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <Badge className="mb-2 bg-gray-100 text-gray-700 border-gray-200">
                  {feature.badge}
                </Badge>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Technical Innovation Highlight */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">Why ChargeSmart is Different</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-3 text-green-200" />
                  Time-series ML forecasting for station availability
                </li>
                <li className="flex items-center">
                  <Route className="w-5 h-5 mr-3 text-blue-200" />
                  Multi-factor routing beyond shortest distance
                </li>
                <li className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-purple-200" />
                  Unified charging & battery swap ecosystem
                </li>
                <li className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-3 text-orange-200" />
                  Data-driven insights for infrastructure growth
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h4 className="text-2xl font-bold mb-2">85% Reduction</h4>
                <p className="text-white/80">in average charging wait times</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
