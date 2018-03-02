const Provider = require('./Provider')
const r2 = require('r2')
const fs = require('fs')
const path = require('path')
const { URL, URLSearchParams } = require('url')
const cheerio = require('cheerio')

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

  let aurl = `http://cache.video.iqiyi.com/jp/avlist/${album.id}/1/50/?albumId=${album.id}&pageNum=50&pageNo=1`
  let text = await r2(aurl).text
  let vchar = 'var tvInfoJs='
  text = text.substring(vchar.length)
  let tvInfoJs = JSON.parse(text)

  let season = {
    name: album.title,
    total: tvInfoJs.data.pt,
    link: album.link
  }

  let videos = []
  tvInfoJs.data.vlist.forEach((i, index) => {
    videos.push({
      name: i.vn || i.shortTitle,
      cover: i.vpic,
      url: i.vurl,
      uuid: i.vid,
      num: i.pd || i.pds,
      times: Number.parseInt(i.timeLength / 60) + ':' + (i.timeLength % 60 + '').padStart(2, '0')
    })
  })
  season.videos = videos
  resobj.seasons = [season]
  return resobj
}

async function getAlbum (url) {
  try {
    let text = await r2(url).text
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
