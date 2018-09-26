const express = require('express');
const router = express.Router();
const yaml = require('yamljs');
const models = require('../models');
const moment = require('moment');

/* GET home page. */
router.get('/changes', function(req, res, next) {
  let title = '<b>Policies with changed content</b>';
  let result = '';

  models.Organisation.findAll()
    .then((_allOrganisations) => {
      _allOrganisations.forEach((org) => {
        let jsonLastUpdated = moment(org.jsonLastUpdated).subtract(1, 'hours');
        let hashLastUpdated = moment(org.hashLastUpdated).subtract(1, 'hours');

        if (hashLastUpdated.isAfter(jsonLastUpdated)) {
          result += `<p><a href="/organisation/${org.registrationCountry}/` +
            `${org.registrationNumber}">${org.name}</a></p>`;
        }
      });

      if (result === '') {
        result = '<p>No changes.</p>';
      }

      res.send(title + result);
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
    let jsonLastUpdated = moment(org.jsonLastUpdated).subtract(1, 'hours');
    let hashLastUpdated = moment(org.hashLastUpdated).subtract(1, 'hours');

    if (hashLastUpdated.isAfter(jsonLastUpdated)) {
      org.jsonLastUpdated = `${moment().subtract(1, 'hours').format('YYYY-MM-DDTHH:mm:ss')}Z`;
      org.save().then(() => res.send('200 OK'));
    } else {
      res.send('Error');
    }
  });
});

module.exports = router;
