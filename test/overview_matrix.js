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
      generate.should.have.lengthOf(9);
    });
  });

  describe('dataProtectionOfficerPresent()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.dataProtectionOfficerPresent;

    it('should return message when dpo is present and has some contact details', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'present': 'present',
          'contactInfo': {
            'url': 'https://projectsbyif.com/dpo'
          },
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionOfficerPresent(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when dpo is present and has no contact details', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'present': 'present',
          'name': 'Firstname Lastname'
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionOfficerPresent(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when dpo is not present', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'present': 'not_present',
          'name': 'Firstname Lastname',
          'contactInfo': {
            'url': 'https://projectsbyif.com/dpo'
          }
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionOfficerPresent(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when dpo present flag is missing', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'contactInfo': {
            'url': 'https://example.com',
          },
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionOfficerPresent(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when dpo is missing', function() {
      // Arrange
      let testInput = {
        'someOtherValue': {
          'foo': 'bar',
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

    it('should return message when there are special categories and dpo is missing', function() {
      // Arrange
      let testInput = {
        'dataCategoriesCollected': {
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

    it('should return message when there are special categories and dpo flag is missing', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'contactInfo': {
            'emailAddress': 'hello@projectsbyif.com',
          },
        },
        'dataCategoriesCollected': {
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

    it('should return message when there are special categories and dpo is not present', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'present': 'not_present',
          'contactInfo': {
            'emailAddress': 'example@example.com',
          },
        },
        'dataCategoriesCollected': {
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

    it('should return message when there are special categories and dpo is present without details', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'present': 'present',
          'name': 'Firstname Lastname',
        },
        'dataCategoriesCollected': {
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

    it('should return nothing when there are special categories and dpo is present with details', function() {
      // Arrange
      let testInput = {
        'dataProtectionOfficer': {
          'present': 'present',
          'contactInfo': {
            'emailAddress': 'hello@projectsbyif.com',
          },
        },
        'dataCategoriesCollected': {
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
          'present': 'present',
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

    it('should return message when data protection register is present with details', function() {
      // Arrange
      let testInput = {
        'dataProtectionRegister': {
          'present': 'present',
          'identifier': 'ZA182519',
          'url': 'https://ico.org.uk/ESDWebPages/Entry/ZA182519',
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionRegister(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return message when data protection register is present with identifier',
      function() {
      // Arrange
      let testInput = {
        'dataProtectionRegister': {
          'present': 'present',
          'identifier': 'ZA182519',
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionRegister(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return message when data protection register is present with url', function() {
      // Arrange
      let testInput = {
        'dataProtectionRegister': {
          'present': 'present',
          'url': 'https://ico.org.uk/ESDWebPages/Entry/ZA182519',
        },
      };

      // Act
      let result = overviewMatrix.dataProtectionRegister(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when register details is missing', function() {
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

    it('should return nothing when data protection register is not present', function() {
      // Arrange
      let testInput = {
        'dataProtectionRegister': {
          'present': 'not_present',
          'url': 'https://ico.org.uk/ESDWebPages/Entry/ZA182519',
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

    it('should return message when privacy shield url is present when us state', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'us_ca',
        },
        'privacyShield': {
          'present': 'present',
          'url': 'https://privacyshield.gov',
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferPrivacyShield(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when privacy shield url is present and not us state', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'gb',
        },
        'privacyShield': {
          'present': 'present',
          'url': 'https://privacyshield.gov',
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferPrivacyShield(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when privacy shield url is not present and in us state', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'us_ca',
        },
        'privacyShield': {
          'present': 'not_present',
          'url': 'https://privacyshield.gov',
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferPrivacyShield(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when privacy shield url is present and in us state with no present flag', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'us_ca',
        },
        'privacyShield': {
          'url': 'https://privacyshield.gov',
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

    it('should return message when data processing addendum is present with details', function() {
      // Arrange
      let testInput = {
        'dataProcessingAddendum': {
          'present': 'present',
          'type': 'setting',
          'url': 'https://example.com',
          'notes': 'This is a note',
        }
      };

      // Act
      let result = overviewMatrix.internationalTransferAddendum(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when data processing addendum is not present',
      function() {
      // Arrange
      let testInput = {
        'dataProcessingAddendum': {
          'present': 'not_present',
          'type': 'setting',
          'url': 'https://example.com',
          'notes': 'This is a note',
        }
      };

      // Act
      let result = overviewMatrix.internationalTransferAddendum(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when data processing addendum has missing present flag', function() {
      // Arrange
      let testInput = {
        'dataProcessingAddendum': {
          'type': 'setting',
          'url': 'https://example.com',
          'notes': 'This is a note',
        }
      };

      // Act
      let result = overviewMatrix.internationalTransferAddendum(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });

    it('should return nothing when data processing addendum is missing', function() {
      // Arrange
      let testInput = {
        'someOtherValue': {
          'foo': 'bar',
        }
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

  // describe('internationalTransferEEA()', function() {
  //   it('should return good when organisation is registered in eea', function() {
  //
  //   });
  //
  //   it('should return nothing when organisation is registered outside eea', function() {
  //
  //   });
  // });

  describe('internationalTransferWarning()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.internationalTransferWarning;

    it('should return message when country is us and is missing privacy shield or addendum', function() {
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

    it('should return message when country is us and privacy shield or addendum is not present', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'us_de',
        },
        'privacyShield': {
          'present': 'not_present',
          'url': 'https://privacyshield.gov',
        },
        'dataProcessingAddendum': {
          'present': 'not_present',
          'type': 'setting',
          'url': 'https://example.com',
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return message when country is us and privacy shield or addendum are missing present flags', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'us_de',
        },
        'privacyShield': {
          'url': 'https://privacyshield.gov',
        },
        'dataProcessingAddendum': {
          'type': 'setting',
          'url': 'https://example.com',
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return message when country is non-eea/us and is missing addendum', function() {
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

    it('should return message when country is non-eea/us and addendum is not present', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'ph',
        },
        'dataProcessingAddendum': {
          'present': 'not_present',
          'type': 'setting',
          'url': 'https://example.com',
        },
      };

      // Act
      let result = overviewMatrix.internationalTransferWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return message when country is non-eea/us and addendum is missing present flag', function() {
      // Arrange
      let testInput = {
        'organisationInformation': {
          'registrationCountry': 'ph',
        },
        'dataProcessingAddendum': {
          'type': 'setting',
          'url': 'https://example.com',
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
        'privacyShield': {
          'present': 'present',
          'url': 'https://www.privacyshield.gov/',
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

  describe('complaintInformationWarning()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.complaintInformationWarning;

    it('should return message when complaint information is not present', function() {
      // Arrange
      let testInput = {
        'complaintInformation': {
          'present': 'not_present',
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.complaintInformationWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return message when complaint information is missing',
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

    it('should return message when complaint information flag is missing', function() {
      // Arrange
      let testInput = {
        'complaintInformation': {
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.complaintInformationWarning(testInput);

      // Assert
      result.should.deep.equals(testResult);
    });

    it('should return nothing when complaint information and flag is present', function() {
      // Arrange
      let testInput = {
        'complaintInformation': {
          'present': 'present',
          'notes': 'These are some notes',
        },
      };

      // Act
      let result = overviewMatrix.complaintInformationWarning(testInput);

      // Assert
      result.should.not.deep.equals(testResult);
    });
  });

  // Lawful bases
  // No tests

  describe('individualRightsWarning()', function() {
    // Pass result
    let testResult = overviewMatrix.templates.individualRightsWarning;

    it('should return message when rights are missing',
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

    it('should return message when missing flag is set', function() {
      // Arrange
      let testInput = {
        'rights': {
          'isMissing': true,
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
      result.should.deep.equals(testResult);
    });
  });

  // Processing purposes
  // No tests

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
