const logger = require('./logger')('Stack')
const db = require('./database')
const GDClass = require('./driver/googleDrive')

class Stack {
  constructor () {
    this.instances = {}
    logger.info('Stack created')
  }

  /**
     * Get driver instance
     *
     * @param {Int} id Driver Id
     * @returns {Object} Driver Instance
     */
  async getInstance (id) {
    if (this.instances[id]) return this.instances[id]

    logger.info('Creating Instance', id)
    const result = await db('drivers').where('isEnable', 1).where('id', id).first()
    if (result) {
      logger.debug(result)
      switch (result.driverType) {
      case 'gd':
        this.instances[id] = new GDClass(id, JSON.parse(result.driverData))
        await this.instances[id].refreshToken()
        return this.instances[id]

      default:
                    // DO NOTHING
      }
    }

    logger.error(`Driver ${id} not found`)
    throw new Error(`Driver ${id} not found`)
  }
}

module.exports = new Stack()
