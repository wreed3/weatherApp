var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('weather', { title: 'Weather Forecast App' });
});

module.exports = router;