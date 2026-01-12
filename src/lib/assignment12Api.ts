// Assignment #12: Full API Implementation
import type {
  ArchivedItem,
  ItemVersion,
  ReminderRule,
  Reminder,
  DashboardAnalytics,
  UserDashboardAnalytics,
  CalendarEvent,
  SmartFilter,
  FilterCondition,
  NotificationTemplate,
  Notification,
  UsageAnalytics,
  ExternalIntegration,
  ProjectArchive,
} from '@/types/assignment12';
import { mockItems } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Storage keys
const STORAGE_KEYS = {
  ARCHIVED_ITEMS: 'smartcity_archived_items',
  ITEM_VERSIONS: 'smartcity_item_versions',
  REMINDER_RULES: 'smartcity_reminder_rules',
  REMINDERS: 'smartcity_reminders',
  SMART_FILTERS: 'smartcity_smart_filters',
  NOTIFICATION_TEMPLATES: 'smartcity_notification_templates',
  NOTIFICATIONS: 'smartcity_notifications',
  INTEGRATIONS: 'smartcity_integrations',
  PROJECT_ARCHIVES: 'smartcity_project_archives',
  CALENDAR_EVENTS: 'smartcity_calendar_events',
  USAGE_LOGS: 'smartcity_usage_logs',
};

// Helper functions
const getStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Log usage for analytics
export const logUsage = (functionName: string, userId: number) => {
  const logs = getStorage<{ function: string; userId: number; timestamp: string }[]>(STORAGE_KEYS.USAGE_LOGS, []);
  logs.push({ function: functionName, userId, timestamp: new Date().toISOString() });
  setStorage(STORAGE_KEYS.USAGE_LOGS, logs.slice(-1000)); // Keep last 1000 logs
};

// ============= PART 1: CORE FEATURES =============

// Topic 1: Automatic Archiving
export const archiveApi = {
  // Manual archive
  archiveItem: async (itemId: number, userId: number): Promise<ArchivedItem> => {
    await delay(300);
    logUsage('archiveItem', userId);
    
    const item = mockItems.find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');
    
    const archived = getStorage<ArchivedItem[]>(STORAGE_KEYS.ARCHIVED_ITEMS, []);
    const newArchive: ArchivedItem = {
      id: Date.now(),
      itemId: item.id,
      title: item.title,
      description: item.description,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      archivedAt: new Date().toISOString(),
      archivedBy: userId,
      reason: 'manual',
      originalData: { ...item },
    };
    
    archived.push(newArchive);
    setStorage(STORAGE_KEYS.ARCHIVED_ITEMS, archived);
    return newArchive;
  },

  // Get archived items
  getArchivedItems: async (userId: number): Promise<ArchivedItem[]> => {
    await delay(200);
    logUsage('getArchivedItems', userId);
    return getStorage<ArchivedItem[]>(STORAGE_KEYS.ARCHIVED_ITEMS, []);
  },

  // Restore archived item
  restoreItem: async (archiveId: number, userId: number): Promise<void> => {
    await delay(300);
    logUsage('restoreItem', userId);
    
    const archived = getStorage<ArchivedItem[]>(STORAGE_KEYS.ARCHIVED_ITEMS, []);
    const index = archived.findIndex(a => a.id === archiveId);
    if (index !== -1) {
      archived.splice(index, 1);
      setStorage(STORAGE_KEYS.ARCHIVED_ITEMS, archived);
    }
  },

  // Auto-archive old/inactive items (scheduler simulation)
  runAutoArchive: async (userId: number, daysOld: number = 30): Promise<number> => {
    await delay(500);
    logUsage('runAutoArchive', userId);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const archived = getStorage<ArchivedItem[]>(STORAGE_KEYS.ARCHIVED_ITEMS, []);
    const alreadyArchivedIds = archived.map(a => a.itemId);
    
    let archivedCount = 0;
    for (const item of mockItems) {
      if (alreadyArchivedIds.includes(item.id)) continue;
      
      const itemDate = new Date(item.createdAt);
      if (itemDate < cutoffDate) {
        const newArchive: ArchivedItem = {
          id: Date.now() + archivedCount,
          itemId: item.id,
          title: item.title,
          description: item.description,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          archivedAt: new Date().toISOString(),
          archivedBy: userId,
          reason: 'auto_old',
          originalData: { ...item },
        };
        archived.push(newArchive);
        archivedCount++;
      }
    }
    
    setStorage(STORAGE_KEYS.ARCHIVED_ITEMS, archived);
    return archivedCount;
  },
};

