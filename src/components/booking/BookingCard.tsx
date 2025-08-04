
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, CheckCircle, X, Battery, Zap } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';
import ReviewModal from '../ReviewModal';
import { formatTime, getTimeRemaining } from '@/utils/bookingUtils';
import { useEVBattery } from '@/hooks/useEVBattery';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  stationId: number;
  stationName: string;
  stationLocation: string;
  bookedTime: Date;
  status: 'upcoming' | 'active' | 'expired' | 'completed' | 'cancelled';
  expiryTime?: Date;
}

interface BookingCardProps {
  booking: Booking;
  currentTime: Date;
  simulationSpeed: number;
  onCheckIn: (bookingId: string) => void;
}

const BookingCard = ({ booking, currentTime, simulationSpeed, onCheckIn }: BookingCardProps) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [chargingStartBattery, setChargingStartBattery] = useState(0);
  const [chargingStartTime, setChargingStartTime] = useState<Date | null>(null);
  const { batteryData, updateBatteryLevel } = useEVBattery();
  const { toast } = useToast();

  const timeRemaining = booking.status === 'upcoming' 
    ? getTimeRemaining(booking.bookedTime, currentTime, simulationSpeed)
    : booking.status === 'active' && booking.expiryTime
    ? getTimeRemaining(booking.expiryTime, currentTime, simulationSpeed)
    : null;

  // Calculate charging progress based on time elapsed in the booked slot
  useEffect(() => {
    if (!isCharging || !chargingStartTime) return;

    const updateChargingProgress = () => {
      // Calculate how much time has passed since charging started (in simulation time)
      const realTimeElapsed = currentTime.getTime() - chargingStartTime.getTime();
      const simulationTimeElapsed = realTimeElapsed * simulationSpeed;
      
      // The booked slot is 1 hour (60 minutes), so charging should complete in 1 hour
      const slotDurationMs = 60 * 60 * 1000; // 1 hour in milliseconds
      const chargingProgress = Math.min(1, simulationTimeElapsed / slotDurationMs);
      
      // Calculate new battery level based on progress
      const batteryIncrease = (100 - chargingStartBattery) * chargingProgress;
      const newLevel = Math.min(100, chargingStartBattery + batteryIncrease);
      
      // Update battery level
      updateBatteryLevel(Math.round(newLevel));
      
      // Check if charging is complete (reached 100% or slot time is up)
      if (newLevel >= 100 || chargingProgress >= 1) {
        setIsCharging(false);
        toast({
          title: "Charging Complete! 🔋",
          description: `Your EV is now ${newLevel >= 100 ? 'fully charged' : Math.round(newLevel) + '% charged'} at ${booking.stationName}`,
          variant: "default"
        });
        // Show review modal after charging is done
        setTimeout(() => setShowReviewModal(true), 1000);
      }
    };

    // Update charging progress every 2 seconds (same as simulation tick)
    const interval = setInterval(updateChargingProgress, 2000);
    
    // Initial update
    updateChargingProgress();

    return () => clearInterval(interval);
  }, [isCharging, currentTime, simulationSpeed, chargingStartTime, chargingStartBattery, booking.stationName, toast, updateBatteryLevel]);

  const handleCheckIn = (bookingId: string) => {
    onCheckIn(bookingId);
    setChargingStartBattery(batteryData.currentBatteryLevel);
    setChargingStartTime(new Date(currentTime));
    setIsCharging(true);
    
    toast({
      title: "Charging Started! ⚡",
      description: `Started charging at ${booking.stationName}. Your slot is from ${formatTime(booking.bookedTime)} to ${booking.expiryTime ? formatTime(booking.expiryTime) : 'end of hour'}.`,
      variant: "default"
    });
  };

  // Calculate expected completion time and progress for display
  const getChargingInfo = () => {
    if (!isCharging || !chargingStartTime) return null;
    
    const realTimeElapsed = currentTime.getTime() - chargingStartTime.getTime();
    const simulationTimeElapsed = realTimeElapsed * simulationSpeed;
    const slotDurationMs = 60 * 60 * 1000; // 1 hour
    const progress = Math.min(100, (simulationTimeElapsed / slotDurationMs) * 100);
    
    const expectedEndTime = new Date(chargingStartTime.getTime() + (slotDurationMs / simulationSpeed));
    
    return { progress, expectedEndTime };
  };

  const chargingInfo = getChargingInfo();

  return (
    <>
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{booking.stationName}</h4>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {booking.stationLocation}
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Booked Slot:</span>
            <span className="font-medium">
              {formatTime(booking.bookedTime)} - {booking.expiryTime ? formatTime(booking.expiryTime) : formatTime(new Date(booking.bookedTime.getTime() + 60 * 60 * 1000))}
            </span>
          </div>

          {booking.status === 'upcoming' && timeRemaining && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time Until Slot:</span>
              <span className="font-medium text-blue-600">
                {timeRemaining.expired ? "Now Active!" : 
                 `${timeRemaining.minutes}m ${timeRemaining.seconds}s`}
              </span>
            </div>
          )}

          {booking.status === 'active' && timeRemaining && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Slot Time Remaining:</span>
                <span className="font-medium text-red-600">
                  {timeRemaining.expired ? "SLOT EXPIRED" : 
                   `${timeRemaining.minutes}m ${timeRemaining.seconds}s`}
                </span>
              </div>
              
              {!timeRemaining.expired && !isCharging && (
                <Button 
                  onClick={() => handleCheckIn(booking.id)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Start Charging Session
                </Button>
              )}
            </div>
          )}

          {booking.status === 'completed' && (
            <div className="text-center py-2">
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Charging Session Completed
              </Badge>
            </div>
          )}

          {booking.status === 'cancelled' && (
            <div className="text-center py-2">
              <Badge className="bg-red-100 text-red-700">
                <X className="w-3 h-3 mr-1" />
                Cancelled - No Show
              </Badge>
            </div>
          )}

          {/* Real-time Charging Simulation */}
          {isCharging && chargingInfo && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-sm font-medium text-blue-700">Charging Session Active</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">Started: {chargingStartBattery}%</span>
                  <span className="text-blue-600">Current: {batteryData.currentBatteryLevel}%</span>
                  <span className="text-blue-600">Target: 100%</span>
                </div>
                <Progress value={batteryData.currentBatteryLevel} className="h-2" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Battery className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      {batteryData.currentBatteryLevel}%
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Session Progress: {Math.round(chargingInfo.progress)}% • Speed: {simulationSpeed}x
                  </p>
                  <p className="text-xs text-blue-600">
                    Expected completion: {formatTime(chargingInfo.expectedEndTime)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        stationName={booking.stationName}
        stationId={booking.stationId}
      />
    </>
  );
};

export default BookingCard;
