const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const {check} = require('express-validator/check');
const models = require('../models');

const settings = yaml.load('settings.yaml');

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

  models.Organisation.findAll({
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