// Topic 2: Full Object Versioning
export const versioningApi = {
  // Create version on update
  createVersion: async (itemId: number, snapshot: Record<string, any>, userId: number, changeDescription?: string): Promise<ItemVersion> => {
    await delay(300);
    logUsage('createVersion', userId);
    
    const versions = getStorage<ItemVersion[]>(STORAGE_KEYS.ITEM_VERSIONS, []);
    const itemVersions = versions.filter(v => v.itemId === itemId);
    const versionNumber = itemVersions.length + 1;
    
    const newVersion: ItemVersion = {
      id: Date.now(),
      itemId,
      versionNumber,
      snapshot,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      changeDescription,
    };
    
    versions.push(newVersion);
    setStorage(STORAGE_KEYS.ITEM_VERSIONS, versions);
    return newVersion;
  },

  // Get item versions
  getItemVersions: async (itemId: number): Promise<ItemVersion[]> => {
    await delay(200);
    const versions = getStorage<ItemVersion[]>(STORAGE_KEYS.ITEM_VERSIONS, []);
    return versions.filter(v => v.itemId === itemId).sort((a, b) => b.versionNumber - a.versionNumber);
  },

  // Revert to version
  revertToVersion: async (itemId: number, versionId: number, userId: number): Promise<ItemVersion> => {
    await delay(400);
    logUsage('revertToVersion', userId);
    
    const versions = getStorage<ItemVersion[]>(STORAGE_KEYS.ITEM_VERSIONS, []);
    const targetVersion = versions.find(v => v.id === versionId && v.itemId === itemId);
    if (!targetVersion) throw new Error('Version not found');
    
    // Create new version from reverted state
    const itemVersions = versions.filter(v => v.itemId === itemId);
    const newVersion: ItemVersion = {
      id: Date.now(),
      itemId,
      versionNumber: itemVersions.length + 1,
      snapshot: targetVersion.snapshot,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      changeDescription: `Reverted to version ${targetVersion.versionNumber}`,
    };
    
    versions.push(newVersion);
    setStorage(STORAGE_KEYS.ITEM_VERSIONS, versions);
    return newVersion;
  },
};

// Topic 3: Tag-Based Reminder Rules
export const reminderApi = {
  // Create reminder rule
  createRule: async (tagId: number, tagName: string, condition: ReminderRule['condition'], threshold: number, message: string, userId: number): Promise<ReminderRule> => {
    await delay(300);
    logUsage('createReminderRule', userId);
    
    const rules = getStorage<ReminderRule[]>(STORAGE_KEYS.REMINDER_RULES, []);
    const newRule: ReminderRule = {
      id: Date.now(),
      tagId,
      tagName,
      condition,
      threshold,
      message,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };
    
    rules.push(newRule);
    setStorage(STORAGE_KEYS.REMINDER_RULES, rules);
    return newRule;
  },

  // Get rules for tag
  getRulesForTag: async (tagId: number): Promise<ReminderRule[]> => {
    await delay(200);
    const rules = getStorage<ReminderRule[]>(STORAGE_KEYS.REMINDER_RULES, []);
    return rules.filter(r => r.tagId === tagId);
  },

  // Get all active reminders
  getActiveReminders: async (userId: number): Promise<Reminder[]> => {
    await delay(200);
    logUsage('getActiveReminders', userId);
    return getStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []).filter(r => r.status === 'pending');
  },

  // Evaluate rules and generate reminders (scheduler)
  evaluateRules: async (userId: number): Promise<number> => {
    await delay(500);
    logUsage('evaluateRules', userId);
    
    const rules = getStorage<ReminderRule[]>(STORAGE_KEYS.REMINDER_RULES, []).filter(r => r.isActive);
    const reminders = getStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
    let newRemindersCount = 0;
    
    for (const rule of rules) {
      const taggedItems = mockItems.filter(item => item.tags.some(t => t.id === rule.tagId));
      
      for (const item of taggedItems) {
        const existingReminder = reminders.find(r => r.ruleId === rule.id && r.itemId === item.id && r.status === 'pending');
        if (existingReminder) continue;
        
        let shouldRemind = false;
        if (rule.condition === 'no_update') {
          const daysSinceUpdate = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          shouldRemind = daysSinceUpdate >= rule.threshold;
        } else if (rule.condition === 'low_rating') {
          shouldRemind = item.rating < rule.threshold;
        }
        
        if (shouldRemind) {
          const newReminder: Reminder = {
            id: Date.now() + newRemindersCount,
            ruleId: rule.id,
            itemId: item.id,
            itemTitle: item.title,
            message: rule.message.replace('{{itemTitle}}', item.title),
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          reminders.push(newReminder);
          newRemindersCount++;
        }
      }
    }
    
    setStorage(STORAGE_KEYS.REMINDERS, reminders);
    return newRemindersCount;
  },

  // Dismiss reminder
  dismissReminder: async (reminderId: number, userId: number): Promise<void> => {
    await delay(200);
    logUsage('dismissReminder', userId);
    
    const reminders = getStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.status = 'dismissed';
      setStorage(STORAGE_KEYS.REMINDERS, reminders);
    }
  },
};

