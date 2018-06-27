'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Organisations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      sortName: {
        type: Sequelize.STRING,
      },
      registrationNumber: {
        type: Sequelize.STRING,
      },
      registrationCountry: {
        type: Sequelize.STRING,
      },
      payload: {
        type: Sequelize.JSON,
      },
      filename: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Organisations');
  },
};
