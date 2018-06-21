const _ = require('lodash');
const constants = require('../libs/constants');

const templates = {
  'dataProtectionOfficerPresent': {
    'status': 'good',
    'message': 'Provides contact details for a <a href="#dataProtectionOfficer">Data Protection Officer</a>',
  },
  'dataProtectionOfficerSpecialCategories': {
    'status': 'warning',
    'message': 'Does not appear to have a <a href="#dataProtectionOfficer">Data Protection Officer</a>',
  },
  'dataProtectionRegister': {
    'status': 'good',
    'message': 'Registered with a <a href="#dataProtectionRegister">data protection authority</a>',
  },
  'internationalTransferPrivacyShield': {
    'status': 'good',
    'message': 'Self-certified under the <a href="#privacyShield">US–EU Privacy Shield Framework</a>',
  },
  'internationalTransferAddendum': {
    'status': 'good',
    'message': 'Offers a <a href="#dataProcessingAddendum">data processing addendum</a>',
  },
  'internationalTransferAdequacyDecision': {
    'status': 'good',
    'message': 'Based in a country that provides <a href="https://ec.europa.eu/info/law/law-topic/data-protection/data-transfers-outside-eu/adequacy-protection-personal-data-non-eu-countries_en" target="_blank">adequate data protection</a>',
  },
  'internationalTransferWarning': {
    'status': 'warning',
    'message': 'Does not appear to provide a <a href="#dataProcessingAddendum">data processing addendum</a>',
  },
  'complaintInformationWarning': {
    'status': 'warning',
    'message': 'Does not appear to provide information about <a href="#complaintInformation">how to make a complaint</a>',
  },
  'individualRightsWarning': {
    'status': 'warning',
    'message': 'Does not appear to provide information about <a href="#individualRights">individual rights</a>',
  },
};

function generate(payload) {
  let result = [
    dataProtectionOfficerPresent(payload),
    dataProtectionOfficerSpecialCategories(payload),
    dataProtectionRegister(payload),
    internationalTransferPrivacyShield(payload),
    internationalTransferAddendum(payload),
    internationalTransferAdequacyDecision(payload),
    internationalTransferWarning(payload),
    complaintInformationWarning(payload),
    individualRightsWarning(payload),
  ];

  // Sort by status type, then by message
  result = _.sortBy(result, [
    function(o) {
      return o.status;
    },
    function(o) {
      return o.message;
    },
  ]);

  return result;
}

