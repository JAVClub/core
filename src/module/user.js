const logger = require('./logger')('Module: User')
const db = require('./database')
const bcrypt = require('bcrypt')
const randomString = require('randomstring')

class User {
  /**
     * Get users info by id
     *
     * @returns {Array} users info
     */
  async getUserList (page, size) {
    const result = await db('users').select('*').paginate({
      perPage: size,
      currentPage: page
    })

    if (!result.data) {
      return {
        total: 0,
        data: []
      }
    }

    let total = await db('users').count()
    total = total[0]['count(*)']

    return {
      total,
      data: result.data
    }
  }

  /**
   * Create user
   *
   * @param {String} username username
   * @param {String} password user password
   * @param {Int} groupId permission group id
   * @param {String=} comment comment
   * @param {String=} from from
   *
   * @returns {Int} username id
   */
  async createUser (username, password, groupId, comment = '', from = '') {
    if (!await this.checkUsername(username)) return -1

    const result = await db('users').insert({
      username,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
      token: randomString.generate(32),
      permission_group: groupId,
      from,
      comment,
      createTime: (new Date()).getTime(),
      lastSeen: (new Date()).getTime()
    }).select('id')

    return result[0]
  }

  /**
   * Check username availability
   *
   * @param {String} username username
   */
  async checkUsername (username) {
    const result = (await db('users').where('username', username).count('*'))[0]['count(*)']

    return result === 0
  }

  /**
     * Remove user
     *
     * @param {Int} uid user id
     */
  async removeUser (uid) {
    const result = await db('users').where('id', uid).delete()

    return result
  }

  /**
     * Check by username and password
     *
     * @param {String} username username
     * @param {String} password password
     *
     * @returns {Object} token and uid
     */
  async checkByUsernameAndPassword (username, password) {
    const result = await db('users').where('username', username).select('*').first()

    if (result && result.password) {
      if (bcrypt.compareSync(password, result.password)) {
        await db('users').where('token', result.token).update('lastSeen', (new Date()).getTime())

        return {
          token: result.token,
          id: result.id
        }
      }
    }

    return {}
  }

  /**
     * Get user info by id
     *
     * @param {Int} id user id
     *
     * @returns {Object} user info
     */
  async getUserInfo (id) {
    const result = await db('users').where('id', id).select('*').first()

    if (!result) return null

    return result
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
    if (!await this.checkUsername(newUsername)) return -1
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
     * Change user's group
     *
     * @param {Int} uid user id
     * @param {String} newGroupId new permission group id
     *
     * @returns {Int}
     */
  async changeGroup (uid, newGroupId) {
    const result = await db('users').where('id', uid).update({
      permission_group: newGroupId
    })

    return result
  }

  /**
     * Change user's comment
     *
     * @param {Int} uid user id
     * @param {String} newComment new comment
     *
     * @returns {Int}
     */
  async changeComment (uid, newComment) {
    const result = await db('users').where('id', uid).update({
      comment: newComment
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
