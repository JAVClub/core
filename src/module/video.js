const db = require('./database');
const logger = require('./logger')('Module: Video');
const metadata = require('./metadata');
const {attachPaginate} = require('knex-paginate');
attachPaginate();

class Video {
    /**
     * Get video info by id
     * 
     * @param {Int} id video id
     * 
     * @returns {Object} video info
     */
    async getVideoInfo(id) {
        logger.debug('Get video info, id', id);
        let result = await db('videos').where('id', id).select('*');

        return {
            id: result.id,
            videoFileId: result.videoFileId,
            isHiden: (result.isHiden) ? true : false,
            infoFileId: result.infoFileId,
            videoMetadata: JSON.parse(result.videoMetadata),
            storyboardFileIdSet: JSON.parse(result.storyboardFileIdSet),
            updateTime: result.updateTime,
        };
    }

    /**
     * Get video list
     * 
     * @param {Int=} page page number
     * @param {Int=} size page size
     * @param {Boolean=} showHiden show hiden video
     * 
     * @returns {Array} video info list
     */
    async getVideoList(page = 1, size = 20, showHiden = false) {
        let result = await db('videos').where('isHiden', (showHiden) ? 1 : 0).paginate({
            perPage: size,
            currentPage: page,
        }).select('*');

        let processed = [];
        for (let i in result) {
            let item = result[i];
            processed.push({
                id: item.id,
                videoFileId: item.videoFileId,
                isHiden: (item.isHiden) ? true : false,
                infoFileId: item.infoFileId,
                videoMetadata: JSON.parse(item.videoMetadata),
                storyboardFileIdSet: JSON.parse(item.storyboardFileIdSet),
                updateTime: item.updateTime,
            });
        }

        return processed;
    }

    /**
     * Hide video by video id
     * 
     * @param {Int} id video id
     * 
     * @returns {Boolean}
     */
    async hideVideo(id) {
        if (await db('videos').where('id', id).update('isHiden', 1)) return true;
        return false;
    }

    /**
     * Unhide video by video id
     * 
     * @param {Int} id video id
     * 
     * @returns {Boolean}
     */
    async unhideVideo(id) {
        if (await db('videos').where('id', id).update('isHiden', 0)) return true;
        return false;
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
    async createVideo(info, fileIds) {
        let JAVID = info.company + '-' + info.id;

        let result = await db('videos').whereRaw('JSON_EXTRACT(videoMetadata, \'$.hash\') = ?', info.hash).select('id').first();
        logger.debug('JAV hash', info.hash, result);

        if (result && result.id) {
            logger.info('Duplicate video exist, skipped', result);
            return result.id;
        }

        let metaId = await metadata.getMetadataId(JAVID);
        logger.debug('Metadata id', metaId);

        if (metaId === 0) {
            return;
        }

        result = await db('videos').insert({
            videoMetadata: JSON.stringify(info),
            isHiden: 0,
            videoFileId: fileIds.videoId,
            metadataId: metaId,
            storyboardFileIdSet: JSON.stringify(fileIds.storyboardId),
            infoFileId: fileIds.metaId,
            updateTime: (new Date()).getTime(),
        }).select('id');

        logger.info(`[${JAVID}] Video created, id`, result[0]);
        return result[0];
    }

    /**
     * Get video id by info.json file id
     * 
     * @param {String} infoFileId 
     * 
     * @returns {Int} video id
     */
    async getVideoIdByInfoFileId(infoFileId) {
        let result = await db('videos').where('infoFileId', infoFileId).select('id').first();

        if (result && result.id) {
            return result.id;
        } else return 0;
    }
}

module.exports = new Video();
