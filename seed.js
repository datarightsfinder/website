// NPM INCLUDES
const cleanDeep = require('clean-deep');
const async = require('async');
const request = require('request');
const Sequelize = require('sequelize');
const exec = require('child_process').exec;

// LOCAL IMPORTS
const Utils = require('./libs/utils.js');

// STARTUP CHECKS
if (Utils.checkForMissingEnvVars(['DATABASE_URL'])) {
  process.exit();
}

// If running on Heroku, use SSL with Sequelize
let isSSLEnabled = false;

if (process.env.NODE_ENV === 'production') {
  isSSLEnabled = true;
}

// CONFIG
const URL_REPO_CONTENTS = 'https://api.github.com/repos/projectsbyif/odr-test/contents/';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: isSSLEnabled,
  },
});

const Organisation = sequelize.import(__dirname + '/models/organisation.js');

async.waterfall([
  function(callback) {
    // Run Sequelize migrate command
    let dir = exec('node_modules/.bin/sequelize db:migrate',
      function(err, stdout, stderr) {
      if (err) {
        callback('Error: Problem running migration');
        return;
      }
    });

    dir.on('exit', function(code) {
      console.log('Migration completed');
      callback(null);
    });
  },
  function(callback) {
    // Request list of all files in the org-gdpr-tool-data repository
    request({
        url: URL_REPO_CONTENTS,
        headers: {
          'User-Agent': 'projectsbyif/org-gdpr-tool-website',
        },
    }, function(err, res, body) {
      if (err) {
        callback('Problem downloading data repo contents from '
          + URL_REPO_CONTENTS);
        return;
      }

      callback(null, body);
    });
  },
  function(_gitContents, callback) {
    // Recursively run createEntries function on each file
    _gitContents = JSON.parse(_gitContents);

    createEntries(_gitContents, callback);
  },
], function(err) {
  if (err) {
    console.log(err);
  }

  console.log('Seeding completed.');

  process.exit();
});

function createEntries(items, parentCallback) {
  let item = items[0];

  let json;

  async.waterfall([
    function(callback) {
      // Skip template.json file
      // TODO: Don't use a conditional for this
      if (item.name === 'template.json' ||
        item.name === 'template-new.json' ||
        item.name === 'schema-readme.md') {
        callback(true);
        return;
      }

      // Get the JSON data file
      let timestamp = Math.round((new Date()).getTime() / 1000);
      request(`${item.download_url}?${timestamp}`, function(err, res, body) {
        if (err) {
          callback('Error: Problem download JSON file ' + item.download_url);
          return;
        }

        callback(null, body);
      });
    },
    function(_json, callback) {
      // Write contents of JSON file to database
      json = JSON.parse(_json);

      // Pull organisation information from OpenCorporates if available
      request(`https://api.opencorporates.com/companies/` +
        `${json.organisationInformation.registrationCountry.toLowerCase()}/` +
        `${json.organisationInformation.number}`, function(err, res, body) {
        if (res.statusCode === 404) {
          callback(null, null);
        } else {
          callback(null, body);
        }
      });
    },
    function(_openCorporatesJson, callback) {
      _openCorporatesJson = JSON.parse(_openCorporatesJson);

      let name = '';

      // Attempt to get a canonical name from OpenCorporates
      if (_openCorporatesJson) {
        name = _openCorporatesJson.results.company.name;
      } else {
        name = json.organisationInformation.name;
      }

      // Remove empty fields
      json = cleanDeep(json);

      Organisation.create({
        'name': name,
        'registrationNumber': json.organisationInformation.number,
        'registrationCountry': json.organisationInformation.registrationCountry
                                  .toLowerCase(),
        'payload': JSON.stringify(json),
      }).then(function() {
        callback(null);
      }).catch(function(err) {
        callback(err);
      });
    },
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
