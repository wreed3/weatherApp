require('dotenv').config();

module.exports = {
  apiKey: process.env.WEATHER_API_KEY || '',
  apiUrl: process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',
  radarApiUrl: process.env.RADAR_API_URL || 'https://tilecache.rainviewer.com',
  cacheDuration: parseInt(process.env.CACHE_DURATION) || 300000, // 5 minutes
  defaultLocation: {
    lat: parseFloat(process.env.DEFAULT_LAT) || 39.8283,
    lon: parseFloat(process.env.DEFAULT_LON) || -98.5795,
    zoom: parseInt(process.env.DEFAULT_ZOOM) || 4
  }
};