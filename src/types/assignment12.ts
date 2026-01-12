// Assignment #12: Final Unique Features & Integrations Types

export interface ArchivedItem {
  id: number;
  itemId: number;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  archivedAt: string;
  archivedBy: number;
  reason: 'manual' | 'auto_old' | 'auto_inactive';
  originalData: Record<string, any>;
}

export interface ItemVersion {
  id: number;
  itemId: number;
  versionNumber: number;
  snapshot: Record<string, any>;
  createdAt: string;
  createdBy: number;
  changeDescription?: string;
}

export interface ReminderRule {
  id: number;
  tagId: number;
  tagName: string;
  condition: 'no_update' | 'no_activity' | 'low_rating';
  threshold: number; // days for no_update/no_activity, rating value for low_rating
  message: string;
  isActive: boolean;
  createdAt: string;
  createdBy: number;
}

export interface Reminder {
  id: number;
  ruleId: number;
  itemId: number;
  itemTitle: string;
  message: string;
  status: 'pending' | 'sent' | 'dismissed';
  createdAt: string;
  sentAt?: string;
}

export interface DashboardAnalytics {
  itemsByStatus: { status: string; count: number }[];
  itemsByCategory: { category: string; count: number }[];
  userActivity: { date: string; actions: number }[];
  popularTags: { tag: string; count: number }[];
  versionsPerItem: { itemTitle: string; versions: number }[];
  reminderActivity: { date: string; sent: number; dismissed: number }[];
}

export interface UserDashboardAnalytics {
  userId: number;
  itemsCreated: number;
  commentsPosted: number;
  likesGiven: number;
  bookmarksCount: number;
  activityHistory: { date: string; count: number }[];
  topCategories: { category: string; interactions: number }[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  itemId?: number;
  source: 'internal' | 'google' | 'outlook';
  externalId?: string;
  synced: boolean;
}

export interface SmartFilter {
  id: number;
  userId: number;
  name: string;
  conditions: FilterCondition[];
  createdAt: string;
}

export interface FilterCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'not_contains';
  value: string | number | boolean;
}

export interface NotificationTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  variables: string[]; // e.g., ['{{userName}}', '{{itemTitle}}']
  channel: 'email' | 'internal' | 'both';
  createdAt: string;
  createdBy: number;
}

export interface Notification {
  id: number;
  templateId?: number;
  userId: number;
  title: string;
  message: string;
  channel: 'email' | 'internal';
  status: 'pending' | 'sent' | 'read';
  createdAt: string;
  sentAt?: string;
  readAt?: string;
}

export interface UsageAnalytics {
  totalSessions: number;
  averageSessionDuration: number; // in minutes
  functionUsage: { function: string; calls: number }[];
  peakHours: { hour: number; sessions: number }[];
  itemActivityStats: { itemId: number; title: string; views: number; interactions: number }[];
}

export interface ExternalIntegration {
  id: number;
  userId: number;
  service: 'zapier' | 'ifttt' | 'google_calendar' | 'outlook';
  status: 'connected' | 'disconnected' | 'error';
  webhookUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  connectedAt: string;
  lastSyncAt?: string;
}

export interface ProjectArchive {
  id: number;
  userId: number;
  name: string;
  description?: string;
  itemIds: number[];
  createdAt: string;
  size: number; // in bytes
  data: Record<string, any>;
}
