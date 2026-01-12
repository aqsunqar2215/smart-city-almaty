// Local Database System using localStorage

export interface DataRecord {
  id: string;
  timestamp: string;
  [key: string]: any;
}

export interface AirQualityRecord extends DataRecord {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  category: string;
}

export interface TrafficRecord extends DataRecord {
  congestionLevel: number;
  averageSpeed: number;
  incidents: number;
  district?: string;
}

export interface WeatherRecord extends DataRecord {
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: string;
  confidence?: number;
  source?: string;
  processingTime?: number;
}

export interface UserQuery {
  id: string;
  query: string;
  response: string;
  timestamp: string;
  category: string;
}

// Generic CRUD operations
class DataStore<T extends DataRecord> {
  private storageKey: string;
  private maxRecords: number;

  constructor(storageKey: string, maxRecords: number = 100) {
    this.storageKey = storageKey;
    this.maxRecords = maxRecords;
  }

  private getAll(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveAll(records: T[]): void {
    // Keep only the latest records
    const trimmed = records.slice(-this.maxRecords);
    localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
  }

  create(record: Omit<T, 'id' | 'timestamp'>): T {
    const newRecord = {
      ...record,
      id: `${this.storageKey}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    } as T;

    const records = this.getAll();
    records.push(newRecord);
    this.saveAll(records);
    return newRecord;
  }

  read(id: string): T | undefined {
    return this.getAll().find(r => r.id === id);
  }

  readAll(): T[] {
    return this.getAll();
  }

  readRecent(count: number = 10): T[] {
    const all = this.getAll();
    return all.slice(-count).reverse();
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return undefined;

    records[index] = { ...records[index], ...updates };
    this.saveAll(records);
    return records[index];
  }

  delete(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;

    this.saveAll(filtered);
    return true;
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  count(): number {
    return this.getAll().length;
  }

  // Query with filter
  query(predicate: (record: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  // Get statistics
  getStats(): { count: number; oldest: string | null; newest: string | null } {
    const records = this.getAll();
    if (records.length === 0) {
      return { count: 0, oldest: null, newest: null };
    }
    return {
      count: records.length,
      oldest: records[0].timestamp,
      newest: records[records.length - 1].timestamp
    };
  }
}

// Specialized stores
export const airQualityStore = new DataStore<AirQualityRecord>('smartcity_air_quality', 500);
export const trafficStore = new DataStore<TrafficRecord>('smartcity_traffic', 500);
export const weatherStore = new DataStore<WeatherRecord>('smartcity_weather', 500);
export const chatHistoryStore = new DataStore<ChatMessage>('smartcity_chat', 200);
export const userQueryStore = new DataStore<UserQuery>('smartcity_queries', 100);

// Helper functions for data aggregation
export const getHourlyAverages = (records: DataRecord[], field: string): { hour: number; value: number }[] => {
  const hourlyData: { [hour: number]: number[] } = {};

  records.forEach(record => {
    const hour = new Date(record.timestamp).getHours();
    if (!hourlyData[hour]) hourlyData[hour] = [];
    if (record[field] !== undefined) {
      hourlyData[hour].push(record[field]);
    }
  });

  return Object.entries(hourlyData).map(([hour, values]) => ({
    hour: parseInt(hour),
    value: values.reduce((a, b) => a + b, 0) / values.length
  })).sort((a, b) => a.hour - b.hour);
};

export const getDailyTrend = (records: DataRecord[], field: string): { date: string; value: number }[] => {
  const dailyData: { [date: string]: number[] } = {};

  records.forEach(record => {
    const date = record.timestamp.split('T')[0];
    if (!dailyData[date]) dailyData[date] = [];
    if (record[field] !== undefined) {
      dailyData[date].push(record[field]);
    }
  });

  return Object.entries(dailyData).map(([date, values]) => ({
    date,
    value: values.reduce((a, b) => a + b, 0) / values.length
  })).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
};

// Initialize with some demo data if empty
export const initializeDemoData = () => {
  if (airQualityStore.count() === 0) {
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now - i * 3600000).toISOString();
      const isPeak = (24 - i) >= 7 && (24 - i) <= 9 || (24 - i) >= 17 && (24 - i) <= 19;
      airQualityStore.create({
        aqi: isPeak ? 70 + Math.random() * 40 : 40 + Math.random() * 30,
        pm25: isPeak ? 25 + Math.random() * 20 : 10 + Math.random() * 15,
        pm10: isPeak ? 40 + Math.random() * 30 : 20 + Math.random() * 20,
        o3: 50 + Math.random() * 30,
        no2: 20 + Math.random() * 20,
        category: isPeak ? 'Moderate' : 'Good'
      });
    }
  }

  if (trafficStore.count() === 0) {
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now - i * 3600000).toISOString();
      const hour = new Date(now - i * 3600000).getHours();
      const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
      trafficStore.create({
        congestionLevel: isPeak ? 60 + Math.random() * 30 : 20 + Math.random() * 30,
        averageSpeed: isPeak ? 25 + Math.random() * 15 : 45 + Math.random() * 15,
        incidents: Math.floor(Math.random() * (isPeak ? 5 : 2))
      });
    }
  }
};
