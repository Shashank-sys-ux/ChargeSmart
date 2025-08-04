
import { useState, useEffect, useRef } from "react";
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
  Filter,
  Search,
  Play,
  Pause
} from "lucide-react";
import { Input } from "@/components/ui/input";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const StationMap = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSimulating, setIsSimulating] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  
  // Station data with coordinates for map visualization
  const stations = [
    {
      id: 1,
      name: "Mumbai Central Hub",
      type: "fast-charging",
      location: "Mumbai, Maharashtra",
      lat: 19.0760, lng: 72.8777, // Mumbai coordinates
      total: 12,
      price: 12,
      baseAvailability: 8,
      baseWaitTime: 5,
      distance: 2.3,
    },
    {
      id: 2,
      name: "Delhi Power Station",
      type: "battery-swap",
      location: "Delhi, NCR",
      lat: 28.6139, lng: 77.2090, // Delhi coordinates
      total: 6,
      price: 8,
      baseAvailability: 3,
      baseWaitTime: 15,
      distance: 1.8,
    },
    {
      id: 3,
      name: "Bangalore Tech Park",
      type: "fast-charging",
      location: "Bangalore, Karnataka",
      lat: 12.9716, lng: 77.5946, // Bangalore coordinates
      total: 8,
      price: 15,
      baseAvailability: 4,
      baseWaitTime: 25,
      distance: 5.2,
    },
    {
      id: 4,
      name: "Chennai Marina Hub",
      type: "standard",
      location: "Chennai, Tamil Nadu",
      lat: 13.0827, lng: 80.2707, // Chennai coordinates
      total: 8,
      price: 10,
      baseAvailability: 6,
      baseWaitTime: 2,
      distance: 3.1,
    },
    {
      id: 5,
      name: "Pune Smart Station",
      type: "battery-swap",
      location: "Pune, Maharashtra",
      lat: 18.5204, lng: 73.8567, // Pune coordinates
      total: 4,
      price: 9,
      baseAvailability: 2,
      baseWaitTime: 25,
      distance: 4.7,
    }
  ];

  // Time simulation: 1 second = 1 minute
  useEffect(() => {
    if (!isSimulating) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = new Date(prev);
        newTime.setMinutes(newTime.getMinutes() + 1);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Calculate dynamic station status based on time
  const getStationStatus = (station, time) => {
    const hour = time.getHours();
    const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
    const isNightTime = hour >= 22 || hour <= 6;
    
    let availability = station.baseAvailability;
    let waitTime = station.baseWaitTime;
    
    if (isPeakHour) {
      availability = Math.max(0, Math.floor(availability * 0.3));
      waitTime = Math.floor(waitTime * 3);
    } else if (isNightTime) {
      availability = Math.min(station.total, Math.floor(availability * 1.5));
      waitTime = Math.floor(waitTime * 0.5);
    }
    
    let status = "available";
    if (availability === 0) status = "full";
    else if (availability <= station.total * 0.3) status = "busy";
    
    return { availability, waitTime, status };
  };

  // Get heat map color based on usage
  const getHeatColor = (station, time) => {
    const { availability } = getStationStatus(station, time);
    const usagePercent = ((station.total - availability) / station.total) * 100;
    
    if (usagePercent >= 90) return '#8B0000'; // Deep red
    if (usagePercent >= 70) return '#FF4500'; // Orange red
    if (usagePercent >= 50) return '#FFA500'; // Orange
    if (usagePercent >= 30) return '#FFD700'; // Gold
    return '#90EE90'; // Light green
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on India
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when stations or time changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    stations.forEach(station => {
      if (filterType !== "all" && station.type !== filterType) return;

      const color = getHeatColor(station, currentTime);
      const { status, availability, waitTime } = getStationStatus(station, currentTime);
      
      // Create custom icon
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid ${status === 'full' ? '#FFFFFF' : '#000000'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${station.type === 'fast-charging' ? '⚡' : station.type === 'battery-swap' ? '🔋' : '📍'}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([station.lat, station.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
              ${station.name}
            </h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
              ${station.location}
            </p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: ${
                  status === 'available' ? '#10b981' :
                  status === 'busy' ? '#f59e0b' : '#ef4444'
                };
              "></span>
              <span style="font-size: 12px; text-transform: capitalize; font-weight: 500;">
                ${status}
              </span>
            </div>
            <div style="font-size: 12px; line-height: 1.4;">
              <div>Availability: ${availability}/${station.total}</div>
              <div>Wait time: ${waitTime}m</div>
              <div>Distance: ${station.distance}km</div>
              <div>Rate: ₹${station.price}/hr</div>
            </div>
          </div>
        `)
        .on('click', () => {
          setSelectedStation(station);
        });

      markersRef.current.push(marker);
    });
  }, [currentTime, filterType, stations]);

  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "bg-green-500";
      case "busy": return "bg-yellow-500";
      case "full": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "fast-charging": return <Zap className="w-4 h-4" />;
      case "battery-swap": return <Battery className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const filteredStations = stations.filter(station => 
    filterType === "all" || station.type === filterType
  );

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const getTimeOfDay = (hour) => {
    if (hour >= 8 && hour <= 10) return "Morning Peak";
    if (hour >= 17 && hour <= 19) return "Evening Peak";
    if (hour >= 22 || hour <= 6) return "Night Time";
    return "Normal Hours";
  };

  return (
    <section className="py-8 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Live Station Map</h2>
          <p className="text-gray-600 text-lg">
            Real-time availability and smart routing across India's EV network
          </p>
        </div>

        {/* Time Control Panel */}
        <div className="mb-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-semibold text-gray-800">
                    Current Time: {formatTime(currentTime)}
                  </div>
                  <Badge variant="outline" className={`${
                    getTimeOfDay(currentTime.getHours()).includes('Peak') ? 'border-red-200 text-red-700 bg-red-50' :
                    getTimeOfDay(currentTime.getHours()).includes('Night') ? 'border-blue-200 text-blue-700 bg-blue-50' :
                    'border-green-200 text-green-700 bg-green-50'
                  }`}>
                    {getTimeOfDay(currentTime.getHours())}
                  </Badge>
                </div>
                <Button
                  onClick={() => setIsSimulating(!isSimulating)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isSimulating ? 'Pause' : 'Play'} Simulation</span>
                </Button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                1 second = 1 minute simulation • Peak hours show deep red stations
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] bg-white/70 backdrop-blur-sm border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Live Heat Map
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={filterType === "all" ? "default" : "outline"}
                      onClick={() => setFilterType("all")}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={filterType === "fast-charging" ? "default" : "outline"}
                      onClick={() => setFilterType("fast-charging")}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Fast
                    </Button>
                    <Button
                      size="sm"
                      variant={filterType === "battery-swap" ? "default" : "outline"}
                      onClick={() => setFilterType("battery-swap")}
                    >
                      <Battery className="w-4 h-4 mr-1" />
                      Swap
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-full p-4">
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <div
                    ref={mapRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ height: '100%' }}
                  />
                  
                  {/* Heat Map Legend */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md z-[1000]">
                    <div className="text-sm font-semibold mb-2">Usage Level</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-800 rounded"></div>
                        <span>90%+ (Critical)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span>70%+ (High)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-300 rounded"></div>
                        <span>50%+ (Medium)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-300 rounded"></div>
                        <span>30%+ (Low)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-300 rounded"></div>
                        <span>&lt;30% (Available)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Station List */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <Input placeholder="Search stations..." className="flex-1" />
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredStations.map((station) => {
                const dynamicData = getStationStatus(station, currentTime);
                return (
                  <Card 
                    key={station.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-white/70 backdrop-blur-sm border-0 ${
                      selectedStation?.id === station.id ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => setSelectedStation(station)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {getTypeIcon(station.type)}
                            <span className="ml-2">{station.name}</span>
                          </CardTitle>
                          <p className="text-gray-600 text-sm">{station.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(dynamicData.status)}`}></div>
                          <Badge 
                            variant="outline" 
                            className={`${
                              dynamicData.status === 'available' ? 'border-green-200 text-green-700' :
                              dynamicData.status === 'busy' ? 'border-yellow-200 text-yellow-700' :
                              'border-red-200 text-red-700'
                            }`}
                          >
                            {dynamicData.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Availability</span>
                          <span className="font-medium">{dynamicData.availability}/{station.total}</span>
                        </div>
                        
                        <Progress 
                          value={(dynamicData.availability / station.total) * 100} 
                          className="h-2"
                        />
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <Clock className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                            <div className="font-medium">{dynamicData.waitTime}m</div>
                            <div className="text-gray-500">Wait time</div>
                          </div>
                          <div className="text-center">
                            <Navigation className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                            <div className="font-medium">{station.distance}km</div>
                            <div className="text-gray-500">Distance</div>
                          </div>
                          <div className="text-center">
                            <Zap className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                            <div className="font-medium">₹{station.price}/hr</div>
                            <div className="text-gray-500">Rate</div>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                          size="sm"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Navigate Here
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StationMap;
