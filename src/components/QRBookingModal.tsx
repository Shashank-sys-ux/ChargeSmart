import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, QrCode } from 'lucide-react';

interface QRBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  onBookingConfirmed: () => void;
}

const QRBookingModal = ({ isOpen, onClose, stationName, onBookingConfirmed }: QRBookingModalProps) => {
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId] = useState(() => Math.random().toString(36).substr(2, 9));

  // Simulate QR code scanning by checking if someone visits the booking URL
  useEffect(() => {
    if (!isOpen) {
      setIsBooked(false);
      return;
    }

    const checkBookingStatus = () => {
      // Check localStorage for booking confirmation
      const confirmedBooking = localStorage.getItem(`booking_${bookingId}`);
      if (confirmedBooking && !isBooked) {
        setIsBooked(true);
        setTimeout(() => {
          onBookingConfirmed();
          localStorage.removeItem(`booking_${bookingId}`);
        }, 2000);
      }
    };

    const interval = setInterval(checkBookingStatus, 1000);
    return () => clearInterval(interval);
  }, [isOpen, bookingId, isBooked, onBookingConfirmed]);

  const bookingUrl = `${window.location.origin}/confirm-booking/${bookingId}`;

  const handleClose = () => {
    setIsBooked(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Book Charging Slot
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 p-6">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-lg">{stationName}</h3>
            <p className="text-sm text-gray-600">₹200 refundable deposit required</p>
            <p className="text-xs text-gray-500 mt-1">Slot will be held for 20 minutes</p>
          </div>

          <div className="relative">
            {!isBooked ? (
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 text-center px-4">
                    Scan QR code to confirm booking
                  </p>
                  <div className="mt-4 p-2 bg-blue-50 rounded text-xs text-center">
                    <p className="font-mono text-blue-800 break-all">{bookingUrl}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 bg-green-50 rounded-lg flex flex-col items-center justify-center border-2 border-green-200">
                <CheckCircle className="w-16 h-16 text-green-600 mb-2" />
                <p className="text-green-700 font-semibold">Booked!</p>
                <p className="text-xs text-green-600 text-center mt-1">
                  Slot confirmed. Reach within 20 minutes.
                </p>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>• Arrive within 20 minutes for full refund</p>
            <p>• Grace period: +2 minutes for partial refund</p>
            <p>• No refund after 22 minutes</p>
          </div>

          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>

          {/* Simulate QR scan button for testing */}
          {!isBooked && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                localStorage.setItem(`booking_${bookingId}`, 'confirmed');
              }}
            >
              🧪 Test: Simulate QR Scan
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRBookingModal;