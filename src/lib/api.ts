import type {
  Comment,
  Item,
  Recommendation,
  UserStats,
  GlobalStats,
  Subscription,
  Tag,
  Category
} from '@/types/api';
import {
  mockCategories,
  mockTags,
  mockItems,
  mockComments,
  mockRecommendations,
  mockUserStats,
  mockGlobalStats,
  mockSubscriptions,
} from './mockData';

// Configure your Spring Boot API base URL here
// Backend API URL
const API_BASE_URL = 'http://localhost:8000/api';
const USE_MOCK_DATA = false; // Disable global mock to use real backend

// Mock current user ID - replace with actual auth
const CURRENT_USER_ID = 1;

// Helper function for simulating API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for API calls
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (USE_MOCK_DATA) {
    throw new Error('Mock mode enabled');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Items API
export const itemsApi = {
  getAll: async (filters?: { categoryId?: number; tagId?: number }) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      let items = [...mockItems];
      if (filters?.categoryId) {
        items = items.filter(item => item.categoryId === filters.categoryId);
      }
      if (filters?.tagId) {
        items = items.filter(item => item.tags.some(tag => tag.id === filters.tagId));
      }
      return items;
    }
    return fetchApi<Item[]>(`/items${filters ? `?${new URLSearchParams(filters as any)}` : ''}`);
  },

  getById: async (id: number) => {
    if (USE_MOCK_DATA) {
      await delay(200);
      const item = mockItems.find(i => i.id === id);
      if (!item) throw new Error('Item not found');
      return item;
    }
    return fetchApi<Item>(`/items/${id}`);
  },

  create: async (data: Partial<Item>) => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return { ...data, id: mockItems.length + 1 } as Item;
    }
    return fetchApi<Item>(`/items`, { method: 'POST', body: JSON.stringify(data) });
  },

  toggleFavorite: async (itemId: number) => {
    if (USE_MOCK_DATA) {
      await delay(200);
      const item = mockItems.find(i => i.id === itemId);
      if (item) item.isFavorite = !item.isFavorite;
      return;
    }
    return fetchApi(`/items/${itemId}/favorite`, { method: 'POST' });
  },
};

// Comments API
export const commentsApi = {
  getByItemId: async (itemId: number) => {
    if (USE_MOCK_DATA) {
      await delay(200);
      return mockComments[itemId] || [];
    }
    return fetchApi<Comment[]>(`/comments/${itemId}`);
  },

  create: async (data: { itemId: number; content: string }) => {
    if (USE_MOCK_DATA) {
      await delay(400);
      const newComment: Comment = {
        id: Date.now(),
        content: data.content,
        userId: CURRENT_USER_ID,
        itemId: data.itemId,
        username: 'Current User',
        createdAt: new Date().toISOString(),
        likes: 0,
        rating: 0,
        userLiked: false,
        userRating: undefined,
      };
      if (!mockComments[data.itemId]) mockComments[data.itemId] = [];
      mockComments[data.itemId].push(newComment);
      return newComment;
    }
    return fetchApi<Comment>(`/comments`, { method: 'POST', body: JSON.stringify(data) });
  },

  like: async (commentId: number) => {
    if (USE_MOCK_DATA) {
      await delay(200);
      for (const comments of Object.values(mockComments)) {
        const comment = comments.find(c => c.id === commentId);
        if (comment && !comment.userLiked) {
          comment.likes += 1;
          comment.userLiked = true;
        }
      }
      return;
    }
    return fetchApi(`/comments/${commentId}/like`, { method: 'POST' });
  },

  rate: async (commentId: number, rating: number) => {
    if (USE_MOCK_DATA) {
      await delay(200);
      for (const comments of Object.values(mockComments)) {
        const comment = comments.find(c => c.id === commentId);
        if (comment && !comment.userRating) {
          comment.userRating = rating;
          comment.rating = (comment.rating + rating) / 2;
        }
      }
      return;
    }
    return fetchApi(`/comments/${commentId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating })
    });
  },
};

// Recommendations API
export const recommendationsApi = {
  getForUser: async (userId: number) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      return mockRecommendations;
    }
    return fetchApi<Recommendation[]>(`/users/${userId}/recommendations`);
  },
};

// Statistics API
export const statsApi = {
  getUserStats: async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`);
      if (!response.ok) throw new Error("User Stats API failed");
      return await response.json();
    } catch (e) {
      console.warn("User Stats API offline, using mock");
      return mockUserStats;
    }
  },

  getGlobalStats: async () => {
    // Force backend call for this one
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) throw new Error("Stats API failed");
      return response.json();
    } catch (e) {
      console.warn("Stats API offline, using mock");
      return mockGlobalStats;
    }
  },

  getTimeseries: async (sensorType: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/timeseries/${sensorType}`);
      if (!response.ok) throw new Error("Timeseries API failed");
      const data = await response.json();
      if (data && data.length > 0) return data;
      throw new Error("Empty data");
    } catch (e) {
      console.warn(`Timeseries API for ${sensorType} offline, using mock data`);
      // Generate mock hourly data for the past 24 hours
      const now = new Date();
      const mockData = [];
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now);
        timestamp.setHours(now.getHours() - i);
        if (sensorType === 'aqi') {
          mockData.push({
            timestamp: timestamp.toISOString(),
            value: Math.floor(40 + Math.random() * 60 + Math.sin(i / 3) * 20)
          });
        } else if (sensorType === 'traffic') {
          mockData.push({
            timestamp: timestamp.toISOString(),
            value: Math.floor(20 + Math.random() * 50 + (i > 6 && i < 10 ? 30 : 0) + (i > 16 && i < 20 ? 25 : 0))
          });
        } else {
          mockData.push({
            timestamp: timestamp.toISOString(),
            value: Math.floor(Math.random() * 100)
          });
        }
      }
      return mockData;
    }
  },
};

export const emergencyApi = {
  getIncidents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/emergency/incidents`);
      if (!response.ok) throw new Error("Emergency API failed");
      return await response.json();
    } catch (e) {
      console.warn("Emergency API offline");
      return [];
    }
  },
  getStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/emergency/status`);
      if (!response.ok) throw new Error("Status API failed");
      return await response.json();
    } catch (e) {
      console.warn("Status API offline");
      return null;
    }
  },
  getUnits: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/emergency/units`);
      if (!response.ok) throw new Error("Units API failed");
      return await response.json();
    } catch (e) {
      console.warn("Units API offline");
      return [];
    }
  },
  sendSOS: async (data: { user_id: number; lat: number; lng: number; message: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/emergency/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (e) {
      throw new Error("SOS Broadcast failed");
    }
  }
};

