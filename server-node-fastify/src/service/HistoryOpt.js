const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./config/db.json')
const db = low(adapter)

const SEARCH_HISTORY = 'search_history'
class HistoryOpt {
  constructor (db) {
    this.db = db
  }
  getSearchHistories ({ size = 5 }) {
    return this.db.get(SEARCH_HISTORY)
      .sortBy('time')
      .reverse()
      .take(size).values()
  }
  record (url, res) {
    let find = this.db.get(SEARCH_HISTORY).find({url: url})
    let findItem = find.value()
    if (findItem) {
      find.assign({frequency: (findItem.frequency || 1) + 1}).write()
    } else {
      let searchItem = findSearchItem(url, res)
      let sitem = {
        title: res.title,
        name: searchItem.name,
        url: url,
        cover: searchItem.cover,
        isLocalCover: res.isLocalCover,
        total: sumTotal(res.seasons),
        seasons: res.seasons.length,
        time: Date.now(),
        frequency: 1
      }
      let fun
      if (this.db.has(SEARCH_HISTORY).value()) {
        fun = item =>
          this.db.get(SEARCH_HISTORY)
            .push(item)
            .write()
      } else {
        fun = item => this.db.set(SEARCH_HISTORY, [item]).write()
      }
      fun(sitem)
    }
  }
}

function findSearchItem (url, {seasons}) {
  for (let {videos} of seasons) {
    for (let v of videos) {
      if (v.url === url) {
        return v
      }
    }
  }
  if (seasons.length >= 1) {
    let {videos} = seasons[0]
    return videos[0]
  }
}
function sumTotal (seasons) {
  let sum = 0
  seasons.forEach(i => {
    sum += i.total
  })
  return sum
}

exports = module.exports = new HistoryOpt(db)
