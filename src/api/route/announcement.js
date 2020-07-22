const express = require('express')
const router = express.Router()
const announcement = require('./../../module/announcement')
const permission = require('./../../module/permission')

router.post('/createAnnouncement', async (req, res) => {
  const per = await permission.getUserPermissionGroupInfo(req.uid)
  if (!per.rule.admin) {
    res.status(403).json({
      code: -1,
      msg: 'Access denied',
      data: {}
    })
    return
  }

  const body = req.body
  if (!body || !body.title || !body.content) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  const result = await announcement.createAnnouncement(body.title, body.content)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      code: result
    }
  })
})

router.post('/changeAnnouncement', async (req, res) => {
  const per = await permission.getUserPermissionGroupInfo(req.uid)
  if (!per.rule.admin) {
    res.status(403).json({
      code: -1,
      msg: 'Access denied',
      data: {}
    })
    return
  }

  const body = req.body
  if (!body || !body.id || !body.title || !body.content) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  const result = await announcement.changeAnnouncement(body.id, body.title, body.content)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      code: result
    }
  })
})

router.post('/removeAnnouncement', async (req, res) => {
  const per = await permission.getUserPermissionGroupInfo(req.uid)
  if (!per.rule.admin) {
    res.status(403).json({
      code: -1,
      msg: 'Access denied',
      data: {}
    })
    return
  }

  const body = req.body
  if (!body || !body.id) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  const result = await announcement.removeAnnouncement(body.id)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      code: result
    }
  })
})

router.get('/getAnnouncementList/:page?/:size?', async (req, res) => {
  let { page, size } = req.params
  page = parseInt(page || 1)
  size = parseInt(size || 20)

  if (page < 1 || size < 1 || size > 50) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  const result = await announcement.getAnnouncementList(page, size)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      ...result
    }
  })
})

module.exports = router
