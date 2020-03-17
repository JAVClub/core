const db = require('./database')
const logger = require('./logger')('Module: File')
const stack = require('./stack')

class File {
    /**
     * Create a new record of file
     *
     * @param {String} name
     * @param {String} driverId
     * @param {Object} storageData
     *
     * @returns {Int} File id
     */
    async createFileRecord (name, driverId, storageData) {
        logger.debug('Creating file record', name)
        storageData = JSON.stringify(storageData)

        let result = await db('files').where('driverId', driverId).where('storageData', storageData).select('id').first()
        if (result && result.id) {
            logger.info('File exist', result.id, storageData)
            return result.id
        }

        result = await db('files').insert({
            name,
            driverId,
            storageData,
            updateTime: (new Date()).getTime()
        })

        return result[0]
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
