const os = require('os')
const fs = require('fs')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./config/config.json')
const db = low(adapter)

const BASE_CONFIG = 'base_config'
const DEFAULT_BASE_CONFIG = {
  savedir: './download',
  rootdir: fs.realpathSync('.'),
  parallels: 1,
  cpus: os.cpus().length,
  pixel: 1080,
  isAutoMerge: false
}

class ConfigOpt {
  constructor (db) {
    this.db = db
  }
  getConfig () {
    let config = db.get(BASE_CONFIG).value()
    if (!config) return DEFAULT_BASE_CONFIG
    return config
  }
  updateConfig (config) {
    db.set(BASE_CONFIG, config).write()
  }
}

exports = module.exports = new ConfigOpt(db)
