import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { bookmarksApi } from '@/lib/extendedApi';
import { getCurrentUserId } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { format } from 'date-fns';
import { Bookmark } from '@/types/extended';

const Bookmarks = () => {
  const userId = getCurrentUserId();
  const queryClient = useQueryClient();
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: () => bookmarksApi.getUserBookmarks(userId),
  });

  const deleteMutation = useMutation({
    mutationFn: bookmarksApi.deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Bookmark deleted');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Bookmark> }) =>
      bookmarksApi.updateBookmark(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Bookmark updated');
      setIsDialogOpen(false);
      setEditingBookmark(null);
    },
  });

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBookmark) return;

    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingBookmark.id,
      updates: {
        priority: formData.get('priority') as 'low' | 'medium' | 'high',
        scheduledDate: formData.get('scheduledDate') as string || undefined,
        notes: formData.get('notes') as string || undefined,
      },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Bookmarks & Planning
        </h1>
        <p className="text-muted-foreground mt-2">
          Save items for later and schedule reviews
        </p>
      </div>

      <div className="grid gap-4">
        {bookmarks?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No bookmarks yet</p>
            </CardContent>
          </Card>
        ) : (
          bookmarks?.map((bookmark) => (
            <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{bookmark.itemTitle}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-md border font-medium ${getPriorityColor(bookmark.priority)}`}>
                        {bookmark.priority.toUpperCase()}
                      </span>
                      {bookmark.scheduledDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(bookmark.scheduledDate), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen && editingBookmark?.id === bookmark.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) setEditingBookmark(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingBookmark(bookmark)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Bookmark</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select name="priority" defaultValue={bookmark.priority}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Scheduled Date</Label>
                            <Input
                              type="date"
                              name="scheduledDate"
                              defaultValue={bookmark.scheduledDate?.split('T')[0]}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                              name="notes"
                              defaultValue={bookmark.notes}
                              placeholder="Add notes..."
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Save Changes
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(bookmark.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {bookmark.notes && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{bookmark.notes}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
