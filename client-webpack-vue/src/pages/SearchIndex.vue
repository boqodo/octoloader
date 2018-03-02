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
        <search-bar ph="input url" @queryEvent="queryMedias" :isStartSearch="isStartSearch" :status="searchStatus"/>
      </section>

      <section class="columns history">
        <div class="column">
          <div class="card">
            <div class="card-image">
              <figure class="image is-4by3">
                <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
              </figure>
            </div>
            <div class="card-content">
              <div class="content">
                Lorem ipsum dolor
                <a href="#">#responsive</a>
                <br>
                <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
              </div>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <div class="card-image">
              <figure class="image is-4by3">
                <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
              </figure>
            </div>
            <div class="card-content">
              <div class="content">
                Lorem ipsum dolor
                <a href="#">#responsive</a>
                <br>
                <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
              </div>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <div class="card-image">
              <figure class="image is-4by3">
                <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
              </figure>
            </div>
            <div class="card-content">
              <div class="content">
                Lorem ipsum dolor
                <a href="#">#responsive</a>
                <br>
                <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
              </div>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <div class="card-image">
              <figure class="image is-4by3">
                <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
              </figure>
            </div>
            <div class="card-content">
              <div class="content">
                Lorem ipsum dolor
                <a href="#">#responsive</a>
                <br>
                <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
              </div>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <div class="card-image">
              <figure class="image is-4by3">
                <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
              </figure>
            </div>
            <div class="card-content">
              <div class="content">
                Lorem ipsum dolor
                <a href="#">#responsive</a>
                <br>
                <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
              </div>
            </div>
          </div>
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
      </div> -->
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
  data () {
    return {
      isStartSearch: false,
      searchStatus: {
        type: 0,
        message: ''
      }
    }
  },
  methods: {
    queryMedias (url) {
      this.isStartSearch = true
      this.searchStatus.type = 0
      this.searchStatus.message = ''
      mediaApi.queryMedias(url)
        .then(res => {
          this.isStartSearch = false
          this.$router.push({ name: 'MediaIndex', params: res })
        }).catch(err => {
          this.isStartSearch = false
          this.searchStatus.type = -1
          this.searchStatus.message = err
        })
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
</style>
