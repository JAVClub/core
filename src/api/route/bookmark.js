const logger = require('./../../module/logger')('API: Bookmark')
const express = require('express')
const router = express.Router()
const bookmark = require('./../../module/bookmark')

router.get('/getList', async (req, res) => {
    const result = await bookmark.getUserBookmarkList(req.uid)

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

router.get('/getInfo/:bookmarkId/:page?/:size?', async (req, res) => {
    let { bookmarkId, page, size } = req.params
    bookmarkId = parseInt(bookmarkId)
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

    if (!await bookmark.isOwn(req.uid, bookmarkId)) {
        res.status(403).json({
            code: -1,
            msg: 'Access denied',
            data: {}
        })
        return
    }

    const result = await bookmark.getBookmarkInfo(bookmarkId, false, page, size)

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

router.post('/addMetadata/:bookmarkId', async (req, res) => {
    const bookmarkId = parseInt(req.params.bookmarkId || 0)

    if (!await bookmark.isOwn(req.uid, bookmarkId)) {
        res.status(403).json({
            code: -1,
            msg: 'Access denied',
            data: {}
        })
        return
    }

    const body = req.body
    if (!body || !body.metadataId) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }

    const result = await bookmark.addMetadata(bookmarkId, body.metadataId)

    res.json({
        code: 0,
        msg: 'Success',
        data: {
            result: result
        }
    })
})

router.post('/createBookmark', async (req, res) => {
    const body = req.body
    if (!body || !body.name) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }
    const bookmarkName = body.name

    const result = await bookmark.createBookmark(req.uid, bookmarkName)

    res.json({
        code: 0,
        msg: 'Success',
        data: {
            result: result
        }
    })
})

router.post('/removeBookmark', async (req, res) => {
    const body = req.body
    if (!body || !body.bookmarkId) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }
    const bookmarkId = parseInt(body.bookmarkId) || 0

    if (!await bookmark.isOwn(req.uid, bookmarkId)) {
        res.status(403).json({
            code: -1,
            msg: 'Access denied',
            data: {}
        })
        return
    }

    const result = await bookmark.removeBookmark(bookmarkId)

    res.json({
        code: 0,
        msg: 'Success',
        data: {
            result: result
        }
    })
})

router.post('/removeMetadata/:bookmarkId', async (req, res) => {
    const bookmarkId = parseInt(req.params.bookmarkId || 0)

    if (!await bookmark.isOwn(req.uid, bookmarkId)) {
        res.status(403).json({
            code: -1,
            msg: 'Access denied',
            data: {}
        })
        return
    }

    const body = req.body
    if (!body || !body.metadataId) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }

    const result = await bookmark.removeMetadata(bookmarkId, body.metadataId)

    res.json({
        code: 0,
        msg: 'Success',
        data: {
            result: result
        }
    })
})

router.get('/getByMetadata/:metadataId', async (req, res) => {
    const metadataId = parseInt(req.params.metadataId)

    if (metadataId < 1) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }

    const result = await bookmark.getBookmarkByMetadataId(req.uid, metadataId)

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

module.exports = router
