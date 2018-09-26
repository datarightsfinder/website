const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const models = require('../models');
const moment = require('moment');

let settings = yaml.load('settings.yaml');

/* GET home page. */
router.get('/changes', (req, res, next) => {
  models.Organisation.findAll()
    .then((_allOrganisations) => {
      let changedOrganisations = [];

      _allOrganisations.forEach((org) => {
        let jsonLastUpdated = moment(org.jsonLastUpdated).subtract(1, 'hours');
        let hashLastUpdated = moment(org.hashLastUpdated).subtract(1, 'hours');

        if (hashLastUpdated.isAfter(jsonLastUpdated)) {
          changedOrganisations.push(org);
        }
      });

      res.render('changes/index.html', {
        settings: settings,
        changedOrganisations: changedOrganisations,
      });
    })
    .catch(() => res.status(500));
});

router.get('/changes/ignore/:id', (req, res, next) => {
  let id = req.params.id;

  models.Organisation.findOne({
    where: {
      id: id,
    },
  })
  .then((org) => {
    if (!org) {
      return res.send('Error');
    }

    let jsonLastUpdated = moment(org.jsonLastUpdated).subtract(1, 'hours');
    let hashLastUpdated = moment(org.hashLastUpdated).subtract(1, 'hours');

    if (!hashLastUpdated.isAfter(jsonLastUpdated)) {
      return res.send('Error');
    }

    org.jsonLastUpdated = `${moment().subtract(1, 'hours').format('YYYY-MM-DDTHH:mm:ss')}Z`;

    if (org.policyTextNew !== null) {
      org.policyTextOld = org.policyTextNew;
    }

    org.save().then(() => res.redirect('/changes'));
  });
});

module.exports = router;
