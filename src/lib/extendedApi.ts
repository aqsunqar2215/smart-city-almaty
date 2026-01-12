import {
  UserActivity,
  Bookmark,
  Event,
  UserProgress,
  ChatMessage,
  ObjectTemplate,
} from '@/types/extended';
import {
  mockActivities,
  mockBookmarks,
  mockEvents,
  mockUserProgress,
  mockChatMessages,
  mockTemplates,
} from './extendedMockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const USE_MOCK_DATA = true;

// Activity API
export const activityApi = {
  getUserActivity: async (userId: number, filters?: { action?: string; date?: string }) => {
    await delay(200);
    let activities = mockActivities.filter(a => a.userId === userId);
    
    if (filters?.action) {
      activities = activities.filter(a => a.action === filters.action);
    }
    
    if (filters?.date) {
      const filterDate = new Date(filters.date).toDateString();
      activities = activities.filter(a => 
        new Date(a.timestamp).toDateString() === filterDate
      );
    }
    
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  logActivity: async (activity: Omit<UserActivity, 'id' | 'timestamp'>) => {
    await delay(100);
    const newActivity: UserActivity = {
      ...activity,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    mockActivities.unshift(newActivity);
    return newActivity;
  },
};

// Bookmarks API
export const bookmarksApi = {
  getUserBookmarks: async (userId: number) => {
    await delay(200);
    return mockBookmarks
      .filter(b => b.userId === userId)
      .sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        if (a.priority === 'medium' && b.priority === 'low') return -1;
        if (a.priority === 'low' && b.priority === 'medium') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  },

  createBookmark: async (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    await delay(300);
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    mockBookmarks.push(newBookmark);
    return newBookmark;
  },

  updateBookmark: async (id: number, updates: Partial<Bookmark>) => {
    await delay(200);
    const index = mockBookmarks.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBookmarks[index] = { ...mockBookmarks[index], ...updates };
      return mockBookmarks[index];
    }
    throw new Error('Bookmark not found');
  },

  deleteBookmark: async (id: number) => {
    await delay(200);
    const index = mockBookmarks.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBookmarks.splice(index, 1);
    }
  },
};

// Events API
export const eventsApi = {
  getUserEvents: async (userId: number, filters?: { date?: string }) => {
    await delay(200);
    let events = mockEvents.filter(e => e.userId === userId);
    
    if (filters?.date) {
      events = events.filter(e => e.date === filters.date);
    }
    
    return events.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  },

  createEvent: async (event: Omit<Event, 'id'>) => {
    await delay(300);
    const newEvent: Event = {
      ...event,
      id: Date.now(),
    };
    mockEvents.push(newEvent);
    return newEvent;
  },

  updateEvent: async (id: number, updates: Partial<Event>) => {
    await delay(200);
    const index = mockEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      mockEvents[index] = { ...mockEvents[index], ...updates };
      return mockEvents[index];
    }
    throw new Error('Event not found');
  },

  deleteEvent: async (id: number) => {
    await delay(200);
    const index = mockEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      mockEvents.splice(index, 1);
    }
  },
};

// Gamification API
export const gamificationApi = {
  getUserProgress: async (userId: number) => {
    await delay(200);
    return mockUserProgress;
  },

  unlockAchievement: async (userId: number, achievementId: string) => {
    await delay(300);
    const achievement = mockUserProgress.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date().toISOString();
      mockUserProgress.totalPoints += achievement.points;
      return achievement;
    }
    return null;
  },
};

// Chat API
export const chatApi = {
  getMessages: async (itemId: number) => {
    await delay(200);
    return mockChatMessages[itemId] || [];
  },

  sendMessage: async (message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) => {
    await delay(300);
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    if (message.itemId) {
      if (!mockChatMessages[message.itemId]) {
        mockChatMessages[message.itemId] = [];
      }
      mockChatMessages[message.itemId].push(newMessage);
    }
    
    return newMessage;
  },
};

// Templates API
export const templatesApi = {
  getUserTemplates: async (userId: number) => {
    await delay(200);
    return mockTemplates.filter(t => t.userId === userId);
  },

  createTemplate: async (template: Omit<ObjectTemplate, 'id' | 'createdAt'>) => {
    await delay(300);
    const newTemplate: ObjectTemplate = {
      ...template,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    mockTemplates.push(newTemplate);
    return newTemplate;
  },

  deleteTemplate: async (id: number) => {
    await delay(200);
    const index = mockTemplates.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTemplates.splice(index, 1);
    }
  },
};
