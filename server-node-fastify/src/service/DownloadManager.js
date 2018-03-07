class DownloadManager {
  constructor (options) {
    this.queue = []
  }
  createDownload (provider) {
    if (!this.sse) {
      this.queue.push(provider)
    } else {
      setImmediate(async () => {
        let r = await provider.startDownload(this.sse)
        console.log(r)
      })
    }
  }
  start (sse) {
    this.sse = sse
    setImmediate(async () => {
      this.queue.forEach(async p => {
        let r = await p.startDownload(sse)
        console.log(r)
      })
    })
  }
}

exports = module.exports = new DownloadManager()
