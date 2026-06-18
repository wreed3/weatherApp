/**
 * Weather Radar Map Controller
 */

(function() {
  'use strict';

  // Global state
  let map = null;
  let radarLayers = [];
  let currentFrameIndex = 0;
  let animationTimer = null;
  let isPlaying = true;
  let config = null;
  let radarData = null;

  /**
   * Initialize the radar map
   */
  async function initMap() {
    try {
      // Fetch configuration
      const configResponse = await fetch('/radar/api/config');
      config = await configResponse.json();

      // Initialize Leaflet map
      map = L.map('radar-map', {
        center: config.map.defaultCenter,
        zoom: config.map.defaultZoom,
        minZoom: config.map.minZoom,
        maxZoom: config.map.maxZoom
      });

      // Add base tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Load radar data
      await loadRadarData();

      // Set up controls
      setupControls();

      // Start animation
      if (isPlaying) {
        startAnimation();
      }

    } catch (error) {
      console.error('Error initializing map:', error);
      showError('Failed to load radar data. Please try again later.');
    }
  }

  /**
   * Load radar data from API
   */
  async function loadRadarData() {
    const response = await fetch('/radar/api/maps');
    radarData = await response.json();

    // Clear existing layers
    radarLayers.forEach(layer => map.removeLayer(layer.layer));
    radarLayers = [];

    // Get past frames (limited by config)
    const frames = radarData.radar.past.slice(-config.animation.frameCount);
    
    // Add current nowcast frame
    if (radarData.radar.nowcast && radarData.radar.nowcast.length > 0) {
      frames.push(radarData.radar.nowcast[0]);
    }

    // Create tile layers for each frame
    frames.forEach((frame, index) => {
      const tileUrl = `${config.tileUrl}/v2/radar/${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
      
      const layer = L.tileLayer(tileUrl, {
        opacity: 0,
        tileSize: 256,
        zIndex: 10
      });

      layer.addTo(map);
      radarLayers.push({
        layer: layer,
        timestamp: frame.time
      });
    });

    // Show first frame
    if (radarLayers.length > 0) {
      showFrame(0);
    }

    updateTimestamp();
  }

  /**
   * Show specific radar frame
   */
  function showFrame(index) {
    currentFrameIndex = index;

    radarLayers.forEach((item, i) => {
      const opacity = i === index ? config.radar.opacity : 0;
      item.layer.setOpacity(opacity);
    });

    updateTimestamp();
  }

  /**
   * Start animation loop
   */
  function startAnimation() {
    if (animationTimer) {
      clearInterval(animationTimer);
    }

    const speed = parseInt(document.getElementById('speed-slider').value);

    animationTimer = setInterval(() => {
      currentFrameIndex = (currentFrameIndex + 1) % radarLayers.length;
      showFrame(currentFrameIndex);
    }, speed);
  }

  /**
   * Stop animation
   */
  function stopAnimation() {
    if (animationTimer) {
      clearInterval(animationTimer);
      animationTimer = null;
    }
  }

  /**
   * Set up UI controls
   */
  function setupControls() {
    // Play/Pause toggle
    const playPauseCheckbox = document.getElementById('play-pause');
    playPauseCheckbox.addEventListener('change', (e) => {
      isPlaying = e.target.checked;
      if (isPlaying) {
        startAnimation();
      } else {
        stopAnimation();
      }
    });

    // Opacity slider
    const opacitySlider = document.getElementById('opacity-slider');
    const opacityValue = document.getElementById('opacity-value');
    opacitySlider.addEventListener('input', (e) => {
      const opacity = e.target.value / 100;
      config.radar.opacity = opacity;
      opacityValue.textContent = e.target.value + '%';
      
      // Update current frame opacity
      if (radarLayers[currentFrameIndex]) {
        radarLayers[currentFrameIndex].layer.setOpacity(opacity);
      }
    });

    // Speed slider
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    speedSlider.addEventListener('input', (e) => {
      speedValue.textContent = e.target.value + 'ms';
      if (isPlaying) {
        startAnimation(); // Restart with new speed
      }
    });

    // Locate button
    const locateBtn = document.getElementById('locate-btn');
    locateBtn.addEventListener('click', () => {
      if (navigator.geolocation) {
        locateBtn.textContent = 'Locating...';
        navigator.geolocation.getCurrentPosition(
          (position) => {
            map.setView([position.coords.latitude, position.coords.longitude], 8);
            locateBtn.textContent = 'Locate Me';
          },
          (error) => {
            console.error('Geolocation error:', error);
            showError('Unable to get your location');
            locateBtn.textContent = 'Locate Me';
          }
        );
      } else {
        showError('Geolocation is not supported by your browser');
      }
    });
  }

  /**
   * Update timestamp display
   */
  function updateTimestamp() {
    const timestampEl = document.getElementById('radar-timestamp');
    if (radarLayers[currentFrameIndex]) {
      const timestamp = radarLayers[currentFrameIndex].timestamp;
      const date = new Date(timestamp * 1000);
      timestampEl.textContent = date.toLocaleString();
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    const mapEl = document.getElementById('radar-map');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    mapEl.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }

})();