const express = require('express')
const router = express.Router()
const invitation = require('./../../module/invitation')
const permission = require('./../../module/permission')

router.post('/createInvitation', async (req, res) => {
  const allow = await invitation.checkUserInvitationLimit(req.uid)

  if (allow === false) {
    res.json({
      code: -2,
      msg: 'Limit exceeded',
      data: {}
    })
    return
  }

  const result = await invitation.createInvitation(req.uid)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      code: result
    }
  })
})

router.get('/getInvitationList/:page?/:size?', async (req, res) => {
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

  let uid = req.uid
  const per = await permission.getUserPermissionGroupInfo(req.uid)
  if (per.rule.admin) uid = -1

  const result = await invitation.getUserInvitation(uid, page, size)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      ...result
    }
  })
})

router.get('/getInvitationLimit', async (req, res) => {
  const result = await invitation.checkUserInvitationLimit(req.uid, false)

  res.json({
    code: 0,
    msg: 'Success',
    data: {
      ...result
    }
  })
})

module.exports = router
