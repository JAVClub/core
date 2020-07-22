const db = require('./database')
const user = require('./user')

class Permission {
  /**
     * Get groups info by id
     *
     * @returns {Array} groups info
     */
  async getPermissionGroupList (page, size) {
    const result = await db('permission_groups').select('*').paginate({
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
   * Create permission group
   *
   * @param {String} name group name
   * @param {Object} rule group rule
   *
   * @returns {Boolean} true
   */
  async createPermissionGroup (name, rule) {
    await db('permission_groups').insert({
      name,
      rule: JSON.stringify(rule),
      createTime: (new Date()).getTime(),
      updateTime: (new Date()).getTime()
    })

    return true
  }

  /**
     * Change permisssion group
     *
     * @param {Int} gid group id
     * @param {String} name group name
     * @param {Object} rule group rule
     *
     * @returns {Int}
     */
  async changePermissionGroup (id, name, rule) {
    const result = await db('permission_groups').where('id', id).update({
      name,
      rule: JSON.stringify(rule),
      updateTime: (new Date()).getTime()
    })

    return result
  }

  /**
     * Remove permission group
     *
     * @param {Int} id group id
     */
  async removePermissionGroup (id) {
    const result = await db('permission_groups').where('id', id).delete()

    return result
  }

  /**
     * Get permission group info
     *
     * @param {Int} id group id
     *
     * @returns {Object} group info
     */
  async getPermissionGroupInfo (id) {
    const result = await db('permission_groups').where('id', id).select('*').first()

    if (!result) return null

    return {
      ...result,
      rule: JSON.parse(result.rule)
    }
  }

  /**
     * Get user permission group info
     *
     * @param {Int} uid user id
     *
     * @returns {Object} group info
     */
  async getUserPermissionGroupInfo (uid) {
    const userInfo = await user.getUserInfo(uid)
    const group = await this.getPermissionGroupInfo(userInfo.permission_group)

    return group
  }
}

module.exports = new Permission()
