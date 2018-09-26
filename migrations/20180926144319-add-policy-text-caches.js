'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Organisations',
      'policyTextOld',
      {
        type: Sequelize.TEXT,
      }
    ).then(() => {
      return queryInterface.addColumn(
        'Organisations',
        'policyTextNew',
        {
          type: Sequelize.TEXT,
        }
      );
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Organisations', 'policyTextOld')
      .then(() => {
        return queryInterface.removeColumn('Organisations', 'policyTextNew');
      });
  },
};
