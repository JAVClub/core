const logger = require('./../module/logger')('API: Main')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const user = require('./../module/user')
const config = require('./../module/config')

app.use(cookieParser())
app.use(bodyParser.json())
app.use(async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    logger.debug(req.method.toUpperCase(), req.path)
    const path = '' + req.path
    if (req.cookies && req.cookies.token) {
        const token = req.cookies.token
        const uid = await user.verifyToken(token)
        if (uid > 0) {
            req.uid = uid
        }
    }

    if (!path.startsWith('/api/auth')) {
        if (req.uid) return next()

        res.status(403).json({
            code: -1,
            msg: 'Access denied',
            data: {}
        })
        return
    }

    next()
})

app.use('/api/auth', require('./route/auth'))
app.use('/api/video', require('./route/video'))
app.use('/api/metadata', require('./route/metadata'))
app.use('/api/bookmark', require('./route/bookmark'))
app.use('/api/file', require('./route/file'))
app.use('/api/statistic', require('./route/statistic'))
app.use('/api/user', require('./route/user'))

app.all('*', (req, res) => {
    res.status(404).json({
        code: -2,
        msg: 'Not found',
        data: {}
    })
})

app.listen(config.get('system.port'), () => console.log(`JAVClub core is listening on port ${config.get('system.port')}!`))
