var express = require('express');
var router = express.Router();
var yaml = require('yamljs');

var settings = yaml.load('settings.yaml');
var db = require('../data/organisations.js');

router.get('/:slug', function(req, res, next) {
  let organisation = db.organisations.filter(org => org.slug === req.params.slug)[0];
  if (!organisation) return next('route');

  res.render('organisation/show.html', { settings: settings, organisation: organisation });
});

router.get('/', function(req, res, next) {
  res.redirect('/');
});

module.exports = router;
