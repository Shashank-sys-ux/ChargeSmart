
import { createContext, useContext, ReactNode } from 'react';
import { bookingDB } from '@/utils/localBookingDB';

interface BookingContextType {
  bookStation: (stationId: number, stationName: string, bookedTime: Date) => string;
  isStationBooked: (stationId: number) => boolean;
  getAllBookings: () => any[];
  updateBookingStatus: (id: string, status: string, expiryTime?: Date) => void;
  checkInBooking: (id: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider = ({ children }: BookingProviderProps) => {
  const bookStation = (stationId: number, stationName: string, bookedTime: Date): string => {
    // Create 1-hour slot ending time
    const slotEndTime = new Date(bookedTime.getTime() + 60 * 60 * 1000); // 1 hour later
    
    const booking = bookingDB.addBooking({
      stationId,
      stationName,
      stationLocation: 'Bangalore',
      bookedTime,
      status: 'upcoming',
      expiryTime: slotEndTime // Set the slot end time as expiry
    });
    return booking.id;
  };

  const isStationBooked = (stationId: number): boolean => {
    return bookingDB.isStationBooked(stationId);
  };

  const getAllBookings = () => {
    return bookingDB.getAllBookings();
  };

  const updateBookingStatus = (id: string, status: string, expiryTime?: Date) => {
    bookingDB.updateBooking(id, { 
      status: status as any,
      expiryTime 
    });
  };

  const checkInBooking = (id: string) => {
    bookingDB.updateBooking(id, { status: 'completed' });
  };

  return (
    <BookingContext.Provider value={{ 
      bookStation, 
      isStationBooked, 
      getAllBookings, 
      updateBookingStatus, 
      checkInBooking 
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