// Topic 4: Built-in Analytics Dashboards
export const analyticsApi = {
  // Global analytics
  getGlobalAnalytics: async (): Promise<DashboardAnalytics> => {
    await delay(400);
    
    const versions = getStorage<ItemVersion[]>(STORAGE_KEYS.ITEM_VERSIONS, []);
    const reminders = getStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
    
    // Items by category
    const categoryCount: Record<string, number> = {};
    mockItems.forEach(item => {
      categoryCount[item.categoryName] = (categoryCount[item.categoryName] || 0) + 1;
    });
    
    // Popular tags
    const tagCount: Record<string, number> = {};
    mockItems.forEach(item => {
      item.tags.forEach(tag => {
        tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
      });
    });
    
    // Versions per item
    const versionCount: Record<number, { title: string; count: number }> = {};
    versions.forEach(v => {
      if (!versionCount[v.itemId]) {
        const item = mockItems.find(i => i.id === v.itemId);
        versionCount[v.itemId] = { title: item?.title || 'Unknown', count: 0 };
      }
      versionCount[v.itemId].count++;
    });
    
    return {
      itemsByStatus: [
        { status: 'Active', count: mockItems.length },
        { status: 'Archived', count: getStorage<ArchivedItem[]>(STORAGE_KEYS.ARCHIVED_ITEMS, []).length },
      ],
      itemsByCategory: Object.entries(categoryCount).map(([category, count]) => ({ category, count })),
      userActivity: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return { date: date.toISOString().split('T')[0], actions: Math.floor(Math.random() * 50) + 10 };
      }).reverse(),
      popularTags: Object.entries(tagCount).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count),
      versionsPerItem: Object.values(versionCount).map(v => ({ itemTitle: v.title, versions: v.count })),
      reminderActivity: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return { 
          date: date.toISOString().split('T')[0], 
          sent: Math.floor(Math.random() * 10), 
          dismissed: Math.floor(Math.random() * 5) 
        };
      }).reverse(),
    };
  },

  // User analytics
  getUserAnalytics: async (userId: number): Promise<UserDashboardAnalytics> => {
    await delay(300);
    logUsage('getUserAnalytics', userId);
    
    const usageLogs = getStorage<{ function: string; userId: number; timestamp: string }[]>(STORAGE_KEYS.USAGE_LOGS, []);
    const userLogs = usageLogs.filter(l => l.userId === userId);
    
    // Activity by day
    const activityByDay: Record<string, number> = {};
    userLogs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      activityByDay[date] = (activityByDay[date] || 0) + 1;
    });
    
    return {
      userId,
      itemsCreated: Math.floor(Math.random() * 10) + 1,
      commentsPosted: Math.floor(Math.random() * 20) + 5,
      likesGiven: Math.floor(Math.random() * 50) + 10,
      bookmarksCount: Math.floor(Math.random() * 15) + 3,
      activityHistory: Object.entries(activityByDay).map(([date, count]) => ({ date, count })).slice(-7),
      topCategories: [
        { category: 'Transport', interactions: Math.floor(Math.random() * 30) + 10 },
        { category: 'Energy', interactions: Math.floor(Math.random() * 25) + 5 },
        { category: 'Environment', interactions: Math.floor(Math.random() * 20) + 5 },
      ],
    };
  },
};

