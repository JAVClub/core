const express = require('express')
const router = express.Router()
const cache = require('./../../module/cache')
const statistic = require('./../../module/statistic')

router.get('/getData', async (req, res) => {
  const result = await cache('api_statistic', async () => {
    const res = await statistic.getData()
    return res
  }, 10000)

  res.json({
    code: 0,
    msg: 'Success',
    data: result
  })
})

module.exports = router
