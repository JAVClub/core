'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable('announcements', {
      id: {
        type: Sequelize.TINYINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })
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
