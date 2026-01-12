// Real-time sensor data from open APIs for Smart City

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  feelsLike?: number;
  cityName: string;
}

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  category: string;
  color: string;
}

export interface TrafficData {
  congestionLevel: number;
  averageSpeed: number;
  incidents: number;
}

export interface CityStats {
  weather: WeatherData;
  airQuality: AirQualityData;
  traffic: TrafficData;
  timestamp: string;
}

const CITY_COORDS = { lat: 43.2567, lon: 76.9285 }; // Almaty

export const fetchWeatherData = async (): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${CITY_COORDS.lat}&longitude=${CITY_COORDS.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&timezone=auto`
    );

    if (!response.ok) throw new Error('Weather API failed');

    const data = await response.json();
    const current = data.current;

    const getWeatherDescription = (code: number) => {
      if (code === 0) return 'Clear sky';
      if (code <= 3) return 'Partly cloudy';
      if (code <= 48) return 'Foggy';
      if (code <= 67) return 'Rainy';
      if (code <= 77) return 'Snowy';
      if (code <= 82) return 'Rain showers';
      return 'Stormy';
    };

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      description: getWeatherDescription(current.weather_code),
      icon: current.weather_code === 0 ? '01d' : '02d',
      windSpeed: current.wind_speed_10m,
      pressure: current.surface_pressure,
      feelsLike: current.temperature_2m - 2,
      cityName: 'Almaty',
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return {
      temperature: 18,
      description: 'Clear sky',
      icon: '01d',
      humidity: 45,
      windSpeed: 3,
      pressure: 720,
      cityName: 'Almaty',
    };
  }
};

// Backend API URL
const BACKEND_URL = 'http://localhost:8000/api';

export const fetchAirQualityData = async (): Promise<AirQualityData> => {
  try {
    const response = await fetch(`${BACKEND_URL}/sensors/qa`);
    if (!response.ok) throw new Error('Air Quality API failed');
    const data = await response.json();

    const getCategory = (aqi: number) => {
      if (aqi <= 50) return { category: 'Good', color: '#00e400' };
      if (aqi <= 100) return { category: 'Moderate', color: '#ffff00' };
      if (aqi <= 150) return { category: 'Unhealthy for Sensitive', color: '#ff7e00' };
      if (aqi <= 200) return { category: 'Unhealthy', color: '#ff0000' };
      if (aqi <= 300) return { category: 'Very Unhealthy', color: '#8f3f97' };
      return { category: 'Hazardous', color: '#7e0023' };
    };

    const { category, color } = getCategory(data.aqi);

    return {
      aqi: data.aqi,
      pm25: data.pm25,
      pm10: data.pm10 || 0,
      o3: data.o3 || 0,
      no2: data.no2 || 0,
      category,
      color,
    };
  } catch (error) {
    console.error('Air quality fetch error:', error);
    return {
      aqi: 50,
      pm25: 12,
      pm10: 20,
      o3: 40,
      no2: 10,
      category: 'Good',
      color: '#00e400',
    };
  }
};

export const fetchTrafficData = async (): Promise<TrafficData> => {
  try {
    const response = await fetch(`${BACKEND_URL}/transport/traffic`);
    if (!response.ok) throw new Error('Traffic API failed');
    const data = await response.json();

    return {
      congestionLevel: data.congestion_level * 10, // Scale 1-10 to 0-100
      averageSpeed: data.avg_speed_kmh,
      incidents: data.incidents,
    };
  } catch (error) {
    console.error('Traffic fetch error:', error);
    return {
      congestionLevel: 45,
      averageSpeed: 40,
      incidents: 1,
    };
  }
};

export const fetchCityStats = async (): Promise<CityStats> => {
  const [weather, airQuality, traffic] = await Promise.all([
    fetchWeatherData(),
    fetchAirQualityData(),
    fetchTrafficData(),
  ]);

  return {
    weather,
    airQuality,
    traffic,
    timestamp: new Date().toISOString(),
  };
};
