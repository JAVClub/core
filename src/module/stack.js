const logger = require('./logger')('Stack');
const db = require('./database');
const gdClass = require('./driver/googleDrive');

class stack {
    instances

    constructor() {
        this.instances = {};
        logger.info('Stack created');
    }

    /**
     * Get driver instance
     *
     * @param {Int} id Driver Id
     * @returns {Object} Driver Instance
     */
    async getInstance(id) {
        if (this.instances[id]) return this.instances[id];

        logger.info('Creating Instance', id);
        let result = await db('drivers').where('isEnable', 1).where('id', id).first();
        if (result) {
            logger.debug(result);
            switch (result.driverType) {
                case 'gd':
                    this.instances[id] = new gdClass(id, JSON.parse(result.driverData));
                    await this.instances[id].refreshToken();
                    return this.instances[id];

                default:
                    // DO NOTHING
            }
        }

        logger.error(`Driver ${id} not found`);
        throw new Error(`Driver ${id} not found`);
    }
}

module.exports = new stack();
