'use strict';
module.exports = (sequelize, DataTypes) => {
  var Organisation = sequelize.define('Organisation', {
    name: DataTypes.STRING,
    registrationNumber: DataTypes.STRING,
    registrationCountry: DataTypes.STRING,
    payload: DataTypes.JSON
  }, {});
  Organisation.associate = function(models) {
    // associations can be defined here
  };
  return Organisation;
};
