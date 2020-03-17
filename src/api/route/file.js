const logger = require('./../../module/logger')('API: Metadata')
const express = require('express')
const router = express.Router()
const file = require('./../../module/file')

router.get('/getURL/:str', async (req, res) => {
    if (!req.params.str) return res.json({
        code: -2,
        msg: 'Param error',
        data: {}
    })

    let str = req.params.str
    console.log(str)
    str= str.split(',')
    let arr = []
    for (let i in str) arr.push(parseInt(str[i]))
    console.log(arr)

    let result = await file.getFilesURL(arr)

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

module.exports = router
