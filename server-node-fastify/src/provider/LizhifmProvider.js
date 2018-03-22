const Provider = require('./Provider')
const userAgent = require('../utils/useragents')
const { URL } = require('url')
const r2 = require('r2')
const fs = require('fs')
const cheerio = require('cheerio')
const pageNum = 20

class LizhifmProvider extends Provider {
  constructor (url) {
    super(url)
  }
  static match (url) {
    super.match(url)
    let u = new URL(url)
    return u.hostname.indexOf('lizhi.fm') > -1
  }

  static async getSeasons (url) {
    super.getSeasons(url)
    let ss = await getSeasonUrls(url)
    ss.isLocalCover = true
    return ss
  }

  configDownloadFileName (video) {
    return `${video.num}${video.name}-${video.seqnum}.mp3`
  }
  configDownloadHeaders (video) {
    return {}
  }
  async parseDownloadVideos (sound) {
    let downurl = sound.url
    let res = await r2.head(downurl).response
    let sounditem
    if (res.ok) {
      sounditem = {
        downurl: downurl,
        seqnum: 1,
        filesize: Number.parseInt(res.headers.get('content-length')),
        title: sound.name
      }
    } else {
      let json = await r2(`http://www.lizhi.fm/media/url/${sound.uuid}`).json
      if (json.data && json.data.url) {
        let res2 = await r2.head(json.data.url).response
        sounditem = {
          downurl: json.data.url,
          seqnum: 1,
          filesize: Number.parseInt(res2.headers.get('content-length')),
          title: sound.name
        }
      }
    }
    this.todoVideos = [Object.assign(sound, sounditem)]
  }
}

async function getSeasonUrls (videourl) {
  videourl = videourl.endsWith('/')
    ? videourl.substring(0, videourl.length - 1)
    : videourl
  let last = videourl.lastIndexOf('/')
  let videono = videourl.substring(last + 1)
  let file = `./sounds/${videono}.json`
  try {
    let buffer = fs.readFileSync(file)
    return JSON.parse(buffer)
  } catch (e) {
    let store = await extraSeason(videourl)
    fs.writeFileSync(file, JSON.stringify(store))
    return store
  }
}

async function extraSeason (url) {
  let resobj = {}
  let pageurls
  let season = await parsePage(url)
  let otherseasons = await Promise.all(pageurls.map(parsePage))
  resobj.seasons = [].concat(season).concat(otherseasons)

  return resobj
  async function parsePage (url) {
    let text = await r2(url).text
    let $ = cheerio.load(text)
    let soundTotal = $('p.radioCnt>i.stat-audio-icon+span').text()
    soundTotal = Number.parseInt(soundTotal)
    let audios = $('.audioList.js-audio-list li a')
    let sound = audios.get(0)
    let name = sound.attribs['data-radio-name']
    let uid = sound.attribs['data-uid']
    if (!pageurls) {
      pageurls = buildPageurls(soundTotal, uid)
    }
    let sounds = audios
      .map((index, s) => {
        return {
          name: s.attribs['title'],
          cover: s.attribs['data-cover'],
          url: buildDownloadUrl(s),
          uuid: s.attribs['data-id'],
          num: index + 1,
          times: calcTimes(s.attribs['data-duration']),
          downloadProgress: 0
        }
      }).toArray()
    let season = {
      name: name,
      total: soundTotal,
      link: url,
      videos: sounds,
      curTotal: pageNum
    }
    return season

    function calcTimes (seconds) {
      return (
        Number.parseInt(seconds / 60) + ':' + (seconds % 60 + '').padStart(2, '0')
      )
    }
    function buildDownloadUrl ($ele) {
      let text = $('p.aduioTime', $ele).text()
      let regx = /([1-9]\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/
      let [_, y, m, d] = regx.exec(text)
      let dataid = $ele.attribs['data-id']
      return `http://cdn5.lizhi.fm/audio/${y}/${m}/${d}/${dataid}_hd.mp3`
    }

    function buildPageurls (soundTotal, uid) {
      let pageNos = Math.ceil(soundTotal / pageNum)
      let urls = []
      for (let i = 2; i <= pageNos; i++) {
        urls.push(`http://www.lizhi.fm/user/${uid}/p/${i}.html`)
      }
      return urls
    }
  }
}

exports = module.exports = LizhifmProvider
