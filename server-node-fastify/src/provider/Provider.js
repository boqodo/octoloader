const userAgent = require('../utils/useragents')
const fs = require('fs')
const r2 = require('r2')
const path = require('path')
const { URL } = require('url')
class Provider {
  constructor (url) {
    this.url = url
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
    let file = await download2Disk(coverUrl)
    return file
  }
  static async downloadVideo (video) {

  }
  async startDownload () {

  }
}

function download2Disk (coverUrl) {
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

exports = module.exports = Provider

/* {
  title:'',
  seasons:[
      {name:'',
      total:50,
      link:'',
      voides:[{
          name:'',
          cover:'',
          url:'',
          num:1}
      ]}
  ]
} */
