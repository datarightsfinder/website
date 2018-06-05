const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const Sequelize = require('sequelize');
const {check} = require('express-validator/check');

const settings = yaml.load('settings.yaml');

// SEQUELIZE
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
});
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
  }).then(function(results) {
    Organisation.findAll().then(function(_all) {
      // let organisations = [];

      _all.forEach(function(item, index) {
        _all[index].payload = JSON.parse(_all[index].payload);
      });

      res.render('search/search.html', {
        settings: settings,
        query: query,
        results: results,
        last_five: _all.slice(Math.max(_all.length - 5, 1)),
      });
    });
  });
});

module.exports = router;
