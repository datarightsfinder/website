// NPM REQUIRES
const chai = require('chai');
const del = require('delete');
const execSync = require('child_process').execSync;
const async = require('async');
const nock = require('nock');

// IMPORT LIBARARIES TO TEST WITH
const webhook = require('../controllers/webhook');

// SEQUELIZE
const Sequelize = require('sequelize');
const sequelizeConfig = require('../config/config.js');

let sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({
    storage: sequelizeConfig[process.env.NODE_ENV].storage,
    dialect: sequelizeConfig[process.env.NODE_ENV].dialect,
    dialectOptions: sequelizeConfig[process.env.NODE_ENV].dialectOptions,
  });
} else {
  sequelize = new Sequelize(sequelizeConfig[process.env.NODE_ENV].url, {
    dialect: sequelizeConfig[process.env.NODE_ENV].dialect,
    dialectOptions: sequelizeConfig[process.env.NODE_ENV].dialectOptions,
  });
}

// MODELS
const Organisation = sequelize.import('../models/organisation.js');

refreshDatabase();

describe('incoming webhook (create)', function() {
  let result;

  before(function(done) {
    // Set up mocks
    let mockJsonFile = require('./data/schema/projectsbyif.json');
    nock('https://raw.githubusercontent.com')
      .get(/projectsbyif\/odr-test\/master\/gb09802689.json\?\d{10}/)
      .reply(200, mockJsonFile);

    let mockOpenCorporates = require('./data/opencorporates/projectsbyif.json');
    nock('https://api.opencorporates.com')
      .get('/companies/gb/09802689')
      .reply(200, mockOpenCorporates);

    async.waterfall([
      function(callback) {
        // Reset database
        Organisation.destroy({
          where: {},
          truncate: true,
        }).then(function() {
          callback();
        });
      },
      function(callback) {
        let input = require('./data/github/webhook_add.json');
        input = JSON.stringify(input);

        webhook.handleIncoming(input, callback);
      },
      function(callback) {
        Organisation.findOne({
          where: {
            filename: 'gb09802689.json',
          },
        }).then(function(obj) {
          result = obj.dataValues;

          done();
        });
      },
    ]);
  });

  it('should create a new entry for a new file', function() {
    let expectedPayload = '{"organisationInformation":{"name":"Projects By IF","number":"09802689","registrationCountry":"gb"},"organisationUrls":["https://projectsbyif.com"],"privacyNoticeUrl":{"url":"https://projectsbyif.com/how-if-uses-data"},"dataProtectionOfficer":{"present":"not_present"},"dataProtectionRegister":{"present":"not_present"},"dataProcessingAddendum":{"present":"not_present"},"thirdParties": {"list": ["Matomo","Digital Ocean","Amazon AWS"],"specificity": "specific"}}';

    expectedPayload = JSON.parse(expectedPayload);

    result.name.should.equal('PROJECTS BY IF LTD');
    result.registrationNumber.should.equal('09802689');
    result.registrationCountry.should.equal('gb');
    result.payload.should.deep.equal(expectedPayload);
    result.filename.should.equal('gb09802689.json');
  });
});

