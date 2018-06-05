const chai = require('chai');
chai.should();
chai.use(require('chai-things'));
const overviewMatrix = require('../libs/overview_matrix');

describe('overviewMatrix()', function() {
  describe('generate()', function() {
    it('should attempt all tests', function() {
      // Arrange
      let payload = {
        'organisationInformation': {
          'name': 'Projects By IF',
          'number': '09802689',
          'registrationCountry': 'GB',
        },
      };

      // Act
      let generate = overviewMatrix.generate(payload);

      // Assert
      generate.should.have.lengthOf(14);
    });
  });

  describe('dataProtectionOfficerPresent()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.dataProtectionOfficerPresent;

    it('should return good when some data protection officer contacts are '
      + 'present', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'name': 'Firstname Lastname',
          'role': 'Data Protection Officer',
          'contactInfo': {
            'url': 'https://projectsbyif.com/dpo',
            'postalAddress': 'Somerset House, Strand, London, WC2R 1LA, '
              + 'United Kingdom',
            'emailAddress': 'hello@projectsbyif.com',
            'telephoneNumber': '+4402078454600',
          },
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionOfficerPresent(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return good when all data protection officer contacts'
      + ' are missing', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'contactInfo': {
            'emailAddress': 'dpo@example.com',
          },
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionOfficerPresent(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when all data protection officer contacts '
      + 'are missing', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'name': 'Firstname Lastname',
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionOfficerPresent(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  describe('dataProtectionOfficerSpecialCategories()', function() {
    // Pass result
    let testResult = overviewMatrix.templates
      .dataProtectionOfficerSpecialCategories;

    it('should return warning when there are special categories and dpo '
      + 'details are missing', function() {
      // Arrange
      let testInput = {
        'dataTypesCollected': {
          'list': [
            'biometrics',
          ],
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionOfficerSpecialCategories(
        testInput
      );

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when there are special categories and some dpo '
      + 'details are present', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'contactInfo': {
            'emailAddress': 'hello@projectsbyif.com',
          },
        },
        'dataTypesCollected': {
          'list': [
            'biometrics',
          ],
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionOfficerSpecialCategories(
        testInput
      );

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when there are are no categories', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'contactInfo': {
            'emailAddress': 'hello@projectsbyif.com',
          },
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionOfficerSpecialCategories(
        testInput
      );

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  describe('dataProtectionRegister()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.dataProtectionRegister;

    it('should return good when all data protection register details '
      + 'are present', function() {
      // Arrange
      let testInput = {
        'dataProtectionRegister': {
          'identifier': 'ZA182519',
          'url': 'https://ico.org.uk/ESDWebPages/Entry/ZA182519',
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionRegister(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return good when data protection identifier is present',
      function() {
      // Arrange
      let testInput = {
        'dataProtectionRegister': {
          'identifier': 'ZA182519',
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionRegister(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return good when data protection url is present', function() {
      // Arrange
      let testInput = {
        'dataProtectionRegister': {
          'url': 'https://ico.org.uk/ESDWebPages/Entry/ZA182519',
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionRegister(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should nothing when no data protection details', function() {
      // Arrange
      let testInput = {
        'someOtherValue': {
          'foo': 'bar',
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionRegister(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  describe('internationalTransferPrivacyShield()', function() {
    // Result
    let testResult = overviewMatrix.templates
      .internationalTransferPrivacyShield;

    it('should return good when privacy shield url is present when us state',
      function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'us_ca',
        },
        'internationalTransfer': {
          'privacyShieldUrl': 'https://www.privacyshield.gov',
          'dataProcessingAddendum': {
            'type': 'assumed',
            'url': 'https://example.com',
            'notes': 'These are some notes',
          },
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferPrivacyShield(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when privacy shield url is present '
      + 'and not us state', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'gb',
        },
        'internationalTransfer': {
          'privacyShieldUrl': 'https://www.privacyshield.gov',
          'dataProcessingAddendum': {
            'type': 'assumed',
            'url': 'https://example.com',
            'notes': 'These are some notes',
          },
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferPrivacyShield(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when privacy shield url is not present '
      + 'and in us state', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'us_ca',
        },
        'internationalTransfer': {
          'dataProcessingAddendum': {
            'type': 'assumed',
            'url': 'https://example.com',
            'notes': 'These are some notes',
          },
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferPrivacyShield(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  describe('internationalTransferAddendum()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.internationalTransferAddendum;

    it('should return good if there is a data processing addendum', function() {
      // Arrange
      let testInput = {
        'internationalTransfer': {
          'privacyShieldUrl': 'https://example.com',
          'dataProcessingAddendum': {
            'type': 'form',
            'url': 'https://example.com/dpa',
            'notes': 'These are some notes',
          },
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferAddendum(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when data processing addendum type is none',
      function() {
      // Arrange
      let testInput = {
        'internationalTransfer': {
          'privacyShieldUrl': 'https://example.com',
          'dataProcessingAddendum': {
            'type': 'none',
            'url': 'https://example.com/dpa',
            'notes': 'These are some notes',
          },
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferAddendum(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when data processing addendum type is none '
      + 'but values are present', function() {
      // Arrange
      let testInput = {
        'internationalTransfer': {
          'privacyShieldUrl': 'https://example.com',
          'dataProcessingAddendum': {
            'url': 'https://example.com/dpa',
          },
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferAddendum(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  describe('internationalTransferAdequacyDecision()', function() {
    // Pass result
    let testResult = overviewMatrix.templates
      .internationalTransferAdequacyDecision;

    it('should return good when organisation is registered in an adequacy '
     + 'decision country', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'AD',
        },
      };

      // Act
      let result = overviewMatrix
        .internationalTransferAdequacyDecision(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return good when organisation is registered in an adequacy '
      + 'country with state', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'ca_nb',
        },
      };

      // Act
      let result = overviewMatrix
        .internationalTransferAdequacyDecision(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when organisation is in eea', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'gb',
        },
      };

      // Act
      let result = overviewMatrix
        .internationalTransferAdequacyDecision(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when organisation is in us', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'us_de',
        },
      };

      // Act
      let result = overviewMatrix
        .internationalTransferAdequacyDecision(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  describe('internationalTransferWarning()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.internationalTransferWarning;

    it('should return warning when country is us and has no privacy '
      + 'shield and dpa', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'us_de',
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return warning when country is non-us / eeu and has no dpa',
      function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'ph',
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when country is in eea', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'gb',
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferWarning(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when country has adequacy decision', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'nz',
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferWarning(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when country is us but has privacy shield',
      function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'us_de',
        },
        'internationalTransfer': {
          'privacyShieldUrl': 'https://www.privacyshield.gov/',
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferWarning(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  // Third parties
  // No tests

  // Retention rules
  // No tests

  describe('specialCategoriesWarning()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.specialCategoriesWarning;

    it('should show warning when special categories are collected', function() {
      // Arrange
      let testInput = {
        'dataTypesCollected': {
          'list': [
            'device_information',
            'biometrics',
            'online_activity',
          ],
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.specialCategoriesWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should show nothing when special categories are not collected',
      function() {
      // Arrange
      let testInput = {
        'dataTypesCollected': {
          'list': [
            'device_information',
            'location',
            'online_activity',
          ],
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.specialCategoriesWarning(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  describe('automatedDecisionMakingWarning()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.automatedDecisionMakingWarning;

    it('should show warning when automated decision making is true',
      function() {
      // Arrange
      let testInput = {
        'automatedDecisionMaking': {
          'usesAutomatedDecisionMaking': true,
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.automatedDecisionMakingWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should show nothing when automated decison making is false',
      function() {
      // Arrange
      let testInput = {
        'automatedDecisionMaking': {
          'usesAutomatedDecisionMaking': false,
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.automatedDecisionMakingWarning(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  describe('complaintInformationWarning()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.complaintInformationWarning;

    it('should return warning when complaint information is false', function() {
      // Arrange
      let testInput = {
        'complaintInformation': {
          'present': false,
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.complaintInformationWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return warning when complaint information is missing',
      function() {
      // Arrange
      let testInput = {
        'someOtherValue': {
          'foo': 'bar',
        },
      };

      // Act
      let result = overviewMatrix.complaintInformationWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when complaint information is true', function() {
      // Arrange
      let testInput = {
        'complaintInformation': {
          'present': true,
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.complaintInformationWarning(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  describe('securityStandardsSpecificity()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.securityStandardsSpecificity;

    it('should return good when specific security stanards', function() {
      // Arrange
      let testInput = {
        'securityStandards': {
          'specificity': 'specific',
          'url': 'https://projectsbyif.com/how-if-uses-data',
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.securityStandardsSpecificity(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when unspecific security standards', function() {
      // Arrange
      let testInput = {
        'securityStandards': {
          'specificity': 'general',
          'url': 'https://projectsbyif.com/how-if-uses-data',
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.securityStandardsSpecificity(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when missing specificity enum', function() {
      // Arrange
      let testInput = {
        'securityStandards': {
          'url': 'https://projectsbyif.com/how-if-uses-data',
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.securityStandardsSpecificity(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  // Lawful bases
  // No tests

  describe('individualRightsWarning()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.individualRightsWarning;

    it('should return warning when no information about rights is present',
      function() {
      // Arrange
      let testInput = {
        'someOtherValue': {
          'foo': 'bar',
        },
      };

      // Act
      let result = overviewMatrix.individualRightsWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when general rights information is present',
      function() {
      // Arrange
      let testInput = {
        'rights': {
          'general': {
            'contactInfo': {
              'url': 'https://projectsbyif.com/test',
              'postalAddress': 'Somerset House, Strand, London, WC2R 1LA, '
                + 'United Kingdom',
              'emailAddress': 'hello@projectsbyif.com',
              'telephoneNumber': '+4402078454600',
            },
            'notes': 'These are some notes\n\nThis is another line',
          },
        },
      };

      // Act
      let result = overviewMatrix.individualRightsWarning(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when any non-general rights information '
      + 'is present', function() {
      // Arrange
      let testInput = {
        'rights': {
          'access': {
            'contactInfo': {
              'url': 'https://projectsbyif.com/test',
              'postalAddress': 'Somerset House, Strand, London, WC2R 1LA, '
                + 'United Kingdom',
              'emailAddress': 'hello@projectsbyif.com',
              'telephoneNumber': '+4402078454600',
            },
            'notes': 'These are some notes\n\nThis is another line',
          },
        },
      };

      // Act
      let result = overviewMatrix.individualRightsWarning(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  // Processing purposes
  // No tests

  describe('transparencyRecommendationsWarning()', function() {
    let testResult = overviewMatrix.templates
      .transparencyRecommendationsWarning;

    it('should show warning when transparency recommendations are all false',
      function() {
      // Arrange
      let testInput = {
        'transparencyRecommendations': {
          'plainLanguage': false,
          'definiteLanguage': false,
          'easyToFind': false,
          'legibleDesign': false,
        },
      };

      // Act
      let result = overviewMatrix.transparencyRecommendationsWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should show nothing when transparency recommendations are '
      + 'not all false', function() {
      // Arrange
      let testInput = {
        'transparencyRecommendations': {
          'plainLanguage': true,
          'definiteLanguage': false,
          'easyToFind': false,
          'legibleDesign': false,
        },
      };

      // Act
      let result = overviewMatrix.transparencyRecommendationsWarning(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  describe('transparencyRecommendationsAllGood()', function() {
    let testResult = overviewMatrix.templates
      .transparencyRecommendationsAllGood;

    it('should show good when transparency recommendations are all true',
      function() {
      // Arrange
      let testInput = {
        'transparencyRecommendations': {
          'plainLanguage': true,
          'definiteLanguage': true,
          'easyToFind': true,
          'legibleDesign': true,
        },
      };

      // Act
      let result = overviewMatrix.transparencyRecommendationsAllGood(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should show nothing when transparency recommendations are not all true',
      function() {
      // Arrange
      let testInput = {
        'transparencyRecommendations': {
          'plainLanguage': false,
          'definiteLanguage': true,
          'easyToFind': true,
          'legibleDesign': true,
        },
      };

      // Act
      let result = overviewMatrix.transparencyRecommendationsAllGood(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  // TODO: Coverage test
  // describe('coverageTest()', function() {
  //   it('should return warning when missing 75% of information', function() {
  //     // Arrange
  //     let testInput =
  //
  //     // Act
  //     let result = overviewMatrix.generate(testInput);
  //
  //     // Assert
  //     result.should.be.an('array')
  //       .that.does.include.something.that.deep.equals(testResult);
  //   });
  //
  //   it('should return nothing when not missing 75% of information',
  //   function() {
  //     // Arrange
  //     let testInput =
  //
  //     // Act
  //     let result = overviewMatrix.generate(testInput);
  //
  //     // Assert
  //     result.should.be.an('array')
  //       .that.does.include.something.that.deep.equals(testResult);
  //   });
  // });
});
