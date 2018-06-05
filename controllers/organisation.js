const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const Sequelize = require('sequelize');
const emojiFlag = require('emoji-flag');
const overviewMatrix = require('../libs/overview_matrix');

const settings = yaml.load('settings.yaml');

// SEQUELIZE
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
});
const Organisation = sequelize.import('../models/organisation.js');

router.get('/:country/:number', function(req, res, next) {
  Organisation.findOne({
    where: {
      registrationCountry: req.params.country,
      registrationNumber: req.params.number,
    },
  })
    .then(function(_result) {
      _result.payload = JSON.parse(_result.payload);

      let extraData = {
        'emojiFlag': emojiFlag(_result.payload.organisationInformation
          .registrationCountry.split('_')[0].toUpperCase()),
          'overviewMatrix': overviewMatrix.generate(_result.payload),
      };

      res.render('organisation/show.html', {
        settings: settings,
        result: _result,
        extraData: extraData,
      });
  }).catch(function(err) {
    console.log(err);
    next('route');
  });
});

router.get('/:country/:number.json', function(req, res, next) {
  Organisation.findOne({
    where: {
      registrationCountry: req.params.country,
      registrationNumber: req.params.number,
    },
  })
    .then(function(_result) {
      res.setHeader('content-type', 'application/json');
      res.status(200).send(_result.payload);
    })
    .catch(function() {
      next('route');
    });
});

router.get('/', function(req, res, next) {
  res.redirect('/');
});

module.exports = router;
