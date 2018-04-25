'use strict';
module.exports = (sequelize, DataTypes) => {
  var Organisation = sequelize.define('Organisation', {
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    payload: DataTypes.JSON
  }, {});
  Organisation.associate = function(models) {
    // associations can be defined here
  };
  return Organisation;
};
