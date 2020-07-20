const db = require('./database')

class Statistic {
  async getData () {
    const tableList = [
      'drivers',
      'files',
      'metadatas',
      'series',
      'stars',
      'tags',
      'videos'
    ]

    const result = {}
    for (const i in tableList) {
      const res = await db(tableList[i]).count()
      result[tableList[i]] = res[0]['count(*)']
    }

    return result
  }
}

module.exports = new Statistic()
