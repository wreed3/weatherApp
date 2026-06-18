/**
 * Location Services
 * Handles geolocation and location search
 */
var LocationService = (function() {
  'use strict';

  var defaultLocation = {
    lat: 39.8283,
    lon: -98.5795,
    name: 'United States'
  };

  /**
   * Get user's current location using browser geolocation
   */
  function getCurrentLocation(callback) {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      callback(null, defaultLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function(position) {
        var location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          name: 'Current Location'
        };
        saveLastLocation(location);
        callback(null, location);
      },
      function(error) {
        console.error('Geolocation error:', error);
        callback(error, getLastLocation() || defaultLocation);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }

  /**
   * Search for location by name
   */
  function searchLocation(query, callback) {
    if (!query || query.trim().length === 0) {
      callback(new Error('Empty search query'), []);
      return;
    }

    fetch('/radar/api/geocode?q=' + encodeURIComponent(query))
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.success) {
          callback(null, data.results);
        } else {
          callback(new Error(data.error || 'Search failed'), []);
        }
      })
      .catch(function(err) {
        console.error('Search error:', err);
        callback(err, []);
      });
  }

  /**
   * Save last known location to localStorage
   */
  function saveLastLocation(location) {
    try {
      localStorage.setItem('lastLocation', JSON.stringify(location));
    } catch (e) {
      console.warn('Failed to save location to localStorage:', e);
    }
  }

  /**
   * Get last known location from localStorage
   */
  function getLastLocation() {
    try {
      var stored = localStorage.getItem('lastLocation');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to retrieve location from localStorage:', e);
    }
    return null;
  }

  /**
   * Get initial location (last known or current or default)
   */
  function getInitialLocation(callback) {
    var lastLocation = getLastLocation();
    
    if (lastLocation) {
      callback(null, lastLocation);
    } else {
      getCurrentLocation(callback);
    }
  }

  /**
   * Request location permission
   */
  function requestPermission(callback) {
    if (!navigator.permissions) {
      // Permissions API not supported, try geolocation directly
      getCurrentLocation(callback);
      return;
    }

    navigator.permissions.query({ name: 'geolocation' })
      .then(function(result) {
        if (result.state === 'granted') {
          getCurrentLocation(callback);
        } else if (result.state === 'prompt') {
          getCurrentLocation(callback);
        } else {
          // Permission denied
          callback(new Error('Location permission denied'), defaultLocation);
        }
      })
      .catch(function(err) {
        console.error('Permission query error:', err);
        getCurrentLocation(callback);
      });
  }

  // Public API
  return {
    getCurrentLocation: getCurrentLocation,
    searchLocation: searchLocation,
    getInitialLocation: getInitialLocation,
    requestPermission: requestPermission,
    saveLastLocation: saveLastLocation,
    getLastLocation: getLastLocation,
    defaultLocation: defaultLocation
  };
})();