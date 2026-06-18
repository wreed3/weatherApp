var express = require('express');
var router = express.Router();
var https = require('https');

// OpenWeatherMap API key - replace with your own
const API_KEY = process.env.OPENWEATHER_API_KEY || 'YOUR_API_KEY_HERE';
const BASE_URL = 'api.openweathermap.org';

/* GET weather forecast */
router.get('/forecast', function(req, res, next) {
  const city = req.query.city || 'San Francisco';
  const units = req.query.units || 'imperial'; // imperial for Fahrenheit, metric for Celsius
  
  const options = {
    hostname: BASE_URL,
    path: `/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}`,
    method: 'GET'
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const weatherData = JSON.parse(data);
        
        if (apiRes.statusCode === 200) {
          // Process forecast data - get one forecast per day
          const dailyForecasts = processForecastData(weatherData);
          res.json({
            success: true,
            city: weatherData.city.name,
            country: weatherData.city.country,
            forecasts: dailyForecasts
          });
        } else {
          res.status(apiRes.statusCode).json({
            success: false,
            error: weatherData.message || 'Failed to fetch weather data'
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error parsing weather data'
        });
      }
    });
  });

  apiReq.on('error', (error) => {
    res.status(500).json({
      success: false,
      error: 'Error connecting to weather service'
    });
  });

  apiReq.end();
});

/* GET current weather */
router.get('/current', function(req, res, next) {
  const city = req.query.city || 'San Francisco';
  const units = req.query.units || 'imperial';
  
  const options = {
    hostname: BASE_URL,
    path: `/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}`,
    method: 'GET'
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const weatherData = JSON.parse(data);
        
        if (apiRes.statusCode === 200) {
          res.json({
            success: true,
            city: weatherData.name,
            country: weatherData.sys.country,
            temperature: Math.round(weatherData.main.temp),
            feelsLike: Math.round(weatherData.main.feels_like),
            description: weatherData.weather[0].description,
            icon: weatherData.weather[0].icon,
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind.speed
          });
        } else {
          res.status(apiRes.statusCode).json({
            success: false,
            error: weatherData.message || 'Failed to fetch weather data'
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error parsing weather data'
        });
      }
    });
  });

  apiReq.on('error', (error) => {
    res.status(500).json({
      success: false,
      error: 'Error connecting to weather service'
    });
  });

  apiReq.end();
});

// Helper function to process forecast data
function processForecastData(data) {
  const dailyData = {};
  
  // Group forecasts by day
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toLocaleDateString();
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: dateKey,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        temps: [],
        descriptions: [],
        icons: [],
        humidity: [],
        windSpeed: []
      };
    }
    
    dailyData[dateKey].temps.push(item.main.temp);
    dailyData[dateKey].descriptions.push(item.weather[0].description);
    dailyData[dateKey].icons.push(item.weather[0].icon);
    dailyData[dateKey].humidity.push(item.main.humidity);
    dailyData[dateKey].windSpeed.push(item.wind.speed);
  });
  
  // Calculate averages and pick most common description/icon
  const forecasts = Object.values(dailyData).slice(0, 5).map(day => {
    const avgTemp = Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length);
    const maxTemp = Math.round(Math.max(...day.temps));
    const minTemp = Math.round(Math.min(...day.temps));
    const mostCommonIcon = getMostCommon(day.icons);
    const mostCommonDesc = getMostCommon(day.descriptions);
    
    return {
      date: day.date,
      dayName: day.dayName,
      avgTemp,
      maxTemp,
      minTemp,
      description: mostCommonDesc,
      icon: mostCommonIcon,
      humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b) / day.windSpeed.length)
    };
  });
  
  return forecasts;
}

function getMostCommon(arr) {
  const counts = {};
  let maxCount = 0;
  let mostCommon = arr[0];
  
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > maxCount) {
      maxCount = counts[item];
      mostCommon = item;
    }
  });
  
  return mostCommon;
}

module.exports = router;