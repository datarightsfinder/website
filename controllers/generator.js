const express = require('express');
const router = express.Router();
const yaml = require('yamljs');

var settings = yaml.load('settings.yaml');

/* GET /generate */
router.get('/', function(req, res, next) {
  res.render('generator/index.html', { settings: settings });
});

module.exports = router;
