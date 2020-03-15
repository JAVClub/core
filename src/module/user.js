const logger = require('./logger')('Module: User')
const db = require('./database')
const bcrypt = require('bcrypt')
const randomString = require('randomstring')

class User {
    /**
     * Create user
     *
     * @param {String} name username
     * @param {String} password user password
     *
     * @returns {Int} username id
     */
    async createUser (name, password) {
        let result = await db('users').insert({
            username: name,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
            token: randomString.generate(32),
            updateTime: (new Date()).getTime(),
            lastSeen: (new Date()).getTime()
        }).select('id')

        return result[0]
    }

    /**
     * Get token by username and password
     *
     * @param {String} username username
     * @param {String} password password
     *
     * @returns {String} token or empty string
     */
    async getTokenByUsernameAndPassword (username, password) {
        let result = await db('users').where('username', username).select('*').first()

        if (result && result.password) {
            if (bcrypt.compareSync(password, result.password)) {
                await db('users').where('token', result.token).update('lastSeen', (new Date()).getTime())

                return result.token
            }
        }

        return ''
    }

    /**
     * Verify token
     *
     * @param {String} token token
     *
     * @returns {Int} user id
     */
    async verifyToken (token) {
        logger.debug('Checking token', token)
        let result = await db('users').where('token', token).select('id').first()

        if (result && result.id > 0) return result.id

        return 0
    }
}

module.exports = new User()
