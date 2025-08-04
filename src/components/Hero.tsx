
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Zap, Battery, TrendingUp, Users } from "lucide-react";

const Hero = () => {
  const [stats, setStats] = useState({
    stations: 1247,
    users: 28543,
    savings: 342
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        stations: prev.stations + Math.floor(Math.random() * 3),
        users: prev.users + Math.floor(Math.random() * 5),
        savings: prev.savings + Math.floor(Math.random() * 2)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-green-100 text-green-700 border-green-200 hover:bg-green-200">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered EV Infrastructure
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
            ChargeSmart
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Revolutionizing India's EV charging experience with predictive AI, 
            smart routing, and unified charging networks
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg">
              <MapPin className="w-5 h-5 mr-2" />
              Find Charging Stations
            </Button>
            <Button size="lg" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 px-8 py-3 text-lg">
              <Battery className="w-5 h-5 mr-2" />
              For Station Owners
            </Button>
          </div>
          
          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-100">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.stations.toLocaleString()}</div>
              <div className="text-gray-600">Active Stations</div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.users.toLocaleString()}</div>
              <div className="text-gray-600">EV Users Served</div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.savings}h</div>
              <div className="text-gray-600">Time Saved Daily</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
