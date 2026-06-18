var express = require('express');
var router = express.Router();
var axios = require('axios');

/**
 * GET /radar/tiles
 * Fetches available radar tile timestamps from Rainviewer API
 */
router.get('/tiles', async function(req, res, next) {
  try {
    const response = await axios.get('https://api.rainviewer.com/public/weather-maps.json');
    
    // Extract radar data
    const radarData = {
      host: response.data.host,
      radar: response.data.radar,
      satellite: response.data.satellite
    };
    
    res.json(radarData);
  } catch (error) {
    console.error('Error fetching radar data:', error.message);
    res.status(500).json({ error: 'Failed to fetch radar data' });
  }
});

/**
 * GET /radar/location
 * Returns radar coverage info for a specific location
 */
router.get('/location', function(req, res, next) {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }
  
  // Return location info for centering the map
  res.json({
    center: [parseFloat(lat), parseFloat(lon)],
    zoom: 8
  });
});

module.exports = router;