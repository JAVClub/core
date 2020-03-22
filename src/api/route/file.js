const express = require('express')
const router = express.Router()
const cache = require('./../../module/cache')
const file = require('./../../module/file')

router.get('/getURL/:str', async (req, res) => {
    if (!req.params.str) {
        return res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
    }

    let str = req.params.str
    str = str.split(',')
    const arr = []
    for (const i in str) arr.push(parseInt(str[i]))

    const result = await cache(`api_file_get_${str}`, async () => {
        const res = await file.getFilesURL(arr)
        return res
    })

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

module.exports = router
