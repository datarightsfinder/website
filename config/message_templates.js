// In this file you can define the message templates shown on an organisation
// page. To add a line break, use \n\n.

module.exports = {
  access: `Dear {{name}},\n\nCould you please send me a copy of the personal data you hold about me? Please send the data in a commonly-used electronic format. This is a subject access request. Please let me know if you require any further information in order to confirm my identity.`,
  rectification: `Dear {{name}},\n\nSome of the data you are holding about me is inaccurate.\n\n[Give details of the inaccurate information.]\n\nPlease rectify this inaccurate information. This is the correct information.\n\n[Give details of the correct information.]\n\nPlease let me know if you require any further information in order to confirm my identity.`,
  erasure: `Dear {{name}},\n\nCould you please erase the following data about me that you are holding?\n\n[Give details of the data you would like to be erased. This may be all the data they are holding about you.]\n\nPlease let me know if you require any further information in order to confirm my identity.`,
  restrictProcessing: `Dear {{name}},\n\nCould you please only store the following data about me? I want you not use it.\n\n[Give details about the data you would like not to be used]\n\nPlease let me know if you require any further information in order to confirm my identity.`,
  dataPortability: `Dear {{name}},\n\nPlease provide me with a copy of my personal data that you holding about me in a structured, commonly-used, interoperable, and machine-readable format.\n\n[You can also ask for your personal data to be transferred to another organisation.]\n\nPlease let me know if you require any further information in order to confirm my identity.`,
  object: `Dear {{name}}, Please stop using my data for direct marketing purposes.\n\nPlease let me know if you require any further information in order to confirm my identity.`,
  automatedDecisionMaking: `Dear {{name}},\n\nI would like to ask for a review about a decision which was recently made about me by automated means.\n\n[Give details about the decision which was made about you]\n\nPlease let me know if you require any further information in order to confirm my identity.`,
};
