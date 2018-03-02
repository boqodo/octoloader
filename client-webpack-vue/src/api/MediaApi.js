import axios from 'axios'

class MediaApi {
  queryMedias (url, fun) {
    // TODO: check supperted url
    return axios.get(`/medias?url=${url}`).then(resp => resp.data)
  }
}

export default new MediaApi()
