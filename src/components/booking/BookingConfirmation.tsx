import { CheckCircle } from 'lucide-react';
import { formatTime, TimeSlot } from '@/utils/timeSlotUtils';

interface BookingConfirmationProps {
  selectedTimeSlot: TimeSlot | null;
  stationName: string;
  currentTime: Date;
}

const BookingConfirmation = ({ selectedTimeSlot, stationName, currentTime }: BookingConfirmationProps) => {
  return (
    <>
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg">{stationName}</h3>
        <p className="text-sm text-muted-foreground">
          Current Time: {formatTime(currentTime)}
        </p>
      </div>

      <div className="text-center">
        <div className="w-48 h-48 bg-green-50 rounded-lg flex flex-col items-center justify-center border-2 border-green-200 mx-auto mb-4">
          <CheckCircle className="w-16 h-16 text-green-600 mb-2" />
          <p className="text-green-700 font-semibold">Payment Confirmed!</p>
          <p className="text-xs text-green-600 text-center mt-1">
            Your slot: {selectedTimeSlot && `${formatTime(selectedTimeSlot.startTime)} - ${formatTime(selectedTimeSlot.endTime)}`}
          </p>
          <p className="text-xs text-green-600 text-center">
            Countdown starts when time arrives
          </p>
        </div>
      </div>
    </>
  );
};

export default BookingConfirmation;