const fetch = require('node-fetch');
const pRetry = require('p-retry');
const parser = new(require('dom-parser'))();
const logger = require('./logger')('Module: MetaData');
const db = require('./database');

class Metadata {
    /**
     * Get or create metadata id
     *
     * @param {String} JAVID in the formal of XXX-001
     *
     * @returns {Int} metadata id
     */
    async getMetadataId(JAVID) {
        logger.debug('Creating JAV metadata record', JAVID);

        return new Promise(async (resolve) => {
            try {
                let metadataId;
                if (metadataId = await db('metadatas')
                    .where('companyName', JAVID.split('0')[0])
                    .where('companyId', JAVID.split('-')[1])
                    .first()) {
                    resolve(metadataId.id);
                } else {
                    await db.transaction(async trx => {
                        let JAVinfo = await this.fetchNew(JAVID);
                        logger.debug('JAVinfo', JAVinfo);

                        if (!JAVinfo || !JAVinfo.tags.length || !JAVinfo.stars.length) {
                            logger.warn('Invalid info for', JAVinfo);
                            resolve(0);
                            return;
                        }

                        let metadataId = await db('metadatas').insert({
                            title: JAVinfo.title,
                            companyName: JAVID.split('-')[0],
                            companyId: JAVID.split('-')[1],
                            posterFileURL: JAVinfo.cover,
                            releaseDate: JAVinfo.releaseDate,
                            updateTime: (new Date()).getTime(),
                        }).transacting(trx).select('id');
                        metadataId = metadataId[0];

                        let promises = [];

                        if (JAVinfo.series) promises.push(this.attachMeta('series', metadataId, JAVinfo.series, null, trx));

                        for (let i in JAVinfo.stars) {
                            let item = JAVinfo.stars[i];
                            promises.push(this.attachMeta('star', metadataId, item.name, item.img, trx));
                        }

                        for (let i in JAVinfo.tags) {
                            let item = JAVinfo.tags[i];
                            promises.push(this.attachMeta('tag', metadataId, item, null, trx));
                        }

                        await Promise.all(promises);

                        logger.debug('Finished attching metas');

                        resolve(metadataId);
                    });
                }
            } catch (error) {
                logger.error('Error while creating records', error);
            }
        });
    }

