'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addIndex(
      'videos',
      ['videoMetadata'],
      {
        indicesType: 'UNIQUE'
      }
    )

    queryInterface.addIndex(
      'files',
      ['driverId', 'storageData'],
      {
        indicesType: 'UNIQUE'
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
}
