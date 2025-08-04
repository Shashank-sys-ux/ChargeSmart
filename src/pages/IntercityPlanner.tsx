import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IntercityRoutePlanner from '@/components/intercity/IntercityRoutePlanner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Car } from 'lucide-react';

const IntercityPlanner = () => {
  const navigate = useNavigate();
  const [vehicleData, setVehicleData] = useState<{
    model: string;
    range: number;
    connectorType: string;
    preference: string;
    batteryLevel?: number;
  } | null>(null);

  useEffect(() => {
    // Try to get vehicle data from localStorage
    const storedEV = localStorage.getItem('selectedEV');
    if (storedEV) {
      try {
        const parsed = JSON.parse(storedEV);
        setVehicleData(parsed);
      } catch (error) {
        console.error('Error parsing stored EV data:', error);
        navigate('/');
      }
    } else {
      // No vehicle selected, redirect to selection
      navigate('/');
    }
  }, [navigate]);

  if (!vehicleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your vehicle information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <IntercityRoutePlanner vehicleData={vehicleData} />
    </div>
  );
};

export default IntercityPlanner;