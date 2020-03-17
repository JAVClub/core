const randomInt = require('random-int')
const logger = require('./../module/logger')('Importer: Main')
const config = require('./../module/config')
const stack = require('./../module/stack')
const GDImporter = require('./driver/googleDrive')

let cron = config.get('importer.cron')
logger.debug('Config:', cron)
;(async () => {
    for (let i in cron) {
        let item = cron[i]

        let instance = await stack.getInstance(item.driveId)
        let importerClass = new GDImporter(item.driveId, instance)

        const setCron = async () => {
            setTimeout(async () => {
                logger.debug(`[${item.driveId}] Starting import process`)
                await importerClass.run(false)
                logger.debug(`[${item.driveId}] Import process fininshed`)
                setCron()
            }, item.interval)
        }

        setTimeout(async () => {
            logger.debug(`[${item.driveId}] Starting full list import process`)
            await importerClass.run(true)
            logger.debug(`[${item.driveId}] Full list import process fininshed`)
            setCron()
        }, randomInt(10, 60) * 1000)
    }
})()
