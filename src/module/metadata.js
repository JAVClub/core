const _ = require('lodash')
const fetch = require('node-fetch')
const pRetry = require('p-retry')
const parser = new (require('dom-parser'))()
const logger = require('./logger')('Module: MetaData')
const db = require('./database')
const cache = require('./cache')
const file = require('./file')
const ignore = require('./ignore')
const config = require('./config')

class Metadata {
  /**
     * Get metadata info by id
     *
     * @param {Int} id metadata id
     *
     * @returns {Object} metadata info
     */
  async getMetadataById (id) {
    logger.debug('Get metadata info, id', id)
    let result = await db('metadatas').where('id', id).select('*').first()
    logger.debug('Got result', result)

    if (!result) return null

    result = await this._processMetadataList([result])
    result = result[0]

    return result
  }

  /**
     * Get metadata list
     *
     * @param {Int} page page number
     * @param {Int} size page size
     *
     * @returns {Array} metadata list
     */
  async getMetadataList (page, size) {
    let result = await db('metadatas').orderBy('releaseDate', 'desc').select('*').paginate({
      perPage: size,
      currentPage: page
    })

    let total = await db('metadatas').count()
    total = total[0]['count(*)']

    result = result.data
    if (!result) return []

    const processed = await this._processMetadataList(result)

    return {
      total,
      data: processed
    }
  }

  /**
     * Get metadata list by meta id
     *
     * @param {String} type meta type(tag, series, star)
     * @param {Int} metaId meta id
     * @param {Int} page page number
     * @param {Int} size page size
     *
     * @returns {Array} metadata list
     */
  async getMetadataListByMetaId (type, metaId, page, size) {
    const mapping = this._getTypeMapping(type)

    let result = await db(`${mapping.type}_mapping`).where(mapping.column, metaId).orderBy('id', 'desc').select('metadataId').paginate({
      perPage: size,
      currentPage: page
    })

    let total = await db(`${mapping.type}_mapping`).where(mapping.column, metaId).count()
    total = total[0]['count(*)']

    result = result.data
    if (!result) return []

    const processed = []
    for (const i in result) {
      const metadataId = result[i].metadataId

      const res = await this.getMetadataById(metadataId)
      if (res) processed.push(res)
    }

    return {
      total,
      data: processed,
      metaInfo: await this.getMetaInfoByMetaId(this._getTypeMapping(type).type, metaId)
    }
  }

  /**
     * Get or create metadata id
     *
     * @param {String} JAVID in the formal of XXX-001
     *
     * @returns {Int} metadata id
     */
  async getMetadataId (JAVID, version = 1, JAVmetadata) {
    logger.info('Creating JAV metadata record', JAVID)

    try {
      const metadataId = await db('metadatas').where('companyName', JAVID.split('-')[0]).where('companyId', JAVID.split('-')[1]).first()
      if (metadataId && metadataId.id) {
        return metadataId.id
      } else {
        let JAVinfo

        switch (version) {
        case 1:
          JAVinfo = await this.fetchNew(JAVID)
          logger.debug('JAVinfo', JAVinfo)

          if (!JAVinfo || !JAVinfo.tags.length) {
            logger.info('Invalid info', JAVinfo)
            await ignore.addIgnore(JAVID)
            return 0
          }
          break

        case 2:
          if (!JAVmetadata || !JAVmetadata.tags.length) {
            logger.info('Invalid version 2 JAV metadata', JAVmetadata)
            return 0
          }

          JAVinfo = JAVmetadata
          break

        default:
          logger.info(`Unknown version '${version}'`)
          return 0
        }

        const anotherMetadataId = await db('metadatas').where('title', JAVinfo.title).first()
        if (anotherMetadataId && anotherMetadataId.id) {
          return anotherMetadataId.id
        }

        const dbData = {
          title: JAVinfo.title,
          companyName: JAVID.split('-')[0],
          companyId: JAVID.split('-')[1],
          posterFileURL: JAVinfo.cover,
          releaseDate: JAVinfo.releaseDate,
          updateTime: (new Date()).getTime(),
          version
        }

        if (version === 2) dbData.screenshotFilesURL = JAVinfo.screenshots
        else dbData.screenshotFilesURL = []

        dbData.screenshotFilesURL = JSON.stringify(dbData.screenshotFilesURL)

        let metadataId = await db('metadatas').insert(dbData).select('id')
        metadataId = metadataId[0]

        const promises = []

        if (JAVinfo.series) promises.push(this.attachMeta('series', metadataId, JAVinfo.series, null))

        if (!JAVinfo.stars.length) {
          JAVinfo.stars = [
            {
              name: '素人',
              img: 'https://pics.dmm.co.jp/mono/actjpgs/nowprinting.gif'
            }
          ]
        }

        for (const item of _.uniqBy(JAVinfo.stars, 'name')) {
          promises.push(this.attachMeta('star', metadataId, item.name, item.img))
        }

        for (const item of (new Set(JAVinfo.tags))) {
          promises.push(this.attachMeta('tag', metadataId, item, null))
        }

        await (Promise.all(promises).catch((error) => {
          logger.error(error)
        }))

        logger.debug('Finished attching metas')

        return metadataId
      }
    } catch (error) {
      logger.error('Error while creating records', error)
    }
  }

