const fs = require('fs')
const r2 = require('r2')
const puppeteer = require('puppeteer')
const path = require('path')
const { URL } = require('url')
const userAgent = require('../utils/useragents')
const configOpt = require('../service/ConfigOpt')

class Provider {
  constructor (url) {
    this.url = url
    this.config = configOpt.getConfig()
  }
  /**
	 *
	 * 是否匹配url地址
	 * @param {string} url
	 * @memberof Provider
	 */
  static match (url) {
    // TODO:校验url是否正确
    let u = this.url || url
    if (!u) {
      console.log('url是必须的')
    }
  }
  static getSeasons (url) {
    // TODO:校验url是否正确
    let u = this.url || url
    if (!u) {
      console.log('url是必须的')
    }
  }
  static async downloadCover (coverUrl) {
    let file = await _download2Disk(coverUrl)
    return file
  }
  async parseDownloadVideos (video) {
    this.todoVideos = await this._openChromeLoadPageResponses(video)
  }

  async parseResponse (video, response, resolve) {
    console.error(`Provider子类${this.constructor.name}必须重写parseResponse方法！`)
    process.exit(1)
  }

  // 配置下载需要的头
  // configDownloadHeaders()

  async _openChromeLoadPageResponses (video) {
    return new Promise(async (resolve, reject) => {
      try {
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: this.config.chromeInstallPath
        })
        const page = await browser.newPage()
        await page.on('response', response => this.parseResponse(video, response, resolve))
        await page.goto(video.url, { timeout: 0, waitUntil: 'networkidle0' })
      } catch (e) {
        reject(e)
      }
    })
  }
  configDownloadHeaders () {
    return {}
  }

  async startDownload (reply) {
    if (!this.isStartDownload) {
      this.isStartDownload = true
      let downress = await Promise.all(this.todoVideos.map(video => new Promise(async (resolve, reject) => {
        let referer = video.url
        let downloadurl = video.downurl
        let filename = `${video.num}${video.name}-${video.seqnum}.flv`
        let savefile = path.join(this.config.savedir, filename)
        let downstatus = await _downloadedStatus({
          filename: savefile,
          filesize: video.filesize
        })
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
          Pragma: 'no-cache',
          Referer: referer
        }
        Object.assign(headers, this.configDownloadHeaders())

        if (!downstatus) {
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
        } else {
          if (downstatus.isPart) {
            headers['Range'] = `bytes=${downstatus.cursize}-`
            let res = await r2(downloadurl.href, { headers }).response
            let write = fs.createWriteStream(savefile, {
              flags: 'r+',
              start: downstatus.cursize
            })
            let curLen = downstatus.cursize
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
          } else {
            reply.sse({event: 'finish', savefile: savefile, url: referer, seqnum: video.seqnum})
            resolve(savefile)
          }
        }
      })))
      return downress
    }
    return 0
  }
}

function _download2Disk (coverUrl) {
  return new Promise(async (resolve, reject) => {
    let savefile = `./images/${path.basename(new URL(coverUrl).pathname)}`
    try {
      fs.statSync(savefile)
      resolve(savefile)
    } catch (e) {
      let res = await r2(coverUrl, {
        'User-Agent': userAgent()
      }).response
      let write = fs.createWriteStream(savefile)

      res.body.on('error', data => {
        reject(data)
      })
      res.body.on('end', () => {
        resolve(savefile)
      })
      res.body.pipe(write)
    }
  })
}

async function _downloadedStatus (downitem) {
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

exports = module.exports = Provider
