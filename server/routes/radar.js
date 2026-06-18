const express = require('express');
const router = express.Router();
const https = require('https');

// Cache for radar data
const cache = {
  timestamps: { data: null, expires: 0 },
  tiles: new Map()
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const TILE_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Fetch data from RainViewer API
 */
function fetchFromRainViewer(path) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.rainviewer.com${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Get available radar timestamps
 */
router.get('/timestamps', async (req, res) => {
  try {
    const now = Date.now();
    
    // Check cache
    if (cache.timestamps.data && cache.timestamps.expires > now) {
      return res.json(cache.timestamps.data);
    }
    
    // Fetch from RainViewer
    const data = await fetchFromRainViewer('/public/weather-maps.json');
    
    // Cache the result
    cache.timestamps.data = data;
    cache.timestamps.expires = now + CACHE_DURATION;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching radar timestamps:', error);
    res.status(500).json({ error: 'Failed to fetch radar data' });
  }
});

/**
 * Proxy radar tiles from RainViewer
 */
router.get('/tile/:size/:z/:x/:y/:color/:options', async (req, res) => {
  try {
    const { size, z, x, y, color, options } = req.params;
    const cacheKey = `${size}/${z}/${x}/${y}/${color}/${options}`;
    const now = Date.now();
    
    // Check cache
    const cached = cache.tiles.get(cacheKey);
    if (cached && cached.expires > now) {
      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'public, max-age=600');
      return res.send(cached.data);
    }
    
    // Fetch from RainViewer
    const url = `https://tilecache.rainviewer.com${req.path}`;
    https.get(url, (apiRes) => {
      const chunks = [];
      
      apiRes.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      apiRes.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        // Cache the tile
        cache.tiles.set(cacheKey, {
          data: buffer,
          expires: now + TILE_CACHE_DURATION
        });
        
        // Clean old cache entries (simple LRU)
        if (cache.tiles.size > 1000) {
          const keysToDelete = Array.from(cache.tiles.keys()).slice(0, 200);
          keysToDelete.forEach(key => cache.tiles.delete(key));
        }
        
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=600');
        res.send(buffer);
      });
    }).on('error', (error) => {
      console.error('Error fetching tile:', error);
      res.status(500).send('Failed to fetch tile');
    });
  } catch (error) {
    console.error('Error in tile route:', error);
    res.status(500).send('Failed to fetch tile');
  }
});

/**
 * Geocoding search endpoint
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    // Use Nominatim for geocoding (free, no API key required)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`;
    
    https.get(url, {
      headers: {
        'User-Agent': 'WeatherApp/1.0'
      }
    }, (apiRes) => {
      let data = '';
      
      apiRes.on('data', (chunk) => {
        data += chunk;
      });
      
      apiRes.on('end', () => {
        try {
          const results = JSON.parse(data);
          res.json(results);
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse geocoding results' });
        }
      });
    }).on('error', (error) => {
      console.error('Geocoding error:', error);
      res.status(500).json({ error: 'Failed to geocode location' });
    });
  } catch (error) {
    console.error('Error in search route:', error);
    res.status(500).json({ error: 'Failed to search location' });
  }
});

module.exports = router;