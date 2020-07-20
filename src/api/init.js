const logger = require('./../module/logger')('API: Main')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const user = require('./../module/user')
const config = require('./../module/config')
const cache = require('./../module/cache')
const Sentry = require('@sentry/node')

const pathPrefix = config.get('system.path')

Sentry.init({
  dsn: 'https://a5df6f6888404ec492be93b7e93b5dd3@o230009.ingest.sentry.io/5217379'
})

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.errorHandler())

app.use(cookieParser())
app.use(bodyParser.json())

app.use((req, res, next) => {
  const whitelist = config.get('system.corsDomain') || []
  const origin = req.headers.origin || ''

  if (whitelist.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }

  next()
})

app.use(async (req, res, next) => {
  req.uid = -1

  const path = '' + req.path
  if (req.cookies && req.cookies.token) {
    const token = req.cookies.token
    const uid = await cache(`api_checktoken_${token}`, async () => {
      const res = await user.verifyToken(token)
      return res
    }, 60000)
    if (uid > 0) {
      req.uid = uid
    }
  }

  logger.debug(`[UID: ${req.uid}]`, req.method.toUpperCase(), req.path)

  if (path.startsWith(pathPrefix + '/auth') || req.uid > 0) return next()

  res.status(403).json({
    code: -1,
    msg: 'Access denied',
    data: {}
  })
})

app.use(pathPrefix + '/auth', require('./route/auth'))
app.use(pathPrefix + '/video', require('./route/video'))
app.use(pathPrefix + '/metadata', require('./route/metadata'))
app.use(pathPrefix + '/bookmark', require('./route/bookmark'))
app.use(pathPrefix + '/file', require('./route/file'))
app.use(pathPrefix + '/statistic', require('./route/statistic'))
app.use(pathPrefix + '/user', require('./route/user'))

app.all('*', (req, res) => {
  res.status(404).json({
    code: -2,
    msg: 'Not found',
    data: {}
  })
})

app.listen(config.get('system.port'), () => {
  logger.info(`JAVClub core is listening on port ${config.get('system.port')}!`)
})
