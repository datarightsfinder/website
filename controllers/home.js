var express = require('express');
var router = express.Router();
var yaml = require('yamljs');

var settings = yaml.load('settings.yaml');
var db = require('../data/organisations.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  let organisations = db.organisations;
  res.render('home/index.html', { settings: settings, organisations: organisations });
});

module.exports = router;
