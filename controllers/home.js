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

router.get('/api/1/all', function(req, res, next) {
  models.Organisation.findAll({
    order: [
      ['name', 'ASC'],
    ],
  }).then(function(_all) {
    let all = [];

    _all.forEach(function(elem) {
      all.push({
        name: elem.name,
        url: `${settings.url}/organisation/${elem.registrationCountry}/`
          + `${elem.registrationNumber}.json`,
      });
    });

    res.setHeader('content-type', 'application/json');
    res.status(200).send({
      all_organisations: all,
    });
  });
});

module.exports = router;
