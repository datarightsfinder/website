const _ = require('lodash');
const async = require('async');
const cleanDeep = require('clean-deep');
const yaml = require('yamljs');
const request = require('request');
const crypto = require('crypto');
const cheerio = require('cheerio');
const moment = require('moment');
const models = require('../models');

const settings = yaml.load('settings.yaml');

// Find what files have changed according to a GitHub push callback
// _json (string): Webhook payload from GitHub push event
function processDiffs(_json) {
  // Create result object
  let result = {
    'modified': [],
    'removed': [],
  };

  // Make sure JSON is in correct format
  let json = _json;

  if (typeof _json !== 'object') {
    json = JSON.parse(json);
  }

  // Reject if commit is not in master branch
  if (json.ref !== 'refs/heads/master') {
    return false;
  }

  // Reject if there are no commits
  if (json.commits.length === 0) {
    return false;
  }

  // Iterate through each commit and build a list of files to
  // update and delete
  json.commits.forEach(function(commit, index) {
    commit.added.forEach(function(commitAdded, index) {
      result.removed = _.remove(result.removed, function(n) {
        return n !== commitAdded;
      });

      if (result.modified.indexOf(commitAdded) === -1) {
        result.modified.push(commitAdded);
      }
    });

    commit.modified.forEach(function(commitModified, index) {
      // Check if already file is due to be removed
      result.removed = _.remove(result.removed, function(n) {
        return n !== commitModified;
      });

      if (result.modified.indexOf(commitModified) === -1) {
        result.modified.push(commitModified);
      }
    });

    commit.removed.forEach(function(commitRemoved, index) {
      // Check if already file is due to be removed
      result.modified = _.remove(result.modified, function(n) {
        return n !== commitRemoved;
      });

      if (result.removed.indexOf(commitRemoved) === -1) {
        result.removed.push(commitRemoved);
      }
    });
  });

  return result;
}

// Reject any malformed JSON files
function validateJSONString(json) {
  // Try to parse a string into JSON, if it fails
  // then return false
  try {
    let o = JSON.parse(json);

    if (o && typeof o === 'object') {
      return true;
    }
  } catch (e) { }

  return false;
}

