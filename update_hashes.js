const models = require('./models');
const request = require('request');
const yaml = require('yamljs');
const crypto = require('crypto');
const cheerio = require('cheerio');
const moment = require('moment');

const settings = yaml.load('settings.yaml');

let update = () => {
  models.Organisation.findAll()
    .then((_allOrganisations) => getLatestHashes(_allOrganisations))
    .then(() => {
      console.log('All done, exiting!');
      return process.exit();
    })
    .catch(() => process.exit());
};

let getLatestHashes = (allOrganisations) => {
  return new Promise((resolve, reject) => {
    let organisation = allOrganisations[0];

    console.log(`Processing ${organisation.name}`);

    getLatestHash(organisation)
      .then(() => {
        console.log(`Finished processing ${organisation.name}`);

        allOrganisations.shift();

        if (allOrganisations.length === 0) {
          console.log('Nothing left to process');
          return resolve();
        } else {
          console.log('Processing next item');
          return resolve(getLatestHashes(allOrganisations));
        }
      })
      .catch(() => process.exit());
  });
};

let getLatestHash = (organisation) => {
  return new Promise((resolve, reject) => {
    requestUrl(organisation.payload.privacyNoticeUrl.url)
      .then((_result) => {
        let isHtmlPolicy = false;
        let policyBodyFull = _result[0];
        let policyBodyNoSpaces = _result[0];
        let contentType = _result[1].split(';')[0];

        if (contentType === 'text/html') {
          const $ = cheerio.load(_result[0]);
          policyBodyFull = $('p').text();
          policyBodyNoSpaces = policyBodyFull.replace(/\s+/g, '');
          isHtmlPolicy = true;
        }

        let policyHash = crypto.createHash('sha512').update(policyBodyNoSpaces)
          .digest('hex');

        if (policyHash !== organisation.hash) {
          console.log('Hashes are different');
          organisation.hash = policyHash;

          if (isHtmlPolicy) {
            organisation.policyTextNew = policyBodyFull;
          }

          organisation.hashLastUpdated = `${moment().subtract(1, 'hours')
            .format('YYYY-MM-DDTHH:mm:ss')}Z`;

          organisation.save().then(() => {
            console.log('Changes saved');
            return resolve();
          });
        } else {
          console.log('Hashes are the same');
          return resolve();
        }
      })
      .catch(() => process.exit());
  });
};

let requestUrl = (url) => {
  return new Promise((resolve, reject) => {
    request({
      url: url,
      headers: {'User-Agent': settings.user_agent},
    }, (err, res, body) => {
      if (err) {
        return reject('Problem making request');
      }

      if (res.statusCode !== 200) {
        return reject('Unable to get file');
      }

      resolve([body, res.headers['content-type']]);
    });
  });
};

update();
