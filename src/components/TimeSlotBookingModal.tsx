import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Clock, Timer } from 'lucide-react';
import TimeSlotSelector from './booking/TimeSlotSelector';
import BookingConfirmation from './booking/BookingConfirmation';
import BookingCountdown from './booking/BookingCountdown';
import { TimeSlot } from '@/utils/timeSlotUtils';

interface TimeSlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  currentTime: Date;
  simulationSpeed: number;
  onBookingConfirmed: (bookedTime: Date) => void;
}

const TimeSlotBookingModal = ({ 
  isOpen, 
  onClose, 
  stationName, 
  currentTime, 
  simulationSpeed,
  onBookingConfirmed 
}: TimeSlotBookingModalProps) => {
  const [step, setStep] = useState<'timeSelect' | 'confirmed' | 'countdown'>('timeSelect');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(600); // 10 minutes in seconds

  // Check if booked time has arrived and start countdown
  useEffect(() => {
    if (!selectedTimeSlot || step !== 'confirmed') return;

    const checkTimeReached = () => {
      if (currentTime >= selectedTimeSlot.startTime) {
        setStep('countdown');
      }
    };

    const interval = setInterval(checkTimeReached, 1000);
    return () => clearInterval(interval);
  }, [currentTime, selectedTimeSlot, step]);

  // Countdown timer (10 minutes = 600 seconds)
  useEffect(() => {
    if (step !== 'countdown') return;

    const interval = setInterval(() => {
      setCountdownSeconds(prev => {
        const newSeconds = prev - simulationSpeed;
        if (newSeconds <= 0) {
          // Time's up - close modal
          handleClose();
          return 0;
        }
        return newSeconds;
      });
    }, 2000); // Update every 2 seconds like main simulation

    return () => clearInterval(interval);
  }, [step, simulationSpeed]);

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handlePayNow = () => {
    // Immediately confirm payment and booking
    setStep('confirmed');
    setTimeout(() => {
      if (selectedTimeSlot) {
        onBookingConfirmed(selectedTimeSlot.startTime);
      }
    }, 1000);
  };

  const handleClose = () => {
    setStep('timeSelect');
    setSelectedTimeSlot(null);
    setCountdownSeconds(600);
    onClose();
  };

  const getStepIcon = () => {
    switch (step) {
      case 'timeSelect': return <Clock className="w-5 h-5" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'countdown': return <Timer className="w-5 h-5" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'timeSelect': return 'Select Time Slot';
      case 'confirmed': return 'Booking Confirmed';
      case 'countdown': return 'Arrive Now!';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStepIcon()}
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 p-6">
          {step === 'timeSelect' && (
            <TimeSlotSelector
              currentTime={currentTime}
              selectedTimeSlot={selectedTimeSlot}
              onTimeSelect={handleTimeSelect}
              onConfirm={handlePayNow}
              stationName={stationName}
            />
          )}

          {step === 'confirmed' && (
            <BookingConfirmation
              selectedTimeSlot={selectedTimeSlot}
              stationName={stationName}
              currentTime={currentTime}
            />
          )}

          {step === 'countdown' && (
            <BookingCountdown
              countdownSeconds={countdownSeconds}
              selectedTimeSlot={selectedTimeSlot}
              stationName={stationName}
              currentTime={currentTime}
            />
          )}

          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSlotBookingModal;