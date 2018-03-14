const Provider = require('./Provider')
const userAgent = require('../utils/useragents')
const r2 = require('r2')
const fs = require('fs')
const path = require('path')
const { URL, URLSearchParams } = require('url')
const cheerio = require('cheerio')
const pageNum = 50

class IQiyiProvider extends Provider {
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
}

async function getSeasonUrls (url) {
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
      times: Number.parseInt(i.timeLength / 60) + ':' + (i.timeLength % 60 + '').padStart(2, '0')
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

exports = module.exports = IQiyiProvider
