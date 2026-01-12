// Social API matching Spring Boot backend
import type { 
  Follow, 
  CommentReaction, 
  CommentWithStats, 
  EnhancedBookmark, 
  SensorRecommendation,
  UserProfile 
} from '@/types/social';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  FOLLOWS: 'smartcity_follows',
  COMMENT_REACTIONS: 'smartcity_comment_reactions',
  ENHANCED_BOOKMARKS: 'smartcity_enhanced_bookmarks',
  USER_PROFILES: 'smartcity_user_profiles',
};

const getStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ============= FOLLOW API =============
// Matching: Follow entity, FollowController

export const followApi = {
  // POST /api/users/{userId}/follow
  followUser: async (followerId: number, followingId: number): Promise<Follow> => {
    await delay(300);
    
    const follows = getStorage<Follow[]>(STORAGE_KEYS.FOLLOWS, []);
    
    // Check if already following
    const existing = follows.find(f => f.followerId === followerId && f.followingId === followingId);
    if (existing) {
      throw new Error('Already following');
    }
    
    const newFollow: Follow = {
      id: Date.now(),
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    };
    
    follows.push(newFollow);
    setStorage(STORAGE_KEYS.FOLLOWS, follows);
    return newFollow;
  },

  // DELETE /api/users/{userId}/follow/{followingId}
  unfollowUser: async (followerId: number, followingId: number): Promise<void> => {
    await delay(200);
    
    const follows = getStorage<Follow[]>(STORAGE_KEYS.FOLLOWS, []);
    const index = follows.findIndex(f => f.followerId === followerId && f.followingId === followingId);
    
    if (index !== -1) {
      follows.splice(index, 1);
      setStorage(STORAGE_KEYS.FOLLOWS, follows);
    }
  },

  // GET /api/users/{userId}/followers
  getFollowers: async (userId: number): Promise<Follow[]> => {
    await delay(200);
    const follows = getStorage<Follow[]>(STORAGE_KEYS.FOLLOWS, []);
    return follows.filter(f => f.followingId === userId);
  },

  // GET /api/users/{userId}/following
  getFollowing: async (userId: number): Promise<Follow[]> => {
    await delay(200);
    const follows = getStorage<Follow[]>(STORAGE_KEYS.FOLLOWS, []);
    return follows.filter(f => f.followerId === userId);
  },

  // Check if following
  isFollowing: async (followerId: number, followingId: number): Promise<boolean> => {
    await delay(100);
    const follows = getStorage<Follow[]>(STORAGE_KEYS.FOLLOWS, []);
    return follows.some(f => f.followerId === followerId && f.followingId === followingId);
  },
};

// ============= COMMENT REACTIONS API =============
// Matching: CommentReaction entity, CommentEnhancedController

export const commentReactionsApi = {
  // POST /api/comments/{id}/like
  likeComment: async (userId: number, commentId: number): Promise<{ status: string; likes: number }> => {
    await delay(200);
    
    const reactions = getStorage<CommentReaction[]>(STORAGE_KEYS.COMMENT_REACTIONS, []);
    let reaction = reactions.find(r => r.userId === userId && r.commentId === commentId);
    
    if (!reaction) {
      reaction = { id: Date.now(), userId, commentId, liked: true, rating: null };
      reactions.push(reaction);
    } else {
      reaction.liked = true;
    }
    
    setStorage(STORAGE_KEYS.COMMENT_REACTIONS, reactions);
    const likes = reactions.filter(r => r.commentId === commentId && r.liked === true).length;
    
    return { status: 'liked', likes };
  },

  // DELETE /api/comments/{id}/like
  unlikeComment: async (userId: number, commentId: number): Promise<{ status: string; likes: number }> => {
    await delay(200);
    
    const reactions = getStorage<CommentReaction[]>(STORAGE_KEYS.COMMENT_REACTIONS, []);
    const index = reactions.findIndex(r => r.userId === userId && r.commentId === commentId);
    
    if (index !== -1) {
      reactions.splice(index, 1);
      setStorage(STORAGE_KEYS.COMMENT_REACTIONS, reactions);
    }
    
    const likes = reactions.filter(r => r.commentId === commentId && r.liked === true).length;
    return { status: 'removed', likes };
  },

  // POST /api/comments/{id}/rating
  rateComment: async (userId: number, commentId: number, rating: number): Promise<{ status: string; avgRating: number }> => {
    await delay(200);
    
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    const reactions = getStorage<CommentReaction[]>(STORAGE_KEYS.COMMENT_REACTIONS, []);
    let reaction = reactions.find(r => r.userId === userId && r.commentId === commentId);
    
    if (!reaction) {
      reaction = { id: Date.now(), userId, commentId, liked: null, rating };
      reactions.push(reaction);
    } else {
      reaction.rating = rating;
    }
    
    setStorage(STORAGE_KEYS.COMMENT_REACTIONS, reactions);
    
    const commentRatings = reactions.filter(r => r.commentId === commentId && r.rating !== null);
    const avgRating = commentRatings.length > 0 
      ? commentRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / commentRatings.length 
      : 0;
    
    return { status: 'rated', avgRating };
  },

  // GET /api/comments/{id}/stats
  getCommentStats: async (commentId: number): Promise<{ commentId: number; likes: number; avgRating: number }> => {
    await delay(100);
    
    const reactions = getStorage<CommentReaction[]>(STORAGE_KEYS.COMMENT_REACTIONS, []);
    const commentReactions = reactions.filter(r => r.commentId === commentId);
    
    const likes = commentReactions.filter(r => r.liked === true).length;
    const ratings = commentReactions.filter(r => r.rating !== null);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length 
      : 0;
    
    return { commentId, likes, avgRating };
  },

  // Check if user liked/rated
  getUserReaction: async (userId: number, commentId: number): Promise<CommentReaction | null> => {
    await delay(100);
    const reactions = getStorage<CommentReaction[]>(STORAGE_KEYS.COMMENT_REACTIONS, []);
    return reactions.find(r => r.userId === userId && r.commentId === commentId) || null;
  },
};

