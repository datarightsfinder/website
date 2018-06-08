const _ = require('lodash');
const express = require('express');
const router = express.Router();
const async = require('async');
const Sequelize = require('sequelize');
const request = require('request');

// SEQUELIZE
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
});
const Organisation = sequelize.import('../models/organisation.js');

// SERVER ROUTES
router.get('/incoming', function(req, res) {
  // GitHub webhooks may require a valid GET path?
  res.status(200).send('200 OK');
});

router.post('/incoming', function(req, res) {
  let diff;

  async.waterfall([
    function(callback) {
      diff = createDiff(req.body);

      if (diff.update.length > 0) {
        handleChanges('update', diff.update, callback);
      } else {
        callback(null);
      }
    },
    function(callback) {
      if (diff.remove.length > 0) {
        handleChanges('remove', diff.remove, callback);
      } else {
        callback(null);
      }
    },
  ], function(err) {
    if (err) {
      console.log('ERROR');
      return;
    }

    console.log('Finished handling push');
  });

  res.status(200).send('200 OK');
});

function handleChanges(action, diff, parentCallback) {
  let thisDiff = diff[0];

  console.log(`Handling ${thisDiff} (${action})`);

  async.waterfall([
    function(callback) {
      if (action === 'update') {
        let timestamp = Math.round((new Date()).getTime() / 1000);

        request({url: `https://raw.githubusercontent.com/projectsbyif/odr-test/master/${thisDiff}?${timestamp}`, headers: {'User-Agent': 'projectsbyif/org-gdpr-tool-website'}}, function(err, res, body) {
          if (err) {
            callback('Error: Can\'t get ' + thisDiff + ' from GitHub');
          }

          console.log('Getting ' + thisDiff);
          console.log(body);

          if (tryParseJSON(body)) {
            callback(null, body);
          } else {
            callback('Can\'t parse this JSON');
          }

          // let json = JSON.parse(body);
          // let contentBase64 = json.content.replace(/\s/g, '');
          // let content = Buffer.from(contentBase64, 'base64').toString('ascii');
          //
          // if (tryParseJSON(content)) {
          //
          // } else {
          //   callback('Error: Invalid JSON file ' + thisDiff);
          // }
        });
      } else if (action === 'remove') {
        callback(null);
      }
    },
    function(_json, callback) {
      if (action === 'update') {
        let json = JSON.parse(_json);

        // Organisation.create({
        //   'name': name,
        //   'registrationNumber': json.organisationInformation.number,
        //   'registrationCountry': json.organisationInformation.registrationCountry
        //                             .toLowerCase(),
        //   'payload': JSON.stringify(json),

        // Pull organisation information from OpenCorporates if available
        request(`https://api.opencorporates.com/companies/` +
          `${json.organisationInformation.registrationCountry.toLowerCase()}/` +
          `${json.organisationInformation.number}`, function(err, res, body) {

          if (res.statusCode === 404) {
            upsert({
                'name': json.organisationInformation.name,
                'registrationNumber': json.organisationInformation.number,
                'registrationCountry': json.organisationInformation.registrationCountry,
                'payload': _json,
              }, callback);
          } else {
            body = JSON.parse(body);

            upsert({
                'name': body.results.company.name,
                'registrationNumber': json.organisationInformation.number,
                'registrationCountry': json.organisationInformation.registrationCountry,
                'payload': _json,
              }, callback);
          }
        });
      } else if (action === 'remove') {
        console.log(thisDiff);

        thisDiff = thisDiff.replace('.json', '');

        let registrationNumber = '';
        let registrationCountry = '';

        if (thisDiff.includes('us_') || thisDiff.includes('ca_') || thisDiff.includes('ae_')) {
          registrationCountry = thisDiff.substring(0, 5).toLowerCase();
          registrationNumber = thisDiff.substring(5);
        } else {
          registrationCountry = thisDiff.substring(0, 2).toLowerCase();
          registrationNumber = thisDiff.substring(2);
        }

        console.log(registrationNumber, registrationCountry);

        Organisation.findOne({
          where: {
            registrationNumber: registrationNumber,
            registrationCountry: registrationCountry,
          },
        }).then(function(obj) {
          obj.destroy().then(function() {
            // callback(null);
          }).catch(function() {
            // callback(null);
          });
        });
      }
    },
  ], function(err) {
    if (err) {
      console.log('ERROR');
      console.log(err);
    }

    diff.shift();

    if (diff.length === 0) {
      parentCallback(null);
    } else {
      handleChanges(action, diff, parentCallback);
    }
  });
}

function tryParseJSON(jsonString) {
  try {
    let o = JSON.parse(jsonString);

    if (o && typeof o === 'object') {
 return o;
}
  } catch (e) { }

  return false;
}

// FUNCTIONS
function createDiff(payload) {
  let commits = payload.commits;

  let toUpdate = [];
  let toRemove = [];

  commits.forEach(function(commit, index) {
    commit.added.forEach(function(commitAdded, index) {
      // Check if already file is due to be removed
      toRemove = _.remove(toRemove, function(n) {
        return n !== commitAdded;
      });

      if (toUpdate.indexOf(commitAdded) === -1) {
        toUpdate.push(commitAdded);
      }
    });

    commit.modified.forEach(function(commitModified, index) {
      // Check if already file is due to be removed
      toRemove = _.remove(toRemove, function(n) {
        return n !== commitModified;
      });

      if (toUpdate.indexOf(commitModified) === -1) {
        toUpdate.push(commitModified);
      }
    });

    commit.removed.forEach(function(commitRemoved, index) {
      // Check if already file is due to be removed
      toUpdate = _.remove(toUpdate, function(n) {
        return n !== commitRemoved;
      });

      if (toRemove.indexOf(commitRemoved) === -1) {
        toRemove.push(commitRemoved);
      }
    });
  });

  return {
    'update': toUpdate,
    'remove': toRemove,
  };
}

function upsert(values, parentCallback) {
  console.log(values);

  Organisation.findOne({where: {
    'registrationNumber': values.registrationNumber,
    'registrationCountry': values.registrationCountry,
  }}).then(function(obj) {
    if (obj) {
      console.log("updating");
      // Update
      obj.update(values).then(function() {
        parentCallback(null);
      });
    } else {
      // Insert
      Organisation.create(values).then(function() {
        parentCallback(null);
      });
    }
  });
}

module.exports = router;
