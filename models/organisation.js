'use strict';
module.exports = (sequelize, DataTypes) => {
  let Organisation = sequelize.define('Organisation', {
    name: DataTypes.STRING,
    sortName: DataTypes.STRING,
    registrationNumber: DataTypes.STRING,
    registrationCountry: DataTypes.STRING,
    payload: DataTypes.JSON,
    filename: DataTypes.STRING,
    jsonLastUpdated: DataTypes.TEXT,
    hash: DataTypes.TEXT,
    hashLastUpdated: DataTypes.TEXT,
  }, {});
  Organisation.associate = function(models) {
    // associations can be defined here
  };
  return Organisation;
};
