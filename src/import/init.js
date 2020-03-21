const randomInt = require('random-int')
const logger = require('./../module/logger')('Importer: Main')
const config = require('./../module/config')
const stack = require('./../module/stack')
const GDImporter = require('./driver/googleDrive')

const startProcess = async (importerClass, doFull) => {
    try {
        await importerClass.run(doFull)
    } catch (error) {
        logger.error(error)
    }
}

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
                logger.info(`[${item.driveId}] Starting import process`)

                await startProcess(false)

                logger.info(`[${item.driveId}] Import process fininshed`)
                setCron()
            }, item.interval)
        }

        const queueTime = randomInt(10, 60)

        logger.info(`[${item.driveId}] Ready in ${queueTime} seconds`)

        setTimeout(async () => {
            const doFull = !!(item.doFull)
            logger.info(`[${item.driveId}] Starting first time import process`)

            await startProcess(importerClass, doFull)

            logger.info(`[${item.driveId}] First time import process fininshed`)
            setCron()
        }, queueTime * 1000)
    }
})()
