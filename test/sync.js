const chai = require('chai');
const sync = require('../libs/sync');

// Set up chai
chai.should();
chai.use(require('chai-things'));

describe('processDiffs()', function() {
  it('should create an object containing files to process', function() {
    // Arrange
    let incomingJson = require('./data/github/webhook.json');
    incomingJson = JSON.stringify(incomingJson);

    // Act
    let result = sync.processDiffs(incomingJson);

    // Assert
    let expectedDiff = {
      'modified': [
        'gb01234567.json',
        'us_de76543210.json',
        'ca_nb246801.json',
        'dk1234567.json',
        'se2468014.json',
      ],
      'removed': [
        'gb135790.json',
        'removethis.json',
      ],
    };

    result.should.be.an('object');
    result.should.have.a.property('modified').which.is.an('array');
    result.should.have.a.property('removed').which.is.an('array');
    result.modified.should.have.members(expectedDiff.modified);
    result.removed.should.have.members(expectedDiff.removed);
  });

  it('should reject a payload without commits', function() {
    // Arrange
    let incomingJson = require('./data/github/webhook_empty.json');
    incomingJson = JSON.stringify(incomingJson);

    // Act
    let result = sync.processDiffs(incomingJson);

    // Assert
    result.should.equals(false);
  });

  it('should ignore anything happening outside the master branch', function() {
    // Arrange
    let incomingJson = require('./data/github/webhook_not_master.json');
    incomingJson = JSON.stringify(incomingJson);

    // Act
    let result = sync.processDiffs(incomingJson);

    // Assert
    result.should.equals(false);
  });
});

describe('tryParseJSON()', function() {
  it('should return true when valid json', function() {
    // Arrange
    let input = '{"foo": "bar"}';

    // Act
    let result = sync.validateJSONString(input);

    // Assert
    result.should.equal(true);
  });

  it('should return false when invalid json', function() {
    // Arrange
    let input = '{foo: "bar}';

    // Act
    let result = sync.validateJSONString(input);

    // Assert
    result.should.equal(false);
  });
});

describe('validateRequiredFields()', function() {
  it('should return true if required fields are present', function() {
    // Arrange
    let input = {
      'organisationInformation': {
        'name': 'Test Limited',
        'number': '01234567',
        'registrationCountry': 'gb',
      },
    };

    // Act
    let result = sync.validateRequiredFields(input);

    // Assert
    result.should.equal(true);
  });

  it('should return false if organisationInformation block is missing',
    function() {
    // Arrange
    let input = {
      'foo': {
        'some': 'value',
      },
    };

    // Act
    let result = sync.validateRequiredFields(input);

    // Assert
    result.should.equal(false);
  });

  it('should return false if organisationInformation is empty', function() {
    // Arrange
    let input = {
      'organisationInformation': {
      },
    };

    // Act
    let result = sync.validateRequiredFields(input);

    // Assert
    result.should.equal(false);
  });

  it('should return false if some required fields are missing', function() {
    // Arrange
    let input = {
      'organisationInformation': {
        'number': '01234567',
      },
    };

    // Act
    let result = sync.validateRequiredFields(input);

    // Assert
    result.should.equal(false);
  });
});

describe('cleanseJson()', function() {
  it('should remove all empty fields', function() {
    // Arrange
    let input = {
      'dataProtectionOfficer': {
        'contactInfo': {},
      },
      'dataProtectionRegister': {
        'url': 'https://example.com',
      },
      'thirdParties': {
        'isMissing': false,
        'list': [],
      },
      'dataCategoriesCollected': {
        'isMissing': true,
      },
      'rights': {
        'isMissing': false,
        'general': {
          'url': 'https://example.com',
        },
      },
    };

    let expectedResult = {
      'dataProtectionRegister': {
        'url': 'https://example.com',
      },
      'dataCategoriesCollected': {
        'isMissing': true,
      },
      'rights': {
        'general': {
          'url': 'https://example.com',
        },
      },
    };

    // Act
    let result = sync.cleanseJson(input);

    // Assert
    result.should.deep.equals(expectedResult);
  });
});