// Handle any new or changed files
function handleModified(files, parentCallback) {
  let json;
  let filename = files[0];
  let jsonLastUpdated;
  let policyHash;
  let organisation;

  async.waterfall([
    function(callback) {
      // Try and see if this organisation already exists
      models.Organisation.findOne({
        where: {
          filename: filename,
        },
      }).then((res) => callback(null, res));
    },
    function(_organisation, callback) {
      organisation = _organisation;

      let timestamp = Math.round((new Date()).getTime() / 1000);
      let url = `https://raw.githubusercontent.com/${settings.repository_path}`
        + `/master/${filename}?${timestamp}`;

      console.log(`--> Getting ${url}`);

      // Attempt to get the file from GitHub
      request({
        url: url,
        headers: {'User-Agent': settings.user_agent},
      }, function(err, res, body) {
        if (err) {
          callback('---> Problem making request');
          return;
        }

        if (res.statusCode !== 200) {
          callback('---> Unable to get file from GitHub');
          return;
        }

        callback(null, body);
      });
    },
    function(_json, callback) {
      // Check file for syntax errors
      if (!validateJSONString(_json)) {
        callback('---> Unable to parse JSON');
        return;
      }

      // Convert and store parsed JSON object
      json = JSON.parse(_json);

      // Validate JSON
      if (!validateRequiredFields(json)) {
        callback('---> Missing required fields');
        return;
      }

      // Remove empty fields
      json = cleanseJson(json);

      // Find when file was last updated from GitHub
      let url = `https://api.github.com/repos/${settings.repository_path}/` +
        `commits?path=${filename}&page=1&per_page=1&access_token=` +
        `${process.env.GITHUB_TOKEN}`;

      request({
        url: url,
        headers: {'User-Agent': settings.user_agent},
      }, function(err, res, body) {
        if (err) {
          callback('---> Problem making request');
          return;
        }

        if (res.statusCode !== 200) {
          callback('---> Unable to get file information from GitHub');
          return;
        }

        callback(null, body);
      });
    },
    function(_fileInfo, callback) {
      _fileInfo = JSON.parse(_fileInfo);
      jsonLastUpdated = _fileInfo[0].commit.author.date;

      request({
        url: json.privacyNoticeUrl.url,
        headers: {'User-Agent': settings.user_agent},
      }, function(err, res, body) {
        if (err) {
          callback('---> Problem making request');
          return;
        }

        if (res.statusCode !== 200) {
          callback('---> Unable to download privacy notice');
          return;
        }

        callback(null, [body, res.headers['content-type']]);
      });
    },
    function(_result, callback) {
      let hashLastUpdated = '';
      let policyBodyFull = _result[0];
      let policyBodyNoSpaces = _result[0];
      let policyTextOld = '';
      let policyTextNew = '';
      let contentType = _result[1].split(';')[0];
      let isHtmlPolicy = false;

      if (contentType === 'text/html') {
        const $ = cheerio.load(_result[0]);
        policyBodyFull = $('p').text();
        policyBodyNoSpaces = policyBodyFull.replace(/\s+/g, '');
        isHtmlPolicy = true;
      }

      policyHash = crypto.createHash('sha512').update(policyBodyNoSpaces)
        .digest('hex');

      if (organisation === null) {
        hashLastUpdated = jsonLastUpdated;

        policyTextOld = isHtmlPolicy ? policyBodyFull : null;
        policyTextNew = isHtmlPolicy ? policyBodyFull : null;
      } else {
        if (policyHash !== organisation.hash) {
          hashLastUpdated = `${moment().subtract(1, 'hours').format('YYYY-MM-DDTHH:mm:ss')}Z`;

          policyTextOld = organisation.policyTextNew;
          policyTextNew = isHtmlPolicy ? policyBodyFull : null;
        } else {
          policyTextOld = isHtmlPolicy ? policyBodyFull : null;
          policyTextNew = isHtmlPolicy ? policyBodyFull : null;

          hashLastUpdated = organisation.hashLastUpdated;
        }
      }

      upsert({
        'name': json.organisationInformation.name,
        'sortName': json.organisationInformation.name.toUpperCase(),
        'registrationNumber': json.organisationInformation.number,
        'registrationCountry': json.organisationInformation
                                    .registrationCountry,
        'payload': json,
        'filename': filename,
        'jsonLastUpdated': jsonLastUpdated,
        'hash': policyHash,
        'hashLastUpdated': hashLastUpdated,
        'policyTextOld': policyTextOld,
        'policyTextNew': policyTextNew,
      }, callback);
    },
  ], function(err) {
    if (err) {
      console.log(err);
    }

    files.shift();

    if (files.length === 0) {
      parentCallback(null);
    } else {
      handleModified(files, parentCallback);
    }
  });
}

// Handle any deleted files
function handleDeleted(files, parentCallback) {
  let file = files[0];

  async.waterfall([
    function(callback) {
      models.Organisation.findOne({
        where: {
          filename: file,
        },
      }).then(function(obj) {
        obj.destroy().then(function() {
          callback(null);
        }).catch(function() {
          callback(`-> Unable to destroy entry for ${file}`);
          return;
        });
      }).catch(function() {
        callback(`-> Unable to find entry for ${file}`);
        return;
      });
    },
  ], function(err) {
    if (err) {
      console.log(err);
    }

    files.shift();

    if (files.length === 0) {
      parentCallback(null);
    } else {
      handleDeleted(files, parentCallback);
    }
  });
}

// Validate JSON for required fields
function validateRequiredFields(json) {
  try {
    if (json.organisationInformation) {
      let org = json.organisationInformation;

      if (org.name && org.number && org.registrationCountry) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

// Cleanse JSON
function cleanseJson(json) {
  // Remove any isMissing: false objects
  for (let root in json) {
    if (json.hasOwnProperty(root)) {
      let itemRoot = json[root];

      if (itemRoot.isMissing === false) {
        delete json[root].isMissing;
      }
    }
  }

  json = cleanDeep(json);

  return json;
}

// Insert new entries or update existing ones
function upsert(row, parentCallback) {
  models.Organisation.findOne({
    where: {
      'filename': row.filename,
    },
  }).then(function(obj) {
    if (obj) {
      // Update
      obj.update(row).then(function() {
        parentCallback(null);
      });
    } else {
      // Insert
      models.Organisation.create(row).then(function() {
        parentCallback(null);
      });
    }
  }).catch(function() {
    parentCallback('Error doing upsert');
  });
}

module.exports = {
  processDiffs,
  validateJSONString,
  handleModified,
  handleDeleted,
  validateRequiredFields,
  cleanseJson,
};
