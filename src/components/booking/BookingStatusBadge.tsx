import { Badge } from '@/components/ui/badge';
import { Clock, Timer, CheckCircle, X, AlertCircle } from 'lucide-react';

interface BookingStatusBadgeProps {
  status: 'upcoming' | 'active' | 'expired' | 'completed' | 'cancelled';
}

const BookingStatusBadge = ({ status }: BookingStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'active': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'active': return <Timer className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {getStatusIcon(status)}
      <span className="ml-1 capitalize">{status}</span>
    </Badge>
  );
};

export default BookingStatusBadge;