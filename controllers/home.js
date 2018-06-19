const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const models = require('../models');

let settings = yaml.load('settings.yaml');

/* GET home page. */
router.get('/', function(req, res, next) {
  models.Organisation.findAll({
    order: [
      ['name', 'ASC'],
    ],
  }).then(function(_all) {
    res.render('home/index.html', {
      settings: settings,
      payload: _all,
      organisation_count: _all.length,
      organisations: _all,
    });
  }).catch(function(err) {
    res.render('home/index.html', {settings: settings, organisations: []});
  });
});

module.exports = router;
