// Extended types for new features

export interface UserActivity {
  id: number;
  userId: number;
  action: 'create' | 'edit' | 'view' | 'comment' | 'like' | 'favorite';
  targetType: 'item' | 'comment' | 'user';
  targetId: number;
  targetTitle?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Bookmark {
  id: number;
  userId: number;
  itemId: number;
  itemTitle: string;
  priority: 'low' | 'medium' | 'high';
  scheduledDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Event {
  id: number;
  userId: number;
  title: string;
  description?: string;
  itemId?: number;
  itemTitle?: string;
  date: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'creator' | 'social' | 'explorer' | 'contributor';
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProgress {
  userId: number;
  level: number;
  totalPoints: number;
  pointsToNextLevel: number;
  achievements: Achievement[];
  stats: {
    itemsCreated: number;
    commentsPosted: number;
    likesGiven: number;
    itemsViewed: number;
  };
}

export interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  itemId?: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ObjectTemplate {
  id: number;
  userId: number;
  name: string;
  description: string;
  categoryId: number;
  tags: number[];
  createdAt: string;
}
