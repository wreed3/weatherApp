var express = require('express');
var router = express.Router();
var axios = require('axios');
var radarConfig = require('../config/radar');

// In-memory cache for radar data
let radarCache = {
  data: null,
  timestamp: 0
};

/**
 * Check if cache is still valid
 */
function isCacheValid() {
  return radarCache.data && 
         (Date.now() - radarCache.timestamp < radarConfig.cache.ttl);
}

/**
 * GET /api/radar/maps
 * Fetch available radar maps from RainViewer API
 */
router.get('/api/maps', async function(req, res, next) {
  try {
    // Return cached data if still valid
    if (isCacheValid()) {
      return res.json(radarCache.data);
    }

    // Fetch fresh data from RainViewer
    const response = await axios.get(radarConfig.api.baseUrl, {
      timeout: 5000
    });

    // Update cache
    radarCache.data = response.data;
    radarCache.timestamp = Date.now();

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching radar maps:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch radar data',
      message: error.message 
    });
  }
});

/**
 * GET /api/radar/config
 * Return radar configuration for frontend
 */
router.get('/api/config', function(req, res) {
  res.json({
    map: radarConfig.map,
    radar: radarConfig.radar,
    animation: radarConfig.animation,
    colors: radarConfig.colors,
    tileUrl: radarConfig.api.tileUrl
  });
});

/**
 * GET /radar
 * Render radar view page
 */
router.get('/', function(req, res) {
  res.render('radar', { 
    title: 'Weather Radar',
    config: radarConfig 
  });
});

module.exports = router;