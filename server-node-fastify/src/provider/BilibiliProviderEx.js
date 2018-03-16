const Provider = require('./Provider')
const userAgent = require('../utils/useragents')
const { URL } = require('url')
const r2 = require('r2')
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const crypto = require('crypto')
const BILIBILI_APPKEY = '84956560bc028eb7'
const BILIBILI_APPSEC = '94aba54af9065f71de72f5508f1cd42e'
const savedir = 'D:\\ztest-demo'

class BilibiliProvider extends Provider {
  constructor (todoVideos) {
    super()
    this.todoVideos = todoVideos
  }
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

  static async downloadVideo (video) {
    let todoVideos = await parsedownloadurl(video)
    return new BilibiliProvider(todoVideos)
  }

  async startDownload (reply) {
    if (!this.isStartDownload) {
      this.isStartDownload = true
      let downress = await Promise.all(this.todoVideos.map(v => download(v, reply)))
      return downress
    }
    return 0
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
          seasontype: json.result.season_type,
          downloadProgress: 0,
          times: ''
        })
      })
      _store.name = json.result.title
      _store.total = json.result.total_ep
      _store.link = json.result.link
      _store.uuid = seasonval
      _store.videos = videoItems
      _store.curTotal = videoItems.length
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

function md5 (data) {
  let md5 = crypto.createHash('md5')
  md5.update(data)
  return md5.digest('hex')
}

async function parsedownloadurl (video) {
  let ourl = new URL(
    'https://bangumi.bilibili.com/player/web_api/v2/playurl?' +
			`cid=${video.cid}&appkey=${BILIBILI_APPKEY}&season_type=${
			  video.seasontype
			}` +
			'&otype=json&type=&quality=0&module=bangumi&qn=0'
  )
  ourl.searchParams.sort()
  let sign = md5(ourl.searchParams.toString() + BILIBILI_APPSEC)
  ourl.searchParams.append('sign', sign)
  let json = await r2(ourl.href, {
    'User-Agent': userAgent()
  }).json
  let downs = []
  json.durl.forEach((item, index) => {
    let downurl = new URL(item.url)
    let videoitem = {
      downurl: downurl,
      seqnum: index,
      filesize: item.size
    }
    downs.push(Object.assign(videoitem, video))
  })
  return downs
}

/**
 * 下载视频分段信息到指定目录
 *
 * @param {{downurl:string,seqnum:number,url: string,title: string,num: number}} video  视频对象
 */
async function download (video, reply) {
  return new Promise(async (resolve, reject) => {
    let referer = video.url
    let downloadurl = video.downurl
    let filename = `${video.num}${video.name}-${video.seqnum}.flv`
    let savefile = path.join(savedir, filename)
    let downstatus = await downloadedStatus({
      filename: savefile,
      filesize: video.filesize
    })
    if (!downstatus) {
      let headers = {
        Host: downloadurl.host,
        'User-Agent': userAgent(),
        Accept: '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Access-Control-Request-Headers': 'range',
        'Access-Control-Request-Method': 'GET',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        Origin: 'https://www.bilibili.com',
        Pragma: 'no-cache',
        Referer: referer
      }
      let res = await r2(downloadurl.href, { headers }).response

      let write = fs.createWriteStream(savefile)
      let curLen = 0
      res.body.on('error', data => {
        reject(data)
      })
      res.body.on('data', function (chunk) {
        curLen += chunk.length
        reply.sse({event: 'downloading', url: referer, seqnum: video.seqnum, curLen: curLen})
      })
      res.body.on('end', () => {
        reply.sse({event: 'finish', savefile: savefile, url: referer, seqnum: video.seqnum})
        resolve(savefile)
      })
      res.body.pipe(write)
    }
  })
}
async function downloadedStatus (downitem) {
  let file = downitem.filename
  let filesize = downitem.filesize
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        err.code === 'ENOENT' ? resolve(false) : reject(err)
      }
      if (!stats) {
        resolve(false)
      } else {
        resolve({
          isPart: Number(stats.size) !== Number(filesize),
          cursize: stats.size
        })
      }
    })
  })
}

exports = module.exports = BilibiliProvider
