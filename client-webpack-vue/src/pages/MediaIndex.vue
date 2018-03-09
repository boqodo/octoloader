<template>
  <div class="app-container">

    <div class="video">
      <div class="video-header">
        <div class="video-title is-size-3 has-text-grey has-text-weight-bold has-text-centered" v-if="isSearch">
          <search-bar ph="input url" @queryEvent="queryMedias" :isStartSearch="isStartSearch" :status="searchStatus" />
        </div>
        <div class="video-title is-size-3 has-text-grey has-text-weight-bold has-text-centered" v-else>
          <span>{{entity.title}}</span>
          <a class="delete is-large" @click="research"></a>
        </div>
      </div>
      <div class="video-content">
        <div class="tabs is-left is-boxed">
          <ul>
            <li v-for="(season,index) in entity.seasons" :class="index === selectedIndex ?'is-active':''" :key="season.uuid">
              <a @click="changeTab(index)" @dblclick="openUrl(season.link)">
                <div class="tags has-addons">
                  <span class="tag">{{season.name}}</span>
                  <span class="tag is-success">{{season.total}}</span>
                </div>
              </a>
            </li>
          </ul>
        </div>
        <section class="columns video-item">
          <div class="column" v-for="item in curSeasonVideos" :key="item.url">
            <div class="card" v-if="item.url">
              <div class="card-shade">
                <div class="card-image">
                  <figure class="image is-4by3">
                    <img :src="localCover(item.url,item.cover)" alt="封面">
                  </figure>
                  <div class="video-item-times has-text-white">
                    <span>{{item.times}}</span>
                  </div>
                </div>
                <div class="video-item-content">
                  <div class="video-item-num is-size-4 has-text-white has-text-weight-bold has-text-centered">
                    <span>{{item.num}}</span>
                  </div>
                  <div class="video-item-name" :title="item.name">
                    <div class="video-item-name-cell">
                      <span>{{videoName(item)}}</span>
                    </div>
                  </div>
                  <div class="video-item-signals">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div class="video-item-status">
                  <progress class="progress is-danger" :value="item.downloadProgress" max="100">{{item.downloadProgress}}</progress>
                </div>
              </div>
              <div class="video-shade has-text-centered">
                <div class="play has-text-dark is-size-1" @click="openUrl(item.url)">
                  <span class="icon is-large">
                    <i class="fa fa-play" aria-hidden="true"></i>
                  </span>
                </div>
                <div class="download is-size-4">
                  <a class="button is-success" @click="downloadVideo(item)">
                    <span class="icon is-large">
                      <i class="fa fa-cloud-download" aria-hidden="true"></i>
                    </span>
                    <span>下载</span>
                  </a>
                </div>
              </div>
            </div>
            <div class="column" v-else></div>
          </div>
        </section>
      </div>
      <div class="video-footer">

      </div>
    </div>
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar'
import mediaApi from '../api/MediaApi'
export default {
  components: {
    SearchBar
  },
  created () {
    this.entity = this.$route.params
  },
  data () {
    return {
      isSearch: false,
      isStartSearch: false,
      searchStatus: {
        type: 0,
        message: ''
      },
      selectedIndex: 0,
      hoverVideoItem: null,
      entity: {
        title: '',
        isLocalCover: true,
        seasons: [
          {
            name: '',
            total: 0,
            link: '',
            uuid: 0,
            videos: [
              {
                name: '',
                cover: '',
                url: '',
                num: 0,
                times: 0
              }
            ]
          }
        ]
      }
    }
  },
  methods: {
    research () {
      this.isSearch = true
    },
    changeTab (index) {
      this.selectedIndex = index
    },
    queryMedias (url) {
      this.isStartSearch = true
      this.searchStatus.type = 0
      this.searchStatus.message = ''

      this.selectedIndex = 0
      mediaApi
        .queryMedias(url)
        .then(res => {
          this.isStartSearch = false
          this.isSearch = false
          this.entity = res
        })
        .catch(err => {
          this.isStartSearch = false
          this.searchStatus.type = -1
          this.searchStatus.message = err
        })
    },
    videoName (videoItem) {
      return videoItem.name || `第 ${videoItem.num} 话`
    },
    downloadVideo (videoItem) {
      this.$store.dispatch('addDownloadItem', videoItem)
    },
    localCover (url, coverUrl) {
      return this.entity.isLocalCover
        ? `http://localhost:3000/api/images?url=${encodeURIComponent(
          url
        )}&cover=${encodeURIComponent(coverUrl)}`
        : coverUrl
    },
    openUrl (url) {
      window.open(url)
    }
  },
  computed: {
    curSeasonVideos () {
      let vs = this.entity.seasons[this.selectedIndex].videos
      let mod = 5 - (vs.length % 5 || 5)
      while (mod--) {
        vs.push({})
      }
      return vs
    }
  }
}
</script>

<style lang="scss" scoped>
.video {
  margin-top: 1rem;
  border: 2px white solid;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 1rem);
}

.video-header {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

  .video-title {
    padding: 0.5rem;
    background: #fff;
    position: relative;

    .delete {
      position: absolute;
      right: 1rem;
      top: 1rem;
    }
  }
}
.video-content {
  margin-top: 0.5rem;
  flex: 1;

  .video-item {
    padding: 0 0.5rem;
    flex-wrap: wrap;
  }

  .video-item-times {
    bottom: 0.25rem;
    right: 0.25rem;
    position: absolute;
  }
}

.video-item-content {
  //padding: 0.5rem;
  display: flex;
  align-items: center;

  .video-item-num {
    background: linear-gradient(90deg, #8e54e9, #4776e6);
    padding: 0 0.725rem;
  }
  .video-item-name {
    min-width: 12.25rem;
    max-width: 12.25rem;
    min-height: 3rem;
    max-height: 3rem;
    flex: 1;
    padding-left: 0.5rem;

    //https://www.qianduan.net/css-to-achieve-the-vertical-center-of-the-five-kinds-of-methods/
    display: table;
    .video-item-name-cell {
      display: table-cell;
      vertical-align: middle;
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }
}
.video-shade {
  visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .play {
    flex: 1;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
  .download {
    flex: none;
    min-height: 3rem;
    max-height: 3rem;
    margin-bottom: 0.2rem;

    flex: 1;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
}

.card:hover > .card-shade {
  opacity: 0.5;
  transition: 0.25s ease-in-out;
}
.card:hover > .video-shade {
  visibility: visible;
}

.video-item-signals {
  position: absolute;
  bottom: 0.825rem;
  right: 0.5rem;
  display: flex;
  flex-direction: column;

  span {
    width: 0.25rem;
    height: 0.25rem;
    background-color: red;
    border-radius: 50%;
    margin-top: 0.25rem;
    &:last-of-type {
      background-color: #4caf50;
      margin-bottom: 0.25rem;
    }

    &:first-of-type {
      background-color: #03a9f4;
    }
  }
}

.video-footer {
  margin-top: 1rem;
  background-color: white;
  height: 2rem;
}

.tabs.is-boxed a {
  border-radius: 0;
}
.progress {
  height: 0.2rem;
}
</style>
