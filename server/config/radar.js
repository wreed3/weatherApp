/**
 * Weather Radar Configuration
 * Using RainViewer API - free, no API key required
 */

module.exports = {
  // RainViewer API endpoints
  api: {
    baseUrl: 'https://api.rainviewer.com/public/weather-maps.json',
    tileUrl: 'https://tilecache.rainviewer.com'
  },

  // Default map settings
  map: {
    defaultCenter: [39.8283, -98.5795], // Center of US
    defaultZoom: 5,
    minZoom: 3,
    maxZoom: 12
  },

  // Radar layer settings
  radar: {
    opacity: 0.6,
    tileSize: 256,
    // Available radar types: precipitation, clouds, temperature
    defaultType: 'precipitation'
  },

  // Animation settings
  animation: {
    frameCount: 10, // Number of past frames to show
    speed: 500, // Milliseconds between frames
    loop: true
  },

  // Cache settings
  cache: {
    ttl: 300000 // 5 minutes in milliseconds
  },

  // Color scheme for radar legend
  colors: [
    { value: 0, color: 'transparent', label: 'None' },
    { value: 0.1, color: '#00FFFF', label: 'Light' },
    { value: 2, color: '#0080FF', label: 'Moderate' },
    { value: 5, color: '#00FF00', label: 'Heavy' },
    { value: 10, color: '#FFFF00', label: 'Very Heavy' },
    { value: 20, color: '#FF8000', label: 'Intense' },
    { value: 50, color: '#FF0000', label: 'Extreme' }
  ]
};