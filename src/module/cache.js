const logger = require('./logger')('Module: Cache')
const cachePool = {}

setInterval(() => {
    for (const i in cachePool) {
        const item = cachePool[i]

        if (item && item.expireTime < (new Date()).getTime()) {
            delete cachePool[i]
            logger.debug(`Expired cache ${i} cleared`)
        }
    }
}, 60000)

module.exports = async (name, fn, time = 0) => {
    if (cachePool[name] && (cachePool[name].expireTime === 0 || cachePool[name].expireTime > (new Date()).getTime())) {
        return cachePool[name].value
    }

    logger.debug(`[${name}] Cache missed, creating one`)
    const result = await fn()
    cachePool[name] = {
        expireTime: (time === 0) ? 0 : (new Date()).getTime() + time,
        value: result
    }

    return result
}
