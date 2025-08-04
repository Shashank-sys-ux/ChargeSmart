interface Booking {
  id: string;
  stationId: number;
  stationName: string;
  stationLocation: string;
  bookedTime: Date;
  status: 'upcoming' | 'active' | 'expired' | 'completed' | 'cancelled';
  expiryTime?: Date;
  createdAt: Date;
}

interface BookingDB {
  bookings: Record<string, Booking>;
  lastUpdated: number;
}

const DB_KEY = 'evCharging_bookingDB';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

class LocalBookingDatabase {
  private cache: BookingDB | null = null;
  private cacheTimestamp: number = 0;

  private loadFromStorage(): BookingDB {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const bookings = Object.fromEntries(
          Object.entries(parsed.bookings || {}).map(([id, booking]: [string, any]) => [
            id,
            {
              ...booking,
              bookedTime: new Date(booking.bookedTime),
              expiryTime: booking.expiryTime ? new Date(booking.expiryTime) : undefined,
              createdAt: new Date(booking.createdAt)
            }
          ])
        );
        return {
          bookings,
          lastUpdated: parsed.lastUpdated || Date.now()
        };
      }
    } catch (error) {
      console.warn('Failed to load booking DB from localStorage:', error);
    }
    
    return {
      bookings: {},
      lastUpdated: Date.now()
    };
  }

  private saveToStorage(db: BookingDB): void {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      this.cache = db;
      this.cacheTimestamp = Date.now();
    } catch (error) {
      console.error('Failed to save booking DB to localStorage:', error);
    }
  }

  private getDB(): BookingDB {
    const now = Date.now();
    
    // Use cache if it's fresh
    if (this.cache && (now - this.cacheTimestamp) < CACHE_DURATION) {
      return this.cache;
    }
    
    // Load from storage and update cache
    const db = this.loadFromStorage();
    this.cache = db;
    this.cacheTimestamp = now;
    return db;
  }

  // Get all bookings
  getAllBookings(): Booking[] {
    const db = this.getDB();
    return Object.values(db.bookings).sort((a, b) => a.bookedTime.getTime() - b.bookedTime.getTime());
  }

  // Get booking by ID
  getBooking(id: string): Booking | null {
    const db = this.getDB();
    return db.bookings[id] || null;
  }

  // Check if station is already booked
  isStationBooked(stationId: number): boolean {
    const db = this.getDB();
    return Object.values(db.bookings).some(
      booking => booking.stationId === stationId && 
      (booking.status === 'upcoming' || booking.status === 'active')
    );
  }

  // Add new booking
  addBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Booking {
    const db = this.getDB();
    
    // Check for duplicates
    const existingBooking = Object.values(db.bookings).find(
      b => b.stationId === booking.stationId && 
      Math.abs(b.bookedTime.getTime() - booking.bookedTime.getTime()) < 60000 // within 1 minute
    );
    
    if (existingBooking) {
      return existingBooking;
    }

    const newBooking: Booking = {
      ...booking,
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    db.bookings[newBooking.id] = newBooking;
    db.lastUpdated = Date.now();
    this.saveToStorage(db);
    
    return newBooking;
  }

  // Update booking status
  updateBooking(id: string, updates: Partial<Booking>): Booking | null {
    const db = this.getDB();
    const booking = db.bookings[id];
    
    if (!booking) {
      return null;
    }

    const updatedBooking = { ...booking, ...updates };
    db.bookings[id] = updatedBooking;
    db.lastUpdated = Date.now();
    this.saveToStorage(db);
    
    return updatedBooking;
  }

  // Remove booking
  removeBooking(id: string): boolean {
    const db = this.getDB();
    
    if (db.bookings[id]) {
      delete db.bookings[id];
      db.lastUpdated = Date.now();
      this.saveToStorage(db);
      return true;
    }
    
    return false;
  }

  // Clear all bookings (for testing)
  clearAll(): void {
    const db: BookingDB = {
      bookings: {},
      lastUpdated: Date.now()
    };
    this.saveToStorage(db);
  }

  // Get booking statistics
  getStats(): { total: number; active: number; completed: number; cancelled: number } {
    const bookings = this.getAllBookings();
    return {
      total: bookings.length,
      active: bookings.filter(b => b.status === 'upcoming' || b.status === 'active').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
  }
}

// Export singleton instance
export const bookingDB = new LocalBookingDatabase();
export type { Booking };