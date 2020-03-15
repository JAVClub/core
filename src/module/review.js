const db = require('./database')

class Review {
    /**
     * Create or edit review for metadata
     *
     * @param {Int} uid user id
     * @param {Int} metadataId metadata id
     * @param {Boolean} type up or down
     *
     * @returns {Boolean}
     */
    async createReview(uid, metadataId, type) {
        type = (type) ? 1 : 0
        if (await this.isReviewExist(uid, metadataId)) {
            let result = await db('reviews').where('uid', uid).where('metadataId', metadataId).update({
                type,
                updateTime: (new Date()).getTime()
            })

            if (result) return true
        } else {
            let result = await db('reviews').insert({
                uid,
                type,
                metadataId,
                updateTime: (new Date()).getTime()
            })

            if (result) return true
        }

        return false
    }

    /**
     * Remove review
     *
     * @param {Int} uid user id
     * @param {Int} metadataId metadata id
     *
     * @returns {Boolean}
     */
    async removeReview(uid, metadataId) {
        let result = await db('reviews').where('uid', uid).where('metadataId', metadataId).delete()

        if (result) return true
        return false
    }

    /**
     * Check status of metadata id list
     *
     * @param {Int} uid user id
     * @param {Array} metadataIdList metadata id list
     *
     * @returns {Array} metadata id list
     */
    async checkStatus(uid, metadataIdList) {
        let result = db('reviews').where('uid', uid)
        for (let i in metadataIdList) {
            let metadataId = metadataIdList[i]
            result = result.orWhere('metadataId', metadataId)
        }

        result = await result.select('*')

        let processed = []
        for (let i in result) {
            let item = result[i]
            processed.push(id.metadataId)
        }

        return processed
    }

    /**
     * Check review status
     *
     * @param {Int} uid user id
     * @param {Int} metadataId metadata id
     *
     * @returns {Boolean}
     */
    async isReviewExist(uid, metadataId) {
        let result = await db('reviews').where('uid', uid).where('metadataId', metadataId).count()

        if (result[0] && result[0]['count(*)']) return true
        return false
    }
}

module.exports = new Review()
