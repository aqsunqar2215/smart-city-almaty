// Social & Enhanced Features Types (matching Spring Boot backend)

export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  followerUsername?: string;
  followingUsername?: string;
  createdAt: string;
}

export interface CommentReaction {
  id: number;
  userId: number;
  commentId: number;
  liked: boolean | null;
  rating: number | null; // 1-5
}

export interface CommentWithStats {
  id: number;
  text: string;
  author: string;
  createdAt: string;
  likes: number;
  avgRating: number | null;
}

export interface EnhancedBookmark {
  id: number;
  userId: number;
  sensorId: number;
  sensorName: string;
  sensorType: string;
  scheduledDate: string | null;
  priority: number | null; // 1-5
  note: string | null;
  createdAt: string;
}

export interface SensorRecommendation {
  id: number;
  name: string;
  type: string;
  rating: number | null;
  tags: string;
  likes: number;
  avgRating: number | null;
}

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}
