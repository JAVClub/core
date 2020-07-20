const log4js = require('log4js')
const config = require('config')

module.exports = (category) => {
  const logger = log4js.getLogger(category)
  logger.level = config.get('system.logLevel')

  return logger
}
