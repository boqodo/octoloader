const state = {
  queue: new Set()
}

const mutations = {
  ADD_DOWNLOAD_ITEM (state, downloadItem) {
    state.queue.add(downloadItem)
    downloadItem.downloadProgress = 25
  },
  REMOVE_DOWNLOAD_ITEM (state, downloadItem) {
    if (state.queue.has(downloadItem)) {
      state.queue.delete(downloadItem)
    }
  }
}

const actions = {
  addDownloadItem ({ commit }, downloadItem) {
    commit('ADD_DOWNLOAD_ITEM', downloadItem)
  }
}

export default {
  state,
  mutations,
  actions
}
