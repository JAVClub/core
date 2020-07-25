'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addIndex(
      'ignore',
      ['data'],
      {
        indicesType: 'UNIQUE'
      }
    )

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

    queryInterface.addIndex(
      'metadatas',
      ['title'],
      {
        indicesType: 'UNIQUE'
      }
    )

    queryInterface.addIndex(
      'series',
      ['name'],
      {
        indicesType: 'UNIQUE'
      }
    )

    queryInterface.addIndex(
      'stars',
      ['name'],
      {
        indicesType: 'UNIQUE'
      }
    )

    queryInterface.addIndex(
      'tags',
      ['name'],
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
