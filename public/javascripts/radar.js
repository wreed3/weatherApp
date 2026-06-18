/**
 * Radar Map Component
 * Handles doppler radar visualization with animation
 */
var RadarMap = (function() {
  'use strict';

  var map = null;
  var radarLayers = [];
  var currentFrameIndex = 0;
  var timestamps = [];
  var isPlaying = false;
  var animationTimer = null;
  var animationSpeed = 500; // ms between frames
  var userMarker = null;
  var radarOpacity = 0.6;

  /**
   * Initialize the radar map
   */
  function init(containerId, lat, lon) {
    // Create map centered on provided coordinates
    map = L.map(containerId, {
      center: [lat, lon],
      zoom: 7,
      zoomControl: true
    });

    // Add base tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add user location marker
    addUserMarker(lat, lon);

    // Load radar data
    loadRadarTimestamps();

    // Set up event listeners
    setupEventListeners();
  }

  /**
   * Add marker for user's location
   */
  function addUserMarker(lat, lon) {
    if (userMarker) {
      map.removeLayer(userMarker);
    }

    var icon = L.divIcon({
      className: 'user-location-marker',
      html: '<div class="marker-pin"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    userMarker = L.marker([lat, lon], { icon: icon }).addTo(map);
  }

  /**
   * Load available radar timestamps from API
   */
  function loadRadarTimestamps() {
    showLoading(true);

    fetch('/radar/api/timestamps')
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.success && data.data) {
          timestamps = data.data.radar.past;
          updateTimeline();
          loadRadarFrames();
        } else {
          showError('Failed to load radar data');
        }
      })
      .catch(function(err) {
        console.error('Error loading radar timestamps:', err);
        showError('Unable to connect to radar service');
      })
      .finally(function() {
        showLoading(false);
      });
  }

  /**
   * Load radar frame images and add as map layers
   */
  function loadRadarFrames() {
    // Clear existing layers
    radarLayers.forEach(function(layer) {
      map.removeLayer(layer);
    });
    radarLayers = [];

    // Create layer for each timestamp
    timestamps.forEach(function(item, index) {
      var layer = L.tileLayer(
        'https://tilecache.rainviewer.com/v2/radar/' + item.path + '/256/{z}/{x}/{y}/2/1_1.png',
        {
          opacity: 0,
          zIndex: 10,
          tileSize: 256
        }
      );

      radarLayers.push(layer);
      layer.addTo(map);
    });

    // Show first frame
    if (radarLayers.length > 0) {
      showFrame(0);
    }
  }

  /**
   * Display specific radar frame
   */
  function showFrame(index) {
    if (index < 0 || index >= radarLayers.length) {
      return;
    }

    // Hide all frames
    radarLayers.forEach(function(layer) {
      layer.setOpacity(0);
    });

    // Show selected frame
    radarLayers[index].setOpacity(radarOpacity);
    currentFrameIndex = index;

    // Update UI
    updateTimestamp(timestamps[index].time);
    updateTimelinePosition(index);
  }

  /**
   * Start radar animation
   */
  function play() {
    if (isPlaying) return;

    isPlaying = true;
    updatePlayButton();

    animationTimer = setInterval(function() {
      var nextIndex = (currentFrameIndex + 1) % radarLayers.length;
      showFrame(nextIndex);
    }, animationSpeed);
  }

  /**
   * Pause radar animation
   */
  function pause() {
    if (!isPlaying) return;

    isPlaying = false;
    updatePlayButton();

    if (animationTimer) {
      clearInterval(animationTimer);
      animationTimer = null;
    }
  }

  /**
   * Step to next frame
   */
  function nextFrame() {
    pause();
    var nextIndex = (currentFrameIndex + 1) % radarLayers.length;
    showFrame(nextIndex);
  }

  /**
   * Step to previous frame
   */
  function previousFrame() {
    pause();
    var prevIndex = currentFrameIndex - 1;
    if (prevIndex < 0) {
      prevIndex = radarLayers.length - 1;
    }
    showFrame(prevIndex);
  }

  /**
   * Change animation speed
   */
  function setSpeed(speed) {
    var speeds = {
      '0.5x': 1000,
      '1x': 500,
      '2x': 250,
      '4x': 125
    };

    animationSpeed = speeds[speed] || 500;

    // Restart animation if playing
    if (isPlaying) {
      pause();
      play();
    }
  }

  /**
   * Change radar opacity
   */
  function setOpacity(opacity) {
    radarOpacity = opacity;
    if (radarLayers[currentFrameIndex]) {
      radarLayers[currentFrameIndex].setOpacity(opacity);
    }
  }

  /**
   * Center map on coordinates
   */
  function centerOn(lat, lon, zoom) {
    map.setView([lat, lon], zoom || 7);
    addUserMarker(lat, lon);
  }

  /**
   * Set up UI event listeners
   */
  function setupEventListeners() {
    var playBtn = document.getElementById('play-btn');
    var prevBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    var speedSelect = document.getElementById('speed-select');
    var opacitySlider = document.getElementById('opacity-slider');
    var timeline = document.getElementById('timeline');

    if (playBtn) {
      playBtn.addEventListener('click', function() {
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', previousFrame);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', nextFrame);
    }

    if (speedSelect) {
      speedSelect.addEventListener('change', function() {
        setSpeed(this.value);
      });
    }

    if (opacitySlider) {
      opacitySlider.addEventListener('input', function() {
        setOpacity(parseFloat(this.value));
      });
    }

    if (timeline) {
      timeline.addEventListener('input', function() {
        pause();
        var index = parseInt(this.value);
        showFrame(index);
      });
    }
  }

  /**
   * Update play button state
   */
  function updatePlayButton() {
    var btn = document.getElementById('play-btn');
    if (btn) {
      btn.textContent = isPlaying ? 'Pause' : 'Play';
      btn.className = isPlaying ? 'btn-pause' : 'btn-play';
    }
  }

  /**
   * Update timestamp display
   */
  function updateTimestamp(unixTime) {
    var elem = document.getElementById('current-time');
    if (elem) {
      var date = new Date(unixTime * 1000);
      elem.textContent = formatTime(date);
    }
  }

  /**
   * Update timeline slider
   */
  function updateTimeline() {
    var timeline = document.getElementById('timeline');
    if (timeline && timestamps.length > 0) {
      timeline.max = timestamps.length - 1;
      timeline.value = 0;
    }
  }

  /**
   * Update timeline position
   */
  function updateTimelinePosition(index) {
    var timeline = document.getElementById('timeline');
    if (timeline) {
      timeline.value = index;
    }
  }

  /**
   * Format time for display
   */
  function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
  }

  /**
   * Show loading indicator
   */
  function showLoading(show) {
    var loader = document.getElementById('radar-loader');
    if (loader) {
      loader.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    var errorElem = document.getElementById('radar-error');
    if (errorElem) {
      errorElem.textContent = message;
      errorElem.style.display = 'block';
      setTimeout(function() {
        errorElem.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Refresh radar data
   */
  function refresh() {
    pause();
    loadRadarTimestamps();
  }

  // Public API
  return {
    init: init,
    play: play,
    pause: pause,
    nextFrame: nextFrame,
    previousFrame: previousFrame,
    setSpeed: setSpeed,
    setOpacity: setOpacity,
    centerOn: centerOn,
    refresh: refresh
  };
})();