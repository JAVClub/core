const db = require('./database')
const logger = require('./logger')('Module: Video')
const metadata = require('./metadata')

class Video {
  /**
     * Get video info by id
     *
     * @param {Int} id video id
     *
     * @returns {Object} video info
     */
  async getVideoInfo (id) {
    logger.debug('Get video info, id', id)
    const result = await db('videos').where('id', id).select('*').first()

    if (!result) return null

    return {
      id: result.id,
      metadataId: result.metadataId,
      videoFileId: result.videoFileId,
      isHiden: (result.isHiden === 1),
      infoFileId: result.infoFileId,
      videoMetadata: JSON.parse(result.videoMetadata),
      storyboardFileIdSet: JSON.parse(result.storyboardFileIdSet),
      version: parseInt(result.version) || 1,
      updateTime: result.updateTime
    }
  }

  /**
     * Get video list
     *
     * @param {Int=} page page number
     * @param {Int=} size page size
     * @param {Boolean=} showHiden show hiden video
     * @param {Int=} get list by metadata id
     *
     * @returns {Array} video info list
     */
  async getVideoList (page = 1, size = 20, showHiden = false, metadataId = 0) {
    let result
    result = db('videos')
    if (!showHiden) result = result.where('isHiden', 0)
    if (metadataId !== 0) result = result.where('metadataId', metadataId)
    result = await result.orderBy('id', 'desc').select('*').paginate({
      perPage: size,
      currentPage: page
    })

    result = result.data
    if (!result) return []

    const processed = []
    for (const i in result) {
      const item = result[i]
      processed.push({
        id: item.id,
        metadataId: item.metadataId,
        videoFileId: item.videoFileId,
        isHiden: (item.isHiden === 1),
        infoFileId: item.infoFileId,
        videoMetadata: JSON.parse(item.videoMetadata),
        storyboardFileIdSet: JSON.parse(item.storyboardFileIdSet || '[]'),
        version: parseInt(item.version) || 1,
        updateTime: item.updateTime
      })
    }

    return processed
  }

  /**
     * Hide video by video id
     *
     * @param {Int} id video id
     *
     * @returns {Boolean}
     */
  async hideVideo (id) {
    if (await db('videos').where('id', id).update('isHiden', 1)) return true
    return false
  }

  /**
     * Unhide video by video id
     *
     * @param {Int} id video id
     *
     * @returns {Boolean}
     */
  async unhideVideo (id) {
    if (await db('videos').where('id', id).update('isHiden', 0)) return true
    return false
  }

  /**
     * Create video record
     *
     * @param {Object} info JAV info
     * @param {Object} fileIds File ids
     * @param {Int} fileIds.metaId info.js file id
     * @param {Int} fileIds.videoId video.mp4 file id
     * @param {Int} fileIds[storyboardId].id storyboard file id
     *
     * @returns {Int} Video id
     */
  async createVideo (info, fileIds, version = 1) {
    if (info.company && info.id) info.JAVID = info.company + '-' + info.id

    const metadataId = await metadata.getMetadataId(info.JAVID, version, info.JAVMetadata)
    logger.debug('Metadata id', metadataId)

    if (!metadataId || metadata === 0) {
      return
    }

    if (info.JAVMetadata) {
      delete info.JAVMetadata
      info.metadata = info.videoMetadata
      delete info.videoMetadata
    }

    const dbData = {
      videoMetadata: JSON.stringify(info),
      isHiden: 0,
      videoFileId: fileIds.videoId,
      metadataId: metadataId,
      infoFileId: fileIds.metaId,
      updateTime: (new Date()).getTime(),
      version
    }

    if (version === 1) dbData.storyboardFileIdSet = JSON.stringify(fileIds.storyboardId)
    else dbData.storyboardFileIdSet = '[]'

    const result = await db('videos').insert(dbData).select('id')

    logger.info(`[${info.JAVID}] Video created, id`, result[0])
    return result[0]
  }

  /**
     * Check video status by meta hash
     *
     * @param {String} hash video meta hash
     *
     * @returns {Boolean}
     */
  async isExistByHash (hash) {
    const result = await db('videos').where('videoMetadata', 'like', `${hash}%`).count()
    if (result && result[0]['count(*)'] === 0) return false
    return true
  }

  /**
     * Get video id by info.json file id
     *
     * @param {String} infoFileId
     *
     * @returns {Int} video id
     */
  async getVideoIdByInfoFileId (infoFileId) {
    const result = await db('videos').where('infoFileId', infoFileId).select('id').first()

    if (result && result.id) {
      return result.id
    } else return 0
  }
}

module.exports = new Video()
