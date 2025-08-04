import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBooking } from '@/contexts/BookingContext';
import { MapPin, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BookingCard from './booking/BookingCard';
import EmptyBookings from './booking/EmptyBookings';
import { Booking } from '@/utils/localBookingDB';
interface MyBookingsProps {
  currentTime: Date;
  simulationSpeed: number;
}
const MyBookings = ({
  currentTime,
  simulationSpeed
}: MyBookingsProps) => {
  const {
    getAllBookings,
    updateBookingStatus,
    checkInBooking
  } = useBooking();
  const {
    toast
  } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load bookings from the database
  useEffect(() => {
    const loadBookings = () => {
      const dbBookings = getAllBookings();
      setBookings(dbBookings);
    };
    loadBookings();

    // Refresh bookings periodically to sync with database
    const interval = setInterval(loadBookings, 1000);
    return () => clearInterval(interval);
  }, [getAllBookings]);

  // Update booking statuses based on current time and slot timing
  useEffect(() => {
    bookings.forEach(booking => {
      const slotStartTime = booking.bookedTime.getTime();
      const slotEndTime = booking.expiryTime ? booking.expiryTime.getTime() : slotStartTime + 60 * 60 * 1000;
      const currentTimeMs = currentTime.getTime();

      // Check if the booked time slot has started
      if (booking.status === 'upcoming' && currentTimeMs >= slotStartTime) {
        updateBookingStatus(booking.id, 'active', booking.expiryTime || new Date(slotEndTime));
        toast({
          title: "Booking Slot Active!",
          description: `Your charging slot at ${booking.stationName} is now active. You can start charging until ${booking.expiryTime ? booking.expiryTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : 'the end of the hour'}.`,
          variant: "default"
        });
      }

      // Check if the booking slot time has completely expired
      if (booking.status === 'active' && currentTimeMs > slotEndTime) {
        updateBookingStatus(booking.id, 'expired');
        toast({
          title: "Booking Slot Expired",
          description: `Your charging slot at ${booking.stationName} has ended. The station is now available for other users.`,
          variant: "destructive"
        });
      }
    });
  }, [currentTime, bookings, updateBookingStatus, toast]);
  const handleCheckIn = (bookingId: string) => {
    // Don't immediately complete - let the charging simulation handle completion
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      toast({
        title: "Charging Session Started!",
        description: `Started charging at ${booking.stationName}. Battery will charge during your booked slot.`,
        variant: "default"
      });
    }
  };
  const sortedBookings = [...bookings].sort((a, b) => {
    const statusOrder = {
      upcoming: 0,
      active: 0,
      completed: 1,
      expired: 1,
      cancelled: 2
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  return <Card className="bg-white/70 backdrop-blur-sm border-0 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-green-600" />
          My Bookings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.length === 0 ? <EmptyBookings /> : sortedBookings.map(booking => <BookingCard key={booking.id} booking={booking} currentTime={currentTime} simulationSpeed={simulationSpeed} onCheckIn={handleCheckIn} />)}

        
      </CardContent>
    </Card>;
};
export default MyBookings;