
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Zap, 
  Clock, 
  Navigation,
  Star,
  Phone,
  DollarSign
} from "lucide-react";

interface StationDetailsProps {
  station: {
    id: number;
    name: string;
    type: string;
    location: string;
    availability: number;
    total: number;
    waitTime: number;
    distance: number;
    price: number;
    status: string;
    rating?: number;
    phone?: string;
    amenities?: string[];
  };
  onClose: () => void;
}

const StationDetails = ({ station, onClose }: StationDetailsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500";
      case "busy": return "bg-yellow-500";
      case "full": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{station.name}</CardTitle>
            <p className="text-gray-600 text-sm mt-1">{station.location}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 mt-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(station.status)}`}></div>
          <Badge variant="outline" className="capitalize">
            {station.status}
          </Badge>
          {station.rating && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm ml-1">{station.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Availability</span>
            <span className="font-medium">{station.availability}/{station.total}</span>
          </div>
          <Progress value={(station.availability / station.total) * 100} className="h-2" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Clock className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <div className="text-sm font-medium">{station.waitTime}m</div>
            <div className="text-xs text-gray-500">Wait time</div>
          </div>
          <div>
            <Navigation className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <div className="text-sm font-medium">{station.distance}km</div>
            <div className="text-xs text-gray-500">Distance</div>
          </div>
          <div>
            <DollarSign className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <div className="text-sm font-medium">₹{station.price}/hr</div>
            <div className="text-xs text-gray-500">Rate</div>
          </div>
        </div>
        
        {station.amenities && (
          <div>
            <h4 className="font-medium text-sm mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-1">
              {station.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
            <Navigation className="w-4 h-4 mr-2" />
            Navigate
          </Button>
          {station.phone && (
            <Button variant="outline" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StationDetails;
