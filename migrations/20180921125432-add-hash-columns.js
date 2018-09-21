'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Organisations',
      'hashLastUpdated',
      {
        type: Sequelize.TEXT,
      }
    ).then(() => {
      return queryInterface.addColumn(
        'Organisations',
        'hash',
        {
          type: Sequelize.TEXT,
        }
      );
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Organisations', 'hashLastUpdated')
      .then(() => queryInterface.removeColumn('Organisations', 'hash'));
  },
};
