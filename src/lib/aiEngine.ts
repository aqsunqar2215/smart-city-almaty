// Local Mini AI Engine for Smart City Data Analysis

import { WeatherData, AirQualityData, TrafficData } from './sensorApi';
import { airQualityStore, trafficStore, weatherStore, getHourlyAverages, getDailyTrend, AirQualityRecord, TrafficRecord } from './dataStore';

export interface AIInsight {
  id: string;
  type: 'prediction' | 'alert' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  category: 'traffic' | 'air' | 'weather' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface CityAnalysis {
  overallScore: number;
  trafficStatus: string;
  airStatus: string;
  weatherStatus: string;
  insights: AIInsight[];
  predictions: string[];
  healthScore: number;
}

export interface ChatAssistantResponse {
  response: string;
  intent?: string;
  confidence?: number;
  source?: string;
  web_sources?: string[];
  processingTime?: number;
  proactive_suggestions?: string[];
  routing_reason?: string;
  debug_trace_id?: string;
}

// Pattern recognition for traffic
const analyzeTrafficPatterns = (traffic: TrafficData): AIInsight[] => {
  const insights: AIInsight[] = [];
  const hour = new Date().getHours();

  if (traffic.congestionLevel > 70) {
    insights.push({
      id: `traffic-${Date.now()}-1`,
      type: 'alert',
      title: 'High Traffic Congestion',
      description: `Current congestion at ${traffic.congestionLevel}%. Consider alternative routes or delay travel.`,
      confidence: 0.85,
      category: 'traffic',
      priority: 'high',
      timestamp: new Date().toISOString()
    });
  }

  if ((hour >= 6 && hour < 8) || (hour >= 16 && hour < 18)) {
    insights.push({
      id: `traffic-${Date.now()}-2`,
      type: 'prediction',
      title: 'Rush Hour Traffic Increase',
      description: `Traffic is expected to ${hour < 12 ? 'peak within 1-2 hours' : 'remain elevated for the next 2 hours'} based on historical patterns.`,
      confidence: 0.78,
      category: 'traffic',
      priority: 'medium',
      timestamp: new Date().toISOString()
    });
  }

  if (traffic.incidents > 2) {
    insights.push({
      id: `traffic-${Date.now()}-3`,
      type: 'alert',
      title: 'Multiple Traffic Incidents',
      description: `${traffic.incidents} incidents detected. Average speed reduced to ${traffic.averageSpeed} km/h.`,
      confidence: 0.92,
      category: 'traffic',
      priority: 'high',
      timestamp: new Date().toISOString()
    });
  }

  return insights;
};

// Air quality analysis
const analyzeAirQuality = (air: AirQualityData): AIInsight[] => {
  const insights: AIInsight[] = [];

  if (air.aqi > 100) {
    insights.push({
      id: `air-${Date.now()}-1`,
      type: 'alert',
      title: 'Poor Air Quality Alert',
      description: `AQI at ${air.aqi} (${air.category}). Sensitive groups should limit outdoor activities.`,
      confidence: 0.95,
      category: 'air',
      priority: air.aqi > 150 ? 'critical' : 'high',
      timestamp: new Date().toISOString()
    });
  }

  if (air.pm25 > 35) {
    insights.push({
      id: `air-${Date.now()}-2`,
      type: 'recommendation',
      title: 'PM2.5 Elevated',
      description: `Fine particulate matter at ${air.pm25.toFixed(1)} µg/m³. Consider wearing masks outdoors.`,
      confidence: 0.88,
      category: 'air',
      priority: 'medium',
      timestamp: new Date().toISOString()
    });
  }

  const hour = new Date().getHours();
  if (hour >= 7 && hour <= 9) {
    insights.push({
      id: `air-${Date.now()}-3`,
      type: 'prediction',
      title: 'Morning Air Quality Trend',
      description: 'Air quality typically worsens during morning rush hours. Expect PM2.5 levels to rise.',
      confidence: 0.72,
      category: 'air',
      priority: 'low',
      timestamp: new Date().toISOString()
    });
  }

  return insights;
};

// Weather analysis
const analyzeWeather = (weather: WeatherData): AIInsight[] => {
  const insights: AIInsight[] = [];

  if (weather.temperature > 35) {
    insights.push({
      id: `weather-${Date.now()}-1`,
      type: 'alert',
      title: 'Extreme Heat Warning',
      description: `Temperature at ${weather.temperature}°C. Stay hydrated and avoid prolonged sun exposure.`,
      confidence: 0.95,
      category: 'weather',
      priority: 'high',
      timestamp: new Date().toISOString()
    });
  } else if (weather.temperature < 0) {
    insights.push({
      id: `weather-${Date.now()}-1`,
      type: 'alert',
      title: 'Freezing Temperature',
      description: `Temperature at ${weather.temperature}°C. Roads may be icy, drive carefully.`,
      confidence: 0.95,
      category: 'weather',
      priority: 'high',
      timestamp: new Date().toISOString()
    });
  }

  if (weather.windSpeed > 40) {
    insights.push({
      id: `weather-${Date.now()}-2`,
      type: 'alert',
      title: 'Strong Wind Advisory',
      description: `Wind speed at ${weather.windSpeed} km/h. Secure loose objects and avoid tall structures.`,
      confidence: 0.90,
      category: 'weather',
      priority: 'medium',
      timestamp: new Date().toISOString()
    });
  }

  if (weather.humidity > 80) {
    insights.push({
      id: `weather-${Date.now()}-3`,
      type: 'recommendation',
      title: 'High Humidity',
      description: `Humidity at ${weather.humidity}%. May feel warmer than actual temperature.`,
      confidence: 0.85,
      category: 'weather',
      priority: 'low',
      timestamp: new Date().toISOString()
    });
  }

  return insights;
};

// Calculate overall city health score
const calculateCityScore = (
  weather: WeatherData,
  air: AirQualityData,
  traffic: TrafficData
): number => {
  let score = 100;
  if (air.aqi > 50) score -= Math.min((air.aqi - 50) * 0.3, 30);
  if (traffic.congestionLevel > 30) score -= (traffic.congestionLevel - 30) * 0.3;
  if (weather.temperature > 35 || weather.temperature < 0) score -= 10;
  if (weather.windSpeed > 30) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
};

// Generate predictions based on patterns
const generatePredictions = (
  weather: WeatherData,
  air: AirQualityData,
  traffic: TrafficData
): string[] => {
  const predictions: string[] = [];
  const hour = new Date().getHours();

  if (hour < 7) {
    predictions.push('Traffic congestion expected to increase between 7-9 AM');
  } else if (hour < 16) {
    predictions.push('Evening rush hour (5-7 PM) will likely see 40-60% congestion increase');
  } else if (hour < 20) {
    predictions.push('Traffic expected to normalize after 8 PM');
  }

  if (air.aqi < 50 && hour < 7) {
    predictions.push('Air quality may degrade during morning traffic hours');
  } else if (air.aqi > 100) {
    predictions.push('Air quality expected to improve by evening as traffic reduces');
  }

  if (weather.humidity > 70 && weather.temperature > 25) {
    predictions.push('Chance of afternoon thunderstorms based on humidity levels');
  }

  if (traffic.congestionLevel > 50 && air.aqi > 80) {
    predictions.push('Correlation detected: High traffic may further degrade air quality');
  }

  return predictions;
};

// Analyze trends from historical data
export const analyzeHistoricalTrends = (category: 'air' | 'traffic'): string => {
  if (category === 'air') {
    const records = airQualityStore.readAll() as AirQualityRecord[];
    if (records.length < 3) return 'Not enough historical data to analyze trends yet.';

    const recent = records.slice(-5);
    const avgAqi = recent.reduce((sum, r) => sum + r.aqi, 0) / recent.length;
    const earlier = records.slice(-10, -5);
    const earlierAvg = earlier.length > 0 ? earlier.reduce((sum, r) => sum + r.aqi, 0) / earlier.length : avgAqi;

    const trend = avgAqi > earlierAvg + 10 ? 'worsening' : avgAqi < earlierAvg - 10 ? 'improving' : 'stable';
    const hourlyData = getHourlyAverages(records, 'aqi');
    const peakHour = hourlyData.reduce((max, h) => h.value > max.value ? h : max, hourlyData[0]);

    return `Air quality trend is ${trend}. Average AQI: ${avgAqi.toFixed(0)}. Peak pollution typically occurs around ${peakHour?.hour || 8}:00. Based on ${records.length} records.`;
  }

  if (category === 'traffic') {
    const records = trafficStore.readAll() as TrafficRecord[];
    if (records.length < 3) return 'Not enough historical data to analyze trends yet.';

    const recent = records.slice(-5);
    const avgCongestion = recent.reduce((sum, r) => sum + r.congestionLevel, 0) / recent.length;
    const hourlyData = getHourlyAverages(records, 'congestionLevel');
    const peakHour = hourlyData.reduce((max, h) => h.value > max.value ? h : max, hourlyData[0]);

    return `Average congestion: ${avgCongestion.toFixed(0)}%. Peak traffic typically at ${peakHour?.hour || 17}:00. Average speed: ${(recent.reduce((sum, r) => sum + r.averageSpeed, 0) / recent.length).toFixed(0)} km/h. Based on ${records.length} records.`;
  }

  return 'Unknown category.';
};

// Get historical statistics
export const getHistoricalStats = (): string => {
  const airCount = airQualityStore.count();
  const trafficCount = trafficStore.count();
  const weatherCount = weatherStore.count();

  const airStats = airQualityStore.getStats();
  const trafficStats = trafficStore.getStats();

  return `Database contains ${airCount} air quality records, ${trafficCount} traffic records, and ${weatherCount} weather records. ` +
    (airStats.oldest ? `Data collection started: ${new Date(airStats.oldest).toLocaleDateString()}.` : '');
};

// Main AI analysis function
export const analyzeSmartCityData = (
  weather: WeatherData,
  air: AirQualityData,
  traffic: TrafficData
): CityAnalysis => {
  const allInsights: AIInsight[] = [
    ...analyzeTrafficPatterns(traffic),
    ...analyzeAirQuality(air),
    ...analyzeWeather(weather)
  ];

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  allInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const overallScore = calculateCityScore(weather, air, traffic);
  const predictions = generatePredictions(weather, air, traffic);

  const trafficStatus = traffic.congestionLevel > 70 ? 'Heavy' :
    traffic.congestionLevel > 40 ? 'Moderate' : 'Light';
  const airStatus = air.category;
  const weatherStatus = weather.description;

  // Calculate penalties for health score
  const aqiPenalty = air.aqi > 50 ? (air.aqi - 50) * 0.5 : 0;
  const trafficPenalty = traffic.congestionLevel > 30 ? (traffic.congestionLevel - 30) * 0.4 : 0;
  const healthScore = Math.max(0, 100 - (aqiPenalty * 0.6 + trafficPenalty * 0.4));

  return {
    overallScore: Math.round(overallScore), // Keep original overallScore for now, or replace with healthScore if intended
    trafficStatus,
    airStatus,
    weatherStatus,
    insights: allInsights,
    predictions,
    healthScore: Math.round(healthScore)
  };
};

// Enhanced Chatbot AI response generator (Now Hybrid: Local + Backend)
export const generateChatResponse = async (
  query: string,
  cityData: { weather: WeatherData; air: AirQualityData; traffic: TrafficData },
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<ChatAssistantResponse> => {
  try {
    // Try to hit the Python Backend LLM
    const userStr = localStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id ? parseInt(user.id) : null;

    const compactHistory = history
      .slice(-14)
      .map((m) => ({
        role: m.role,
        content: (m.content || '').replace(/\s+/g, ' ').trim().slice(0, 320)
      }));

    const response = await fetch('http://localhost:8000/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        user_id: userId,
        enable_internet_fallback: false,
        context: {
          ...cityData,
          history: compactHistory
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        response: data.response,
        intent: data.intent_detected,
        confidence: data.intent_confidence,
        source: data.source,
        web_sources: data.web_sources,
        processingTime: data.processing_time_ms,
        proactive_suggestions: data.proactive_suggestions,
        routing_reason: import.meta.env.DEV ? data.routing_reason : undefined,
        debug_trace_id: import.meta.env.DEV ? data.debug_trace_id : undefined
      };
    }
  } catch (e) {
    console.warn("Backend AI offline, falling back to local logic");
  }

  // Fallback to local logic if backend is down
  let fallbackText = '';
  const lowerQuery = query.toLowerCase();

  // Historical/trend queries
  if (lowerQuery.includes('history') || lowerQuery.includes('trend') || lowerQuery.includes('historical') || lowerQuery.includes('past')) {
    if (lowerQuery.includes('air') || lowerQuery.includes('quality') || lowerQuery.includes('pollution')) {
      fallbackText = analyzeHistoricalTrends('air');
    }
    else if (lowerQuery.includes('traffic') || lowerQuery.includes('congestion')) {
      fallbackText = analyzeHistoricalTrends('traffic');
    }
    else {
      fallbackText = getHistoricalStats();
    }
  }

  // Database/records queries
  else if (lowerQuery.includes('database') || lowerQuery.includes('records') || lowerQuery.includes('data') || lowerQuery.includes('stored')) {
    fallbackText = getHistoricalStats();
  }

  // Traffic queries
  else if (lowerQuery.includes('traffic') || lowerQuery.includes('congestion') || lowerQuery.includes('road') || lowerQuery.includes('drive')) {
    const { traffic } = cityData;
    const status = traffic.congestionLevel > 70 ? '🔴 Heavy' : traffic.congestionLevel > 40 ? '🟡 Moderate' : '🟢 Light';
    fallbackText = `Traffic Status: ${status}\n` +
      `• Congestion: ${traffic.congestionLevel}%\n` +
      `• Average Speed: ${traffic.averageSpeed} km/h\n` +
      `• Active Incidents: ${traffic.incidents}\n\n` +
      (traffic.congestionLevel > 50 ? '⚠️ Recommendation: Consider alternative routes or delay travel.' : '✅ Roads are relatively clear for travel.');
  }

  // Air quality queries
  else if (lowerQuery.includes('air') || lowerQuery.includes('pollution') || lowerQuery.includes('aqi') || lowerQuery.includes('breathe')) {
    const { air } = cityData;
    const emoji = air.aqi < 50 ? '🟢' : air.aqi < 100 ? '🟡' : air.aqi < 150 ? '🟠' : '🔴';
    fallbackText = `Air Quality: ${emoji} ${air.category}\n` +
      `• AQI: ${air.aqi}\n` +
      `• PM2.5: ${air.pm25.toFixed(1)} µg/m³\n` +
      `• PM10: ${air.pm10.toFixed(1)} µg/m³\n` +
      `• O₃: ${air.o3?.toFixed(1) || 'N/A'} µg/m³\n\n` +
      (air.aqi > 100 ? '⚠️ Sensitive groups should limit outdoor activities.' : '✅ Air quality is acceptable for outdoor activities.');
  }

  // Weather queries
  else if (lowerQuery.includes('weather') || lowerQuery.includes('temperature') || lowerQuery.includes('hot') || lowerQuery.includes('cold') || lowerQuery.includes('rain')) {
    const { weather } = cityData;
    fallbackText = `Weather in ${weather.cityName}: ${weather.description}\n` +
      `• Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)\n` +
      `• Humidity: ${weather.humidity}%\n` +
      `• Wind: ${weather.windSpeed} km/h\n` +
      `• Pressure: ${weather.pressure} hPa`;
  }

  // Prediction queries
  else if (lowerQuery.includes('predict') || lowerQuery.includes('forecast') || lowerQuery.includes('expect') || lowerQuery.includes('will') || lowerQuery.includes('next')) {
    const analysis = analyzeSmartCityData(cityData.weather, cityData.air, cityData.traffic);
    if (analysis.predictions.length > 0) {
      fallbackText = '🔮 AI Predictions:\n• ' + analysis.predictions.join('\n• ');
    }
    else {
      fallbackText = '🔮 Based on current data, conditions are expected to remain stable for the next few hours.';
    }
  }

  // Comparison queries
  else if (lowerQuery.includes('compare') || lowerQuery.includes('versus') || lowerQuery.includes('vs') || lowerQuery.includes('better') || lowerQuery.includes('worse')) {
    const airTrend = analyzeHistoricalTrends('air');
    const trafficTrend = analyzeHistoricalTrends('traffic');
    fallbackText = `📊 Comparison Analysis:\n\n${airTrend}\n\n${trafficTrend}`;
  }

  // General city status
  else if (lowerQuery.includes('status') || lowerQuery.includes('overview') || lowerQuery.includes('how') || lowerQuery.includes('city') || lowerQuery.includes('summary')) {
    const analysis = analyzeSmartCityData(cityData.weather, cityData.air, cityData.traffic);
    const scoreEmoji = analysis.overallScore > 80 ? '🌟' : analysis.overallScore > 60 ? '👍' : analysis.overallScore > 40 ? '⚠️' : '🚨';
    fallbackText = `${scoreEmoji} City Health Score: ${analysis.overallScore}/100\n\n` +
      `🚗 Traffic: ${analysis.trafficStatus}\n` +
      `💨 Air Quality: ${analysis.airStatus}\n` +
      `🌤️ Weather: ${analysis.weatherStatus}\n\n` +
      (analysis.insights.length > 0 ? `📢 Active Alerts: ${analysis.insights.filter(i => i.type === 'alert').length}` : '✅ No active alerts.');
  }

  // Alerts queries
  else if (lowerQuery.includes('alert') || lowerQuery.includes('warning') || lowerQuery.includes('danger') || lowerQuery.includes('problem')) {
    const analysis = analyzeSmartCityData(cityData.weather, cityData.air, cityData.traffic);
    const alerts = analysis.insights.filter(i => i.type === 'alert' || i.priority === 'high' || i.priority === 'critical');
    if (alerts.length === 0) {
      fallbackText = '✅ No active alerts or warnings. City conditions are normal.';
    }
    else {
      fallbackText = '🚨 Active Alerts:\n' + alerts.map(a => `• ${a.title}: ${a.description}`).join('\n');
    }
  }

  // Help/capabilities
  else if (lowerQuery.includes('help') || lowerQuery.includes('can you') || lowerQuery.includes('what can')) {
    fallbackText = '🤖 I can help you with:\n\n' +
      '• Traffic conditions & congestion\n' +
      '• Air quality & pollution levels\n' +
      '• Weather information\n' +
      '• City predictions & forecasts\n' +
      '• Historical trends & analysis\n' +
      '• Database records & statistics\n' +
      '• Active alerts & warnings\n\n' +
      'Try: "Show traffic trends" or "What\'s the air quality history?"';
  }

  // Default response
  else {
    fallbackText = '🏙️ I\'m your Smart City AI assistant. I can provide real-time information about:\n\n' +
      '• Traffic & road conditions\n' +
      '• Air quality & pollution\n' +
      '• Weather & forecasts\n' +
      '• Historical trends\n' +
      '• City predictions\n\n' +
      'What would you like to know?';
  }

  return {
    response: fallbackText,
    source: 'local_engine',
    confidence: 1.0
  };
};
