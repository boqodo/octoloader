import mediaApi from '../../api/MediaApi'

const state = {
  queue: []
}

const EventSoureState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2
}

var sse

const mutations = {
  ADD_DOWNLOAD_ITEM (state, downloadItem) {
    state.queue.push(downloadItem)
  },
  REMOVE_DOWNLOAD_ITEM (state, downloadItem) {
    let index = state.queue.indexOf(downloadItem)
    if (index > -1) {
      state.queue.splice(index, 1)
    }
  }
}

const actions = {
  async addDownloadItem ({ commit }, downloadItem) {
    if (!isExists(downloadItem)) {
      let segments = await mediaApi.downloadVideo(downloadItem)
      downloadItem.segments = segments
      commit('ADD_DOWNLOAD_ITEM', downloadItem)
      initSSE()
    }
  }
}

function isExists (downloadItem) {
  return !!state.queue.find(item => item === downloadItem || item.url === downloadItem.url)
}
function initSSE () {
  if (!sse || sse.readyState === EventSoureState.CLOSED) {
    sse = new EventSource('http://localhost:3000/api/sse')
    sse.onopen = e => console.info('sse start')
    sse.onerror = e => {
      console.error(e)
      sse.close()
    }
    sse.onmessage = e => console.log(e.data)
    sse.addEventListener('downloading', e => {
      let p = JSON.parse(e.data)
      state.queue.forEach(v => {
        if (v.url === p.url) {
          let sumFilesize = 0
          let sumCurLen = 0
          v.segments.forEach(s => {
            if (s.seqnum === p.seqnum) {
              s.curLen = p.curLen
              s.downloadProgress = calcDownloadProgress(s.curLen, s.filesize)
            }
            sumFilesize += Number.parseInt(s.filesize)
            sumCurLen += (Number.parseInt(s.curLen) || 0)
          })
          v.downloadProgress = calcDownloadProgress(sumCurLen, sumFilesize)
        }
      })
    })
    sse.addEventListener('end', e => sse.close())
  }
}
function calcDownloadProgress (curLen, total) {
  let ratio = curLen / total
  ratio = Math.min(Math.max(ratio, 0), 1)
  let percent = ratio * 100
  percent = percent.toFixed(2)
  return Number.parseInt(percent)
}

export default {
  state,
  mutations,
  actions
}
