/**
 * Cache middleware for weather API responses
 */
function cacheMiddleware(duration = 300000) {
  return (req, res, next) => {
    // Set cache headers for client-side caching
    res.set({
      'Cache-Control': `public, max-age=${Math.floor(duration / 1000)}`,
      'Expires': new Date(Date.now() + duration).toUTCString()
    });
    next();
  };
}

/**
 * No-cache middleware for dynamic content
 */
function noCacheMiddleware(req, res, next) {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Expires': '0',
    'Pragma': 'no-cache'
  });
  next();
}

module.exports = {
  cacheMiddleware,
  noCacheMiddleware
};