
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, X } from 'lucide-react';
import { reviewCache } from '@/utils/reviewCache';
import { toast } from '@/hooks/use-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  stationId: number;
}

const ReviewModal = ({ isOpen, onClose, stationName, stationId }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0 && comment.trim() && name.trim()) {
      reviewCache.addReview(stationId, name.trim(), rating, comment.trim());
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      setIsSubmitted(true);
      
      // Close the modal after showing thank you message
      setTimeout(() => {
        setIsSubmitted(false);
        setRating(0);
        setComment('');
        setName('');
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setRating(0);
    setComment('');
    setName('');
    onClose();
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          className="p-1 hover:scale-110 transition-transform"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star
            className={`w-8 h-8 ${
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            } transition-colors`}
          />
        </button>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isSubmitted ? 'Thank You!' : `Review ${stationName}`}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-6">
            <div className="text-green-600 text-lg font-medium mb-2">
              Thank you for your review!
            </div>
            <p className="text-gray-600">Your review has been submitted successfully.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">How was your charging experience?</p>
              <div className="flex justify-center space-x-1">
                {renderStars()}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {rating} star{rating !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-4"
              />
            </div>

            <div>
              <Label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </Label>
              <Textarea
                id="comment"
                placeholder="Share your experience with other users..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={rating === 0 || !name.trim() || !comment.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Review
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
