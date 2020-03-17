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
        let num = await db('bookmarks_mapping').where('bookmarkId', bookmarkId).where('metadataId', metadataId).count()

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
    async getBookmarkInfo(id, onlyName = false, page = 1, size = 20) {
        let bookmarkName = await db('bookmarks').where('id', id).select('*').first()
        if (onlyName) return {
            id: bookmarkName.id,
            name: bookmarkName.name
        }
        let metadatas = await db('bookmarks_mapping').where('bookmarkId', id).orderBy('id', 'desc').select('*').paginate({
            perPage: size,
            currentPage: page
        })

        let total = await db('bookmarks_mapping').where('bookmarkId', id).count()
        total = total[0]['count(*)']

        let processed = []
        metadatas = metadatas.data
        for (let i in metadatas) {
            let item = metadatas[i]
            processed.push(await metadata.getMetadataById(item.metadataId))
        }

        return {
            total,
            name: bookmarkName.name,
            metadatas: processed
        }
    }

    /**
     * Remove bookmark
     *
     * @param {Int} id bookmark id
     *
     * @returns {Boolean} true
     */
    async removeBookmark(id) {
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
    async removeMetadata(bookmarkId, metadataId) {
        let result = await db('bookmarks_mapping').where('bookmarkId', bookmarkId).where('metadataId', metadataId).delete()

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
    async isOwn(uid, bookmarkId) {
        let result = await db('bookmarks').where('uid', uid).where('id', bookmarkId).count()

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
    async getUserBookmarkList(uid, onlyId = false) {
        let result = await db('bookmarks').where('uid', uid).select('*')

        let processed = []
        for (let i in result) {
            let item = result[i]
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
    async getBookmarkByMetadataId(uid, metadataId) {
        let own = await this.getUserBookmarkList(uid, true)
        let result = await db('bookmarks_mapping').where('metadataId', metadataId).select('*')

        let processed = new Set()
        for (let i in result) {
            let item = result[i]
            if (!own.includes(item.bookmarkId)) continue
            processed.add(item.bookmarkId)
        }

        processed = Array.from(processed)
        let again = []
        for (let i in processed) {
            let res = await this.getBookmarkInfo(processed[i], true)
            again.push(res)
        }

        return again
    }
}

module.exports = new Bookmark()
