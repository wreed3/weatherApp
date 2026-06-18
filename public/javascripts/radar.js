/**
 * Weather Radar Component
 * Uses Leaflet.js and Rainviewer API for animated weather radar
 */

class WeatherRadar {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.map = null;
    this.radarLayers = [];
    this.animationPosition = 0;
    this.animationTimer = null;
    this.options = {
      center: options.center || [39.8283, -98.5795], // Center of US
      zoom: options.zoom || 5,
      animationSpeed: options.animationSpeed || 500, // ms between frames
      ...options
    };
  }

  /**
   * Initialize the map and radar layers
   */
  async init() {
    // Create map instance
    this.map = L.map(this.containerId).setView(this.options.center, this.options.zoom);

    // Add base tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Load radar data
    await this.loadRadarData();

    // Setup controls
    this.setupControls();
  }

  /**
   * Fetch radar tile data from backend
   */
  async loadRadarData() {
    try {
      const response = await fetch('/radar/tiles');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      this.radarData = data;
      this.addRadarLayers();
    } catch (error) {
      console.error('Failed to load radar data:', error);
      this.showError('Unable to load radar data. Please try again later.');
    }
  }

  /**
   * Add radar layers to the map
   */
  addRadarLayers() {
    // Clear existing layers
    this.radarLayers.forEach(layer => this.map.removeLayer(layer));
    this.radarLayers = [];

    if (!this.radarData || !this.radarData.radar) {
      return;
    }

    const { host, radar } = this.radarData;

    // Add each radar timestamp as a layer
    radar.past.forEach((item, index) => {
      const layer = L.tileLayer(
        `${host}${item.path}/256/{z}/{x}/{y}/2/1_1.png`,
        {
          tileSize: 256,
          opacity: 0.001,
          zIndex: index + 200
        }
      );
      
      this.radarLayers.push(layer);
      this.map.addLayer(layer);
    });

    // Add current radar
    if (radar.nowcast && radar.nowcast.length > 0) {
      radar.nowcast.forEach((item, index) => {
        const layer = L.tileLayer(
          `${host}${item.path}/256/{z}/{x}/{y}/2/1_1.png`,
          {
            tileSize: 256,
            opacity: 0.001,
            zIndex: radar.past.length + index + 200
          }
        );
        
        this.radarLayers.push(layer);
        this.map.addLayer(layer);
      });
    }

    // Show the most recent frame
    this.showFrame(this.radarLayers.length - 1);
  }

  /**
   * Show a specific radar frame
   */
  showFrame(frameIndex) {
    this.animationPosition = frameIndex;

    this.radarLayers.forEach((layer, index) => {
      if (index === frameIndex) {
        layer.setOpacity(0.6);
      } else {
        layer.setOpacity(0);
      }
    });

    // Update timestamp display
    this.updateTimestamp(frameIndex);
  }

  /**
   * Update timestamp display
   */
  updateTimestamp(frameIndex) {
    const timestampEl = document.getElementById('radar-timestamp');
    if (!timestampEl || !this.radarData) return;

    const allFrames = [...this.radarData.radar.past, ...this.radarData.radar.nowcast];
    if (allFrames[frameIndex]) {
      const date = new Date(allFrames[frameIndex].time * 1000);
      timestampEl.textContent = date.toLocaleTimeString();
    }
  }

  /**
   * Start radar animation
   */
  startAnimation() {
    if (this.animationTimer) return;

    this.animationTimer = setInterval(() => {
      this.animationPosition = (this.animationPosition + 1) % this.radarLayers.length;
      this.showFrame(this.animationPosition);
    }, this.options.animationSpeed);

    this.updatePlayButton(true);
  }

  /**
   * Stop radar animation
   */
  stopAnimation() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }

    this.updatePlayButton(false);
  }

  /**
   * Toggle animation play/pause
   */
  toggleAnimation() {
    if (this.animationTimer) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  /**
   * Update play button state
   */
  updatePlayButton(isPlaying) {
    const playBtn = document.getElementById('radar-play-btn');
    if (!playBtn) return;

    playBtn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
    playBtn.classList.toggle('playing', isPlaying);
  }

  /**
   * Setup control buttons
   */
  setupControls() {
    const playBtn = document.getElementById('radar-play-btn');
    const refreshBtn = document.getElementById('radar-refresh-btn');

    if (playBtn) {
      playBtn.addEventListener('click', () => this.toggleAnimation());
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadRadarData());
    }
  }

  /**
   * Update map center and zoom
   */
  setView(lat, lon, zoom = 8) {
    if (this.map) {
      this.map.setView([lat, lon], zoom);
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorEl = document.getElementById('radar-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopAnimation();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherRadar;
}