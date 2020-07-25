'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bookmarks', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      uid: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
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

    await queryInterface.createTable('bookmarks_mapping', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      bookmarkId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      metadataId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })

    queryInterface.addIndex(
      'bookmarks_mapping',
      ['bookmarkId', 'metadataId'],
      {
        indicesType: 'UNIQUE'
      }
    )

    await queryInterface.createTable('drivers', {
      id: {
        type: Sequelize.TINYINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      driverType: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      driverData: {
        type: Sequelize.STRING(2048),
        allowNull: false
      },
      isEnable: {
        type: Sequelize.TINYINT,
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

    await queryInterface.createTable('files', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      driverId: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false
      },
      storageData: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })

    await queryInterface.createTable('ignore', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      data: {
        type: Sequelize.STRING(30),
        allowNull: false
      }
    })

    await queryInterface.createTable('metadatas', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true
      },
      companyName: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      companyId: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      posterFileURL: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      version: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false
      },
      screenshotFilesURL: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      releaseDate: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })

    queryInterface.addIndex(
      'metadatas',
      ['companyName', 'companyId'],
      {
        indicesType: 'UNIQUE'
      }
    )

    await queryInterface.createTable('series', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })

    await queryInterface.createTable('series_mapping', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      metadataId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      seriesId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })

    queryInterface.addIndex(
      'series_mapping',
      ['metadataId', 'seriesId'],
      {
        indicesType: 'UNIQUE'
      }
    )

    await queryInterface.createTable('stars', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true
      },
      photoURL: {
        type: Sequelize.STRING(256),
        allowNull: false
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })

    await queryInterface.createTable('stars_mapping', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      metadataId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      starId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })

    queryInterface.addIndex(
      'stars_mapping',
      ['metadataId', 'starId'],
      {
        indicesType: 'UNIQUE'
      }
    )

    await queryInterface.createTable('tags', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })

    await queryInterface.createTable('tags_mapping', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      metadataId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      tagId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })

    queryInterface.addIndex(
      'tags_mapping',
      ['metadataId', 'tagId'],
      {
        indicesType: 'UNIQUE'
      }
    )

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      username: {
        type: Sequelize.STRING(32),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(61).BINARY,
        allowNull: false
      },
      token: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true
      },
      comment: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      createTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      lastSeen: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })

    await queryInterface.createTable('videos', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      metadataId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      videoFileId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true
      },
      infoFileId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      videoMetadata: {
        type: Sequelize.STRING(512),
        allowNull: false
      },
      storyboardFileIdSet: {
        type: Sequelize.STRING(512),
        allowNull: false
      },
      isHiden: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      version: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 1
      },
      updateTime: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    })

    queryInterface.addIndex(
      'videos',
      ['id', 'metadataId'],
      {
        indicesType: 'UNIQUE'
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropAllTables()
  }
}
