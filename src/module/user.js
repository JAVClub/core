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
    const result = await db('users').insert({
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
    const result = await db('users').where('username', username).select('*').first()

    if (result && result.password) {
      if (bcrypt.compareSync(password, result.password)) {
        await db('users').where('token', result.token).update('lastSeen', (new Date()).getTime())

        return result.token
      }
    }

    return ''
  }

  /**
     * Change user's username
     *
     * @param {Int} uid user id
     * @param {String} newUsername new username
     *
     * @returns {Int}
     */
  async changeUsername (uid, newUsername) {
    const result = await db('users').where('id', uid).update({
      username: newUsername,
      lastSeen: (new Date()).getTime()
    })

    return result
  }

  /**
     * Change user's password
     *
     * @param {Int} uid user id
     * @param {String} newPassword new password
     *
     * @returns {Int}
     */
  async changePassword (uid, newPassword) {
    const password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync())

    const result = await db('users').where('id', uid).update({
      password: password,
      token: randomString.generate(32),
      lastSeen: (new Date()).getTime()
    })

    return result
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
    const result = await db('users').where('token', token).select('id').first()

    if (result && result.id > 0) {
      await db('users').where('token', token).update('lastSeen', (new Date()).getTime())

      return result.id
    }

    return 0
  }
}

module.exports = new User()