describe('incoming webhook (modify)', function() {
  let result;

  before(function(done) {
    // Set up mocks
    let mockJsonFile = require('./data/schema/projectsbyif-modified.json');
    nock('https://raw.githubusercontent.com')
      .get(/projectsbyif\/odr-test\/master\/gb09802689.json\?\d{10}/)
      .reply(200, mockJsonFile);

    let mockOpenCorporates = require('./data/opencorporates/projectsbyif.json');
    nock('https://api.opencorporates.com')
      .get('/companies/gb/09802689')
      .reply(200, mockOpenCorporates);

    async.waterfall([
      function(callback) {
        // Reset database
        Organisation.destroy({
          where: {},
          truncate: true,
        }).then(function() {
          callback();
        });
      },
      function(callback) {
        // Add an existing entry to the database
        let existingPayload = '{"organisationInformation":{"name":"Projects By IF","number":"09802689","registrationCountry":"gb"},"organisationUrls":["https://projectsbyif.com"],"privacyNoticeUrl":{"url":"https://projectsbyif.com/how-if-uses-data"},"dataProtectionOfficer":{"present":"not_present"},"dataProtectionRegister":{"present":"not_present"},"dataProcessingAddendum":{"present":"not_present"}}';

        Organisation.create({
          name: 'PROJECTS BY IF LTD',
          registrationNumber: '09802689',
          registrationCountry: 'gb',
          payload: JSON.parse(existingPayload),
          filename: 'gb09802689.json',
        }).then(function() {
          callback();
        });
      },
      function(callback) {
        let input = require('./data/github/webhook_modify.json');
        input = JSON.stringify(input);

        webhook.handleIncoming(input, callback);
      },
      function(callback) {
        Organisation.findOne({
          where: {
            filename: 'gb09802689.json',
          },
        }).then(function(obj) {
          result = obj.dataValues;

          done();
        });
      },
    ]);
  });

  it('should modify an existing entry for an existing file', function() {
    let expectedPayload = '{"organisationInformation":{"name":"Projects By IF","number":"09802689","registrationCountry":"gb"},"organisationUrls":["https://projectsbyif.com"],"privacyNoticeUrl":{"url":"https://projectsbyif.com/how-if-uses-data"},"dataProtectionOfficer":{"present":"not_present"},"dataProtectionRegister":{"present":"not_present"},"dataProcessingAddendum":{"present":"not_present"},"automatedDecisionMaking":{"usesAutomatedDecisionMaking":"not_present"},"complaintInformation":{"present":"present"},"presentation":{"plainLanguage":"pass","easyToFind":"pass","easyToFindInside":"pass"},"thirdParties": {"list": ["Matomo","Digital Ocean","Amazon AWS"],"specificity": "specific"}}';

    expectedPayload = JSON.parse(expectedPayload);

    result.name.should.equal('PROJECTS BY IF LTD');
    result.registrationNumber.should.equal('09802689');
    result.registrationCountry.should.equal('gb');
    result.payload.should.deep.equal(expectedPayload);
    result.filename.should.equal('gb09802689.json');
  });
});

describe('incoming webhook (delete)', function() {
  let result;

  before(function(done) {
    async.waterfall([
      function(callback) {
        // Reset database
        Organisation.destroy({
          where: {},
          truncate: true,
        }).then(function() {
          callback();
        });
      },
      function(callback) {
        // Add an existing entry to the database
        let existingPayload = '{"organisationInformation":{"name":"Projects By IF","number":"09802689","registrationCountry":"gb"},"organisationUrls":["https://projectsbyif.com"],"privacyNoticeUrl":{"url":"https://projectsbyif.com/how-if-uses-data"},"dataProtectionOfficer":{"present":"not_present"},"dataProtectionRegister":{"present":"not_present"},"dataProcessingAddendum":{"present":"not_present"}}';

        Organisation.create({
          name: 'PROJECTS BY IF LTD',
          registrationNumber: '09802689',
          registrationCountry: 'gb',
          payload: JSON.parse(existingPayload),
          filename: 'gb09802689.json',
        }).then(function() {
          callback();
        });
      },
      function(callback) {
        let input = require('./data/github/webhook_remove.json');
        input = JSON.stringify(input);

        webhook.handleIncoming(input, callback);
      },
      function(callback) {
        Organisation.findOne({
          where: {
            filename: 'gb09802689.json',
          },
        }).then(function(obj) {
          result = obj;

          console.log(obj);

          done();
        });
      },
    ]);
  });

  it('should delete an existing entry for an existing file', function() {
    chai.expect(result).to.be.null;
  });
});

function refreshDatabase() {
  // Create a testing database
  del.sync(['test/test.db']);
  execSync('NODE_ENV=test ./node_modules/.bin/sequelize db:migrate');
}
