const Provider = require('./Provider')
const { URL } = require('url')
const r2 = require('r2')
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

class CCTVProvider extends Provider {
  constructor (url) {
    super(url)
  }

  static match (url) {
    super.match(url)
    let u = new URL(url)
    return u.hostname.indexOf('cctv.com') > -1
  }
  static async getSeasons (url) {
    super.getSeasons(url)
    let ss = await getSeasonUrls(url)
    ss.isLocalCover = false
    return ss
  }
  configDownloadFileName (video) {
    return `${video.num}${video.name}-${video.seqnum}.mp4`
  }

  async parseDownloadVideos (video) {
    let ourl = `http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${video.uuid}`
    let json = await r2(ourl).json

    let chapter = Object.keys(json.video)
      .filter(v => v.indexOf('chapter') > -1)
      .sort()
      .pop()
    this.todoVideos = await Promise.all(
      json.video[chapter].map(async (item, index) => {
        let downurl = new URL(item.url)
        let filesize = await filesizeHandler(item.url)
        let videoitem = {
          downurl: downurl,
          seqnum: index,
          filesize: filesize,
          title: json.title
        }
        return Object.assign(videoitem, video)
      })
    )
  }
}
async function filesizeHandler (url) {
  let res = await r2.head(url).response
  return Number.parseInt(res.headers.get('content-length'))
}

async function getSeasonUrls (videourl) {
  videourl = videourl.endsWith('/')
    ? videourl.substring(0, videourl.length - 1)
    : videourl
  let last = videourl.lastIndexOf('/')
  let videono = videourl.substring(last + 1)
  let file = `./videos/${path.basename(videono, '.shtml')}.json`
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
  let text = await r2(url).text
  let $ = cheerio.load(text)
  let videoid = $('meta[name="contentid"]').attr('content')
  videoid = videoid || path.basename(url, path.extname(url))
  let title = $('title').text()
  // http://api.cntv.cn/lanmu/columnInfoByColumnId?id=TOPC1451559205464876&serviceId=tvcctv&t=json
  let [, seasontitle] = /《(\S+)》/gi.exec(title)
  let link = $('div.cnt_nav p>a').attr('href')

  let guidregex = /var guid = "(\w{32})";/gi
  let [, guid] = guidregex.exec(text)
  let cidregex = /var column_id = "(\w{20})";/gi
  let [, topicid] = cidregex.exec(text)
  let listurl = `http://api.cntv.cn/video/getVideoListByTopicIdInfo?videoid=${videoid}&topicid=${topicid}&serviceId=cbox&type=0&t=json`
  let json = await r2(listurl).json

  let season = {}
  let videos = []
  json.data.forEach((v, index) => {
    videos.push({
      name: v.video_title,
      url: v.video_url,
      cover: v.video_key_frame_url,
      num: index + 1,
      uuid: guid,
      vid: v.video_id,
      times: v.video_length,
      downloadProgress: 0
    })
  })
  season.videos = videos
  season.name = seasontitle
  season.total = json.total
  season.link = link
  resobj.seasons = [season]
  resobj.title = seasontitle
  return resobj
}

exports = module.exports = CCTVProvider
