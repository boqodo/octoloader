import axios from 'axios'

class MediaApi {
  queryMedias (url) {
    // TODO: check supperted url
    return axios.get(`/medias?url=${url}`).then(resp => resp.data)
  }
  downloadVideo (videoItem) {
    return axios.post(`/download`, videoItem).then(resp => resp.data)
  }

  querySearchHistories (size) {
    return axios.get(`/histories?size=${size}`).then(resp => resp.data)
  }
  getConfig () {
    return axios.get('/config').then(resp => resp.data)
  }
  updateConfig (config) {
    return axios.post('/config', config).then(resp => resp.data)
  }
}

export default new MediaApi()
