const { google } = require('googleapis')
const pRetry = require('p-retry')
const cryptoJs = require('crypto-js')
const base64 = require('js-base64').Base64
const randomInt = require('random-int')
let logger

class GoogleDrive {
    /**
     * Create a instance of Google Drive Driver
     *
     * @param {Number} id
     * @param {Object=} data
     */
    constructor (id, data = {}) {
        logger = require('../logger')(`Driver[${id}]: Google Drive`)
        if (data.oAuth) {
            this.oAuth2Client = new google.auth.OAuth2(data.oAuth.client_id, data.oAuth.client_secret, data.oAuth.redirect_uri)
            this.oAuth2Client.setCredentials(data.oAuth.token)
        }

        if (data.drive) {
            this.driveClient = google.drive({
                version: 'v3',
                auth: this.oAuth2Client
            })
        }
        this._data = data
    }

    /**
     * Authorize with code
     *
     * @param {Object} data Google Driver configuration
     *
     * @returns {Object} Google Driver configuration
     */
    async authorizeWithCode (data) {
        data = data.oAuth
        if (!this.oAuth2Client) {
            this.oAuth2Client = new google.auth.OAuth2(data.client_id, data.client_secret, data.redirect_uri)
        }

        logger.info('Retrieving access token')
        return new Promise((resolve, reject) => {
            this.oAuth2Client.getToken(data.code, (error, token) => {
                if (error) {
                    logger.error('Error retrieving access token', error)
                    reject(new Error('Error retrieving access token'))
                    return
                }
                logger.info('Got access token')
                logger.debug(token)
                this.oAuth2Client.setCredentials(token)

                resolve({
                    client_id: data.client_id,
                    client_secret: data.client_secret,
                    redirect_uri: data.redirect_uri,
                    token
                })
            })
        })
    }

    /**
     * Refresh Google API's access token
     *
     * @param {Object=} data Google Driver configuration
     *
     * @returns {Object} Google Driver configuration
     */
    async refreshToken (data) {
        if (!data) data = this._data
        data = data.oAuth
        if (!this.oAuth2Client) {
            this.oAuth2Client = new google.auth.OAuth2(data.client_id, data.client_secret, data.redirect_uri)
            this.oAuth2Client.setCredentials(data.token)
        }

        const expiryDate = this.oAuth2Client.credentials.expiry_date
        logger.debug('Token expiry date', expiryDate)
        if (((new Date()).getTime() + 600000) < expiryDate) return

        logger.info('Refreshing access token')
        return new Promise((resolve, reject) => {
            this.oAuth2Client.refreshAccessToken((error, token) => {
                if (error) {
                    logger.error('Error refreshing access token', error)
                    reject(new Error('Error refreshing access token'))
                    return
                }

                logger.info('Got access token')
                logger.debug(token)
                resolve(token)
            })
        })
    }

    /**
     * Get file list
     *
     * @param {String} q Keywords
     * @param {String=} fields Selected fields
     * @param {Boolean=} full Get all files
     * @param {String} orderBy Order of the list
     *
     * @returns {Array} File list
     */
    async getFileList (q, fields, full, orderBy) {
        fields = fields || 'id, name, modifiedTime, parents, size'
        full = full || false

        if (!this.checkAuthorizationStatus()) return

        let data = []
        let pageToken
        let counter = 1

        logger.info('Getting full file list of keyword', q)
        do {
            logger.debug(`Getting page ${counter}`)
            const params = {
                driveId: this._data.drive.driveId,
                corpora: 'drive',
                includeItemsFromAllDrives: true,
                supportsTeamDrives: true,
                pageSize: 1000,
                orderBy: orderBy || 'modifiedTime desc',
                q,
                fields: 'nextPageToken, files(' + fields + ')'
            }
            if (pageToken) params.pageToken = pageToken
            let res = await pRetry(async () => {
                const result = await this.driveClient.files.list(params)

                return result
            }, {
                onFailedAttempt: error => {
                    logger.error(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left`)
                },
                retries: 3
            })
            res = res.data
            if (res.nextPageToken && full) pageToken = res.nextPageToken
            else pageToken = null
            data = data.concat(res.files)
            counter++
        } while (pageToken)

        logger.info(`Got ${data.length} files' metadatas`)
        return data
    }

    /**
     * Get file download URL
     *
     * @param {String} Google Drive file storage data
     *
     * @returns {String} URL
     */
    async getFileURL(storageData) {
        if (this._data.encryption && this._data.encryption.secret && this._data.encryption.server) {
            let uri = cryptoJs.AES.encrypt(this._data.drive.driveId + '||!||' + storageData.fileId, this._data.encryption.secret).toString()
            let server = this._data.encryption.server.split(',')
            return server[randomInt(0, server.length - 1)] + '/' +  base64.encode(uri)
        }
        return ''
    }

    /**
     * Download file by fileId
     *
     * @param {String} fileId Google Drive fileId
     *
     * @returns {ArrayBuffer} File buffer
     */
    async downloadFile (fileId) {
        if (!this.checkAuthorizationStatus()) return

        logger.info('Downloading file', fileId)

        let res = await pRetry(async () => {
            const result = await this.driveClient.files.get({
                corpora: 'drive',
                includeItemsFromAllDrives: true,
                supportsTeamDrives: true,
                driveId: this._data.drive.driveId,
                alt: 'media',
                fileId
            }, {
                responseType: 'arraybuffer'
            })

            return result
        }, {
            onFailedAttempt: error => {
                logger.error(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left`)
            },
            retries: 3
        })

        res = Buffer.from(res.data, 'binary')
        return res
    }

    /**
     * Get class authorization status
     *
     * @returns {Boolean} status
     */
    checkAuthorizationStatus () {
        if (!this.oAuth2Client || !this.driveClient) {
            logger.error('Havn\'t authorize yet.')
            return false
        }

        return true
    }
}

module.exports = GoogleDrive
