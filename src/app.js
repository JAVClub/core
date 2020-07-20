;(async () => {
  const Sentry = require('@sentry/node')

  Sentry.init({
    dsn: 'https://a5df6f6888404ec492be93b7e93b5dd3@o230009.ingest.sentry.io/5217379'
  })
})()

const { execSync } = require('child_process')
const config = require('./module/config')
const path = require('path')
const binfile = path.resolve(__dirname, '../node_modules/.bin', 'sequelize')

console.log(execSync(binfile + ' --config config/dev.json --env database db:create ' + config.get('database.database')).toString())
console.log(execSync(binfile + ' --config config/dev.json --env database db:migrate --debug').toString())

require('./api/init')
require('./import/init')