function dataProtectionOfficerPresent(payload) {
  let message = templates.dataProtectionOfficerPresent;

  try {
    if (payload.dataProtectionOfficer.present === 'present') {
      try {
        if (payload.dataProtectionOfficer.contactInfo) {
          return message;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

function dataProtectionOfficerSpecialCategories(payload) {
  let message = templates.dataProtectionOfficerSpecialCategories;

  let specialCategories = constants.getSpecialCategories();
  let intersection = [];

  try {
    let categories = payload.dataCategoriesCollected.list;
    intersection = _.intersection(categories, specialCategories);
  } catch (e) {
    return false;
  }

  if (intersection.length === 0) {
    return false;
  }

  try {
    if (payload.dataProtectionOfficer.present === 'present') {
      try {
        if (payload.dataProtectionOfficer.contactInfo) {
          return false;
        } else {
          return message;
        }
      } catch (e) {
        return message;
      }
    } else {
      return message;
    }
  } catch (e) {
    return message;
  }
}

function dataProtectionRegister(payload) {
  let message = templates.dataProtectionRegister;

  try {
    if (payload.dataProtectionRegister.present === 'present') {
      try {
        if (payload.dataProtectionRegister.identifier) {
          return message;
        }
      } catch (e) {
        return false;
      }

      try {
        if (payload.dataProtectionRegister.url) {
          return message;
        }
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }

  return false;
}

function internationalTransferPrivacyShield(payload) {
  let message = templates.internationalTransferPrivacyShield;

  // Remove state from country code
  let countryCode = payload.organisationInformation
    .registrationCountry.split('_')[0].toLowerCase();

  // Check if in US
  if (countryCode !== 'us') {
    return false;
  }

  try {
    if (payload.privacyShield.present === 'present') {
      try {
        if (payload.privacyShield.url) {
          return message;
        }
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }

  return false;
}

function internationalTransferAddendum(payload) {
  let message = templates.internationalTransferAddendum;

  try {
    if (payload.dataProcessingAddendum.present === 'present') {
      try {
        if (
          payload.dataProcessingAddendum.type === 'form' ||
          payload.dataProcessingAddendum.type === 'assumed' ||
          payload.dataProcessingAddendum.type === 'setting'
        ) {
          return message;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

function internationalTransferAdequacyDecision(payload) {
  let message = templates.internationalTransferAdequacyDecision;

  let countryCode = payload.organisationInformation
    .registrationCountry.split('_')[0].toLowerCase();

  let adequacyDecisionCountries = constants.getECAdequacyDecisionCountries();

  if (adequacyDecisionCountries.indexOf(countryCode) !== -1) {
    return message;
  } else {
    return false;
  }
}

function internationalTransferWarning(payload) {
  let message = templates.internationalTransferWarning;

  let countryCode = payload.organisationInformation
    .registrationCountry.split('_')[0].toLowerCase();

  let adequacyDecisionCountries = constants.getECAdequacyDecisionCountries();

  if (adequacyDecisionCountries.indexOf(countryCode) !== -1) {
    return false;
  }

  let eeaCountries = constants.getEEACountries();

  if (eeaCountries.indexOf(countryCode) !== -1) {
    return false;
  }

  if (countryCode === 'us') {
    try {
      if (payload.privacyShield.present === 'present') {
        try {
          if (payload.privacyShield.url) {
            return false;
          } else {
            return message;
          }
        } catch (e) {
          return message;
        }
      } else {
        return message;
      }
    } catch (e) {
      return message;
    }
  }

  try {
    if (dataProcessingAddendum.present === 'present') {
      try {
        if (
          payload.dataProcessingAddendum.type === 'form' ||
          payload.dataProcessingAddendum.type === 'assumed' ||
          payload.dataProcessingAddendum.type === 'setting'
        ) {
          return false;
        } else {
          return message;
        }
      } catch (e) {
        return message;
      }
    } else {
      return message;
    }
  } catch (e) {
    return message;
  }

  return message;
}

function complaintInformationWarning(payload) {
  let message = templates.complaintInformationWarning;

  try {
    if (payload.complaintInformation.present === 'present') {
      return false;
    } else {
      return message;
    }
  } catch (e) {
    return message;
  }
}

function individualRightsWarning(payload) {
  let message = templates.individualRightsWarning;

  let missingRightsCounter = 0;

  try {
    if (payload.rights.isMissing) {
      return message;
    }
  } catch (e) {

  }

  try {
    if (payload.rights.access.contactInfo) {
      return false;
    }
  } catch (e) {
    missingRightsCounter++;
  }

  try {
    if (payload.rights.rectification.contactInfo) {
      return false;
    }
  } catch (e) {
    missingRightsCounter++;
  }

  try {
    if (payload.rights.erasure.contactInfo) {
      return false;
    }
  } catch (e) {
    missingRightsCounter++;
  }

  try {
    if (payload.rights.restrictProcessing.contactInfo) {
      return false;
    }
  } catch (e) {
    missingRightsCounter++;
  }

  try {
    if (payload.rights.dataPortability.contactInfo) {
      return false;
    }
  } catch (e) {
    missingRightsCounter++;
  }

  try {
    if (payload.rights.object.contactInfo) {
      return false;
    }
  } catch (e) {
    missingRightsCounter++;
  }

  try {
    if (payload.rights.automatedDecisionMaking.contactInfo) {
      return false;
    }
  } catch (e) {
    missingRightsCounter++;
  }

  try {
    if (payload.rights.general) {
      return false;
    }
  } catch (e) {
    if (missingRightsCounter === 7) {
      return message;
    }
  }
}

module.exports = {
  generate,
  dataProtectionOfficerPresent,
  dataProtectionOfficerSpecialCategories,
  dataProtectionRegister,
  internationalTransferPrivacyShield,
  internationalTransferAddendum,
  internationalTransferAdequacyDecision,
  internationalTransferWarning,
  complaintInformationWarning,
  individualRightsWarning,
  templates,
};
