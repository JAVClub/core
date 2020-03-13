const db = require('./database');
const logger = require('./logger')('Module: File');

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
    async createFileRecord(name, driverId, storageData) {
        logger.debug('Creating file record', name);
        storageData = JSON.stringify(storageData);

        let result = await db('files').where('driverId', driverId).where('storageData', storageData).select('id').first();
        if (result && result.id) {
            logger.info('File exist', result.id, storageData);
            return result.id;
        }

        result = await db('files').insert({
            name,
            driverId,
            storageData,
            updateTime: (new Date()).getTime(),
        });

        return result[0];
    }

    async downloadFile() {

    }
}

module.exports = new File();
