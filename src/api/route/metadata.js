const logger = require('./../../module/logger')('API: Metadata')
const express = require('express')
const router = express.Router()
const cache = require('./../../module/cache')
const metadata = require('./../../module/metadata')

router.get('/getInfo/:metadataId', async (req, res) => {
    let { metadataId } = req.params
    metadataId = parseInt(metadataId || 1)
    logger.debug(`Metadata id ${metadataId}`)

    if (metadataId < 1) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }

    const result = await cache(`api_metadata_info_${metadataId}`, async () => {
        const res = await metadata.getMetadataById(metadataId)
        return res
    }, 60000)

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

router.get('/getList/:page?/:size?', async (req, res) => {
    let { page, size } = req.params
    page = parseInt(page || 1)
    size = parseInt(size || 20)
    logger.debug(`Page ${page}, size ${size}`)

    if (page < 1 || size < 1 || size > 50) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }

    const result = await cache(`api_metadata_list_${page}_${size}`, async () => {
        const res = await metadata.getMetadataList(page, size)
        return res
    }, 60000)

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

router.get('/getListByMeta/:type/:metaId/:page?/:size?', async (req, res) => {
    let { type, metaId, page, size } = req.params
    page = parseInt(page || 1)
    size = parseInt(size || 20)
    logger.debug(`Type ${type}, metaId ${metaId}, page ${page}, size ${size}`)

    if (page < 1 || size < 1 || size > 50) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }

    const result = await cache(`api_metadata_listbymeta_${metaId}_${page}_${size}`, async () => {
        const res = await metadata.getMetadataListByMetaId(type, metaId, page, size)
        return res
    }, 60000)

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

router.get('/getMetaList/:type/:page?/:size?', async (req, res) => {
    let { type, page, size } = req.params
    page = parseInt(page || 1)
    size = parseInt(size || 20)
    logger.debug(`Type ${type}, page ${page}, size ${size}`)

    if (page < 1 || size < 1 || size > 50) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }

    type = metadata._getTypeMapping(type).type

    const result = await cache(`api_meta_list_${type}_${page}_${size}`, async () => {
        const res = await metadata.getMetaList(type, page, size)
        return res
    }, 60000)

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

router.get('/search/:str/:page?/:size?', async (req, res) => {
    let { str, page, size } = req.params
    str = `${str}`
    page = parseInt(page || 1)
    size = parseInt(size || 20)
    logger.debug(`Search string ${str}, page ${page}, size ${size}`)

    if (page < 1 || size < 1 || size > 50 || str.length <= 0) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }

    const result = await cache(`api_metadata_search_${str}_${page}_${size}`, async () => {
        const res = await metadata.searchMetadata(str, page, size)
        return res
    }, 60000)

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

module.exports = router
