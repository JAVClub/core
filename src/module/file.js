const db = require('./database')
const logger = require('./logger')('Module: File')
const stack = require('./stack')

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
        logger.debug('Creating file record', storageDataList)

        let fileIds = {}

        let result = db('files').where('driverId', driverId).where('storageData', storageDataList[0])
        for (let i in storageDataList) {
            let item = storageDataList[i]
            if (i === 0) continue
            result = result.orWhere('storageData', item)
        }
        result = await result.select('id', 'storageData')

        for (let i in result) {
            fileIds[result[i].storageData] = result[i].id
        }

        let oriKeys = storageDataList
        let nowKeys = Object.keys(fileIds)

        storageDataList = oriKeys.filter(o => {
            return nowKeys.indexOf(o) === -1
        })

        let insertData = []
        for (let i in storageDataList) {
            insertData.push({
                driverId: driverId,
                storageData: storageDataList[i],
                updateTime: (new Date()).getTime()
            })
        }

        result = await db('files').insert(insertData)

        if (result) {
            result = db('files').where('driverId', driverId).where('storageData', storageDataList[0])
            for (let i in storageDataList) {
                let item = storageDataList[i]
                if (i === 0) continue
                result = result.orWhere('storageData', item)
            }
            result = await result.select('id', 'storageData')

            for (let i in result) {
                fileIds[result[i].storageData] = result[i].id
            }
        }

        return fileIds
    }

    /**
     *
     * @param {Array} fileIds
     */
    async getFilesURL(fileIds) {
        let result = db('files').where('id', fileIds[0])
        for (let id in fileIds) {
            if (id === 0) continue
            let fileId = fileIds[id]
            result = result.orWhere('id', fileId)
        }
        result = await result.select('*')

        if (!result) return ''
        logger.debug('Files record:', result)
        let url = {}

        for (let i in result) {
            let item = result[i]
            let client = await stack.getInstance(item.driverId)
            let res = await client.getFileURL(JSON.parse(item.storageData))
            url[item.id] = res
        }

        return url
    }
}

module.exports = new File()