// Topic 5: External Calendar Integration
export const calendarApi = {
  // Get calendar events
  getEvents: async (userId: number): Promise<CalendarEvent[]> => {
    await delay(300);
    logUsage('getCalendarEvents', userId);
    return getStorage<CalendarEvent[]>(STORAGE_KEYS.CALENDAR_EVENTS, []);
  },

  // Create event
  createEvent: async (event: Omit<CalendarEvent, 'id' | 'synced'>, userId: number): Promise<CalendarEvent> => {
    await delay(300);
    logUsage('createCalendarEvent', userId);
    
    const events = getStorage<CalendarEvent[]>(STORAGE_KEYS.CALENDAR_EVENTS, []);
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt_${Date.now()}`,
      synced: false,
    };
    
    events.push(newEvent);
    setStorage(STORAGE_KEYS.CALENDAR_EVENTS, events);
    return newEvent;
  },

  // Sync with external calendar (simulation)
  syncCalendar: async (userId: number, service: 'google' | 'outlook'): Promise<{ synced: number; errors: number }> => {
    await delay(1000);
    logUsage('syncCalendar', userId);
    
    const events = getStorage<CalendarEvent[]>(STORAGE_KEYS.CALENDAR_EVENTS, []);
    let synced = 0;
    
    events.forEach(event => {
      if (!event.synced && event.source === 'internal') {
        event.synced = true;
        event.externalId = `ext_${service}_${Date.now()}_${synced}`;
        synced++;
      }
    });
    
    setStorage(STORAGE_KEYS.CALENDAR_EVENTS, events);
    return { synced, errors: 0 };
  },
};

// ============= PART 2: EXTRA FEATURES =============

// Topic 1: Smart Filters
export const smartFilterApi = {
  // Create smart filter
  createFilter: async (userId: number, name: string, conditions: FilterCondition[]): Promise<SmartFilter> => {
    await delay(300);
    logUsage('createSmartFilter', userId);
    
    const filters = getStorage<SmartFilter[]>(STORAGE_KEYS.SMART_FILTERS, []);
    const newFilter: SmartFilter = {
      id: Date.now(),
      userId,
      name,
      conditions,
      createdAt: new Date().toISOString(),
    };
    
    filters.push(newFilter);
    setStorage(STORAGE_KEYS.SMART_FILTERS, filters);
    return newFilter;
  },

  // Get user filters
  getUserFilters: async (userId: number): Promise<SmartFilter[]> => {
    await delay(200);
    return getStorage<SmartFilter[]>(STORAGE_KEYS.SMART_FILTERS, []).filter(f => f.userId === userId);
  },

  // Apply smart filter
  applyFilter: async (conditions: FilterCondition[]): Promise<typeof mockItems> => {
    await delay(300);
    
    return mockItems.filter(item => {
      return conditions.every(cond => {
        const value = (item as any)[cond.field];
        if (value === undefined) return false;
        
        switch (cond.operator) {
          case 'eq': return value === cond.value;
          case 'neq': return value !== cond.value;
          case 'gt': return value > cond.value;
          case 'lt': return value < cond.value;
          case 'gte': return value >= cond.value;
          case 'lte': return value <= cond.value;
          case 'contains': return String(value).toLowerCase().includes(String(cond.value).toLowerCase());
          case 'not_contains': return !String(value).toLowerCase().includes(String(cond.value).toLowerCase());
          default: return true;
        }
      });
    });
  },

  // Delete filter
  deleteFilter: async (filterId: number, userId: number): Promise<void> => {
    await delay(200);
    logUsage('deleteSmartFilter', userId);
    
    const filters = getStorage<SmartFilter[]>(STORAGE_KEYS.SMART_FILTERS, []);
    const index = filters.findIndex(f => f.id === filterId && f.userId === userId);
    if (index !== -1) {
      filters.splice(index, 1);
      setStorage(STORAGE_KEYS.SMART_FILTERS, filters);
    }
  },
};

// Topic 2: Notification Templates
export const notificationApi = {
  // Create template
  createTemplate: async (template: Omit<NotificationTemplate, 'id' | 'createdAt'>, userId: number): Promise<NotificationTemplate> => {
    await delay(300);
    logUsage('createNotificationTemplate', userId);
    
    const templates = getStorage<NotificationTemplate[]>(STORAGE_KEYS.NOTIFICATION_TEMPLATES, []);
    const newTemplate: NotificationTemplate = {
      ...template,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    
    templates.push(newTemplate);
    setStorage(STORAGE_KEYS.NOTIFICATION_TEMPLATES, templates);
    return newTemplate;
  },

  // Get templates
  getTemplates: async (): Promise<NotificationTemplate[]> => {
    await delay(200);
    return getStorage<NotificationTemplate[]>(STORAGE_KEYS.NOTIFICATION_TEMPLATES, []);
  },

  // Send notification using template
  sendNotification: async (templateId: number, userId: number, variables: Record<string, string>): Promise<Notification> => {
    await delay(400);
    logUsage('sendNotification', userId);
    
    const templates = getStorage<NotificationTemplate[]>(STORAGE_KEYS.NOTIFICATION_TEMPLATES, []);
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');
    
    let message = template.body;
    let title = template.subject;
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
      title = title.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    const notifications = getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotification: Notification = {
      id: Date.now(),
      templateId,
      userId,
      title,
      message,
      channel: template.channel === 'both' ? 'internal' : template.channel,
      status: 'sent',
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    };
    
    notifications.push(newNotification);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  },

  // Get user notifications
  getUserNotifications: async (userId: number): Promise<Notification[]> => {
    await delay(200);
    return getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []).filter(n => n.userId === userId);
  },

  // Mark as read
  markAsRead: async (notificationId: number): Promise<void> => {
    await delay(200);
    
    const notifications = getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status = 'read';
      notification.readAt = new Date().toISOString();
      setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  },
};

// Topic 3: Project Usage Analytics
export const usageAnalyticsApi = {
  // Get usage analytics
  getUsageAnalytics: async (): Promise<UsageAnalytics> => {
    await delay(400);
    
    const logs = getStorage<{ function: string; userId: number; timestamp: string }[]>(STORAGE_KEYS.USAGE_LOGS, []);
    
    // Function usage
    const functionUsage: Record<string, number> = {};
    logs.forEach(log => {
      functionUsage[log.function] = (functionUsage[log.function] || 0) + 1;
    });
    
    // Peak hours
    const hourUsage: Record<number, number> = {};
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourUsage[hour] = (hourUsage[hour] || 0) + 1;
    });
    
    return {
      totalSessions: Math.floor(Math.random() * 500) + 100,
      averageSessionDuration: Math.floor(Math.random() * 30) + 5,
      functionUsage: Object.entries(functionUsage).map(([fn, calls]) => ({ function: fn, calls })),
      peakHours: Object.entries(hourUsage).map(([hour, sessions]) => ({ hour: Number(hour), sessions })),
      itemActivityStats: mockItems.slice(0, 5).map(item => ({
        itemId: item.id,
        title: item.title,
        views: Math.floor(Math.random() * 200) + 50,
        interactions: Math.floor(Math.random() * 50) + 10,
      })),
    };
  },

  // Get user usage
  getUserUsage: async (userId: number): Promise<{ totalActions: number; lastActive: string; topFunctions: { function: string; count: number }[] }> => {
    await delay(300);
    logUsage('getUserUsage', userId);
    
    const logs = getStorage<{ function: string; userId: number; timestamp: string }[]>(STORAGE_KEYS.USAGE_LOGS, []);
    const userLogs = logs.filter(l => l.userId === userId);
    
    const functionCount: Record<string, number> = {};
    userLogs.forEach(log => {
      functionCount[log.function] = (functionCount[log.function] || 0) + 1;
    });
    
    return {
      totalActions: userLogs.length,
      lastActive: userLogs.length > 0 ? userLogs[userLogs.length - 1].timestamp : new Date().toISOString(),
      topFunctions: Object.entries(functionCount)
        .map(([fn, count]) => ({ function: fn, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  },
};

// Topic 4: External Automation Services Integration
export const integrationApi = {
  // Connect service
  connectService: async (userId: number, service: ExternalIntegration['service'], webhookUrl?: string): Promise<ExternalIntegration> => {
    await delay(500);
    logUsage('connectService', userId);
    
    const integrations = getStorage<ExternalIntegration[]>(STORAGE_KEYS.INTEGRATIONS, []);
    
    // Remove existing connection for same service
    const existingIndex = integrations.findIndex(i => i.userId === userId && i.service === service);
    if (existingIndex !== -1) {
      integrations.splice(existingIndex, 1);
    }
    
    const newIntegration: ExternalIntegration = {
      id: Date.now(),
      userId,
      service,
      status: 'connected',
      webhookUrl,
      accessToken: `token_${service}_${Date.now()}`,
      connectedAt: new Date().toISOString(),
    };
    
    integrations.push(newIntegration);
    setStorage(STORAGE_KEYS.INTEGRATIONS, integrations);
    return newIntegration;
  },

  // Get user integrations
  getUserIntegrations: async (userId: number): Promise<ExternalIntegration[]> => {
    await delay(200);
    return getStorage<ExternalIntegration[]>(STORAGE_KEYS.INTEGRATIONS, []).filter(i => i.userId === userId);
  },

  // Trigger external action
  triggerAction: async (userId: number, service: ExternalIntegration['service'], payload: Record<string, any>): Promise<{ success: boolean; message: string }> => {
    await delay(800);
    logUsage('triggerAction', userId);
    
    const integrations = getStorage<ExternalIntegration[]>(STORAGE_KEYS.INTEGRATIONS, []);
    const integration = integrations.find(i => i.userId === userId && i.service === service && i.status === 'connected');
    
    if (!integration) {
      return { success: false, message: `${service} is not connected` };
    }
    
    // Simulate webhook call
    if (integration.webhookUrl) {
      console.log(`Triggering ${service} webhook:`, integration.webhookUrl, payload);
    }
    
    integration.lastSyncAt = new Date().toISOString();
    setStorage(STORAGE_KEYS.INTEGRATIONS, integrations);
    
    return { success: true, message: `Action triggered successfully on ${service}` };
  },

  // Disconnect service
  disconnectService: async (userId: number, service: ExternalIntegration['service']): Promise<void> => {
    await delay(300);
    logUsage('disconnectService', userId);
    
    const integrations = getStorage<ExternalIntegration[]>(STORAGE_KEYS.INTEGRATIONS, []);
    const index = integrations.findIndex(i => i.userId === userId && i.service === service);
    if (index !== -1) {
      integrations.splice(index, 1);
      setStorage(STORAGE_KEYS.INTEGRATIONS, integrations);
    }
  },
};

// Topic 5: Project Archiving & Restoration
export const projectArchiveApi = {
  // Create archive
  createArchive: async (userId: number, name: string, itemIds: number[], description?: string): Promise<ProjectArchive> => {
    await delay(500);
    logUsage('createProjectArchive', userId);
    
    const itemsToArchive = mockItems.filter(i => itemIds.includes(i.id));
    const archives = getStorage<ProjectArchive[]>(STORAGE_KEYS.PROJECT_ARCHIVES, []);
    
    const newArchive: ProjectArchive = {
      id: Date.now(),
      userId,
      name,
      description,
      itemIds,
      createdAt: new Date().toISOString(),
      size: JSON.stringify(itemsToArchive).length,
      data: { items: itemsToArchive },
    };
    
    archives.push(newArchive);
    setStorage(STORAGE_KEYS.PROJECT_ARCHIVES, archives);
    return newArchive;
  },

  // Get archives
  getArchives: async (userId: number): Promise<ProjectArchive[]> => {
    await delay(200);
    return getStorage<ProjectArchive[]>(STORAGE_KEYS.PROJECT_ARCHIVES, []).filter(a => a.userId === userId);
  },

  // Restore archive
  restoreArchive: async (archiveId: number, userId: number): Promise<{ restored: number }> => {
    await delay(500);
    logUsage('restoreProjectArchive', userId);
    
    const archives = getStorage<ProjectArchive[]>(STORAGE_KEYS.PROJECT_ARCHIVES, []);
    const archive = archives.find(a => a.id === archiveId && a.userId === userId);
    
    if (!archive) throw new Error('Archive not found');
    
    // In a real app, this would restore the items to the database
    console.log('Restoring archive:', archive.name, archive.data);
    
    return { restored: archive.itemIds.length };
  },

  // Delete archive
  deleteArchive: async (archiveId: number, userId: number): Promise<void> => {
    await delay(300);
    logUsage('deleteProjectArchive', userId);
    
    const archives = getStorage<ProjectArchive[]>(STORAGE_KEYS.PROJECT_ARCHIVES, []);
    const index = archives.findIndex(a => a.id === archiveId && a.userId === userId);
    if (index !== -1) {
      archives.splice(index, 1);
      setStorage(STORAGE_KEYS.PROJECT_ARCHIVES, archives);
    }
  },
};
