import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { formatTime, generateTimeSlots, formatTimeRange, TimeSlot } from '@/utils/timeSlotUtils';

interface TimeSlotSelectorProps {
  currentTime: Date;
  selectedTimeSlot: TimeSlot | null;
  onTimeSelect: (timeSlot: TimeSlot) => void;
  onConfirm: () => void;
  stationName: string;
}

const TimeSlotSelector = ({ 
  currentTime, 
  selectedTimeSlot, 
  onTimeSelect, 
  onConfirm,
  stationName 
}: TimeSlotSelectorProps) => {
  const timeSlots = generateTimeSlots(currentTime);

  return (
    <>
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg">{stationName}</h3>
        <p className="text-sm text-muted-foreground">
          Current Time: {formatTime(currentTime)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ₹200 refundable deposit • 10-minute arrival window
        </p>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {timeSlots.map((slot, index) => (
          <Button
            key={slot.id}
            variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => onTimeSelect(slot)}
          >
            <Clock className="w-4 h-4 mr-2" />
            {formatTimeRange(slot.startTime, slot.endTime)}
            {index === 0 && <span className="ml-2 text-xs text-muted-foreground">(Next Available)</span>}
          </Button>
        ))}
      </div>
      
      <Button
        onClick={onConfirm}
        disabled={!selectedTimeSlot}
        className="w-full"
      >
        Pay ₹200 & Book Slot
      </Button>
    </>
  );
};

export default TimeSlotSelector;