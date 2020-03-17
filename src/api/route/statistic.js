const express = require('express')
const router = express.Router()
const statistic = require('../../module/statistic')

router.get('/getData', async (req, res) => {
    let result = await statistic.getData()

    res.json({
        code: 0,
        msg: 'Success',
        data: result
    })
})

module.exports = router
