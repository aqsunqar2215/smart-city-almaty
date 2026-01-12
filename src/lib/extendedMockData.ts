import { 
  UserActivity, 
  Bookmark, 
  Event, 
  Achievement, 
  UserProgress, 
  ChatMessage, 
  ObjectTemplate 
} from '@/types/extended';

// Mock user activities
export const mockActivities: UserActivity[] = [
  {
    id: 1,
    userId: 1,
    action: 'create',
    targetType: 'item',
    targetId: 1,
    targetTitle: 'Smart Traffic System',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    userId: 1,
    action: 'view',
    targetType: 'item',
    targetId: 2,
    targetTitle: 'Energy Grid Monitor',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    userId: 1,
    action: 'comment',
    targetType: 'item',
    targetId: 1,
    targetTitle: 'Smart Traffic System',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 4,
    userId: 1,
    action: 'like',
    targetType: 'comment',
    targetId: 101,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 5,
    userId: 1,
    action: 'favorite',
    targetType: 'item',
    targetId: 3,
    targetTitle: 'Water Quality Sensor',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
  },
];

// Mock bookmarks
export const mockBookmarks: Bookmark[] = [
  {
    id: 1,
    userId: 1,
    itemId: 1,
    itemTitle: 'Smart Traffic System',
    priority: 'high',
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    notes: 'Review implementation details',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 2,
    userId: 1,
    itemId: 3,
    itemTitle: 'Water Quality Sensor',
    priority: 'medium',
    scheduledDate: new Date(Date.now() + 259200000).toISOString(),
    notes: 'Check sensor specifications',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    userId: 1,
    itemId: 5,
    itemTitle: 'Public WiFi Network',
    priority: 'low',
    notes: 'Low priority for review',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

// Mock events
export const mockEvents: Event[] = [
  {
    id: 1,
    userId: 1,
    title: 'Review Traffic System Proposal',
    description: 'Meeting to discuss the smart traffic implementation',
    itemId: 1,
    itemTitle: 'Smart Traffic System',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '14:00',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 2,
    userId: 1,
    title: 'Water Sensor Installation',
    description: 'Site visit for sensor deployment',
    itemId: 3,
    itemTitle: 'Water Quality Sensor',
    date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    time: '10:00',
    priority: 'medium',
    status: 'pending',
  },
  {
    id: 3,
    userId: 1,
    title: 'City Planning Workshop',
    date: new Date(Date.now() + 432000000).toISOString().split('T')[0],
    time: '09:00',
    priority: 'medium',
    status: 'pending',
  },
];

// Mock achievements
const achievementsList: Achievement[] = [
  {
    id: 'first_item',
    name: 'First Contribution',
    description: 'Created your first city object',
    icon: '🎯',
    points: 10,
    category: 'creator',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'five_items',
    name: 'Active Creator',
    description: 'Created 5 city objects',
    icon: '🏗️',
    points: 50,
    category: 'creator',
    unlocked: false,
  },
  {
    id: 'first_comment',
    name: 'Voice Heard',
    description: 'Posted your first comment',
    icon: '💬',
    points: 5,
    category: 'social',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: 'ten_comments',
    name: 'Community Leader',
    description: 'Posted 10 comments',
    icon: '🗣️',
    points: 25,
    category: 'social',
    unlocked: false,
  },
  {
    id: 'explorer',
    name: 'City Explorer',
    description: 'Viewed 20 different objects',
    icon: '🔍',
    points: 15,
    category: 'explorer',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 'helpful',
    name: 'Helpful Citizen',
    description: 'Received 10 likes on your comments',
    icon: '❤️',
    points: 30,
    category: 'contributor',
    unlocked: false,
  },
];

// Mock user progress
export const mockUserProgress: UserProgress = {
  userId: 1,
  level: 3,
  totalPoints: 145,
  pointsToNextLevel: 55,
  achievements: achievementsList,
  stats: {
    itemsCreated: 3,
    commentsPosted: 7,
    likesGiven: 12,
    itemsViewed: 24,
  },
};

// Mock chat messages
export const mockChatMessages: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 1,
      userId: 2,
      username: 'Jane Smith',
      itemId: 1,
      content: 'Has anyone reviewed the traffic flow algorithms?',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      isRead: true,
    },
    {
      id: 2,
      userId: 1,
      username: 'Current User',
      itemId: 1,
      content: 'Yes, I looked at them yesterday. Very promising approach!',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      isRead: true,
    },
    {
      id: 3,
      userId: 3,
      username: 'Mike Johnson',
      itemId: 1,
      content: 'I have some concerns about scalability. Can we discuss?',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      isRead: false,
    },
  ],
};

// Mock templates
export const mockTemplates: ObjectTemplate[] = [
  {
    id: 1,
    userId: 1,
    name: 'IoT Sensor Template',
    description: 'Standard template for IoT sensor devices',
    categoryId: 1,
    tags: [1, 3],
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
  },
  {
    id: 2,
    userId: 1,
    name: 'Infrastructure Project Template',
    description: 'Template for large infrastructure projects',
    categoryId: 2,
    tags: [2, 4],
    createdAt: new Date(Date.now() - 1296000000).toISOString(),
  },
];
