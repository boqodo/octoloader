<template>
  <ul class="vue-tree-list">
    <tree-item v-for="(item, idx) in treeData"
    :ids="ids"
    :ids-with-parent="idsWithParent"
    :model="item"
    :options="termOptions"
    :depth="0"
    :state="state"
    :key="idx"
    @handle="handle" />
  </ul>
</template>

<script>
import Item from './Item.vue'

export default {
  components: { 'tree-item': Item },

  model: {
    prop: 'ids',
    event: 'change'
  },

  props: {
    treeData: {
      type: Array,
      default: function () {
        return []
      }
    },
    options: {
      type: Object,
      default: function () {
        return {}
      }
    },
    ids: {
      type: Array,
      default: function () {
        return []
      }
    }
  },

  data () {
    return {
      defaultOptions: {
        label: 'label',
        checkbox: true,
        checkedOpen: true,
        folderBold: true,
        idsWithParent: true,
        depthOpen: 0,
        openIcon: 'fa fa-angle-right',
        closeIcon: 'fa fa-angle-down',
        loadIcon: 'fa fa-spinner',
        halfCheckedIcon: 'fa fa-minus-square-o fa-fw',
        checkedIcon: 'fa fa-check-square-o fa-fw',
        uncheckedIcon: 'fa fa-square-o fa-fw'
      },
      termOptions: {},
      idsWithParent: [],
      state: 0
    }
  },

  created () {
    this.initOptions()
    this.idsWithParent = this.ids.slice(0)
  },

  watch: {
    options: {
      handler: function (val) {
        this.initOptions()
      },
      deep: true
    }
  },

  methods: {
    handle (item) {
      this.$emit('handle', item)
    },
    initOptions () {
      this.termOptions = Object.assign({}, this.defaultOptions, this.options)
      this.idsWithParent = this.ids.slice(0)
    }
  }
}
</script>
<style lang='scss'>
@each $member in "Desktop",
  "Computer",
  "Pictures",
  "Videos",
  "Documents",
  "Music",
  "Library",
  "Downloads",
  "Device",'Dirtory' {
  .item-icon-#{$member} {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-image: url("../assets/#{$member}.ico");
    margin-right: 0.25rem;
  }
}

.vue-tree-list {
  list-style-type: none;
  padding-left: 20px;
}
.vue-tree-list .item-wrapper {
  padding: 5px 0;
  height: 100%;
  line-height: 100%;
}
.vue-tree-list .item-bold {
  font-weight: bold;
}
.vue-tree-list .item-toggle,
.vue-tree-list .item-checkbox,
.vue-tree-list .item-label {
  cursor: pointer;
}
.vue-tree-list .item-toggle {
  display: inline-block;
  width: 20px;
  text-align: center;
  overflow: hidden;
}
.item-label-container:hover {
  background-color: #acd5fc;
  border: 1px solid #359cfd; //解决抖动问题，原先用白色占位
}
.item-label-container-selected{
    background-color: #acd5fc;
}
.item-label-container{
  display: inline-flex;
  border: 1px solid white;
}
</style>
