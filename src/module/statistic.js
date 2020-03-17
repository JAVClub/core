const db = require('./database')

class Statistic {
    async getData() {
        let tableList = [
            'drivers',
            'files',
            'metadatas',
            'series',
            'stars',
            'tags',
            'videos'
        ]

        let result = {}
        for (let i in tableList) {
            let res = await db(tableList[i]).count()
            result[tableList[i]] = res[0]['count(*)']
        }

        return result
    }
}

module.exports = new Statistic()
