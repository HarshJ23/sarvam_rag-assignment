import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const numericRating = parseFloat(rating);
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;

  return (
    <div className="flex items-center text-sm">
      {[...Array(5)].map((_, index) => {
        if (index < fullStars) {
          return <Star key={index} className="text-yellow-400 fill-current " size={12} />;
        } else if (index === fullStars && hasHalfStar) {
          return <StarHalf key={index} className="text-yellow-400 fill-current text-sm" size={12} />;
        } else {
          return <Star key={index} className="text-gray-400" size={12}/>;
        }
      })}
      <span className="ml-1 text-sm text-gray-600">{numericRating.toFixed(1)}</span>
    </div>
  );
};

export default StarRating;