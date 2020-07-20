const config = require('./config')
const knex = require('knex')({
  client: 'mysql',
  connection: {
    ...config.get('database'),
    user: config.get('database.username')
  }
})
const { attachPaginate } = require('knex-paginate')
attachPaginate()

module.exports = knex
