import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Navigation, Search } from 'lucide-react';

interface DestinationSuggestion {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  distance: number; // km from user location
  estimatedTime: number; // minutes
  type: 'landmark' | 'business' | 'station';
}

interface DestinationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDestinationSelect: (destination: DestinationSuggestion) => void;
  userLocation: [number, number];
}

import { INTERCITY_DESTINATIONS } from '@/data/intercityData';

// Mock destinations around Bangalore with real coordinates
const BANGALORE_DESTINATIONS: Omit<DestinationSuggestion, 'distance' | 'estimatedTime'>[] = [
  {
    id: 'cubbon-park',
    name: 'Cubbon Park',
    location: 'Central Bangalore',
    coordinates: [12.9762, 77.5906],
    type: 'landmark'
  },
  {
    id: 'ub-city-mall',
    name: 'UB City Mall',
    location: 'Vittal Mallya Road',
    coordinates: [12.9721, 77.5937],
    type: 'business'
  },
  {
    id: 'brigade-road',
    name: 'Brigade Road',
    location: 'Central Shopping District',
    coordinates: [12.9716, 77.6097],
    type: 'business'
  },
  {
    id: 'bannerghatta-road',
    name: 'Bannerghatta Road',
    location: 'South Bangalore',
    coordinates: [12.8692, 77.6106],
    type: 'business'
  },
  {
    id: 'electronic-city',
    name: 'Electronic City',
    location: 'IT Hub, South Bangalore',
    coordinates: [12.8456, 77.6603],
    type: 'business'
  },
  {
    id: 'whitefield',
    name: 'Whitefield',
    location: 'East Bangalore IT Corridor',
    coordinates: [12.9698, 77.7500],
    type: 'business'
  },
  {
    id: 'koramangala',
    name: 'Koramangala',
    location: 'Hip Urban District',
    coordinates: [12.9352, 77.6245],
    type: 'business'
  },
  {
    id: 'indiranagar',
    name: 'Indiranagar',
    location: 'Shopping & Dining Hub',
    coordinates: [12.9719, 77.6412],
    type: 'business'
  },
  {
    id: 'mg-road',
    name: 'MG Road',
    location: 'Commercial Street',
    coordinates: [12.9753, 77.6086],
    type: 'business'
  },
  {
    id: 'jp-nagar',
    name: 'JP Nagar',
    location: 'South Bangalore Residential',
    coordinates: [12.9165, 77.5848],
    type: 'business'
  }
];

// Convert intercity destinations to destination suggestions
const INTERCITY_DESTINATION_SUGGESTIONS: Omit<DestinationSuggestion, 'distance' | 'estimatedTime'>[] = 
  INTERCITY_DESTINATIONS.map(dest => ({
    id: dest.id,
    name: `${dest.name}, ${dest.city}`,
    location: `${dest.description} (${dest.distanceFromBangalore}km)`,
    coordinates: dest.coordinates,
    type: 'landmark' as const
  }));

// Combine local and intercity destinations
const ALL_DESTINATIONS = [...BANGALORE_DESTINATIONS, ...INTERCITY_DESTINATION_SUGGESTIONS];

const DestinationSearchModal = ({
  isOpen,
  onClose,
  onDestinationSelect,
  userLocation
}: DestinationSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate distance using Haversine formula
  const calculateDistance = (from: [number, number], to: [number, number]): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (to[0] - from[0]) * Math.PI / 180;
    const dLon = (to[1] - from[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from[0] * Math.PI / 180) * Math.cos(to[0] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Update suggestions when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Show all destinations when no search term - prioritize local destinations
      const allSuggestions = ALL_DESTINATIONS.map(dest => {
        const distance = calculateDistance(userLocation, dest.coordinates);
        const estimatedTime = distance > 100 ? 
          Math.round(distance / 60 * 60) : // For long distance, show hours in minutes
          Math.round(distance * 2.5); // For local, 2.5 minutes per km in traffic
        
        return {
          ...dest,
          distance: Math.round(distance * 10) / 10,
          estimatedTime
        };
      }).sort((a, b) => {
        // Prioritize local destinations (< 100km), then by distance
        if (a.distance < 100 && b.distance >= 100) return -1;
        if (a.distance >= 100 && b.distance < 100) return 1;
        return a.distance - b.distance;
      });
      
      setSuggestions(allSuggestions);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    const searchTimeout = setTimeout(() => {
      const filtered = ALL_DESTINATIONS
        .filter(dest => 
          dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(dest => {
          const distance = calculateDistance(userLocation, dest.coordinates);
          const estimatedTime = distance > 100 ? 
            Math.round(distance / 60 * 60) : 
            Math.round(distance * 2.5);
          
          return {
            ...dest,
            distance: Math.round(distance * 10) / 10,
            estimatedTime
          };
        })
        .sort((a, b) => {
          // Prioritize local destinations, then by distance
          if (a.distance < 100 && b.distance >= 100) return -1;
          if (a.distance >= 100 && b.distance < 100) return 1;
          return a.distance - b.distance;
        });
      
      setSuggestions(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, userLocation]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleDestinationClick = (destination: DestinationSuggestion) => {
    onDestinationSelect(destination);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'landmark':
        return '🏛️';
      case 'business':
        return '🏢';
      case 'station':
        return '🚉';
      default:
        return '📍';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search Destination
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Type destination name or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No destinations found</p>
                <p className="text-sm">Try searching for landmarks, areas, or businesses</p>
              </div>
            ) : (
              suggestions.map((destination) => (
                <Card 
                  key={destination.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                  onClick={() => handleDestinationClick(destination)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getTypeIcon(destination.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{destination.name}</h3>
                        <p className="text-sm text-gray-600">{destination.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-700 mb-1">
                          <MapPin className="h-3 w-3" />
                          <span>{destination.distance} km</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Clock className="h-3 w-3" />
                          <span>~{destination.distance > 100 ? 
                            `${Math.round(destination.estimatedTime / 60)}h ${destination.estimatedTime % 60}min` : 
                            `${destination.estimatedTime} min`
                          }</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DestinationSearchModal;