var express = require('express');
var router = express.Router();
var https = require('https');

// Cache for radar timestamps (5 minute TTL)
var timestampCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 minutes
};

/**
 * Fetch available radar timestamps from RainViewer API
 */
function fetchRadarTimestamps() {
  return new Promise((resolve, reject) => {
    // Check cache first
    var now = Date.now();
    if (timestampCache.data && (now - timestampCache.timestamp) < timestampCache.ttl) {
      return resolve(timestampCache.data);
    }

    var options = {
      hostname: 'api.rainviewer.com',
      path: '/public/weather-maps.json',
      method: 'GET'
    };

    https.get(options, function(response) {
      var data = '';

      response.on('data', function(chunk) {
        data += chunk;
      });

      response.on('end', function() {
        try {
          var parsed = JSON.parse(data);
          // Update cache
          timestampCache.data = parsed;
          timestampCache.timestamp = now;
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', function(err) {
      reject(err);
    });
  });
}

/**
 * GET /radar - Render radar page
 */
router.get('/', function(req, res, next) {
  res.render('radar', { 
    title: 'Weather Radar',
    page: 'radar'
  });
});

/**
 * GET /radar/api/timestamps - Get available radar frame timestamps
 */
router.get('/api/timestamps', function(req, res, next) {
  fetchRadarTimestamps()
    .then(function(data) {
      res.json({
        success: true,
        data: data
      });
    })
    .catch(function(err) {
      console.error('Error fetching radar timestamps:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch radar data'
      });
    });
});

/**
 * GET /radar/api/geocode - Geocode location search
 */
router.get('/api/geocode', function(req, res, next) {
  var query = req.query.q;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Search query required'
    });
  }

  var options = {
    hostname: 'nominatim.openstreetmap.org',
    path: '/search?q=' + encodeURIComponent(query) + '&format=json&limit=5',
    method: 'GET',
    headers: {
      'User-Agent': 'WeatherApp/1.0'
    }
  };

  https.get(options, function(response) {
    var data = '';

    response.on('data', function(chunk) {
      data += chunk;
    });

    response.on('end', function() {
      try {
        var parsed = JSON.parse(data);
        res.json({
          success: true,
          results: parsed.map(function(item) {
            return {
              name: item.display_name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon)
            };
          })
        });
      } catch (e) {
        res.status(500).json({
          success: false,
          error: 'Failed to parse geocoding results'
        });
      }
    });
  }).on('error', function(err) {
    console.error('Geocoding error:', err);
    res.status(500).json({
      success: false,
      error: 'Geocoding service unavailable'
    });
  });
});

module.exports = router;