const _ = require('lodash');
const constants = require('../libs/constants');

const templates = {
  'dataProtectionOfficerPresent': {
    'status': 'good',
    'message': 'Provides contact details for their '
      + '<a href="#dataProtectionOfficer">Data Protection Officer</a>',
  },
  'dataProtectionOfficerSpecialCategories': {
    'status': 'warning',
    'message': 'Missing contact details for their '
      + '<a href="#dataProtectionOfficer">Data Protection Officer</a>',
  },
  'dataProtectionRegister': {
    'status': 'good',
    'message': 'Registered with a <a href="#dataProtectionRegister">data '
      + 'protection authority</a>',
  },
  'internationalTransferPrivacyShield': {
    'status': 'good',
    'message': 'Self-certified under the <a href="#internationalTransfer">'
      + 'US–EU Privacy Shield Framework</a>',
  },
  'internationalTransferAddendum': {
    'status': 'good',
    'message': 'Offers a <a href="#internationalTransfer">data processing '
      + 'addendum</a>',
  },
  'internationalTransferAdequacyDecision': {
    'status': 'good',
    'message': 'Based in a country that provides '
      + '<a href="#internationalTransfer">adequate data protection</a>',
  },
  'internationalTransferWarning': {
    'status': 'warning',
    'message': 'No clear <a href="#internationalTransfer">international data '
      + 'transfer</a> protections',
  },
  'specialCategoriesWarning': {
    'status': 'warning',
    'message': 'Collects <a href="#dataCategoriesCollected">special category</a> data',
  },
  'automatedDecisionMakingWarning': {
    'status': 'warning',
    'message': 'Uses <a href="#automatedDecisionMaking">automated decision making</a>',
  },
  'complaintInformationWarning': {
    'status': 'warning',
    'message': 'Does not give information about <a href="#complaintInformation"'
      + '>making a complaint</a>',
  },
  'securityStandardsSpecificity': {
    'status': 'good',
    'message': 'Mentions specific <a href="#securityStandards">data security standards</a>',
  },
  'individualRightsWarning': {
    'status': 'warning',
    'message': 'Does not give information about <a href="#individualRights">individual rights</a>',
  },
  'transparencyRecommendationsWarning': {
    'status': 'warning',
    'message': 'Does not <a href="#transparencyRecommendations">follow recommendations</a> for transparent privacy notices',
  },
  'transparencyRecommendationsAllGood': {
    'status': 'good',
    'message': '<a href="#transparencyRecommendations">Follows recommendations</a> for transparent privacy notices',
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
    specialCategoriesWarning(payload),
    automatedDecisionMakingWarning(payload),
    complaintInformationWarning(payload),
    securityStandardsSpecificity(payload),
    individualRightsWarning(payload),
    transparencyRecommendationsWarning(payload),
    transparencyRecommendationsAllGood(payload),
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
    if (payload.dataProtectionOfficer.contactInfo) {
      return message;
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
    let categories = payload.dataTypesCollected.list;
    intersection = _.intersection(categories, specialCategories);
  } catch (e) {
    return false;
  }

  if (intersection.length === 0) {
    return false;
  }

  try {
    if (payload.dataProtectionOfficer.contactInfo) {
      return false;
    }
  } catch (e) {
    return message;
  }
}

function dataProtectionRegister(payload) {
  let message = templates.dataProtectionRegister;

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
    if (payload.internationalTransfer.privacyShieldUrl) {
      return message;
    }
  } catch (e) {
    return false;
  }

  return false;
}

function internationalTransferAddendum(payload) {
  let message = templates.internationalTransferAddendum;

  try {
    if (
      payload.internationalTransfer.dataProcessingAddendum.type === 'form' ||
      payload.internationalTransfer.dataProcessingAddendum.type === 'assumed'
    ) {
      return message;
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

  try {
    if (
      countryCode === 'us' &&
      payload.internationalTransfer.privacyShieldUrl
    ) {
      return false;
    }
  } catch (e) {
    return message;
  }

  try {
    if (
      payload.internationalTransfer.dataProcessingAddendum.type === 'assumed' ||
      payload.internationalTransfer.dataProcessingAddendum.type === 'form'
    ) {
      return false;
    }
  } catch (e) {
    return message;
  }
}

function specialCategoriesWarning(payload) {
  let message = templates.specialCategoriesWarning;

  let specialCategories = constants.getSpecialCategories();
  let intersection = [];

  try {
    let categories = payload.dataTypesCollected.list;
    intersection = _.intersection(categories, specialCategories);

    if (intersection.length > 0) {
      return message;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

function automatedDecisionMakingWarning(payload) {
  let message = templates.automatedDecisionMakingWarning;

  try {
    if (payload.automatedDecisionMaking.usesAutomatedDecisionMaking) {
      return message;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

function complaintInformationWarning(payload) {
  let message = templates.complaintInformationWarning;

  try {
    if (payload.complaintInformation.present) {
      return false;
    } else {
      return message;
    }
  } catch (e) {
    return message;
  }
}

function securityStandardsSpecificity(payload) {
  let message = templates.securityStandardsSpecificity;

  try {
    if (payload.securityStandards.specificity === 'specific') {
      return message;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

function individualRightsWarning(payload) {
  let message = templates.individualRightsWarning;

  let missingRightsCounter = 0;

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
    if (payload.rights.general.contactInfo) {
      return false;
    }
  } catch (e) {
    if (missingRightsCounter === 7) {
      return message;
    }
  }
}

function transparencyRecommendationsWarning(payload) {
  let message = templates.transparencyRecommendationsWarning;

  try {
    if (
      !payload.transparencyRecommendations.plainLanguage &&
      !payload.transparencyRecommendations.definiteLanguage &&
      !payload.transparencyRecommendations.easyToFind &&
      !payload.transparencyRecommendations.legibleDesign
    ) {
      return message;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

function transparencyRecommendationsAllGood(payload) {
  let message = templates.transparencyRecommendationsAllGood;

  try {
    if (
      payload.transparencyRecommendations.plainLanguage &&
      payload.transparencyRecommendations.definiteLanguage &&
      payload.transparencyRecommendations.easyToFind &&
      payload.transparencyRecommendations.legibleDesign
    ) {
      return message;
    } else {
      return false;
    }
  } catch (e) {
    return false;
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
  specialCategoriesWarning,
  automatedDecisionMakingWarning,
  complaintInformationWarning,
  securityStandardsSpecificity,
  individualRightsWarning,
  transparencyRecommendationsWarning,
  transparencyRecommendationsAllGood,
  templates,
};