    /**
     * Fetch JAV info from javbus.com
     *
     * @param {String} JAVID JAV id, in the formal of 'XXX-001'
     *
     * @returns {Promise} JAV info
     */
    async fetchNew(JAVID) {
        logger.debug('Request URL', 'https://www.javbus.com/ja/' + JAVID);
        let result = await pRetry(async () => {
            let res = await fetch('https://www.javbus.com/ja/' + JAVID, {
                headers: {
                    "Cache-Control": "max-age=0",
                    "Host": "www.javbus.com",
                    "Referer": "https://www.javbus.com",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36",
                },
                timeout: 7000,
            }).then((res) => res.text());

            return res;
        }, {
            onFailedAttempt: error => {
                logger.error(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left`);
            },
            retries: 3,
        });

        logger.debug('Result length', result.length);

        let dom = parser.parseFromString(result);

        let data = {
            title: "",
            cover: "",
            studio: "",
            series: "",
            tags: [],
            stars: [],
            releaseDate: "",
        };

        if (!dom.getElementsByClassName('info')[0])
        {
            logger.debug('JAV not found');
            return;
        }

        let a = dom.getElementsByClassName('info')[0].getElementsByTagName('a');
        for (let i in a) {
            let item = a[i];
            let at = item.attributes;
            for (let x in at) {
                let attr = at[x];
                if (attr.name === "href") {
                    let v = attr.value;
                    if (!data.studio && v.indexOf("/ja/studio/") !== -1) {
                        logger.debug(JAVID, 'Get studio info', item.textContent);
                        data.studio = item.textContent;
                    } else if (!data.series && v.indexOf("/ja/series/") !== -1) {
                        logger.debug(JAVID, 'Get series info', item.textContent);
                        data.series = item.textContent;
                    } else if (v.indexOf("/ja/genre/") !== -1) {
                        logger.debug(JAVID, 'Get tag info', item.textContent);
                        data.tags.push(item.textContent);
                    }
                }
            }
        }

        let imgs = dom.getElementsByClassName('movie')[0].getElementsByTagName('img');
        for (let i in imgs) {
            let item = imgs[i];
            let attrs = item.attributes;
            if (attrs[0] && (attrs[0].value.indexOf('/actress/') !== -1 || attrs[0].value.indexOf('nowprinting') !== -1)) {
                logger.debug(JAVID, 'Get star name', attrs[1].value.trim());
                data.stars.push({
                    name: attrs[1].value.trim(),
                    img: attrs[0].value.trim(),
                });
            } else if (attrs[0] && (attrs[0].value.indexOf('/cover/') !== -1 || attrs[0].value.indexOf('digital/video') !== -1)) {
                logger.debug(JAVID, 'Get JAV name', attrs[1].value);
                data.title = attrs[1].value;
                logger.debug(JAVID, 'Get JAV cover', attrs[0].value);
                data.cover = attrs[0].value;
            }
        }

        let p = dom.getElementsByClassName('info')[0].getElementsByTagName('p');
        for (let i in p) {
            if (data.releaseDate) continue;
            let item = p[i];
            if (item.firstChild && item.firstChild.textContent.indexOf('発売日:') !== -1) {
                logger.debug(JAVID, 'Get JAV release date', item.lastChild.textContent.trim());
                data.releaseDate = item.lastChild.textContent.trim();
            }
        }

        logger.debug(JAVID, data);

        return data;
    }

    /**
     * Get or create multiple types of metas' id
     *
     * @param {String} type value can be: tags, stars, series
     * @param {String} name name
     * @param {String=} photoURL photo URL
     * @param {trx} trx knex trx object
     *
     * @returns {Int} id
     */
    async getMetaId(type, name, photoURL, trx) {
        try {
            let result;
            if (result = await db(`${type}`).where('name', name).first()) {
                logger.debug(`[${type}] record for`, name, result);
                return result.id;
            } else {
                logger.debug(`[${type}] record for`, name, 'not found, create one');

                let data = {
                    name,
                    updateTime: (new Date()).getTime(),
                };

                if (photoURL) data.photoURL = photoURL;

                let id = await db(`${type}`).insert(data).transacting(trx).select('id');
                id = id[0];

                logger.debug(`[${type}] record for`, name, 'created,', id);
                return id;
            }
        } catch (error) {
            logger.error('Error while creating a record', error);
            throw error;
        }
    }

    /**
     * Attach meta to meatdata table
     *
     * @param {String} type
     * @param {Int} metadataId
     * @param {String} name
     * @param {String=} photoURL photo URL
     * @param {trx} trx knex trx object
     *
     * @return {Int}
     */
    async attachMeta(type, metadataId, name, photoURL, trx) {
        let map = {};
        switch (type) {
            case 'tag':
                map.log = 'Tag';
                map.column = 'tagId';
                map.type = 'tags';
                break;
            case 'star':
                map.log = 'Star';
                map.column = 'starId';
                map.type = 'stars';
                break;
            case 'series':
                map.log = 'Series';
                map.column = 'seriesId';
                map.type = 'series';
        }
        logger.debug(map);

        return new Promise(async (resolve) => {
            try {
                let id = await this.getMetaId(map.type, name, photoURL, trx);
                logger.debug(`${map.log} id`, id);

                let count = await db(`${map.type}_mapping`).where(map.column, id).where('metadataId', metadataId).count();
                await db.transaction(async trx => {
                    if (count[0]['count(*)'] === 0) {
                        logger.debug('Create mapping, count', count, count[0]['count(*)']);
                        
                        let data = {
                            metadataId,
                            updateTime: (new Date()).getTime(),
                        };
                        data[map.column] = id;

                        await db(`${map.type}_mapping`).insert(data).transacting(trx);
                        resolve(1);
                    } else {
                        logger.debug('Meta exist');
                        resolve(1);
                    };
                });
            } catch (error) {
                logger.error('Error while attaching a record', error);
                throw error;
            }
        });
    }
}

module.exports = new Metadata();
