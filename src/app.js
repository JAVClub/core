const Sentry = require('@sentry/node')

Sentry.init({
  dsn: 'https://a5df6f6888404ec492be93b7e93b5dd3@o230009.ingest.sentry.io/5217379'
})

require('./api/init')
require('./import/init')
