import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { activityApi } from '@/lib/extendedApi';
import { getCurrentUserId } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Heart, MessageSquare, Plus, Edit, Star } from 'lucide-react';

const Activity = () => {
  const userId = getCurrentUserId();
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { data: activities, isLoading } = useQuery({
    queryKey: ['userActivity', userId, actionFilter],
    queryFn: () => activityApi.getUserActivity(userId, {
      action: actionFilter === 'all' ? undefined : actionFilter
    }),
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="w-4 h-4 text-green-500" />;
      case 'edit': return <Edit className="w-4 h-4 text-blue-500" />;
      case 'view': return <Eye className="w-4 h-4 text-purple-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-cyan-500" />;
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'favorite': return <Star className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Created',
      edit: 'Edited',
      view: 'Viewed',
      comment: 'Commented on',
      like: 'Liked',
      favorite: 'Favorited',
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Activity History
        </h1>
        <p className="text-muted-foreground mt-2">
          Track all your actions and interactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter Activity</CardTitle>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="create">Created</SelectItem>
                <SelectItem value="edit">Edited</SelectItem>
                <SelectItem value="view">Viewed</SelectItem>
                <SelectItem value="comment">Commented</SelectItem>
                <SelectItem value="like">Liked</SelectItem>
                <SelectItem value="favorite">Favorited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {activities?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No activities found</p>
            </CardContent>
          </Card>
        ) : (
          activities?.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getActionIcon(activity.action)}</div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{getActionLabel(activity.action)}</span>
                      {activity.targetTitle && (
                        <span className="text-muted-foreground"> {activity.targetTitle}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Activity;
