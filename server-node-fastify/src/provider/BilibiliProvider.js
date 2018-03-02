const Provider = require('./Provider')
const { URL } = require('url')
const r2 = require('r2')
const fs = require('fs')
const cheerio = require('cheerio')

class BilibiliProvider extends Provider {
  static match (url) {
    super.match(url)
    let u = new URL(url)
    return u.hostname.indexOf('bilibili.com') > -1
  }
  static async getSeasons (url) {
    super.getSeasons(url)
    let ss = await getSeasonUrls(url)
    ss.isLocalCover = true
    return ss
  }
}

/**
 * 根据任意一集动画的地址，提取对应动画各季下的动画地址
 *
 * @param {string} url
 * @returns {Promise.<{[index:string]:Array.<string>}>}
 */
async function extraSeason (url) {
  let text = await r2(url).text
  let $ = cheerio.load(text)
  let seasonurl = $('meta[property="og:url"]').attr('content')
  seasonurl = seasonurl.endsWith('/')
    ? seasonurl.substring(0, seasonurl.length - 1)
    : seasonurl
  let last = seasonurl.lastIndexOf('/')
  let seasonval = seasonurl.substring(last + 1 + 2)
  let store = await extraVideoItemUrls(seasonval)
  return store
}
async function extraVideoItemUrls (sval) {
  let store = await parseSearson(sval)
  let resobj = {
    title: store.extras.title
  }
  let ss = store.extras.seasons
  delete store['extras']

  if (ss && ss.length > 0) {
    let promises = []
    ss.filter(s => s.season_id != sval).forEach(s => {
      promises.push(parseSearson(s.season_id))
    })
    let sss = await Promise.all(promises)
    let result = []
    sss.forEach(s => {
      delete s['extras']
      result.push(s)
    })
    let index = ss.findIndex(s => s.season_id == sval)
    result.splice(index, 0, store)
    resobj.seasons = result
  } else {
    resobj.seasons = [store]
  }
  return resobj

  async function parseSearson (seasonval) {
    let searsonlisturl = `https://bangumi.bilibili.com/view/web_api/season?season_id=${seasonval}`
    let json = await r2(searsonlisturl).json
    let key = json.result.title
    let _store = {}
    if (!_store[key]) {
      let videoItems = []
      json.result.episodes.forEach(ep => {
        let videoitemurl = `https://www.bilibili.com/bangumi/play/ep${ep.ep_id}`
        videoItems.push({
          url: videoitemurl,
          name: ep.index_title,
          num: ep.index,
          cover: ep.cover,
          cid: ep.cid,
          seasontype: json.result.season_type
        })
      })
      _store.name = json.result.title
      _store.total = json.result.total_ep
      _store.link = json.result.link
      _store.uuid = seasonval
      _store.videos = videoItems
    }
    _store.extras = {
      seasons: json.result.seasons,
      title: json.result.title.replace(json.result.season_title, '').trim()
    }
    return _store
  }
}

async function getSeasonUrls (videourl) {
  videourl = videourl.endsWith('/')
    ? videourl.substring(0, videourl.length - 1)
    : videourl
  let last = videourl.lastIndexOf('/')
  let videono = videourl.substring(last + 1)
  let file = `./videos/${videono}.json`
  try {
    let buffer = fs.readFileSync(file)
    return JSON.parse(buffer)
  } catch (e) {
    let store = await extraSeason(videourl)
    fs.writeFileSync(file, JSON.stringify(store))
    return store
  }
}

exports = module.exports = BilibiliProvider
