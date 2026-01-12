import type { 
  Item, 
  Comment, 
  Recommendation, 
  UserStats, 
  GlobalStats, 
  Subscription, 
  Tag, 
  Category 
} from '@/types/api';

export const mockCategories: Category[] = [
  { id: 1, name: 'Infrastructure', description: 'City infrastructure projects' },
  { id: 2, name: 'Transport', description: 'Transportation systems' },
  { id: 3, name: 'Energy', description: 'Energy and utilities' },
  { id: 4, name: 'Environment', description: 'Environmental projects' },
];

export const mockTags: Tag[] = [
  { id: 1, name: 'Smart Sensors' },
  { id: 2, name: 'IoT' },
  { id: 3, name: 'AI' },
  { id: 4, name: 'Sustainability' },
  { id: 5, name: '5G' },
  { id: 6, name: 'Big Data' },
];

export const mockItems: Item[] = [
  {
    id: 1,
    title: 'Smart Traffic Management System',
    description: 'AI-powered traffic light system that adapts to real-time traffic conditions, reducing congestion by up to 40%.',
    imageUrl: undefined,
    categoryId: 2,
    categoryName: 'Transport',
    tags: [{ id: 1, name: 'Smart Sensors' }, { id: 3, name: 'AI' }],
    createdAt: '2025-01-15T10:00:00Z',
    rating: 4.5,
    commentsCount: 12,
    isFavorite: true,
  },
  {
    id: 2,
    title: 'Solar Panel Grid Network',
    description: 'City-wide solar panel network with smart energy distribution and storage capabilities.',
    imageUrl: undefined,
    categoryId: 3,
    categoryName: 'Energy',
    tags: [{ id: 4, name: 'Sustainability' }, { id: 2, name: 'IoT' }],
    createdAt: '2025-02-20T14:30:00Z',
    rating: 4.8,
    commentsCount: 8,
    isFavorite: false,
  },
  {
    id: 3,
    title: 'Air Quality Monitoring Network',
    description: 'IoT sensor network for real-time air quality monitoring across the city with predictive analytics.',
    imageUrl: undefined,
    categoryId: 4,
    categoryName: 'Environment',
    tags: [{ id: 1, name: 'Smart Sensors' }, { id: 2, name: 'IoT' }, { id: 6, name: 'Big Data' }],
    createdAt: '2025-03-10T09:15:00Z',
    rating: 4.3,
    commentsCount: 15,
    isFavorite: true,
  },
  {
    id: 4,
    title: 'Smart Waste Management',
    description: 'IoT-enabled waste bins with fill-level sensors and optimized collection routes.',
    imageUrl: undefined,
    categoryId: 1,
    categoryName: 'Infrastructure',
    tags: [{ id: 2, name: 'IoT' }, { id: 4, name: 'Sustainability' }],
    createdAt: '2025-03-25T11:00:00Z',
    rating: 4.2,
    commentsCount: 6,
    isFavorite: false,
  },
  {
    id: 5,
    title: '5G Network Infrastructure',
    description: 'Next-generation 5G network deployment for ultra-fast connectivity across the city.',
    imageUrl: undefined,
    categoryId: 1,
    categoryName: 'Infrastructure',
    tags: [{ id: 5, name: '5G' }, { id: 2, name: 'IoT' }],
    createdAt: '2025-04-01T08:00:00Z',
    rating: 4.7,
    commentsCount: 20,
    isFavorite: true,
  },
  {
    id: 6,
    title: 'Smart Parking System',
    description: 'Real-time parking availability system with mobile app integration and automated payments.',
    imageUrl: undefined,
    categoryId: 2,
    categoryName: 'Transport',
    tags: [{ id: 1, name: 'Smart Sensors' }, { id: 2, name: 'IoT' }],
    createdAt: '2025-04-15T13:45:00Z',
    rating: 4.4,
    commentsCount: 10,
    isFavorite: false,
  },
];

export const mockComments: Record<number, Comment[]> = {
  1: [
    {
      id: 1,
      content: 'This system has significantly improved traffic flow in our area. Great initiative!',
      userId: 2,
      itemId: 1,
      username: 'Sarah Johnson',
      createdAt: '2025-01-16T09:00:00Z',
      likes: 15,
      rating: 4.5,
      userLiked: false,
      userRating: undefined,
    },
    {
      id: 2,
      content: 'The AI adaptation is impressive, but we need better integration with public transport.',
      userId: 3,
      itemId: 1,
      username: 'Mike Chen',
      createdAt: '2025-01-17T14:20:00Z',
      likes: 8,
      rating: 4.0,
      userLiked: true,
      userRating: 4,
    },
  ],
  2: [
    {
      id: 3,
      content: 'Amazing project! The energy savings are already noticeable.',
      userId: 4,
      itemId: 2,
      username: 'Emma Williams',
      createdAt: '2025-02-21T10:30:00Z',
      likes: 12,
      rating: 5.0,
      userLiked: false,
      userRating: undefined,
    },
  ],
  3: [
    {
      id: 4,
      content: 'Very useful data for understanding pollution patterns in the city.',
      userId: 5,
      itemId: 3,
      username: 'David Brown',
      createdAt: '2025-03-11T11:00:00Z',
      likes: 10,
      rating: 4.5,
      userLiked: false,
      userRating: undefined,
    },
  ],
};

export const mockRecommendations: Recommendation[] = [
  {
    item: mockItems[3],
    score: 0.92,
    reason: 'Based on your interest in IoT and Sustainability tags',
  },
  {
    item: mockItems[5],
    score: 0.85,
    reason: 'Popular among users with similar interests',
  },
  {
    item: mockItems[1],
    score: 0.78,
    reason: 'Trending in Energy category',
  },
];

export const mockUserStats: UserStats = {
  userId: 1,
  objectsCount: 3,
  commentsCount: 8,
  likesGiven: 24,
  ratingsGiven: 12,
  subscriptionsCount: 5,
};

export const mockGlobalStats: GlobalStats = {
  totalObjects: 42,
  totalCategories: 8,
  totalComments: 156,
  totalLikes: 428,
  activeUsers: 87,
  activityByDay: [
    { date: '2025-10-25', count: 12 },
    { date: '2025-10-26', count: 18 },
    { date: '2025-10-27', count: 15 },
    { date: '2025-10-28', count: 22 },
    { date: '2025-10-29', count: 19 },
    { date: '2025-10-30', count: 25 },
    { date: '2025-10-31', count: 28 },
  ],
};

export const mockSubscriptions: Subscription[] = [
  { id: 1, type: 'tag', targetId: 2, targetName: 'IoT' },
  { id: 2, type: 'tag', targetId: 3, targetName: 'AI' },
  { id: 3, type: 'category', targetId: 2, targetName: 'Transport' },
  { id: 4, type: 'tag', targetId: 4, targetName: 'Sustainability' },
  { id: 5, type: 'category', targetId: 3, targetName: 'Energy' },
];
