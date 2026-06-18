const express = require('express');
const router = express.Router();
const https = require('https');

// Cache for radar data
const radarCache = {
  timestamps: { data: null, expiry: 0 },
  tiles: new Map()
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get available radar timestamps from RainViewer API
 */
router.get('/timestamps', async (req, res) => {
  try {
    // Check cache first
    if (radarCache.timestamps.data && Date.now() < radarCache.timestamps.expiry) {
      return res.json(radarCache.timestamps.data);
    }

    // Fetch from RainViewer API
    const data = await fetchFromAPI('https://api.rainviewer.com/public/weather-maps.json');
    
    // Cache the result
    radarCache.timestamps.data = data;
    radarCache.timestamps.expiry = Date.now() + CACHE_TTL;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching radar timestamps:', error);
    res.status(500).json({ error: 'Failed to fetch radar data' });
  }
});

/**
 * Proxy radar tiles from RainViewer
 * This helps with CORS and allows us to cache tiles
 */
router.get('/tile/:host/:path(*)', (req, res) => {
  const { host, path } = req.params;
  const tileUrl = `https://${host}/${path}`;
  
  // Check tile cache
  const cacheKey = tileUrl;
  const cached = radarCache.tiles.get(cacheKey);
  
  if (cached && Date.now() < cached.expiry) {
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=300');
    return res.send(cached.data);
  }

  // Fetch tile
  https.get(tileUrl, (apiRes) => {
    const chunks = [];
    
    apiRes.on('data', (chunk) => chunks.push(chunk));
    
    apiRes.on('end', () => {
      const buffer = Buffer.concat(chunks);
      
      // Cache the tile
      radarCache.tiles.set(cacheKey, {
        data: buffer,
        expiry: Date.now() + CACHE_TTL
      });
      
      // Clean old cache entries if cache is too large
      if (radarCache.tiles.size > 100) {
        const now = Date.now();
        for (const [key, value] of radarCache.tiles.entries()) {
          if (now >= value.expiry) {
            radarCache.tiles.delete(key);
          }
        }
      }
      
      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'public, max-age=300');
      res.send(buffer);
    });
  }).on('error', (error) => {
    console.error('Error fetching tile:', error);
    res.status(500).json({ error: 'Failed to fetch tile' });
  });
});

/**
 * Geocoding endpoint for location search
 */
router.get('/geocode', async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`;
    const data = await fetchFromAPI(url, {
      'User-Agent': 'WeatherApp/1.0'
    });
    
    res.json(data);
  } catch (error) {
    console.error('Error geocoding:', error);
    res.status(500).json({ error: 'Failed to geocode location' });
  }
});

/**
 * Reverse geocoding endpoint
 */
router.get('/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Parameters "lat" and "lon" are required' });
  }
  
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const data = await fetchFromAPI(url, {
      'User-Agent': 'WeatherApp/1.0'
    });
    
    res.json(data);
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    res.status(500).json({ error: 'Failed to reverse geocode location' });
  }
});

/**
 * Helper function to fetch data from external APIs
 */
function fetchFromAPI(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

module.exports = router;