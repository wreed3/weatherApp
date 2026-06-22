const express = require('express');
const router = express.Router();
const weatherService = require('../services/weather-service');

/**
 * GET /api/weather/radar/timestamps
 * Get available radar frame timestamps
 */
router.get('/radar/timestamps', async (req, res, next) => {
  try {
    const timestamps = await weatherService.getRadarTimestamps();
    res.json({
      success: true,
      data: timestamps,
      count: timestamps.length
    });
  } catch (error) {
    console.error('Radar timestamps error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch radar timestamps',
      message: error.message
    });
  }
});

/**
 * GET /api/weather/radar/tile/:timestamp/:z/:x/:y
 * Proxy radar tile requests (optional - can also use direct URLs)
 */
router.get('/radar/tile/:timestamp/:z/:x/:y', (req, res) => {
  const { timestamp, z, x, y } = req.params;
  const tileUrl = weatherService.getRadarTileUrl(timestamp, z, x, y);
  
  // Redirect to the tile URL
  res.redirect(tileUrl);
});

/**
 * GET /api/weather/current/:lat/:lon
 * Get current weather conditions for a location
 */
router.get('/current/:lat/:lon', async (req, res, next) => {
  try {
    const lat = parseFloat(req.params.lat);
    const lon = parseFloat(req.params.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates',
        message: 'Latitude and longitude must be valid numbers'
      });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates',
        message: 'Coordinates out of valid range'
      });
    }

    const weather = await weatherService.getCurrentWeather(lat, lon);
    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    console.error('Current weather error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current weather',
      message: error.message
    });
  }
});

/**
 * GET /api/weather/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;