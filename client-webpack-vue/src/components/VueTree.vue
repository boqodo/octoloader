<template>
  <ul class="vue-tree-list">
    <tree-item
      v-for="(item, idx) in treeData"
      :ids="ids"
      :ids-with-parent="idsWithParent"
      :model="item"
      :options="termOptions"
      :depth="0"
      :state="state"
      :key="idx"
      @handle="handle"
    />
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
<style>
.vue-tree-list {
    list-style-type: none;
    padding-left: 20px
}
.vue-tree-list .item-wrapper {
    padding: 5px 0;
    height: 100%;
    line-height: 100%;
}
.vue-tree-list .item-bold {
   font-weight: bold
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
    overflow: hidden
}
</style>
