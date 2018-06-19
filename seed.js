// NPM INCLUDES
const _ = require('lodash');
const cleanDeep = require('clean-deep');
const async = require('async');
const request = require('request');
const yaml = require('yamljs');
const execSync = require('child_process').execSync;
const models = require('../models');

// LOCAL IMPORTS
const Utils = require('./libs/utils.js');
const sync = require('./libs/sync');
const settings = yaml.load('settings.yaml');

// STARTUP CHECKS
if (Utils.checkForMissingEnvVars(['DATABASE_URL'])) {
  process.exit();
}

async.waterfall([
  function(callback) {
    // Create database
    try {
      console.log('-> Creating database');
      execSync('./node_modules/.bin/sequelize db:create');
    } catch (e) {
      console.log('--> Failed to create database (probably exists)');
    }

    // Run migrations
    try {
      console.log('-> Running migrations');
      execSync('./node_modules/.bin/sequelize db:migrate');
    } catch (e) {
      console.log('--> Failed to run database migrations');
    }

    // Remove any existing entries
    models.Organisation.destroy({
      where: {},
      truncate: true,
    }).then(function() {
      callback();
    });
  },
  function(callback) {
    let url = `https://api.github.com/repos/${settings.repository_path}/contents/`;

    console.log(`-> Getting list of files from ${url}`);

    // Request list of all files in the data repository
    request({
      url: url,
      headers: {
        'User-Agent': settings.user_agent,
      },
    }, function(err, res, body) {
      if (err) {
        callback(`--> Problem getting files from ${url}`);
      }

      if (res.statusCode !== 200) {
        callback(`--> Problem getting files from ${url}`);
      }

      callback(null, body);
    });
  },
  function(_contents, callback) {
    _contents = JSON.parse(_contents);

    let files = [];

    // Turn response into list of files
    _contents.forEach(function(item) {
      if (item.name.includes('.json')) {
        files.push(item.name);
      }
    });

    sync.handleModified(files, callback);
  },
  function(err) {
    if (err) {
      console.log(err);
    }

    console.log('Seeding completed.');

    process.exit();
  },
]);
