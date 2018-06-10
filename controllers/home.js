const express = require('express');
const router = express.Router();
const yaml = require('yamljs');

let settings = yaml.load('settings.yaml');

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

/* GET home page. */
router.get('/', function(req, res, next) {
  Organisation.findAll().then(function(_all) {
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
