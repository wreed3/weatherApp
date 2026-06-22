var express = require('express');
var router = express.Router();
var config = require('../config/weather-config');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Weather App' });
});

/* GET radar page */
router.get('/radar', function(req, res, next) {
  res.render('radar', { 
    title: 'Weather Radar',
    defaultLat: config.defaultLocation.lat,
    defaultLon: config.defaultLocation.lon,
    defaultZoom: config.defaultLocation.zoom
  });
});

module.exports = router;