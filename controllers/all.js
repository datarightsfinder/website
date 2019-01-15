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
    let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('').map(function(letter) {
      return {
        letter: letter,
        inOrgList: false,
      };
    });

    for (let j = 0; j < _all.length; j++) {
      let firstInitial = _all[j].sortName.charAt(0);
      for (let i = 0; i < alphabet.length; i++) {
        if (firstInitial == alphabet[i].letter.toUpperCase()) {
          alphabet[i].inOrgList = true;
        }
      }
    };

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
