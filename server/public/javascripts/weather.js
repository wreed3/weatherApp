document.addEventListener('DOMContentLoaded', function() {
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const unitsSelect = document.getElementById('unitsSelect');
  const errorMessage = document.getElementById('errorMessage');
  const currentWeather = document.getElementById('currentWeather');
  const forecastGrid = document.getElementById('forecastGrid');
  
  let currentCity = 'San Francisco';
  let currentUnits = 'imperial';
  
  // Load initial weather data
  loadWeatherData();
  
  // Event listeners
  searchBtn.addEventListener('click', function() {
    currentCity = cityInput.value.trim();
    if (currentCity) {
      loadWeatherData();
    }
  });
  
  cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      currentCity = cityInput.value.trim();
      if (currentCity) {
        loadWeatherData();
      }
    }
  });
  
  unitsSelect.addEventListener('change', function() {
    currentUnits = this.value;
    loadWeatherData();
  });
  
  function loadWeatherData() {
    hideError();
    loadCurrentWeather();
    loadForecast();
  }
  
  function loadCurrentWeather() {
    fetch(`/weather/current?city=${encodeURIComponent(currentCity)}&units=${currentUnits}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          displayCurrentWeather(data);
        } else {
          showError(data.error || 'Failed to load current weather');
        }
      })
      .catch(error => {
        showError('Error loading current weather');
        console.error('Error:', error);
      });
  }
  
  function loadForecast() {
    forecastGrid.innerHTML = '<div class="loading">Loading forecast...</div>';
    
    fetch(`/weather/forecast?city=${encodeURIComponent(currentCity)}&units=${currentUnits}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          displayForecast(data);
        } else {
          showError(data.error || 'Failed to load forecast');
          forecastGrid.innerHTML = '<div class="error">Failed to load forecast</div>';
        }
      })
      .catch(error => {
        showError('Error loading forecast');
        forecastGrid.innerHTML = '<div class="error">Error loading forecast</div>';
        console.error('Error:', error);
      });
  }
  
  function displayCurrentWeather(data) {
    const tempUnit = currentUnits === 'imperial' ? '°F' : '°C';
    const windUnit = currentUnits === 'imperial' ? 'mph' : 'm/s';
    
    document.getElementById('currentTemp').textContent = data.temperature;
    document.querySelector('.current-temp .temp-unit').textContent = tempUnit;
    document.getElementById('currentCity').textContent = `${data.city}, ${data.country}`;
    document.getElementById('currentDescription').textContent = capitalizeFirst(data.description);
    document.getElementById('feelsLike').textContent = `${data.feelsLike}${tempUnit}`;
    document.getElementById('humidity').textContent = `${data.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.windSpeed} ${windUnit}`;
    
    currentWeather.style.display = 'block';
  }
  
  function displayForecast(data) {
    const tempUnit = currentUnits === 'imperial' ? '°F' : '°C';
    
    forecastGrid.innerHTML = '';
    
    data.forecasts.forEach(forecast => {
      const forecastCard = document.createElement('div');
      forecastCard.className = 'forecast-card';
      
      forecastCard.innerHTML = `
        <div class="forecast-day">${forecast.dayName}</div>
        <div class="forecast-date">${forecast.date}</div>
        <img class="forecast-icon" src="https://openweathermap.org/img/wn/${forecast.icon}@2x.png" alt="${forecast.description}">
        <div class="forecast-temp">
          <span class="temp-high">${forecast.maxTemp}°</span>
          <span class="temp-low">${forecast.minTemp}°</span>
        </div>
        <div class="forecast-description">${capitalizeFirst(forecast.description)}</div>
        <div class="forecast-details">
          <div class="detail-item">
            <span class="detail-icon">💧</span>
            <span>${forecast.humidity}%</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">💨</span>
            <span>${forecast.windSpeed} ${currentUnits === 'imperial' ? 'mph' : 'm/s'}</span>
          </div>
        </div>
      `;
      
      forecastGrid.appendChild(forecastCard);
    });
  }
  
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }
  
  function hideError() {
    errorMessage.style.display = 'none';
  }
  
  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});