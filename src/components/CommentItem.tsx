import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star } from 'lucide-react';
import { Comment } from '@/types/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: number) => void;
  onRate: (commentId: number, rating: number) => void;
}

export const CommentItem = ({ comment, onLike, onRate }: CommentItemProps) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  
  const handleRate = (rating: number) => {
    if (comment.userRating) {
      toast.info('You have already rated this comment');
      return;
    }
    onRate(comment.id, rating);
  };
  
  const displayRating = hoveredStar || comment.userRating || 0;
  
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {comment.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{comment.username}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <p className="text-sm mb-3">{comment.content}</p>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(comment.id)}
                disabled={comment.userLiked}
                className="gap-2"
              >
                <Heart 
                  className={cn(
                    "w-4 h-4 transition-all",
                    comment.userLiked && "fill-destructive text-destructive"
                  )} 
                />
                <span className="text-sm">{comment.likes}</span>
              </Button>
              
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    disabled={!!comment.userRating}
                    className="p-0.5 disabled:cursor-not-allowed"
                  >
                    <Star
                      className={cn(
                        "w-4 h-4 transition-all",
                        star <= displayRating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  ({comment.rating.toFixed(1)})
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
