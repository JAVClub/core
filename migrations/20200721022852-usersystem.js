'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('users', 'from', {
      type: Sequelize.STRING(64),
      allowNull: false,
      defaultValue: 'direct'
    })

    queryInterface.addColumn('users', 'permission_group', {
      type: Sequelize.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: '2'
    })

    queryInterface.createTable('invitations', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      creator: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING(32),
        allowNull: false,
        unique: true
      },
      useBy: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true
      },
      permission_group: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false
      },
      createTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      useTime: {
        type: Sequelize.STRING(20),
        allowNull: true
      }
    })

    await queryInterface.createTable('permission_groups', {
      id: {
        type: Sequelize.TINYINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      rule: {
        type: Sequelize.STRING(256),
        allowNull: false
      },
      createTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: true
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
