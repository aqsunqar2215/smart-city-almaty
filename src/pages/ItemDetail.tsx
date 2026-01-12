import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommentItem } from '@/components/CommentItem';
import { ArrowLeft, Heart, MessageCircle, Star, Send, Bookmark } from 'lucide-react';
import { itemsApi, commentsApi, getCurrentUserId } from '@/lib/api';
import { bookmarksApi, activityApi } from '@/lib/extendedApi';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [commentText, setCommentText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const queryClient = useQueryClient();
  const userId = getCurrentUserId();
  
  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsApi.getById(Number(id)),
    enabled: !!id,
  });

  // Log view activity
  useEffect(() => {
    if (item) {
      activityApi.logActivity({
        userId,
        action: 'view',
        targetType: 'item',
        targetId: item.id,
        targetTitle: item.title,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['userActivity'] });
      });
    }
  }, [item, userId, queryClient]);

  // Check if bookmarked
  useEffect(() => {
    if (id) {
      bookmarksApi.getUserBookmarks(userId).then(bookmarks => {
        const bookmarked = bookmarks.some(b => b.itemId === Number(id));
        setIsBookmarked(bookmarked);
      });
    }
  }, [id, userId]);
  
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => commentsApi.getByItemId(Number(id)),
    enabled: !!id,
  });
  
  const toggleFavoriteMutation = useMutation({
    mutationFn: itemsApi.toggleFavorite,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['item', id] });
      await activityApi.logActivity({
        userId,
        action: 'favorite',
        targetType: 'item',
        targetId: Number(id),
        targetTitle: item?.title,
      });
      queryClient.invalidateQueries({ queryKey: ['userActivity'] });
      toast.success('Favorite updated');
    },
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        const bookmarks = await bookmarksApi.getUserBookmarks(userId);
        const bookmark = bookmarks.find(b => b.itemId === Number(id));
        if (bookmark) {
          await bookmarksApi.deleteBookmark(bookmark.id);
        }
      } else {
        await bookmarksApi.createBookmark({
          userId,
          itemId: Number(id),
          itemTitle: item?.title || '',
          priority: 'medium',
        });
        await activityApi.logActivity({
          userId,
          action: 'favorite',
          targetType: 'item',
          targetId: Number(id),
          targetTitle: item?.title,
        });
      }
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['userActivity'] });
      toast.success(isBookmarked ? 'Bookmark removed' : 'Added to bookmarks');
    },
  });
  
  const createCommentMutation = useMutation({
    mutationFn: commentsApi.create,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      await activityApi.logActivity({
        userId,
        action: 'comment',
        targetType: 'item',
        targetId: Number(id),
        targetTitle: item?.title,
      });
      queryClient.invalidateQueries({ queryKey: ['userActivity'] });
      setCommentText('');
      toast.success('Comment added');
    },
  });
  
  const likeCommentMutation = useMutation({
    mutationFn: commentsApi.like,
    onSuccess: async (_, commentId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      await activityApi.logActivity({
        userId,
        action: 'like',
        targetType: 'comment',
        targetId: commentId,
      });
      queryClient.invalidateQueries({ queryKey: ['userActivity'] });
      toast.success('Comment liked');
    },
  });
  
  const rateCommentMutation = useMutation({
    mutationFn: ({ commentId, rating }: { commentId: number; rating: number }) =>
      commentsApi.rate(commentId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      toast.success('Rating submitted');
    },
  });
  
  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    createCommentMutation.mutate({
      itemId: Number(id),
      content: commentText,
    });
  };
  
  if (itemLoading) {
    return <Skeleton className="h-96" />;
  }
  
  if (!item) {
    return <div>Item not found</div>;
  }
  
  return (
    <div className="space-y-6">
      <Link to="/items">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Items
        </Button>
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative h-96 bg-gradient-to-br from-primary/10 to-secondary/10">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-9xl">🏙️</div>
                </div>
              )}
            </div>
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{item.categoryName}</Badge>
                    {item.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleBookmarkMutation.mutate()}
                    title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    <Bookmark
                      className={cn(
                        "w-6 h-6",
                        isBookmarked && "fill-primary text-primary"
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavoriteMutation.mutate(item.id)}
                  >
                    <Heart
                      className={cn(
                        "w-6 h-6",
                        item.isFavorite && "fill-destructive text-destructive"
                      )}
                    />
                  </Button>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comments ({comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-24"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || createCommentMutation.isPending}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </Button>
              </div>
              
              <div className="space-y-3">
                {commentsLoading ? (
                  [1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)
                ) : (
                  comments?.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onLike={(commentId) => likeCommentMutation.mutate(commentId)}
                      onRate={(commentId, rating) =>
                        rateCommentMutation.mutate({ commentId, rating })
                      }
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span>Rating</span>
                </div>
                <span className="font-semibold">{item.rating.toFixed(1)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span>Comments</span>
                </div>
                <span className="font-semibold">{item.commentsCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span>Favorite</span>
                </div>
                <span className="font-semibold">{item.isFavorite ? 'Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{item.categoryName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
