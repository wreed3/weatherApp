var express = require('express');
var router = express.Router();

/* GET weather page. */
router.get('/', function(req, res, next) {
  res.render('weather', { 
    title: 'Weather Forecast',
    city: 'San Francisco',
    temperature: '72°F',
    condition: 'Sunny'
  });
});

module.exports = router;