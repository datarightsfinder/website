const _ = require('lodash');
const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const moment = require('moment');
const overviewMatrix = require('../libs/overview_matrix');
const constants = require('../libs/constants');
const tableify = require('tableify');

const countries = require('../countries.json');
const settings = yaml.load('settings.yaml');

// SEQUELIZE
const Sequelize = require('sequelize');
const sequelizeConfig = require('../config/config.js');

let sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({
    storage: sequelizeConfig[process.env.NODE_ENV].storage,
    dialect: sequelizeConfig[process.env.NODE_ENV].dialect,
    dialectOptions: sequelizeConfig[process.env.NODE_ENV].dialectOptions,
  });
} else {
  sequelize = new Sequelize(sequelizeConfig[process.env.NODE_ENV].url, {
    dialect: sequelizeConfig[process.env.NODE_ENV].dialect,
    dialectOptions: sequelizeConfig[process.env.NODE_ENV].dialectOptions,
  });
}

const Organisation = sequelize.import('../models/organisation.js');

router.get('/:country/:number', function(req, res, next) {
  Organisation.findOne({
    where: {
      registrationCountry: req.params.country,
      registrationNumber: req.params.number,
    },
  }).then(function(_result) {
    let meta = {
      'fullCountryName': countries[_result.registrationCountry.toLowerCase()],
      'overviewMatrix': _.filter(
        overviewMatrix.generate(_result.payload), function(o) {
        return o != false;
      }),
      'friendlyDate': moment(_result.updatedAt).format('YYYY-MM-DD'),
      'friendlyTime': moment(_result.updatedAt).format('HH:MM:ss'),
      'isEEACountry': isEEACountry(_result.registrationCountry),
      'isECAdequacyDecisionCountry': isECAdequacyDecisionCountry(
        _result.registrationCountry),
      'isUS': isUS(_result.registrationCountry),
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
  }).then(function(_result) {
    res.setHeader('content-type', 'application/json');
    res.status(200).send(_result.payload);
  }).catch(function() {
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
  delete payload['privacyShield'];
  delete payload['dataProcessingAddendum'];
  delete payload['thirdParties'];
  delete payload['retentionRules'];
  delete payload['dataCategoriesCollected'];
  delete payload['automatedDecisionMaking'];
  delete payload['complaintInformation'];
  delete payload['securityStandards'];
  delete payload['lawfulBases'];
  delete payload['rights'];
  delete payload['unusualProcessingPurposes'];
  delete payload['presentation'];

  if (Object.keys(payload).length === 0) {
    return null;
  }

  return tableify(payload);
}

function isUS(registrationCountry) {
  registrationCountry = registrationCountry.split('_')[0];

  if (registrationCountry === 'us') {
    return true;
  } else {
    return false;
  }
}

module.exports = router;
