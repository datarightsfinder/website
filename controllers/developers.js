const express = require('express');
const router = express.Router();
const yaml = require('yamljs');

let settings = yaml.load('settings.yaml');

/* GET /about */
router.get('/', function(req, res, next) {
  res.render('developers/index.html', {settings: settings});
});

module.exports = router;
