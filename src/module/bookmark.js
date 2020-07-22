const db = require('./database')
const metadata = require('./metadata')

class Bookmark {
  /**
     * Create new bookmark
     *
     * @param {Int} uid user id
     * @param {String} name bookmark name
     *
     * @returns {Int} bookmark id
     */
  async createBookmark (uid, name) {
    let result = await db('bookmarks').insert({
      uid,
      name,
      createTime: (new Date()).getTime(),
      updateTime: (new Date()).getTime()
    }).select('id')

    result = result[0]

    return result
  }

  /**
     * Add metadata to bookmark
     *
     * @param {Int} bookmarkId bookmark id
     * @param {Int} metadataId matedata id
     *
     * @returns {Int} bookmark mapping id
     */
  async addMetadata (bookmarkId, metadataId) {
    const num = await db('bookmarks_mapping').where('bookmarkId', bookmarkId).where('metadataId', metadataId).count()

    if (num && num[0]['count(*)'] !== 0) return true

    let result = await db('bookmarks_mapping').insert({
      bookmarkId,
      metadataId,
      updateTime: (new Date()).getTime()
    }).select('id')

    result = result[0]

    return result
  }

  /**
     * Get bookmark info by id
     *
     * @param {Int} id bookmark id
     * @param {Boolean} onlyName only name
     *
     * @returns {Array} matedata id
     */
  async getBookmarkInfo (id, onlyName = false, page = 1, size = 20) {
    const bookmarkName = await db('bookmarks').where('id', id).select('*').first()
    if (onlyName) {
      return {
        id: bookmarkName.id,
        name: bookmarkName.name
      }
    }
    let metadatas = await db('bookmarks_mapping').where('bookmarkId', id).orderBy('id', 'desc').select('*').paginate({
      perPage: size,
      currentPage: page
    })

    const total = metadatas.pagination.total

    const processed = []
    metadatas = metadatas.data
    for (const i in metadatas) {
      const item = metadatas[i]
      processed.push(await metadata.getMetadataById(item.metadataId))
    }

    return {
      total,
      name: bookmarkName.name,
      metadatas: processed
    }
  }

  /**
     * Get number of user's bookmarks
     *
     * @param {Int} uid user id
     */
  async getBookmarkNumByUserId (uid) {
    const result = await db('bookmarks').where('uid', uid).count()

    if (result || result[0]) return result[0]['count(*)']
    return result
  }

  /**
     * Get number of bookmark's items
     *
     * @param {Int} bookmarkId bookmark id
     *
     * @returns {Int}
     */
  async getBookmarkInfoNum (bookmarkId) {
    const result = await db('bookmarks_mapping').where('bookmarkId', bookmarkId).count()

    if (result || result[0]) return result[0]['count(*)']
    return 100
  }

  /**
     * Remove bookmark
     *
     * @param {Int} id bookmark id
     *
     * @returns {Boolean} true
     */
  async removeBookmark (id) {
    await db('bookmarks').where('id', id).delete()
    await db('bookmarks_mapping').where('bookmarkId', id).delete()

    return true
  }

  /**
     * Remove metadata from bookmark
     *
     * @param {Int} bookmarkId bookmark id
     * @param {Int} metadataId metadata id
     *
     * @returns {Boolean}
     */
  async removeMetadata (bookmarkId, metadataId) {
    const result = await db('bookmarks_mapping').where('bookmarkId', bookmarkId).where('metadataId', metadataId).delete()

    if (result) return true
    return false
  }

  /**
     * Check permission of bookmark
     *
     * @param {Int} uid user id
     * @param {Int} bookmarkId bookmark id
     *
     * @returns {Boolean}
     */
  async isOwn (uid, bookmarkId) {
    const result = await db('bookmarks').where('uid', uid).where('id', bookmarkId).count()

    if (result[0]['count(*)'] !== 0) return true
    return false
  }

  /**
     * Get bookmark list by user id
     *
     * @param {Int} uid user id
     * @param {Boolean} onlyId only return id list
     *
     * @returns {Array} bookmark list
     */
  async getUserBookmarkList (uid, onlyId = false) {
    const result = await db('bookmarks').where('uid', uid).select('*')

    const processed = []
    for (const i in result) {
      const item = result[i]
      processed.push((onlyId) ? item.id : Object.assign({}, item))
    }

    return processed
  }

  /**
     * Get bookmark list by metadata id
     *
     * @param {Int} uid user id
     * @param {Int} metadataId metadata id
     *
     * @returns {Array} bookmark list
     */
  async getBookmarkByMetadataId (uid, metadataId) {
    const own = await this.getUserBookmarkList(uid, true)
    const result = await db('bookmarks_mapping').where('metadataId', metadataId).select('*')

    let processed = new Set()
    for (const i in result) {
      const item = result[i]
      if (!own.includes(item.bookmarkId)) continue
      processed.add(item.bookmarkId)
    }

    processed = Array.from(processed)
    const again = []
    for (const i in processed) {
      const res = await this.getBookmarkInfo(processed[i], true)
      again.push(res)
    }

    return again
  }
}

module.exports = new Bookmark()
