// NPM INCLUDES
const async = require('async');
const request = require('request');
const Sequelize = require('sequelize');
const exec = require('child_process').exec;

// LOCAL IMPORTS
const Utils = require('./libs/utils.js');

// STARTUP CHECKS
if (Utils.checkForMissingEnvVars(["DATABASE_URL"])) {
  process.exit();
}

// If running on Heroku, use SSL with Sequelize
var isSSLEnabled = false

if (process.env.NODE_ENV === "production") {
  isSSLEnabled = true;
}

// CONFIG
const URL_REPO_CONTENTS = "https://api.github.com/repos/projectsbyif/org-gdpr-tool-data/contents/";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: isSSLEnabled
  }
});

const Organisation = sequelize.import(__dirname + "/models/organisation.js");

async.waterfall([
  function(callback) {
    // Run Sequelize migrate command
    var dir = exec("node_modules/.bin/sequelize db:migrate", function(err, stdout, stderr) {
      if (err) {
        callback("Error: Problem running migration");
        return;
      }
    });

    dir.on("exit", function (code) {
      console.log("Migration completed");
      callback(null);
    });
  },
  function(callback) {
    // Request list of all files in the org-gdpr-tool-data repository
    request({ url: URL_REPO_CONTENTS, headers: { 'User-Agent': 'projectsbyif/org-gdpr-tool-website' }}, function(err, res, body) {
      if (err) {
        callback("Problem downloading data repo contents from " + URL_REPO_CONTENTS);
        return;
      }

      callback(null, body);
    });
  },
  function(_gitContents, callback) {
    // Recursively run createEntries function on each file
    _gitContents = JSON.parse(_gitContents);

    createEntries(_gitContents, callback);
  }
], function(err) {
  if (err) {
    console.log(err);
  }

  console.log("Seeding completed.");

  process.exit();
});

function createEntries(items, parentCallback) {
  var item = items[0];

  async.waterfall([
    function(callback) {
      // Skip template.json file
      if (item.name === "template.json") {
        callback(true);
        return;
      }

      // Get the JSON data file
      request(item.download_url, function(err, res, body) {
        if (err) {
          callback("Error: Problem download JSON file " + item.download_url);
          return;
        }

        callback(null, item.name, body);
      });
    },
    function(_label, _json, callback) {
      // Write contents of JSON file to database
      var json = JSON.parse(_json);

      Organisation.create({
        "slug": _label.split('.')[0],
        "name": json.organisation.name,
        "payload": _json
      }).then(function() {
        callback(null);
      }).catch(function(err) {
        callback(err);
      });
    }
  ], function(err) {
    if (err) {
      console.log(err);
    }

    items.shift();

    if (items.length > 0) {
      createEntries(items, parentCallback);
    } else {
      parentCallback(null);
    }
  });
}
