import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  MapPin, 
  Zap, 
  Battery, 
  Clock, 
  Navigation,
  Search,
  Brain,
  TrendingUp,
  Star,
  Calendar,
  CheckCircle,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import TimeSlotBookingModal from "@/components/TimeSlotBookingModal";
import ReviewModal from "@/components/ReviewModal";
import { reviewCache } from "@/utils/reviewCache";

interface StationListProps {
  stations: any[];
  selectedStation: any;
  onStationSelect: (station: any) => void;
  onNavigateToStation?: (station: any) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  getPredictionData: (stationId: number) => any;
  isModelReady: boolean;
  currentTime: Date;
  simulationSpeed: number;
  activeRoute?: any;
  routeInfo?: {distance: string, duration: string} | null;
}

const StationList = ({ 
  stations, 
  selectedStation, 
  onStationSelect,
  onNavigateToStation, 
  searchTerm, 
  onSearchChange,
  getPredictionData,
  isModelReady,
  currentTime,
  simulationSpeed,
  activeRoute,
  routeInfo
}: StationListProps) => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBookingStation, setSelectedBookingStation] = useState<any>(null);
  const [expandedReviews, setExpandedReviews] = useState<number | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewStation, setSelectedReviewStation] = useState<any>(null);
  const { bookStation, isStationBooked } = useBooking();
  
  // Get real reviews from cache
  const getStationReviews = (stationId: number) => {
    return reviewCache.getStationReviews(stationId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500";
      case "moderate": return "bg-yellow-400";
      case "busy": return "bg-orange-500";
      case "critical": return "bg-red-600";
      case "full": return "bg-red-800";
      default: return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fast-charging": return <Zap className="w-4 h-4" />;
      case "battery-swap": return <Battery className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getAvailabilityRank = (index: number, stationId: number, isSelected: boolean) => {
    // Only show "Best" for the actual best station (first in sorted order), not just selected
    if (index === 0 && !isSelected) return { icon: <Star className="w-3 h-3" />, label: "Best", color: "text-green-600" };
    if (index <= 2 && !isSelected) return { icon: <TrendingUp className="w-3 h-3" />, label: "Good", color: "text-blue-600" };
    return null;
  };

  // Generate star rating for each station (3.5, 4, or 4.5 stars)
  const getStationRating = (stationId: number) => {
    const ratings = [3.5, 4, 4.5];
    return ratings[stationId % 3];
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }

    return stars;
  };

  const handleNavigateClick = (station: any) => {
    // Use the new navigation prop if available, otherwise fallback to global function
    if (onNavigateToStation) {
      onNavigateToStation(station);
    } else if ((window as any).navigateToStation) {
      (window as any).navigateToStation(station.id);
    }
    onStationSelect(station);
  };

  const handleBookClick = (station: any) => {
    setSelectedBookingStation(station);
    setBookingModalOpen(true);
  };

  const handleBookingConfirmed = (bookedTime: Date) => {
    if (selectedBookingStation) {
      bookStation(selectedBookingStation.id, selectedBookingStation.name, bookedTime);
    }
    setBookingModalOpen(false);
    setSelectedBookingStation(null);
  };

  const toggleReviews = (stationId: number) => {
    setExpandedReviews(expandedReviews === stationId ? null : stationId);
  };

  const handleAddReview = (station: any) => {
    setSelectedReviewStation(station);
    setReviewModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Search stations..." 
            className="flex-1" 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>


        <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {stations
          .sort((a, b) => {
            // Move selected station to top
            if (selectedStation?.id === a.id) return -1;
            if (selectedStation?.id === b.id) return 1;
            return 0;
          })
          .map((station, index) => {
          const prediction = getPredictionData(station.id);
          const isSelected = selectedStation?.id === station.id;
          // Find the original index (before selected station was moved to top)
          const originalIndex = isSelected ? 
            stations.findIndex(s => s.id === station.id) : 
            index - (selectedStation && stations.findIndex(s => s.id === selectedStation.id) < index ? 0 : 0);
          const rank = getAvailabilityRank(originalIndex, station.id, isSelected);
          const rating = getStationRating(station.id);
          const reviews = getStationReviews(station.id);
          const isReviewsExpanded = expandedReviews === station.id;
          
          return (
            <Card 
              key={station.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-white/70 backdrop-blur-sm border-0 relative ${
                isSelected ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => onStationSelect(station)}
            >
              {rank && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border">
                  <div className={`flex items-center space-x-1 ${rank.color} text-xs font-medium px-2 py-1`}>
                    {rank.icon}
                    <span>{rank.label}</span>
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    {getTypeIcon(station.type)}
                    <span className="ml-2">{station.name}</span>
                    {isSelected && (
                      <Badge className="ml-2 bg-green-100 text-green-700 border-green-200">
                        Selected
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">{station.location}</p>
                </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(rating)}
                    <span className="text-sm text-gray-600 ml-1">({rating})</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Availability</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{prediction.availability}/8</span>
                      {prediction.availability >= 6 && (
                        <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                          High
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Progress 
                    value={(prediction.availability / 8) * 100} 
                    className="h-2"
                  />
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <Clock className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <div className="font-medium">{prediction.waitTime}m</div>
                      <div className="text-gray-500">Wait time</div>
                    </div>
                    <div className="text-center">
                      <Navigation className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <div className="font-medium">
                        {activeRoute && routeInfo && station.id === activeRoute.id 
                          ? routeInfo.distance 
                          : `${station.distance}km`
                        }
                      </div>
                      <div className="text-gray-500">Distance</div>
                    </div>
                    <div className="text-center">
                      <Zap className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <div className="font-medium">₹{station.price}/hr</div>
                      <div className="text-gray-500">Rate</div>
                    </div>
                  </div>

                  <Collapsible open={isReviewsExpanded} onOpenChange={() => toggleReviews(station.id)}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReviews(station.id);
                        }}
                      >
                        <span>See Reviews</span>
                        {isReviewsExpanded ? (
                          <ChevronDown className="w-4 h-4 ml-2" />
                        ) : (
                          <ChevronRight className="w-4 h-4 ml-2" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                        {reviews.length > 0 ? (
                          reviews.map((review, reviewIndex) => (
                            <div key={reviewIndex} className="flex space-x-3 p-2 bg-white rounded border">
                              <div className="text-2xl">{review.avatar}</div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{review.name}</span>
                                  <div className="flex items-center space-x-1">
                                    {renderStars(review.rating)}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-600">{review.review}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500 text-sm mb-2">No reviews yet</p>
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddReview(station);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              Be the first to review
                            </Button>
                          </div>
                        )}
                        {reviews.length > 0 && (
                          <div className="pt-2 border-t">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddReview(station);
                              }}
                              className="w-full"
                            >
                              Add your review
                            </Button>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateClick(station);
                      }}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Navigate
                    </Button>
                    
                    {isStationBooked(station.id) ? (
                      <Button 
                        className="flex-1 bg-green-100 text-green-700 border border-green-200 hover:bg-green-50"
                        size="sm"
                        variant="outline"
                        disabled
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Booked
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookClick(station);
                        }}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Book
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    
    <TimeSlotBookingModal
      isOpen={bookingModalOpen}
      onClose={() => setBookingModalOpen(false)}
      stationName={selectedBookingStation?.name || ''}
      currentTime={currentTime}
      simulationSpeed={simulationSpeed}
      onBookingConfirmed={handleBookingConfirmed}
    />
    
    <ReviewModal
      isOpen={reviewModalOpen}
      onClose={() => setReviewModalOpen(false)}
      stationName={selectedReviewStation?.name || ''}
      stationId={selectedReviewStation?.id || 0}
    />
  </>
  );
};

export default StationList;
