<template>
  <div class="setting-container">
    <file-select-dialog :isOpenFileChooserDialog="isOpenFileChooserDialog" @close="fileChooserDialogClose" />
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
            <div class="field is-expanded">
              <div class="field has-addons">
                <p class="control">
                  <span class="select">
                    <select v-model="pathMode" disabled>
                      <option v-bind:value=0>相对路径</option>
                      <option v-bind:value=1>绝对路径</option>
                    </select>
                  </span>
                </p>
                <p class="control" v-if="pathMode === 0">
                  <a class="button is-static">
                    {{config.rootdir}}
                  </a>
                </p>
                <p class="control is-expanded">
                  <input class="input" type="text" placeholder="输入本机用于存放下载的文件的路径"
                    ref="savedir"
                    v-model="config.savedir"
                    @focus="toggleFileChooserDialog">
                </p>
                <p class="control">
                  <a class="button is-warning" title="点击打开文件夹" @click="openSaveDir">
                    可用空间 {{freespace}}
                  </a>
                </p>
              </div>
              <p class="help">{{helpMessage}}</p>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Chrome安装目录</label>
          </div>
          <div class="field-body">
            <div class="field is-expanded">
              <div class="field has-addons">
                 <p class="control">
                  <a class="button" style="width:115px" title="点击打开文件夹"
                    :class="hasChrome?'is-success':' is-warning'">
                    {{hasChrome ? '已安装':'未安装'}}
                  </a>
                </p>
                <p class="control is-expanded">
                  <input class="input" type="text" placeholder="选择Chrome浏览器安装的路径"
                      ref="chromeInstallPath"
                      :disabled="hasChrome"
                      v-model="config.chromeInstallPath">
                </p>
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
                  <select v-model="config.parallels">
                    <option v-for="n in maxParallel" :value="n" :key="n">{{n}}</option>
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
                  <select v-model="config.pixel">
                    <option v-for="p in pixels" :key="p" :value="p">{{pixelName(p)}}</option>
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
                  <input type="radio" v-bind:value=true v-model="config.isAutoMerge"> 是
                </label>
                <label class="radio">
                  <input type="radio" v-bind:value=false v-model="config.isAutoMerge"> 否
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">是否删除原分片文件?</label>
          </div>
          <div class="field-body">
            <div class="field is-narrow">
              <div class="control">
                <label class="radio">
                  <input type="radio" v-bind:value=true v-model="config.isAutoClear"> 是
                </label>
                <label class="radio">
                  <input type="radio" v-bind:value=false v-model="config.isAutoClear"> 否
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label">
            <!-- 都存在同一个文件夹，还是不同的动画片分开，同时同一动画片下是否放在一起，是否需要文件夹包含-->
            <label class="label">是否各剧文件独立存放?</label>
          </div>
          <div class="field-body">
            <div class="field is-narrow">
              <div class="control">
                <label class="radio">
                  <input type="radio" v-bind:value=true v-model="config.isDepend"> 是
                </label>
                <label class="radio">
                  <input type="radio" v-bind:value=false v-model="config.isDepend"> 否
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
import pretty from 'prettysize'
import FileSelectDialog from '@/components/FileSelectDialog'
import mediaApi from '../api/MediaApi'
export default {
  name: 'Setting',
  components: {
    FileSelectDialog
  },
  directives: {
    focus: {
      update: function (el, { value }) {
        if (value) {
          el.focus()
        }
      }
    }
  },
  created () {
    mediaApi
      .getConfig()
      .then(res => {
        this.config = res.config
        this.sysenv = res.sysenv

        if (!this.config.savedir) {
          let ds = this.sysenv.devices
          this.config.savedir = ds
            .sort((a, b) => {
              let sa = Number(a.size) - a.used
              let sb = Number(b.size) - b.used
              return sa - sb
            })
            .pop().mount
        }
      })
      .catch(err => {
        console.error(err)
      })
  },
  data () {
    return {
      helpMessage: '',
      isShow: false,
      isOpenFileChooserDialog: false,
      pathMode: 1,
      ps: {
        1080: '超清',
        720: '高清',
        360: '普通'
      },
      config: {
        savedir: '/download',
        rootdir: '',
        chromeInstallPath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        parallels: 1,
        cpus: 3,
        pixel: 1080,
        isAutoMerge: false
      },
      sysenv: {}
    }
  },
  watch: {
    'config.isAutoMerge' (newValue, oldValue) {
      this.config.isAutoMerge = /^true$/i.test(newValue)
    }
  },
  methods: {
    toggle () {
      if (this.isShow) {
        mediaApi
          .updateConfig(this.config)
          .then(res => {
            this.isShow = false
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        this.isShow = true
      }
    },
    pixelName (p) {
      return this.ps[p]
    },
    toggleFileChooserDialog () {
      this.isOpenFileChooserDialog = !this.isOpenFileChooserDialog
      this.$refs.savedir.blur()
    },
    openSaveDir () {
      let target =
        this.pathMode === 0
          ? this.config.rootdir + this.config.savedir
          : this.config.savedir
      mediaApi
        .openSystemFile(target)
        .then(res => {
          this.helpMessage = res
        })
        .catch(err => {
          console.error(err)
        })
    },
    fileChooserDialogClose (path) {
      if (path) {
        this.config.savedir = path
      }
      this.isOpenFileChooserDialog = false
    }
  },
  computed: {
    changeIcon () {
      return this.isShow ? 'fa-times' : 'fa-cog'
    },
    maxParallel () {
      return Number.parseInt(this.config.cpus * 1.5)
    },
    pixels () {
      return Object.keys(this.ps)
    },
    saveDirRealPath () {
      return this.pathMode === 1
        ? this.config.savedir
        : this.config.rootdir + this.config.savedir
    },
    freespace () {
      let path = this.config.savedir
      return this.sysenv.devices
        .filter(d => path.startsWith(d.mount))
        .map(d => pretty(Number(d.size) - d.used))
        .pop()
    },
    hasChrome () {
      return !!this.config.chromeInstallPath
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
