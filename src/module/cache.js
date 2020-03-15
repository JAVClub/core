const cachePool = {}

module.exports = async (name, fn, time = 0) => {
    if (cachePool[name] && (cachePool[name].expireTime === 0 || cachePool[name].expireTime < (new Date()).getTime())) {
        return cachePool[name].value
    }

    const result = await fn()
    cachePool[name] = {
        expireTime: (time === 0) ? 0 : (new Date()).getTime() + time,
        value: result
    }

    return result
}
