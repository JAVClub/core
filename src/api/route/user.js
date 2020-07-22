const express = require('express')
const router = express.Router()
const config = require('./../../module/config')
const user = require('./../../module/user')
const permission = require('./../../module/permission')

router.get('/getUserList/:page?/:size?', async (req, res) => {
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

  const result = await user.getUserList(page, size)

  res.json({
    code: 0,
    msg: 'Success',
    data: result
  })
})

router.post('/createUser', async (req, res) => {
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
  if (!body || !body.username || !body.password || !body.groupId) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  const uid = await user.createUser(body.username, body.password, body.groupId, body.comment || '', body.from || 'Admin insert')

  if (uid === -1) {
    res.json({
      code: -2,
      msg: 'Username exists',
      data: {}
    })
  } else {
    res.json({
      code: 0,
      msg: 'Success',
      data: {
        uid
      }
    })
  }
})

router.post('/removeUser', async (req, res) => {
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
  if (!body || !body.uid) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  const result = await user.removeUser(body.uid)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      result
    }
  })
})

router.post('/changeUsername', async (req, res) => {
  const body = req.body
  if (!body || !body.newUsername) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  let uid = req.uid
  if (body.uid) {
    const per = await permission.getUserPermissionGroupInfo(req.uid)
    if (!per.rule.admin) {
      res.status(403).json({
        code: -1,
        msg: 'Access denied',
        data: {}
      })
      return
    }
    uid = body.uid
  } else {
    const allow = config.get('system.allowChangeUsername') || false

    if (allow === false) {
      res.json({
        code: -2,
        msg: 'Your can\'t change your username now due to the policy of the site owner',
        data: {}
      })
      return
    }
  }

  const result = await user.changeUsername(uid, body.newUsername)

  if (result === -1) {
    res.json({
      code: -2,
      msg: 'Username exists',
      data: {}
    })
  } else {
    res.json({
      code: 0,
      msg: 'Success',
      data: {
        uid
      }
    })
  }
})

router.post('/changePassword', async (req, res) => {
  const body = req.body
  if (!body || !body.newPassword) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  let uid = req.uid
  if (body.uid) {
    const per = await permission.getUserPermissionGroupInfo(req.uid)
    if (!per.rule.admin) {
      res.status(403).json({
        code: -1,
        msg: 'Access denied',
        data: {}
      })
      return
    }
    uid = body.uid
  }

  const result = await user.changePassword(uid, body.newPassword)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      result
    }
  })
})

router.post('/changeGroup', async (req, res) => {
  const body = req.body
  if (!body || !body.newGroup) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  let uid = req.uid
  if (body.uid) {
    const per = await permission.getUserPermissionGroupInfo(req.uid)
    if (!per.rule.admin) {
      res.status(403).json({
        code: -1,
        msg: 'Access denied',
        data: {}
      })
      return
    }
    uid = body.uid
  }

  const result = await user.changeGroup(uid, body.newGroup)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      result
    }
  })
})

router.post('/changeComment', async (req, res) => {
  const body = req.body
  if (!body || !body.newComment || !body.uid) {
    res.json({
      code: -2,
      msg: 'Param error',
      data: {}
    })
    return
  }

  const per = await permission.getUserPermissionGroupInfo(req.uid)
  if (!per.rule.admin) {
    res.status(403).json({
      code: -1,
      msg: 'Access denied',
      data: {}
    })
    return
  }

  const result = await user.changeComment(body.uid, body.newComment)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      result
    }
  })
})

module.exports = router
