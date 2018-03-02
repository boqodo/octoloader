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
              <div class="card-image" @click="openUrl(item.url)">
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
                    <span>{{videoName(item.name)}}</span>
                  </div>
                </div>
              </div>
              <div class="video-item-status">
                <progress class="progress is-danger" value="0" max="100">0%</progress>
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
      mediaApi.queryMedias(url)
        .then(res => {
          this.isStartSearch = false
          this.isSearch = false
          this.entity = res
        }).catch(err => {
          this.isStartSearch = false
          this.searchStatus.type = -1
          this.searchStatus.message = err
        })
    },
    videoName (name) {
      return name
    },
    localCover (url, coverUrl) {
      return this.entity.isLocalCover ? `http://localhost:3000/api/images?url=${encodeURIComponent(url)}&cover=${encodeURIComponent(coverUrl)}` : coverUrl
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
