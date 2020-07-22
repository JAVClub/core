const db = require('./database')

class Announcement {
  /**
   * Create announcement
   *
   * @param {String} title announcement title
   * @param {String} content announcement content
   *
   * @returns {Int}
   */
  async createAnnouncement (title, content) {
    const result = await db('announcements').insert({
      title,
      content,
      createTime: (new Date()).getTime(),
      updateTime: (new Date()).getTime()
    })

    return result
  }

  /**
     * Change announcement
     *
     * @param {Int} id announcement id
     * @param {String} title announcement title
     * @param {String} content announcement content
     *
     * @returns {Int}
     */
  async changeAnnouncement (id, title, content) {
    const result = await db('announcements').where('id', id).update({
      title,
      content,
      updateTime: (new Date()).getTime()
    })

    return result
  }

  /**
     * Remove announcement
     *
     * @param {Int} id announcement id
     *
     * @returns {Int}
     */
  async removeAnnouncement (id) {
    const result = await db('announcements').where('id', id).delete()

    return result
  }

  /**
     * Get announcement list
     *
     * @param {Int=} page page number
     * @param {Int=} size page size
     *
     * @returns {Array} announcement list
     */
  async getAnnouncementList (page, size) {
    const result = await db('announcements').orderBy('id', 'desc').select('*').paginate({
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
}

module.exports = new Announcement()
