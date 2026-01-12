import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Users, UserPlus, UserMinus, Search, Heart, Star, Calendar, StickyNote } from 'lucide-react';
import { getCurrentUserId } from '@/lib/api';
import { followApi, userProfileApi, enhancedBookmarksApi, enhancedRecommendationsApi } from '@/lib/socialApi';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Social = () => {
  const userId = getCurrentUserId();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('followers');

  const { data: profile } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => userProfileApi.getUserProfile(userId),
  });

  const { data: followers } = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => followApi.getFollowers(userId),
  });

  const { data: following } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => followApi.getFollowing(userId),
  });

  const { data: searchResults } = useQuery({
    queryKey: ['searchUsers', searchQuery],
    queryFn: () => userProfileApi.searchUsers(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  const followMutation = useMutation({
    mutationFn: (targetUserId: number) => followApi.followUser(userId, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Followed user');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const unfollowMutation = useMutation({
    mutationFn: (targetUserId: number) => followApi.unfollowUser(userId, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Unfollowed user');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Social</h1>
        <p className="text-muted-foreground">Connect with other users and manage your network</p>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{profile?.username}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{profile?.followersCount || 0}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{profile?.followingCount || 0}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          {searchResults && searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.filter(u => u.id !== userId).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.followersCount} followers • {user.followingCount} following
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => followMutation.mutate(user.id)}
                    disabled={followMutation.isPending}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Followers / Following Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="followers">
            <Users className="w-4 h-4 mr-2" />
            Followers ({followers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="following">
            <UserPlus className="w-4 h-4 mr-2" />
            Following ({following?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="followers">
          <Card>
            <CardContent className="pt-6">
              {!followers || followers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No followers yet</p>
              ) : (
                <div className="space-y-2">
                  {followers.map((follow) => (
                    <div key={follow.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>U{follow.followerId}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">User {follow.followerId}</p>
                      </div>
                      <Badge variant="outline">
                        Since {new Date(follow.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following">
          <Card>
            <CardContent className="pt-6">
              {!following || following.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Not following anyone yet</p>
              ) : (
                <div className="space-y-2">
                  {following.map((follow) => (
                    <div key={follow.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>U{follow.followingId}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">User {follow.followingId}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unfollowMutation.mutate(follow.followingId)}
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        Unfollow
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Bookmarks */}
      <EnhancedBookmarksSection userId={userId} />

      {/* Recommendations */}
      <RecommendationsSection userId={userId} />
    </div>
  );
};

// Enhanced Bookmarks with scheduling and priority
const EnhancedBookmarksSection = ({ userId }: { userId: number }) => {
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'created'>('created');
  const [editingBookmark, setEditingBookmark] = useState<number | null>(null);
  const [editData, setEditData] = useState({ scheduledDate: '', priority: '', note: '' });

  const { data: bookmarks } = useQuery({
    queryKey: ['enhancedBookmarks', userId, sortBy],
    queryFn: () => enhancedBookmarksApi.getBookmarks(userId, sortBy),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      enhancedBookmarksApi.updateBookmark(id, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedBookmarks'] });
      toast.success('Bookmark updated');
      setEditingBookmark(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => enhancedBookmarksApi.deleteBookmark(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancedBookmarks'] });
      toast.success('Bookmark removed');
    },
  });

  const getPriorityColor = (priority: number | null) => {
    if (!priority) return 'secondary';
    if (priority >= 4) return 'destructive';
    if (priority >= 2) return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              Enhanced Bookmarks
            </CardTitle>
            <CardDescription>Bookmarks with scheduling, priority, and notes</CardDescription>
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Recent</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="date">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!bookmarks || bookmarks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No enhanced bookmarks yet. Bookmark items to add scheduling and notes.</p>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{bookmark.sensorName}</p>
                    <p className="text-xs text-muted-foreground">{bookmark.sensorType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {bookmark.priority && (
                      <Badge variant={getPriorityColor(bookmark.priority)}>
                        Priority {bookmark.priority}
                      </Badge>
                    )}
                    {bookmark.scheduledDate && (
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(bookmark.scheduledDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {bookmark.note && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{bookmark.note}</p>
                )}

                {editingBookmark === bookmark.id ? (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Scheduled Date</Label>
                        <Input
                          type="date"
                          value={editData.scheduledDate}
                          onChange={(e) => setEditData(d => ({ ...d, scheduledDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Priority (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={editData.priority}
                          onChange={(e) => setEditData(d => ({ ...d, priority: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Note</Label>
                      <Textarea
                        value={editData.note}
                        onChange={(e) => setEditData(d => ({ ...d, note: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateMutation.mutate({
                          id: bookmark.id,
                          data: {
                            scheduledDate: editData.scheduledDate || undefined,
                            priority: editData.priority ? Number(editData.priority) : undefined,
                            note: editData.note || undefined,
                          },
                        })}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingBookmark(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingBookmark(bookmark.id);
                        setEditData({
                          scheduledDate: bookmark.scheduledDate || '',
                          priority: bookmark.priority?.toString() || '',
                          note: bookmark.note || '',
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(bookmark.id)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Recommendations Section
const RecommendationsSection = ({ userId }: { userId: number }) => {
  const [sortBy, setSortBy] = useState<'rating' | 'popularity' | 'date'>('popularity');

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', userId, sortBy],
    queryFn: () => enhancedRecommendationsApi.getRecommendations(userId, { limit: 6, sort: sortBy }),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Recommendations
            </CardTitle>
            <CardDescription>Based on your favorites and activity</CardDescription>
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popular</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="date">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!recommendations || recommendations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recommendations available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border rounded-lg">
                <p className="font-medium">{rec.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{rec.type}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {rec.tags.split(',').map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {rec.likes}
                  </span>
                  {rec.avgRating && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {rec.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Social;
