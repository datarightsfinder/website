const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const models = require('../models');
const cors = require('cors');
const moment = require('moment');

let settings = yaml.load('settings.yaml');

/* GET home page. */
router.get('/', function(req, res, next) {
  models.Organisation.findAll({
    order: [
      ['jsonLastUpdated', 'DESC'],
    ],
  }).then(function(_all) {
    let all = _all.map(function(elem) {
      let dateLastUpdated = moment(elem.dataValues.jsonLastUpdated);

      let currentDate = moment();

      let diff = currentDate.diff(dateLastUpdated, 'days');

      let ending = ' days ago';

      if (diff <= 1) {
        ending = ' day ago';
      }

      let daysSinceLastUpdate = diff + ending;

      elem.dataValues.jsonLastUpdated = daysSinceLastUpdate;

      return elem;
    });

    res.render('home/index.html', {
      settings: settings,
      organisations: all,
    });
  }).catch(function(err) {
    res.render('home/index.html', {settings: settings, organisations: []});
  });
});

router.get('/api/1/all', cors(), (req, res, next) => {
  models.Organisation.findAll({
    order: [
      ['name', 'ASC'],
    ],
  }).then(function(_all) {
    let all = [];

    _all.forEach(function(elem) {
      all.push({
        name: elem.name,
        url: `${settings.url}/api/1/organisation/${elem.registrationCountry}/`
          + `${elem.registrationNumber}`,
      });
    });

    res.setHeader('content-type', 'application/json');
    res.status(200).send({
      all_organisations: all,
    });
  });
});

module.exports = router;
