import { Timer } from 'lucide-react';
import { formatTime, formatCountdown, TimeSlot } from '@/utils/timeSlotUtils';

interface BookingCountdownProps {
  countdownSeconds: number;
  selectedTimeSlot: TimeSlot | null;
  stationName: string;
  currentTime: Date;
}

const BookingCountdown = ({ 
  countdownSeconds, 
  selectedTimeSlot, 
  stationName, 
  currentTime 
}: BookingCountdownProps) => {
  return (
    <>
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg">{stationName}</h3>
        <p className="text-sm text-muted-foreground">
          Current Time: {formatTime(currentTime)}
        </p>
      </div>

      <div className="text-center">
        <div className="w-48 h-48 bg-orange-50 rounded-lg flex flex-col items-center justify-center border-2 border-orange-200 mx-auto mb-4">
          <Timer className="w-16 h-16 text-orange-600 mb-2" />
          <p className="text-orange-700 font-bold text-2xl">{formatCountdown(countdownSeconds)}</p>
          <p className="text-xs text-orange-600 text-center mt-1">
            Time remaining to arrive
          </p>
          <p className="text-xs text-orange-600 text-center">
            Your slot: {selectedTimeSlot && `${formatTime(selectedTimeSlot.startTime)} - ${formatTime(selectedTimeSlot.endTime)}`}
          </p>
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          <p>• Arrive within 10 minutes for full refund</p>
          <p>• Grace period: +2 minutes for partial refund</p>
          <p>• No refund after 12 minutes</p>
        </div>
      </div>
    </>
  );
};

export default BookingCountdown;