// ============= ENHANCED BOOKMARKS API =============
// Matching: Bookmark entity, BookmarkController

export const enhancedBookmarksApi = {
  // POST /api/users/{userId}/bookmarks
  createBookmark: async (
    userId: number, 
    sensorId: number, 
    sensorName: string,
    sensorType: string,
    data: { scheduledDate?: string; priority?: number; note?: string }
  ): Promise<EnhancedBookmark> => {
    await delay(300);
    
    const bookmarks = getStorage<EnhancedBookmark[]>(STORAGE_KEYS.ENHANCED_BOOKMARKS, []);
    
    // Check if already bookmarked
    if (bookmarks.some(b => b.userId === userId && b.sensorId === sensorId)) {
      throw new Error('Already bookmarked');
    }
    
    const newBookmark: EnhancedBookmark = {
      id: Date.now(),
      userId,
      sensorId,
      sensorName,
      sensorType,
      scheduledDate: data.scheduledDate || null,
      priority: data.priority || null,
      note: data.note || null,
      createdAt: new Date().toISOString(),
    };
    
    bookmarks.push(newBookmark);
    setStorage(STORAGE_KEYS.ENHANCED_BOOKMARKS, bookmarks);
    return newBookmark;
  },

  // GET /api/users/{userId}/bookmarks
  getBookmarks: async (userId: number, sort?: 'priority' | 'date' | 'created'): Promise<EnhancedBookmark[]> => {
    await delay(200);
    
    let bookmarks = getStorage<EnhancedBookmark[]>(STORAGE_KEYS.ENHANCED_BOOKMARKS, [])
      .filter(b => b.userId === userId);
    
    if (sort === 'priority') {
      bookmarks = bookmarks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    } else if (sort === 'date') {
      bookmarks = bookmarks.sort((a, b) => {
        if (!a.scheduledDate) return 1;
        if (!b.scheduledDate) return -1;
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      });
    } else {
      bookmarks = bookmarks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return bookmarks;
  },

  // PUT /api/bookmarks/{id}
  updateBookmark: async (
    bookmarkId: number, 
    userId: number,
    data: { scheduledDate?: string; priority?: number; note?: string }
  ): Promise<EnhancedBookmark> => {
    await delay(200);
    
    const bookmarks = getStorage<EnhancedBookmark[]>(STORAGE_KEYS.ENHANCED_BOOKMARKS, []);
    const bookmark = bookmarks.find(b => b.id === bookmarkId && b.userId === userId);
    
    if (!bookmark) {
      throw new Error('Bookmark not found or access denied');
    }
    
    if (data.scheduledDate !== undefined) bookmark.scheduledDate = data.scheduledDate;
    if (data.priority !== undefined) bookmark.priority = data.priority;
    if (data.note !== undefined) bookmark.note = data.note;
    
    setStorage(STORAGE_KEYS.ENHANCED_BOOKMARKS, bookmarks);
    return bookmark;
  },

  // DELETE /api/users/{userId}/bookmarks/{id}
  deleteBookmark: async (bookmarkId: number, userId: number): Promise<void> => {
    await delay(200);
    
    const bookmarks = getStorage<EnhancedBookmark[]>(STORAGE_KEYS.ENHANCED_BOOKMARKS, []);
    const index = bookmarks.findIndex(b => b.id === bookmarkId && b.userId === userId);
    
    if (index === -1) {
      throw new Error('Bookmark not found or access denied');
    }
    
    bookmarks.splice(index, 1);
    setStorage(STORAGE_KEYS.ENHANCED_BOOKMARKS, bookmarks);
  },

  // Check if bookmarked
  isBookmarked: async (userId: number, sensorId: number): Promise<boolean> => {
    await delay(100);
    const bookmarks = getStorage<EnhancedBookmark[]>(STORAGE_KEYS.ENHANCED_BOOKMARKS, []);
    return bookmarks.some(b => b.userId === userId && b.sensorId === sensorId);
  },
};

// ============= ENHANCED RECOMMENDATIONS API =============
// Matching: RecommendationsController

export const enhancedRecommendationsApi = {
  // GET /api/users/{userId}/recommendations
  getRecommendations: async (
    userId: number, 
    options?: { limit?: number; sort?: 'rating' | 'popularity' | 'date' }
  ): Promise<SensorRecommendation[]> => {
    await delay(400);
    
    // Get user's favorites to determine tags
    const bookmarks = getStorage<EnhancedBookmark[]>(STORAGE_KEYS.ENHANCED_BOOKMARKS, [])
      .filter(b => b.userId === userId);
    
    // Mock sensor data - in real app this would come from backend
    const mockSensors: SensorRecommendation[] = [
      { id: 1, name: 'Smart Traffic Light', type: 'Traffic', rating: 4, tags: 'AI,IoT', likes: 45, avgRating: 4.5 },
      { id: 2, name: 'Air Quality Monitor', type: 'Environment', rating: 5, tags: 'IoT,Sustainability', likes: 32, avgRating: 4.8 },
      { id: 3, name: 'Solar Panel Grid', type: 'Energy', rating: 4, tags: 'Sustainability,Smart', likes: 28, avgRating: 4.2 },
      { id: 4, name: 'Parking Sensor', type: 'Traffic', rating: 3, tags: 'IoT,Smart', likes: 19, avgRating: 3.9 },
      { id: 5, name: 'Noise Monitor', type: 'Environment', rating: 4, tags: 'IoT,Big Data', likes: 15, avgRating: 4.1 },
      { id: 6, name: 'Water Quality Sensor', type: 'Environment', rating: 5, tags: 'Sustainability,IoT', likes: 22, avgRating: 4.6 },
    ];
    
    // Filter out already bookmarked
    const bookmarkedIds = bookmarks.map(b => b.sensorId);
    let recommendations = mockSensors.filter(s => !bookmarkedIds.includes(s.id));
    
    // Sort
    if (options?.sort === 'rating') {
      recommendations = recommendations.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    } else if (options?.sort === 'popularity') {
      recommendations = recommendations.sort((a, b) => b.likes - a.likes);
    }
    
    return recommendations.slice(0, options?.limit || 10);
  },
};

// ============= USER PROFILE API =============
// Matching: UserService

export const userProfileApi = {
  // GET /api/users/{id}
  getUserProfile: async (userId: number): Promise<UserProfile> => {
    await delay(200);
    
    const follows = getStorage<Follow[]>(STORAGE_KEYS.FOLLOWS, []);
    const followersCount = follows.filter(f => f.followingId === userId).length;
    const followingCount = follows.filter(f => f.followerId === userId).length;
    
    // Get user from registered users
    const registeredUsers = JSON.parse(localStorage.getItem('smartcity_registered_users') || '[]');
    const user = registeredUsers.find((u: any) => u.id === userId);
    
    return {
      id: userId,
      username: user?.username || `User ${userId}`,
      email: user?.email,
      avatarUrl: user?.avatarUrl,
      followersCount,
      followingCount,
    };
  },

  // Search users
  searchUsers: async (query: string): Promise<UserProfile[]> => {
    await delay(300);
    
    const registeredUsers = JSON.parse(localStorage.getItem('smartcity_registered_users') || '[]');
    const follows = getStorage<Follow[]>(STORAGE_KEYS.FOLLOWS, []);
    
    return registeredUsers
      .filter((u: any) => u.username.toLowerCase().includes(query.toLowerCase()))
      .map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        followersCount: follows.filter(f => f.followingId === u.id).length,
        followingCount: follows.filter(f => f.followerId === u.id).length,
      }));
  },
};
