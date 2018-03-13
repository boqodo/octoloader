<template>
  <div class="modal" :class="isActive">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">选择文件夹</p>
        <button class="delete" aria-label="close" @click="close"></button>
      </header>
      <section class="modal-card-body">
        <vue-tree
        v-model="ids"
        :tree-data="treeData"
        :options="options"
        @handle="handle"/>
      </section>
      <footer class="modal-card-foot">
        <div class="dialog-opts">
          <button class="button is-primary">新建文件夹</button>
        </div>
        <div class="dialog-opts">
          <button class="button is-success is-right">确定</button>
          <button class="button is-danger is-right" @click="close">取消</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import VueTree from './VueTree'
import mediaApi from '../api/MediaApi'

export default {

  components: { VueTree },
  created () {
    mediaApi.findSystemFile().then(res => {
      this.treeData = res
    }).catch(err => {
      console.error(err)
    })
  },
  data () {
    return {
      ids: [],
      curSelectedItem: undefined,
      options: {
        label: 'label',
        checkbox: false,
        checkedOpen: false,
        folderBold: false,
        idsWithParent: false,
        depthOpen: 1,
        openIcon: 'fa fa-angle-right',
        closeIcon: 'fa fa-angle-down',
        loadIcon: 'fa fa-spinner',
        halfCheckedIcon: 'fa fa-minus-square-o fa-fw text-primary',
        checkedIcon: 'fa fa-check-square-o fa-fw text-danger',
        uncheckedIcon: 'fa fa-square-o fa-fw'
      },
      treeData: []
    }
  },
  props: {
    isOpenFileChooserDialog: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    handle (item) {
      if (this.curSelectedItem) {
        this.curSelectedItem.isSelected = false
      }
      this.curSelectedItem = item
      this.curSelectedItem.isSelected = true
    }
  },
  computed: {
    isActive () {
      return this.isOpenFileChooserDialog ? 'is-active' : ''
    }
  }
}
</script>

<style lang='scss' scoped>
.modal {
  z-index: 99999;
}

.dialog-opts {
  &:first-of-type {
    flex: 1;
  }
}
</style>
