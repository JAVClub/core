const randomInt = require('random-int')
const logger = require('./../module/logger')('Importer: Main')
const config = require('./../module/config')
const stack = require('./../module/stack')
const GDImporter = require('./driver/googleDrive')

const cron = config.get('importer.cron')
logger.debug('Config:', cron)
;(async () => {
    for (const i in cron) {
        const item = cron[i]

        const instance = await stack.getInstance(item.driveId)
        const importerClass = new GDImporter(item.driveId, instance)

        const setCron = async () => {
            logger.debug(`[${item.driveId}] Cron set, ${item.interval}ms`)
            setTimeout(async () => {
                logger.debug(`[${item.driveId}] Starting import process`)
                await importerClass.run(false)
                logger.debug(`[${item.driveId}] Import process fininshed`)
                setCron()
            }, item.interval)
        }

        setTimeout(async () => {
            const doFull = !!(item.doFull)
            logger.debug(`[${item.driveId}] Starting first time import process`)
            await importerClass.run(doFull)
            logger.debug(`[${item.driveId}] First time import process fininshed`)
            setCron()
        }, randomInt(10, 60) * 1000)
    }
})()
