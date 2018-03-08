<template>
  <div class="app-container">
    <setting/>
    <header class="app-header">
      <div class="is-size-2 has-text-white has-text-weight-bold has-text-centered">
        <span>Octoloader</span>
      </div>
    </header>
    <main class="app-content">
      <section class="search">
        <search-bar ph="input url" @queryEvent="queryMedias" :isStartSearch="isStartSearch" :status="searchStatus" />
      </section>

      <section class="columns history">
        <div class="column" v-for="history in curHistories" :key="history.url">
          <div class="card-container" v-if="history.url" @click="reSearch(history.url)">
            <div class="card">
              <div class="card-image">
                <figure class="image is-4by3">
                  <img :src="localCover(history)" alt="封面">
                </figure>
              </div>
              <div class="history-card-content">
                <div class="history-content">
                  <h2 class="title is-5">{{history.title}}</h2>
                  <h3 class="subtitle is-6">{{history.name}}</h3>
                </div>
                <div class="history-label is-size-7">
                  <div class="history-label-item has-text-light">
                    <span class="history-data">{{history.total+' 集'}}</span>
                  </div>
                  <div class="history-label-item has-text-light">
                    <span class="history-data">{{history.seasons+' 季'}}</span>
                  </div>
                  <div class="history-label-item" :title="dateFormat(history.time)">
                    <img src="../assets/time.svg">
                  </div>
                </div>
              </div>
            </div>
            <div class="video-shade">
              <h1 class="title has-text-success">{{'已搜索 '+history.frequency+' 次'}}</h1>
            </div>
          </div>
          <div class="column" v-else></div>
        </div>
      </section>
    </main>
    <footer class="app-footer">
      <!-- <div class="columns is-size-4 has-text-white has-text-centered">
        <div class="column" title="正下载">
          <span class="icon">
            <i class="fa fa-download" aria-hidden="true"></i>
          </span>
          4
        </div>
        <div class="column" title="待下载">
          <span class="icon">
            <i class="fa fa-tasks" aria-hidden="true"></i>
          </span>
          5
        </div>
        <div class="column" title="已下载">
          <span class="icon">
            <i class="fa fa-arrow-circle-down" aria-hidden="true"></i>
          </span>
          11
        </div>
        <div class="column" title="磁盘空间">
          <span class="icon">
            <i class="fa fa-hdd-o" aria-hidden="true"></i>
          </span>
          123GB
        </div>
      </div>-->
    </footer>
  </div>

</template>

<script>
import SearchBar from '@/components/SearchBar'
import Setting from '@/components/Setting'
import mediaApi from '../api/MediaApi'

export default {
  name: 'SearchIndex',
  components: {
    SearchBar,
    Setting
  },
  created () {
    mediaApi
      .querySearchHistories()
      .then(res => {
        this.histories = res
      })
      .catch(err => {
        console.error(err)
      })
  },
  data () {
    return {
      isStartSearch: false,
      searchStatus: {
        type: 0,
        message: ''
      },
      histories: []
    }
  },
  methods: {
    queryMedias (url) {
      this.isStartSearch = true
      this.searchStatus.type = 0
      this.searchStatus.message = ''
      mediaApi
        .queryMedias(url)
        .then(res => {
          this.isStartSearch = false
          this.$router.push({ name: 'MediaIndex', params: res })
        })
        .catch(err => {
          this.isStartSearch = false
          this.searchStatus.type = -1
          this.searchStatus.message = err
        })
    },
    reSearch (url) {
      this.queryMedias(url)
    },
    localCover (history) {
      return history.isLocalCover
        ? `http://localhost:3000/api/images?url=${encodeURIComponent(
          history.url
        )}&cover=${encodeURIComponent(history.cover)}`
        : history.cover
    },
    dateFormat (times) {
      let date = new Date(times)
      return (
        date.getFullYear() +
        '年' +
        (date.getMonth() + 1) +
        '月' +
        date.getDay() +
        '日'
      )
    }
  },
  computed: {
    curHistories () {
      let vs = this.histories
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
.search {
  padding: 2rem;
  background: #fff;
}
.history {
  margin-top: 2rem;
  flex-wrap: wrap;
}
.history-card-content {
  border-top: 1px #f2f2f2 solid;
  padding: 0.2rem 0.2rem 0 0.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.history-content {
  padding: 0.2rem;
  flex: 1;

  .subtitle {
    padding: 0.2rem 0 0.2rem 0.8rem;
  }
}
.history-label {
  padding: 0.25rem 0 0.2rem 0;
  border-top: 1px #f2f2f2 solid;

  div {
    display: inline-block;
  }
}

.history-label-item {
  span {
    background: linear-gradient(90deg, #8e54e9, #4776e6);
    padding: 0.05rem 0.25rem;
  }

  img {
    width: 1rem;
    height: 1rem;
  }

  &:last-of-type {
    float: right;
    background: none;
    padding: 0;
  }
}

.card {
  display: flex;
  flex-direction: column;
  height: 100%;
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
}

.card-container {
  height: 100%;
  position: relative;

  &:hover > .card {
    opacity: 0.2;
    transition: 0.25s ease-in-out;
  }
  &:hover > .video-shade {
    visibility: visible;
  }
}
</style>