  /**
     * Fetch JAV info from javbus.com
     *
     * @param {String} JAVID JAV id, in the formal of 'XXX-001'
     *
     * @returns {Promise} JAV info
     */
  async fetchNew (JAVID) {
    logger.debug('Request URL', 'https://www.javbus.com/ja/' + JAVID)
    const result = await pRetry(async () => {
      const res = await fetch('https://www.javbus.com/ja/' + JAVID, {
        headers: {
          'Cache-Control': 'max-age=0',
          Host: 'www.javbus.com',
          Referer: 'https://www.javbus.com',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36'
        },
        timeout: 7000
      }).then((res) => res.text())

      return res
    }, {
      onFailedAttempt: async (error) => {
        logger.debug(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left`)

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, 20000)
        })
      },
      retries: 5
    })

    logger.debug('Result length', result.length)

    const dom = parser.parseFromString(result)

    const data = {
      title: '',
      cover: '',
      studio: '',
      series: '',
      tags: [],
      stars: [],
      releaseDate: ''
    }

    if (!dom.getElementsByClassName('info')[0]) {
      logger.debug('JAV not found')
      return
    }

    const a = dom.getElementsByClassName('info')[0].getElementsByTagName('a')
    for (const i in a) {
      const item = a[i]
      const at = item.attributes
      for (const x in at) {
        const attr = at[x]
        if (attr.name === 'href') {
          const v = attr.value
          if (!data.studio && v.indexOf('/ja/studio/') !== -1) {
            logger.debug(JAVID, 'Get studio info', item.textContent)
            data.studio = item.textContent
          } else if (!data.series && v.indexOf('/ja/series/') !== -1) {
            logger.debug(JAVID, 'Get series info', item.textContent)
            data.series = item.textContent
          } else if (v.indexOf('/ja/genre/') !== -1) {
            logger.debug(JAVID, 'Get tag info', item.textContent)
            data.tags.push(item.textContent)
          }
        }
      }
    }

    const imgs = dom.getElementsByClassName('movie')[0].getElementsByTagName('img')
    for (const i in imgs) {
      const item = imgs[i]
      const attrs = item.attributes
      if (attrs[0] && (attrs[0].value.indexOf('/actress/') !== -1 || attrs[0].value.indexOf('nowprinting') !== -1)) {
        logger.debug(JAVID, 'Get star name', attrs[1].value.trim())
        data.stars.push({
          name: attrs[1].value.trim(),
          img: attrs[0].value.trim()
        })
      } else if (attrs[0] && (attrs[0].value.indexOf('/cover/') !== -1 || attrs[0].value.indexOf('digital/video') !== -1)) {
        logger.debug(JAVID, 'Get JAV name', attrs[1].value)
        data.title = attrs[1].value
        logger.debug(JAVID, 'Get JAV cover', attrs[0].value)
        data.cover = attrs[0].value
      }
    }

    const p = dom.getElementsByClassName('info')[0].getElementsByTagName('p')
    for (const i in p) {
      if (data.releaseDate) continue
      const item = p[i]
      if (item.firstChild && item.firstChild.textContent.indexOf('発売日:') !== -1) {
        logger.debug(JAVID, 'Get JAV release date', item.lastChild.textContent.trim())
        data.releaseDate = item.lastChild.textContent.trim()
      }
    }

    logger.debug(JAVID, data)

    return data
  }

  /**
     * Get meta list
     *
     * @param {String} type meta type
     * @param {Int} page page number
     * @param {Int} size page size
     *
     * @returns {Array} meta list
     */
  async getMetaList (type, page, size) {
    let result = await db(type).select('*').paginate({
      perPage: size,
      currentPage: page
    })

    let total = await db(type).count()
    total = total[0]['count(*)']

    result = result.data
    if (!result) return []

    const processed = []
    for (const i in result) {
      const item = result[i]
      if (type === 'stars') item.photoURL = file.getProxyPrefix() + item.photoURL
      processed.push(Object.assign({}, item))
    }

    return {
      total,
      data: processed
    }
  }

  /**
     * Get or create multiple types of metas' id
     *
     * @param {String} type value can be: tags, stars, series
     * @param {String} name name
     * @param {String=} photoURL photo URL
     *
     * @returns {Int} id
     */
  async getMetaId (type, name, photoURL) {
    try {
      const result = await db(`${type}`).where('name', name).first()
      if (result) {
        logger.debug(`[${type}] record for`, name, result)
        return result.id
      } else {
        logger.debug(`[${type}] record for`, name, 'not found, create one')

        const data = {
          name,
          updateTime: (new Date()).getTime()
        }

        if (photoURL) data.photoURL = photoURL

        let id = await db(`${type}`).insert(data).select('id')
        id = id[0]

        logger.debug(`[${type}] record for`, name, 'created,', id)
        return id
      }
    } catch (error) {
      logger.error('Error while creating a record', error)
      throw error
    }
  }

  /**
     * Get meta list(tags,stars,series) by metadata id
     *
     * @param {Int} id metadata id
     *
     * @returns {Object} meta list
     */
  async getMetaByMetadataId (id) {
    const metas = {
      tags: [],
      stars: [],
      series: null
    }

    let result
    result = await db('tags_mapping').where('metadataId', id).select('*')
    if (result) {
      for (const i in result) {
        metas.tags.push((await this.getMetaInfoByMetaId('tags', result[i].tagId)))
      }
    }

    result = await db('stars_mapping').where('metadataId', id).select('*')
    if (result) {
      for (const i in result) {
        metas.stars.push(await this.getMetaInfoByMetaId('stars', result[i].starId))
      }
    }

    result = await db('series_mapping').where('metadataId', id).select('*').first()
    if (result) {
      metas.series = (await this.getMetaInfoByMetaId('series', result.seriesId))
    }

    return metas
  }

  /**
     * Get meta info by meta id
     *
     * @param {String} type meta type, tags/stars/series
     * @param {Int} id meta id
     *
     * @returns {Object} meta info
     */
  async getMetaInfoByMetaId (type, id) {
    const result = await cache(`getMeta_${type}_${id}`, async () => {
      const res = await db(type).where('id', id).select('*').first()

      if (!res) return null
      if (res.photoURL) res.photoURL = file.getProxyPrefix() + res.photoURL

      return Object.assign({}, res)
    })

    return result
  }

  /**
     * Attach meta to meatdata table
     *
     * @param {String} type
     * @param {Int} metadataId
     * @param {String} name
     * @param {String=} photoURL photo URL
     *
     * @return {Int}
     */
  async attachMeta (type, metadataId, name, photoURL) {
    const map = this._getTypeMapping(type)
    logger.debug(map)

    try {
      const id = await this.getMetaId(map.type, name, photoURL)
      logger.debug(`${map.log} id`, id)

      const count = await db(`${map.type}_mapping`).where(map.column, id).where('metadataId', metadataId).count()
      if (count[0]['count(*)'] === 0) {
        logger.debug('Create mapping, count', count, count[0]['count(*)'])

        const data = {
          metadataId,
          updateTime: (new Date()).getTime()
        }
        data[map.column] = id

        await db(`${map.type}_mapping`).insert(data)
      } else {
        logger.debug('Meta exists')
      }
    } catch (error) {
      logger.error('Error while attaching a meta', error)
      throw error
    }
  }

  async searchMetadata (searchStr, page, size) {
    const params = `${searchStr}`.split(' ', parseInt(config.get('system.searchParmaNum')) || 3)

    let result = db('metadatas').orderBy('releaseDate', 'desc')

    const _param = params.shift()

    result = result.where((builder) => {
      builder.where('title', 'like', `%${_param}%`)
        .orWhere('companyName', 'like', `%${_param}%`)
        .orWhere('companyId', 'like', `%${_param}%`)
    })

    for (const i in params) {
      const param = params[i]

      result = result.where((builder) => {
        builder.where('title', 'like', `%${param}%`)
          .orWhere('companyName', 'like', `%${param}%`)
          .orWhere('companyId', 'like', `%${param}%`)
      })
    }

    let total = await result.clone().count()
    total = total[0]['count(*)']

    result = await result.select('*').paginate({
      perPage: size,
      currentPage: page
    })

    result = result.data
    if (!result) return []

    result = await this._processMetadataList(result)

    return {
      total,
      data: result
    }
  }

  /**
     * Get type mapping
     *
     * @param {String} type type(tag, series, star)
     *
     * @returns {Object}
     */
  _getTypeMapping (type) {
    const map = {}
    switch (type) {
    case 'tag':
      map.log = 'Tag'
      map.column = 'tagId'
      map.type = 'tags'
      break
    case 'star':
      map.log = 'Star'
      map.column = 'starId'
      map.type = 'stars'
      break
    case 'series':
      map.log = 'Series'
      map.column = 'seriesId'
      map.type = 'series'
    }

    return map
  }

  /**
     * Process Knex Object to Object-Array
     *
     * @param {Object} result
     * @returns {Array}
     */
  async _processMetadataList (result) {
    const processed = []
    for (const i in result) {
      let item = result[i]
      item = Object.assign({}, item)

      item.JAVID = (`${item.JAVID}`.indexOf('-') !== -1) ? item.JAVID : (item.companyName + '-' + item.companyId)
      item.posterFileURL = file.getProxyPrefix() + item.posterFileURL

      if (item.version === 2) {
        item.screenshotFilesURL = JSON.parse(item.screenshotFilesURL)
        for (const i in item.screenshotFilesURL) {
          item.screenshotFilesURL[i] = file.getProxyPrefix() + item.screenshotFilesURL[i]
        }
      } else item.screenshotFilesURL = []

      processed.push(Object.assign(item, await this.getMetaByMetadataId(item.id)))
    }

    return processed
  }
}

module.exports = new Metadata()
