<template>
  <div class="setting-container">
    <div class="setting-button button" @click="toggle">
      <div class="is-size-2 has-text-centered">
        <span class="icon">
          <i class="fa" :class="changeIcon" aria-hidden="true"></i>
        </span>
      </div>
    </div>
    <transition name="fade">
      <div class="setting-form" v-show="isShow">

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">文件存放路径</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <input class="input" type="text" placeholder="输入本机用于存放下载的文件的路径">
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">同时下载个数</label>
          </div>
          <div class="field-body">
            <div class="field is-narrow">
              <div class="control">
                <div class="select is-fullwidth">
                  <select>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">清晰度</label>
          </div>
          <div class="field-body">
            <div class="field is-narrow">
              <div class="control">
                <div class="select is-fullwidth">
                  <select>
                    <option>超高清</option>
                    <option>高清</option>
                    <option>普通</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">是否主动合并分片文件?</label>
          </div>
          <div class="field-body">
            <div class="field is-narrow">
              <div class="control">
                <label class="radio">
                  <input type="radio" name="member"> 是
                </label>
                <label class="radio">
                  <input type="radio" name="member"> 否
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Setting',
  data () {
    return {
      isShow: false
    }
  },
  methods: {
    toggle () {
      this.isShow = !this.isShow
    }
  },
  computed: {
    changeIcon () {
      return this.isShow ? 'fa-times' : 'fa-cog'
    }
  }
}
</script>

<style  lang="scss" scoped>
.setting-container {
  .setting-button {
    width: 5rem;
    height: 5rem;
    position: absolute;
    bottom: 2.5rem;
    right: 2.5rem;
    background-color: white;
    border-radius: 50%;
    line-height: 2;
    z-index: 100;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }

  .setting-form {
    padding: 2rem;
    border-radius: 0.5rem;
    z-index: 100;
    background-color: white;
    position: absolute;
    bottom: 8.5rem;
    right: 2.5rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    height: calc(100% - 15.25rem);
    width: calc(100% - 5rem);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.fa-cog {
  transition: All 1s ease-in-out;
}
.fa-times {
  transform: rotate(60deg);
}
</style>
