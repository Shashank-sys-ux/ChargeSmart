import { Clock } from 'lucide-react';

const EmptyBookings = () => {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <Clock className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-gray-500 text-sm">No bookings yet</p>
      <p className="text-gray-400 text-xs mt-1">Your charging slot bookings will appear here</p>
    </div>
  );
};

export default EmptyBookings;