const express = require('express')
const router = express.Router()
const user = require('../../module/user')

router.post('/changeUsername', async (req, res) => {
    let body = req.body
    if (!body || !body.newUsername) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }

    let result = await user.changeUsername(req.uid, body.newUsername)

    res.json({
        code: 0,
        msg: 'Success',
        data: {
            result
        }
    })
})

router.post('/changePassword', async (req, res) => {
    let body = req.body
    if (!body || !body.newPassword) {
        res.json({
            code: -2,
            msg: 'Param error',
            data: {}
        })
        return
    }

    let result = await user.changePassword(req.uid, body.newPassword)

    res.json({
        code: 0,
        msg: 'Success',
        data: {
            result
        }
    })
})

module.exports = router