export const transportApi = {
  getBuses: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transport/buses`);
      if (!response.ok) throw new Error("Transport API failed");
      return await response.json();
    } catch (e) {
      console.warn("Transport API offline");
      return [];
    }
  },
  getRoutes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transport/routes`);
      if (!response.ok) throw new Error("Transport routes API failed");
      return await response.json();
    } catch (e) {
      console.warn("Transport routes API offline");
      return [];
    }
  }
};

export const reportsApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      return await response.json();
    } catch (e) {
      console.warn("Reports API offline");
      return [];
    }
  }
};

export const adminApi = {
  getUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`);
      if (!response.ok) throw new Error("Admin Users API failed");
      return await response.json();
    } catch (e) {
      console.warn("Admin Users API offline");
      return [];
    }
  },
  getLogs: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/logs`);
      if (!response.ok) throw new Error("Admin Logs API failed");
      return await response.json();
    } catch (e) {
      console.warn("Admin Logs API offline");
      return [];
    }
  }
};

export const userApi = {
  getHistory: async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/history`);
      if (!response.ok) throw new Error("Failed to fetch history");
      return await response.json();
    } catch (e) {
      console.warn("User History API offline");
      return [];
    }
  }
};

// Subscriptions API
export const subscriptionsApi = {
  getForUser: async (userId: number) => {
    if (USE_MOCK_DATA) {
      await delay(200);
      return mockSubscriptions;
    }
    return fetchApi<Subscription[]>(`/users/${userId}/subscriptions`);
  },

  subscribeToTag: async (userId: number, tagId: number) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      return;
    }
    return fetchApi(`/users/${userId}/subscribe/tag`, {
      method: 'POST',
      body: JSON.stringify({ tagId })
    });
  },

  subscribeToCategory: async (userId: number, categoryId: number) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      return;
    }
    return fetchApi(`/users/${userId}/subscribe/category`, {
      method: 'POST',
      body: JSON.stringify({ categoryId })
    });
  },

  unsubscribe: async (subscriptionId: number) => {
    if (USE_MOCK_DATA) {
      await delay(200);
      const index = mockSubscriptions.findIndex(s => s.id === subscriptionId);
      if (index !== -1) mockSubscriptions.splice(index, 1);
      return;
    }
    return fetchApi(`/subscriptions/${subscriptionId}`, { method: 'DELETE' });
  },
};

// Categories and Tags API
export const metaApi = {
  getCategories: async () => {
    if (USE_MOCK_DATA) {
      await delay(100);
      return mockCategories;
    }
    return fetchApi<Category[]>(`/categories`);
  },

  getTags: async () => {
    if (USE_MOCK_DATA) {
      await delay(100);
      return mockTags;
    }
    return fetchApi<Tag[]>(`/tags`);
  },
};

export const getCurrentUserId = () => CURRENT_USER_ID;
