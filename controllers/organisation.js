const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const Sequelize = require('sequelize');

const settings = yaml.load('settings.yaml');

// SEQUELIZE
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: "postgres" });
const Organisation = sequelize.import("../models/organisation.js");

router.get('/:slug', function(req, res, next) {
  Organisation.findOne({ where: { slug:  req.params.slug }}).then(function(_result) {
    _result.payload = JSON.parse(_result.payload);
    res.render('organisation/show.html', { settings: settings, result: _result });
  }).catch(function() {
    next('route');
  });
});

router.get('/:slug.json', function(req, res, next) {
  Organisation.findOne({ where: { slug: req.params.slug }}).then(function(_result) {
    res.setHeader("content-type", "application/json");
    res.status(200).send(_result.payload);
  });
});

router.get('/', function(req, res, next) {
  res.redirect('/');
});

module.exports = router;
