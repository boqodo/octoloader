const Provider = require('./Provider')
const userAgent = require('../utils/useragents')
const r2 = require('r2')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')
const cheerio = require('cheerio')
const pageNum = 50

class IQiyiProvider extends Provider {
  constructor (url) {
    super(url)
  }
  static match (url) {
    super.match(url)
    let u = new URL(url)
    return u.hostname.indexOf('iqiyi.com') > -1
  }
  static async getSeasons (url) {
    super.getSeasons(url)
    let ss = await getSeasonUrls(url)
    ss.isLocalCover = true
    return ss
  }
  async parseResponse (video, response, resolve) {
    const url = response.url()
    if (url.indexOf('/vms?tvId') !== -1 && response.ok) {
      let jsonp = await response.text()
      let json = jsonp2json(jsonp)
      let urlPrefix = json.data.vp.du
      let lists = json.data.vp.tkl
      if (lists.length === 0) {
        console.error('获取下载信息失败！')
        return
      }
      let downitems = []

      for (let l of lists) {
        let vinfos = l.vs
        let maxVinfo
        let maxScrsz
        for (let vinfo of vinfos) {
          let [w, h] = vinfo.scrsz.split('x')
          let scrsz = w * h
          if (!maxScrsz) {
            maxScrsz = scrsz
            maxVinfo = vinfo
          } else {
            if (maxScrsz < scrsz) {
              maxScrsz = scrsz
              maxVinfo = vinfo
            }
          }
        }
        let fs = maxVinfo.fs
        for (let segInfo of fs) {
          let surl = segInfo.l
          surl = urlPrefix + surl
          let sjson = await r2(surl).json
          let downurl = sjson.l
          let parseurl = new URL(surl)
          let index = parseurl.searchParams.get('qd_index')
          let filesize = segInfo.b
          let item = {
            downurl: downurl,
            filesize: filesize,
            seqnum: index,
            url: video.url
          }
          downitems.push(Object.assign(item, video))
        }
      }
      resolve(downitems)
    }
  }
}

async function getSeasonUrls (videourl) {
  videourl = videourl.endsWith('/')
    ? videourl.substring(0, videourl.length - 1)
    : videourl
  let last = videourl.lastIndexOf('/')
  let videono = videourl.substring(last + 1)
  let file = `./videos/${path.basename(videono, '.html')}.json`
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
  let album = await getAlbum(url)
  resobj.title = album.title
  let seasons = []

  let pageNo = 1
  let season = await parseSeason(album, pageNo)
  let pageNos = Math.ceil(season.total / pageNum)
  let promises = []
  for (let i = 2; i <= pageNos; i++) {
    promises.push(parseSeason(album, i))
  }
  if (promises.length) {
    let ress = await Promise.all(promises)
    seasons = ress
    seasons.unshift(season)
    seasons = seasons.map((s, index) => {
      s.total = pageNum
      s.name = s.name + '-' + (index + 1)
      return s
    })
  } else {
    seasons.push(season)
  }

  resobj.seasons = seasons
  return resobj
}
async function parseSeason (album, pageNo) {
  let aurl = `http://cache.video.iqiyi.com/jp/avlist/${album.id}/${pageNo}/${pageNum}/?albumId=${album.id}&pageNum=${pageNum}&pageNo=${pageNo}`
  let text = await r2(aurl, {
    'User-Agent': userAgent()
  }).text
  let vchar = 'var tvInfoJs='
  text = text.substring(vchar.length)
  let tvInfoJs = JSON.parse(text)

  let total = tvInfoJs.data.pt

  let season = {
    name: album.title,
    total: total,
    link: album.link
  }

  let videos = []
  tvInfoJs.data.vlist.forEach((i, index) => {
    videos.push({
      name: i.vt || i.vn || i.shortTitle,
      cover: i.vpic,
      url: i.vurl,
      uuid: i.vid,
      num: i.pd || i.pds,
      tvid: i.tvQipuId || i.id,
      times: Number.parseInt(i.timeLength / 60) + ':' + (i.timeLength % 60 + '').padStart(2, '0'),
      downloadProgress: 0
    })
  })
  season.videos = videos
  season.curTotal = videos.length
  return season
}

async function getAlbum (url) {
  try {
    let text = await r2(url, {
      'User-Agent': userAgent()
    }).text
    const $ = cheerio.load(text)
    return {
      id: $('#flashbox').attr('data-player-albumid'),
      title: $('meta[name="irAlbumName"]').attr('content'),
      link: $('h2.playList-title-txt a').attr('href')
    }
  } catch (e) {
    throw new Error(e)
  }
}

function jsonp2json (jsonp) {
  let first = jsonp.indexOf('{', 4)
  let last = jsonp.indexOf(';')
  return JSON.parse(jsonp.substring(first, last - 1))
}

exports = module.exports = IQiyiProvider
