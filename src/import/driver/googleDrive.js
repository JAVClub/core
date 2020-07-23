const config = require('./../../module/config')
const file = require('./../../module/file')
const video = require('./../../module/video')
const ignore = require('./../../module/ignore')

class googleDrive {
  /**
     * @param {Int} id driver id
     * @param {Object} driver Google Drive driver instance
     */
  constructor (id, driver) {
    this.id = id
    this.client = driver
    this.logger = require('./../../module/logger')('Importer: GD ' + id)

    if (!this.client) throw new Error('Invaild drive instance')
    this.logger.info('Got drive instance')

    const {
      default: PQueue
    } = require('p-queue')

    this.queue = new PQueue({
      concurrency: config.get('importer.settings.googleDrive.queueNum') || 1
    })
  }

  /**
     * Entry for Google Drive importer
     *
     * @param {Boolean} full Scan the whole drive
     *
     * @returns {Promise} Promise queue
     */
  async run (full = false) {
    this.logger.info('Starting process of import, full =', full)

    const fileList = await this.client.getFileList('name=\'info.json\'', null, full, 'modifiedTime desc', (full) ? null : 51)
    this.logger.debug('Got info.json file list')

    fileList.forEach((info) => {
      this.queue.add(async () => {
        this.logger.debug('Handling info.json file', info.id)

        let res = await this.client.downloadFile(info.id)
        res = res.toString()

        this.logger.debug(`File ${info.id}'s content`, res)
        if (res && JSON.parse(res)) {
          return await this.handleInfoDotJSON(JSON.parse(res), info)
        }

        this.logger.error('Invalid file of id', info.id, res)
        throw new Error('Invalid file of id', info.id)
      })
    })

    const result = await this.queue.onIdle().then(() => {
      this.logger.info('All Promise settled')
    })

    return result
  }

  /**
     * Handle contents of info.json
     *
     * @param {String} info info.js file content
     * @param {String} fileInfo Google Drive file info
     *
     * @returns {Promise} Video create Promise
     */
  async handleInfoDotJSON (info, fileInfo) {
    this.logger.debug('Info', info)
    if (!info.JAVID && (!info.company || !info.id)) {
      this.logger.warn('Info invalid', info)
      return
    }

    let JAVID = info.JAVID
    if (info.company && info.id) JAVID = info.company + '-' + info.id

    const version = parseInt(info.version || 1)
    this.logger.info('Processing', JAVID)

    this.logger.debug(`${JAVID} info.json file version:`, version)
    if (await ignore.checkIgnoreStatus(JAVID)) {
      this.logger.debug(`Metadata ${JAVID} invalid, skipped`)
      return
    }

    if (await video.isExistByHash(info.hash)) {
      this.logger.info(`Video ${info.hash} existed, skipped`)
      return
    }
    const parent = fileInfo.parents[0]

    this.logger.debug('Video folder id', parent)

    const fileList = await this.client.getFileList(`'${parent}' in parents`)
    this.logger.debug('Video folder file list', fileList)

    let storyboardId, videoId
    for (const i in fileList) {
      const item = fileList[i]
      if (item.name === 'video.mp4' && (item.size / 1024 / 1024) > 100) videoId = item.id
      if (item.name === 'storyboard') storyboardId = item.id
    }

    this.logger.debug('Video id', videoId)

    let storyboardList = []
    if (version === 1) {
      this.logger.debug('Storyboard folder id', storyboardId)

      storyboardList = await this.client.getFileList(`'${storyboardId}' in parents`)
    }

    if ((version === 1 && storyboardList.length !== 50) || !videoId) {
      this.logger.info(`Video ${info.hash} havn't fully upload yet`)
      return
    }

    this.logger.debug(JAVID, 'check pass')
    const fileIds = await this.createFileRecord({
      videoId,
      storyboardList,
      fileInfo
    }, version)

    const result = await video.createVideo(info, fileIds, version)
    this.logger.info(JAVID, 'processed!')

    return result
  }

  /**
     * Create file records for file bundle
     *
     * @param {Object} data files info
     *
     * @returns {Object} file ids
     */
  async createFileRecord (data, version = 1) {
    this.logger.debug('Creating file records')
    const fileIds = {
      metaId: 0,
      videoId: 0,
      storyboardId: {}
    }

    const storageDataList = [
      JSON.stringify({ fileId: data.fileInfo.id }),
      JSON.stringify({ fileId: data.videoId })
    ]

    if (version === 1) {
      for (const i in data.storyboardList) {
        const item = data.storyboardList[i]
        storageDataList.push(JSON.stringify({ fileId: item.id }))
      }
    }

    const result = await file.createFilesRecord(this.id, storageDataList)

    fileIds.metaId = result[JSON.stringify({ fileId: data.fileInfo.id })]

    fileIds.videoId = result[JSON.stringify({ fileId: data.videoId })]

    if (version === 1) {
      for (const i in data.storyboardList) {
        const item = data.storyboardList[i]
        fileIds.storyboardId[i] = result[JSON.stringify({ fileId: item.id })]
      }
    }

    return fileIds
  }
}

module.exports = googleDrive
