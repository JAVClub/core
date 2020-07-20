const logger = require('./../module/logger')('Module: ignore')
const db = require('./database')

class Ignore {
  async checkIgnoreStatus (data) {
    const result = await db('ignore').where('data', JSON.stringify(data)).count()

    if (result && result[0]['count(*)'] === 0) return false
    return true
  }

  async addIgnore (data) {
    const result = await db('ignore').insert({
      data: JSON.stringify(data)
    })

    logger.info('Add', JSON.stringify(data), 'to ignore list')

    return result
  }
}

module.exports = new Ignore()
