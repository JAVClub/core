const logger = require('./logger')('Module: Invitation')
const db = require('./database')
const randomString = require('randomstring')
const permission = require('./permission')
const user = require('./user')

class Invitation {
  /**
   * Create invitation code
   *
   * @param {Int} uid user id
   *
   * @returns {String} invitation code
   */
  async createInvitation (uid) {
    const code = randomString.generate(24)
    const groupInfo = await permission.getUserPermissionGroupInfo(uid)

    await db('invitations').insert({
      creator: uid,
      code,
      permission_group: groupInfo.rule.invitationGroup,
      createTime: (new Date()).getTime()
    })

    return code
  }

  /**
     * Use invitation code
     *
     * @param {Int} uid user id
     * @param {String} code invitation code
     *
     * @returns {Int}
     */
  async useInvitation (uid, code) {
    const result = await db('invitations').where('code', code).update({
      useBy: uid,
      useTime: (new Date()).getTime()
    })

    return result
  }

  /**
     * Get invitation info
     *
     * @param {String} code invitation code
     *
     * @returns {Object} invitation info
     */
  async getInvitationInfo (code) {
    const result = await db('invitations').where('code', code).select('*').first()

    return result
  }

  /**
   * Create user using invitation code
   *
   * @param {String} code invitation code
   * @param {String} username username
   * @param {String} password password
   */
  async createUserUseInvitation (code, username, password) {
    const codeStatus = await this.verifyInvitation(code)
    if (!codeStatus) {
      return {
        code: -1,
        msg: 'Code invalid',
        data: {}
      }
    }

    const codeInfo = await this.getInvitationInfo(code)
    const group = codeInfo.permission_group
    const uid = await user.createUser(username, password, group, 'Using invitation', 'invitation code')
    if (uid === -1) {
      return {
        code: -2,
        msg: 'Username exists',
        data: {}
      }
    }
    await this.useInvitation(uid, code)

    return {
      code: 0,
      msg: 'Success',
      data: {
        uid
      }
    }
  }

  /**
     * Get user invitation list
     *
     * @param {Int=} uid user id
     * @param {Int=} page page number
     * @param {Int=} size page size
     *
     * @returns {Array} invitation list
     */
  async getUserInvitation (uid = -1, page = 1, size = 20) {
    let result = db('invitations')
    if (uid !== -1) result = result.where('creator', uid)
    result = await result.orderBy('id', 'desc').select('*').paginate({
      perPage: size,
      currentPage: page
    })

    if (!result.data) {
      return {
        total: 0,
        data: []
      }
    }

    return {
      total: result.pagination.total,
      data: result.data
    }
  }

  /**
   * Check user invitation limit
   *
   * @param {Int} uid user id
   * @param {Boolean} boolean whether return boolean
   *
   * @returns {Boolean|Object}
   */
  async checkUserInvitationLimit (uid, boolean = true) {
    const currentYear = (new Date()).getFullYear()
    const currentMonth = (new Date()).getMonth() + 1

    const monthStart = (new Date(`${currentYear}-${currentMonth}-1`)).getTime()
    const monthEnd = (new Date(`${currentYear}-${currentMonth + 1}-1`)).getTime()

    const codeNum = (await db('invitations').where('creator', uid).whereBetween('createTime', [monthStart, monthEnd]).count('*'))[0]['count(*)']
    const permissionInfo = await permission.getUserPermissionGroupInfo(uid)
    const invitationNum = permissionInfo.rule.invitationNum

    if (boolean) {
      if (codeNum >= invitationNum && invitationNum !== -1) return false
      return true
    } else {
      return {
        codeNum,
        invitationNum
      }
    }
  }

  /**
     * Verify invitation code
     *
     * @param {String} code invitation code
     *
     * @returns {Boolean} invitation code status
     */
  async verifyInvitation (code) {
    logger.debug('Checking invitation code', code)
    const result = await db('invitations').where('code', code).select('useBy').first()

    if (result) {
      if (result.useBy === null) {
        return true
      }
    }

    return false
  }
}

module.exports = new Invitation()
