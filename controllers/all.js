const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const models = require('../models');

let settings = yaml.load('settings.yaml');

/* GET /all */
router.get('/', function(req, res, next) {
  models.Organisation.findAll({
    order: [
      ['sortName', 'ASC'],
    ],
  }).then(function(_all) {
    let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    res.render('all/index.html', {
      settings: settings,
      organisations: _all,
      alphabet: alphabet,
    });
  }).catch(function(err) {
    res.render('all/index.html', {settings: settings, organisations: []});
  });
});

module.exports = router;
