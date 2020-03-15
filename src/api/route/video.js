const logger = require('./../../module/logger')('API: Video')
const express = require('express')
const router = express.Router()
const video = require('./../../module/video')

router.get('/getList/:metadataId/:page?/:size?', async (req, res) => {
    let { metadataId, page, size } = req.params
    metadataId = parseInt(metadataId || 1)
    page = parseInt(page || 1)
    size = parseInt(size || 20)
    logger.debug(`Metadata id ${metadataId}, page ${page}, size ${size}`)

    if (metadataId < 1 || page < 1 || size < 1) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }

    const result = await video.getVideoList(page, size, false, metadataId)

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

module.exports = router
