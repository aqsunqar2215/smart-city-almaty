export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface Comment {
  id: number;
  content: string;
  userId: number;
  itemId: number;
  username: string;
  createdAt: string;
  likes: number;
  rating: number;
  userLiked: boolean;
  userRating?: number;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  categoryId: number;
  categoryName: string;
  tags: Tag[];
  createdAt: string;
  rating: number;
  commentsCount: number;
  isFavorite: boolean;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Recommendation {
  item: Item;
  score: number;
  reason: string;
}

export interface UserStats {
  userId: number;
  objectsCount: number;
  commentsCount: number;
  likesGiven: number;
  ratingsGiven: number;
  subscriptionsCount: number;
}

export interface GlobalStats {
  totalObjects: number;
  totalCategories: number;
  totalComments: number;
  totalLikes: number;
  activeUsers: number;
  activityByDay: Array<{ date: string; count: number }>;
}

export interface Subscription {
  id: number;
  type: 'tag' | 'category';
  targetId: number;
  targetName: string;
}
