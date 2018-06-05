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
        request({url: 'https://api.github.com/repos/projectsbyif/org-gdpr-tool-data/contents/' + thisDiff, headers: {'User-Agent': 'projectsbyif/org-gdpr-tool-website'}}, function(err, res, body) {
          if (err) {
            callback('Error: Can\'t get ' + thisDiff + ' from GitHub');
          }

          console.log('Getting ' + thisDiff);

          let json = JSON.parse(body);
          let contentBase64 = json.content.replace(/\s/g, '');
          let content = Buffer.from(contentBase64, 'base64').toString('ascii');

          if (tryParseJSON(content)) {
            callback(null, content);
          } else {
            callback('Error: Invalid JSON file ' + thisDiff);
          }
        });
      } else if (action === 'remove') {
        callback(null);
      }
    },
    function(_json, callback) {
      if (action === 'update') {
        let json = JSON.parse(_json);

        upsert({
            'name': json.organisation.name,
            'slug': thisDiff.split('.')[0],
            'payload': _json,
          }, callback);
      } else if (action === 'remove') {
        Organisation.findOne({
          where: {
            slug: thisDiff.split('.')[0],
          },
        }).then(function(obj) {
          obj.destroy().then(function() {
            callback(null);
          }).catch(function() {
            callback(null);
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
  Organisation.findOne({where: {'slug': values.slug}}).then(function(obj) {
    if (obj) {
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
