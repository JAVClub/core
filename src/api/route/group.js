const express = require('express')
const router = express.Router()
const permission = require('./../../module/permission')

router.get('/getGroupList/:page?/:size?', async (req, res) => {
  const per = await permission.getUserPermissionGroupInfo(req.uid)
  if (!per.rule.admin) {
    res.status(403).json({
      code: -1,
      msg: 'Access denied',
      data: {}
    })
    return
  }

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

  const result = await permission.getPermissionGroupList(page, size)

  res.json({
    code: 0,
    msg: 'Success',
    data: result
  })
})

router.post('/createGroup', async (req, res) => {
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
  if (!body || !body.name || !body.rule) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  const result = await permission.createPermissionGroup(body.name, JSON.parse(body.rule))

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      result
    }
  })
})

router.post('/removeGroup', async (req, res) => {
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

  const result = await permission.removePermissionGroup(body.id)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      result
    }
  })
})

router.post('/changeGroup', async (req, res) => {
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
  if (!body || !body.id || !body.name || !body.rule) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  const result = await permission.changePermissionGroup(body.id, body.name, JSON.parse(body.rule))

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      result
    }
  })
})

module.exports = router
