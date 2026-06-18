var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Weather App' });
});

/* GET radar page. */
router.get('/radar', function(req, res, next) {
  res.render('radar', { title: 'Doppler Radar' });
});

module.exports = router;