import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, BarChart3, Activity, LogOut } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const data = [
  { name: 'Bandra West Hub', value: 450 },
  { name: 'Another East', value: 380 },
  { name: 'Power Swap', value: 310 },
  { name: 'Worli Plaza', value: 290 },
  { name: 'BKC Terminal', value: 220 },
];

const AdminDashboard = () => {
  const { logout } = useAuth();
  const average = 336;
  const [isLoaded, setIsLoaded] = useState(false);
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0]);

  useEffect(() => {
    setIsLoaded(true);
    // Animate counter values
    const targetValues = [1680, 450, 336];
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      setAnimatedValues(targetValues.map(target => Math.floor(target * easedProgress)));
      
      if (currentStep >= steps) {
        setAnimatedValues(targetValues);
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className={`mb-4 sm:mb-6 md:mb-8 transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2 sm:mb-3 animate-fade-in">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 text-sm sm:text-base md:text-lg">Real-time EV charging station analytics and insights</p>
            </div>
            <Button 
              variant="outline" 
              onClick={logout}
              className="flex items-center gap-2 self-start sm:mt-2 text-sm sm:text-base"
              size="sm"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>

        {/* Chart Section */}
        <Card className={`w-full shadow-lg sm:shadow-xl md:shadow-2xl border-0 bg-white/70 backdrop-blur-sm hover:shadow-xl sm:hover:shadow-2xl md:hover:shadow-3xl transition-all duration-500 hover:scale-[1.005] sm:hover:scale-[1.01] transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <CardHeader className="pb-2 sm:pb-3 md:pb-4 p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 animate-pulse" />
              <span className="truncate">Station Usage Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="h-48 sm:h-64 md:h-80 lg:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 15, left: 5, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b"
                    fontSize={10}
                    className="sm:text-xs"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={10}
                    className="sm:text-xs"
                    domain={[0, 600]}
                  />
                  <ReferenceLine 
                    y={average} 
                    stroke="#f59e0b" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    className="sm:strokeDasharray-6 sm:strokeWidth-2"
                    label={{ 
                      value: `Avg: ${average}`, 
                      position: "right", 
                      style: { 
                        fill: "#f59e0b", 
                        fontWeight: "bold", 
                        fontSize: "10px"
                      },
                      className: "sm:text-xs"
                    }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={2}
                    dot={{ fill: "#ffffff", stroke: "#10b981", strokeWidth: 2, r: 3, filter: "url(#glow)" }}
                    activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2, filter: "url(#glow)" }}
                    animationDuration={2000}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <Card className={`bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 border-0 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 hover:scale-102 sm:hover:scale-105 hover:-translate-y-1 sm:hover:-translate-y-2 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
                <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:scale-105 sm:hover:scale-110">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white drop-shadow-md" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-emerald-700 mb-1 sm:mb-2 uppercase tracking-wide">Active</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-900 mb-1 font-mono">{animatedValues[0]}</p>
                  <p className="text-xs sm:text-sm text-emerald-600 font-medium">Total Sessions Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 border-0 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 hover:scale-102 sm:hover:scale-105 hover:-translate-y-1 sm:hover:-translate-y-2 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ animationDelay: '400ms' }}>
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
                <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:scale-105 sm:hover:scale-110">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white drop-shadow-md" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-blue-700 mb-1 sm:mb-2 uppercase tracking-wide">Peak</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-1 font-mono">{animatedValues[1]}</p>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">Highest Usage (Bandra West Hub)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100 border-0 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 hover:scale-102 sm:hover:scale-105 hover:-translate-y-1 sm:hover:-translate-y-2 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ animationDelay: '600ms' }}>
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
                <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:scale-105 sm:hover:scale-110">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white drop-shadow-md" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-teal-700 mb-1 sm:mb-2 uppercase tracking-wide">Average</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-900 mb-1 font-mono">{animatedValues[2]}</p>
                  <p className="text-xs sm:text-sm text-teal-600 font-medium">Average Sessions per Station</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <Card className={`border-0 shadow-lg sm:shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 hover:scale-[1.005] sm:hover:scale-[1.02] transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ animationDelay: '800ms' }}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Station Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {data.map((station, index) => (
                  <div key={station.name} className="group hover:bg-slate-50 p-2 sm:p-3 rounded-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors truncate flex-1 pr-2">{station.name}</span>
                      <span className="text-xs sm:text-sm text-slate-600 w-8 sm:w-12 text-right font-mono">{station.value}</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 sm:h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{ 
                            width: isLoaded ? `${(station.value / 450) * 100}%` : '0%',
                            animationDelay: `${1000 + index * 200}ms`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={`border-0 shadow-lg sm:shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 hover:scale-[1.005] sm:hover:scale-[1.02] transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ animationDelay: '1000ms' }}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {[
                  { label: "Total Stations", value: "5", color: "text-slate-700" },
                  { label: "Active Now", value: "4", color: "text-emerald-600" },
                  { label: "Maintenance", value: "1", color: "text-orange-600" },
                  { label: "Average Wait Time", value: "12 min", color: "text-slate-700" }
                ].map((stat, index) => (
                  <div key={stat.label} className="flex justify-between items-center py-2 sm:py-3 px-2 sm:px-4 rounded-lg hover:bg-slate-50 transition-all duration-300 group">
                    <span className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{stat.label}</span>
                    <span className={`font-bold text-sm sm:text-base md:text-lg ${stat.color} group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-200`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;