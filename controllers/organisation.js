const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const Sequelize = require('sequelize');
const moment = require('moment');
const overviewMatrix = require('../libs/overview_matrix');
const constants = require('../libs/constants');
const tableify = require('tableify');

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

      let meta = {
        'overviewMatrix': overviewMatrix.generate(_result.payload),
        'friendlyDate': moment(_result.updatedAt).format('YYYY-MM-DD'),
        'friendlyTime': moment(_result.updatedAt).format('HH:MM:ss'),
        'isEEACountry': isEEACountry(_result.registrationCountry),
        'isECAdequacyDecisionCountry': isECAdequacyDecisionCountry(_result.registrationCountry),
      };

      let extraData = createExtraDataTable(_result.payload);

      res.render('organisation/show.html', {
        settings: settings,
        result: _result,
        meta: meta,
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

function isEEACountry(country) {
  country = country.split('_')[0].toLowerCase();

  if (constants.getEEACountries().indexOf(country) !== -1) {
    return true;
  } else {
    return false;
  }
}

function isECAdequacyDecisionCountry(country) {
  country = country.split('_')[0].toLowerCase();

  if (constants.getECAdequacyDecisionCountries().indexOf(country) !== -1) {
    return true;
  } else {
    return false;
  }
}

function createExtraDataTable(payload) {
  payload = Object.assign({}, payload);

  delete payload['organisationInformation'];
  delete payload['organisationUrls'];
  delete payload['privacyNoticeUrl'];
  delete payload['dataProtectionOfficer'];
  delete payload['dataProtectionRegister'];
  delete payload['internationalTransfer'];
  delete payload['thirdParties'];
  delete payload['retentionRules'];
  delete payload['dataTypesCollected'];
  delete payload['automatedDecisionMaking'];
  delete payload['complaintInformation'];
  delete payload['securityStandards'];
  delete payload['lawfulBases'];
  delete payload['rights'];
  delete payload['unusualProcessingPurposes'];
  delete payload['transparencyRecommendations'];

  if (Object.keys(payload).length === 0) {
    return null;
  }

  return tableify(payload);
}

module.exports = router;
