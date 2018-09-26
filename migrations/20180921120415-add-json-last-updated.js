'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Organisations',
      'jsonLastUpdated',
      {
        type: Sequelize.TEXT,
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Organisations', 'jsonLastUpdated');
  },
};
