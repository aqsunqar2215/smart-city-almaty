import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Star, Bookmark } from 'lucide-react';
import { Item } from '@/types/api';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { bookmarksApi, activityApi } from '@/lib/extendedApi';
import { getCurrentUserId } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ItemCardProps {
  item: Item;
  onToggleFavorite?: (itemId: number) => void;
}

export const ItemCard = ({ item, onToggleFavorite }: ItemCardProps) => {
  const userId = getCurrentUserId();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    bookmarksApi.getUserBookmarks(userId).then(bookmarks => {
      const bookmarked = bookmarks.some(b => b.itemId === item.id);
      setIsBookmarked(bookmarked);
    });
  }, [item.id, userId]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isBookmarked) {
        const bookmarks = await bookmarksApi.getUserBookmarks(userId);
        const bookmark = bookmarks.find(b => b.itemId === item.id);
        if (bookmark) {
          await bookmarksApi.deleteBookmark(bookmark.id);
        }
      } else {
        await bookmarksApi.createBookmark({
          userId,
          itemId: item.id,
          itemTitle: item.title,
          priority: 'medium',
        });
        await activityApi.logActivity({
          userId,
          action: 'favorite',
          targetType: 'item',
          targetId: item.id,
          targetTitle: item.title,
        });
      }
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ['userActivity'] });
      toast.success(isBookmarked ? 'Bookmark removed' : 'Added to bookmarks');
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link to={`/items/${item.id}`}>
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl text-primary/20">🏙️</div>
            </div>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/items/${item.id}`}>
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {item.title}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="secondary" className="text-xs">
            {item.categoryName}
          </Badge>
          {item.tags.slice(0, 2).map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{item.commentsCount}</span>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={handleToggleBookmark}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark
              className={cn(
                "w-4 h-4 transition-all",
                isBookmarked
                  ? "fill-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(item.id);
            }}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Heart 
              className={cn(
                "w-5 h-5 transition-all",
                item.isFavorite 
                  ? "fill-destructive text-destructive" 
                  : "text-muted-foreground hover:text-foreground"
              )} 
            />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};
