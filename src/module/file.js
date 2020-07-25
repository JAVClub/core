const db = require('./database')
const logger = require('./logger')('Module: File')
const stack = require('./stack')
const config = require('./config')
const randomInt = require('random-int')

class File {
  /**
     * Create or get a record of file
     *
     * @param {Int} driverId
     * @param {Array} storageDataList
     *
     * @returns {Object} File ids
     */
  async createFilesRecord (driverId, storageDataList) {
    // TODO: optimize
    logger.debug('Creating file record', storageDataList)

    const fileIds = {}

    let result = db('files').where('driverId', driverId).andWhere((builder) => {
      builder.where('storageData', storageDataList[0])

      for (const i in storageDataList) {
        const item = storageDataList[i]
        if (i === 0) continue
        builder.orWhere('storageData', item)
      }
    })

    result = await result.select('id', 'storageData')

    for (const i in result) {
      fileIds[result[i].storageData] = result[i].id
    }

    const oriKeys = storageDataList
    const nowKeys = Object.keys(fileIds)

    storageDataList = oriKeys.filter(o => {
      return nowKeys.indexOf(o) === -1
    })

    const insertData = []
    for (const i in storageDataList) {
      insertData.push({
        driverId: driverId,
        storageData: storageDataList[i],
        updateTime: (new Date()).getTime()
      })
    }

    result = await db('files').insert(insertData)

    if (result) {
      result = db('files').where('driverId', driverId).where('storageData', storageDataList[0])
      for (const i in storageDataList) {
        const item = storageDataList[i]
        if (i === 0) continue
        result = result.orWhere('storageData', item)
      }
      result = await result.select('id', 'storageData')

      for (const i in result) {
        fileIds[result[i].storageData] = result[i].id
      }
    }

    return fileIds
  }

  /**
     *
     * @param {Array} fileIds
     */
  async getFilesURL (fileIds) {
    let result = db('files').where('id', fileIds[0])
    for (const id in fileIds) {
      if (id === 0) continue
      const fileId = fileIds[id]
      result = result.orWhere('id', fileId)
    }
    result = await result.select('*')

    if (!result) return ''
    logger.debug('Files record:', result)
    const url = {}

    for (const i in result) {
      const item = result[i]
      const client = await stack.getInstance(item.driverId)
      const res = await client.getFileURL(JSON.parse(item.storageData))
      url[item.id] = res
    }

    return url
  }

  getProxyPrefix () {
    const proxyList = config.get('proxy')
    if (!proxyList || proxyList.length < 1) return ''

    return proxyList[randomInt(0, proxyList.length - 1)]
  }
}

module.exports = new File()
