const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const {check} = require('express-validator/check');

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

router.get('/', function(req, res, next) {
  res.redirect('/');
});

router.post('/', [
  check('query').trim().escape(),
], function(req, res, next) {
  res.redirect('/search/' + req.body.query);
});

router.get('/:query', function(req, res, next) {
  let query = req.params.query;

  Organisation.findAll({
    where: {
      name: {
        ilike: '%' + query + '%',
      },
    },
  }).then(function(_results) {
    console.log(_results);
    res.render('search/search.html', {
      settings: settings,
      query: query,
      results: _results,
    });
  });
});

module.exports = router;
