const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const Sequelize = require('sequelize');

let settings = yaml.load('settings.yaml');

// SEQUELIZE
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
});
const Organisation = sequelize.import('../models/organisation.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  Organisation.findAll().then(function(_all) {
    _all.forEach(function(item, index) {
      _all[index].payload = JSON.parse(_all[index].payload);
    });

    res.render('home/index.html', {
      settings: settings,
      payload: _all,
      organisation_count: _all.length,
      organisations: _all,
    });
  }).catch(function() {
    res.render('home/index.html', {settings: settings, organisations: []});
  });
});

module.exports = router;
