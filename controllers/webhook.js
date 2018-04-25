const _ = require('lodash');
const express = require('express');
const router = express.Router();
const async = require('async');
const Sequelize = require('sequelize');
const request = require('request');


// CONSTANTS
const URL_GITHUB_REPO = "https://raw.githubusercontent.com/projectsbyif/org-gdpr-tool-data/master/";

// SEQUELIZE
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: "postgres" });
const Organisation = sequelize.import("../models/organisation.js");

// SERVER ROUTES
router.get('/', function(req, res) {
  Organisation.findAll().then(function(_all) {
    var contents = [];

    _all.forEach(function(item, index) {
      contents.push(item.dataValues.label);
    });

    sendContents(contents, res);
  }).catch(function() {
    sendContents("Table not found", res);
  });
});

function sendContents(contents, res) {
  res.send({
    "name": "org-gdpr-tool-updater",
    "status": "healthy",
    "contents": contents
  });
}

router.get('/incoming', function(req, res) {
  // GitHub webhooks may require a valid GET path?
  res.status(200).send("200 OK");
});

router.post('/incoming', function(req, res) {
  var diff;

  async.waterfall([
    function(callback) {
      diff = createDiff(req.body);

      if (diff.update.length > 0) {
        handleChanges("update", diff.update, callback);
      } else {
        callback(null);
      }
    },
    function(callback) {
      if (diff.remove.length > 0) {
        handleChanges("remove", diff.remove, callback);
      } else {
        callback(null);
      }
    }
  ], function(err) {
    if (err) {
      console.log("ERROR");
      return;
    }

    console.log("Finished handling push");
  });

  res.status(200).send("200 OK");
});

function handleChanges(action, diff, parentCallback) {
  var thisDiff = diff[0];

  console.log(action, ": ", thisDiff);

  async.waterfall([
    function(callback) {
      request([URL_GITHUB_REPO, thisDiff].join(''), function (err, res, body) {
        if (err) {
          // TODO: Handle request error
        }

        if (tryParseJSON(body)) {
          callback(null, body);
        } else {
          console.log("parse error");
          callback("Parse Error");
        }
      });
    },
    function(_json, callback) {
      if (action === "update") {
        upsert({ "label": thisDiff, "payload": _json }, thisDiff, callback);
      } else if (action === "remove") {
        Organisation.findOne({ where: { label: thisDiff } }).then(function(obj) {
          obj.destroy().then(function() {
            callback(null);
          });
        });
      }
    }
  ], function(err) {
    if (err) {
      console.log("ERROR");
      console.log(err);
    }

    diff.shift();

    if (diff.length === 0) {
      parentCallback(null)
    } else {
      handleChanges(action, diff, parentCallback);
    }
  });
}

function tryParseJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString);

    if (o && typeof o === "object") { return o; }
  } catch(e) { }

  return false;
}

// FUNCTIONS
function createDiff(payload) {
  var commits = payload.commits;

  var toUpdate = [];
  var toRemove = [];

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
    "update": toUpdate,
    "remove": toRemove
  }
}

function upsert(values, label, parentCallback) {
  Organisation.findOne({ where: { "label": label }}).then(function(obj) {
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
