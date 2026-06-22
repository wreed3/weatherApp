const axios = require('axios');
const config = require('../config/weather-config');

class WeatherService {
  constructor() {
    this.radarCache = new Map();
    this.weatherCache = new Map();
  }

  /**
   * Get available radar frame timestamps from RainViewer API
   */
  async getRadarTimestamps() {
    try {
      const cacheKey = 'radar_timestamps';
      const cached = this.radarCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < config.cacheDuration) {
        return cached.data;
      }

      const response = await axios.get(`${config.radarApiUrl}/api/maps.json`, {
        timeout: 10000
      });

      const timestamps = response.data.map(item => ({
        timestamp: item.time,
        path: item.path
      }));

      this.radarCache.set(cacheKey, {
        data: timestamps,
        timestamp: Date.now()
      });

      return timestamps;
    } catch (error) {
      console.error('Error fetching radar timestamps:', error.message);
      throw new Error('Failed to fetch radar data');
    }
  }

  /**
   * Generate radar tile URL for specific timestamp and tile coordinates
   */
  getRadarTileUrl(timestamp, zoom, x, y) {
    return `${config.radarApiUrl}${timestamp}/256/${zoom}/${x}/${y}/2/1_1.png`;
  }

  /**
   * Get current weather conditions for a location
   */
  async getCurrentWeather(lat, lon) {
    try {
      const cacheKey = `weather_${lat}_${lon}`;
      const cached = this.weatherCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < config.cacheDuration) {
        return cached.data;
      }

      if (!config.apiKey) {
        // Return mock data if no API key configured
        return this.getMockWeather(lat, lon);
      }

      const response = await axios.get(`${config.apiUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: config.apiKey,
          units: 'imperial'
        },
        timeout: 10000
      });

      const weatherData = {
        location: response.data.name,
        temperature: Math.round(response.data.main.temp),
        feelsLike: Math.round(response.data.main.feels_like),
        humidity: response.data.main.humidity,
        windSpeed: Math.round(response.data.wind.speed),
        windDirection: response.data.wind.deg,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        pressure: response.data.main.pressure,
        visibility: response.data.visibility,
        coordinates: {
          lat: response.data.coord.lat,
          lon: response.data.coord.lon
        }
      };

      this.weatherCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (error) {
      console.error('Error fetching current weather:', error.message);
      return this.getMockWeather(lat, lon);
    }
  }

  /**
   * Get mock weather data for development/fallback
   */
  getMockWeather(lat, lon) {
    return {
      location: 'Sample Location',
      temperature: 72,
      feelsLike: 70,
      humidity: 65,
      windSpeed: 8,
      windDirection: 180,
      description: 'partly cloudy',
      icon: '02d',
      pressure: 1013,
      visibility: 10000,
      coordinates: { lat, lon }
    };
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const now = Date.now();
    
    for (const [key, value] of this.radarCache.entries()) {
      if (now - value.timestamp > config.cacheDuration) {
        this.radarCache.delete(key);
      }
    }
    
    for (const [key, value] of this.weatherCache.entries()) {
      if (now - value.timestamp > config.cacheDuration) {
        this.weatherCache.delete(key);
      }
    }
  }
}

module.exports = new WeatherService();