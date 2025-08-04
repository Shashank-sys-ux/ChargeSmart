import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConfirmBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (bookingId) {
      // Set the booking confirmation in localStorage
      localStorage.setItem(`booking_${bookingId}`, 'confirmed');
      
      // Auto-redirect after 3 seconds
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [bookingId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your charging slot has been successfully booked. Please reach the station within 20 minutes.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-700">
            <strong>Booking ID:</strong> {bookingId}
          </p>
          <p className="text-xs text-green-600 mt-1">
            ₹200 deposit will be refunded upon timely arrival
          </p>
        </div>
        <Button onClick={() => navigate('/')} className="w-full">
          Return to Station Map
        </Button>
      </div>
    </div>
  );
};

export default ConfirmBooking;