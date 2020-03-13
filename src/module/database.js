const config = require('./config');
const knex = require('knex')({
    client: "mysql",
    connection: config.get('database'),
});

module.exports = knex;
