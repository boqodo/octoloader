<template>
  <li class="vue-tree-item">
    <div class="item-wrapper" onselectstart="return false;">
      <div class="item-label-container" :class="isSelected">
        <span
          v-if="isFolder"
          class="item-toggle"
          @click="toggle"
        >
          <i :class="[toggleIcon]"></i>
        </span>
        <span
          v-else
          class="item-toggle"
        />
        <span
          v-if="options.checkbox"
          class="item-checkbox"
          :class="[labelIcon, labelStatus]"
          @click="toggleChecked"
        />
        <div :class="itemIcon"></div>
        <span
          class="item-label"
          :class="[isBold]"
          @click="handle">
          {{ model[options.label] }}
        </span>
      </div>
    </div>
    <ul v-if="isFolder" v-show="open" class="vue-tree-list">
      <tree-item
        v-for="(item, idx) in model.children"
        :model="item"
        :options="options"
        :ids="ids"
        :depth="depth + 1"
        :ids-with-parent="idsWithParent"
        :half="half"
        :state="itemState"
        :key="idx"
        @handle="emitHandle"
        @child-change="childChange"
      />
    </ul>
  </li>
</template>
<script>
export default {
  name: 'tree-item',

  props: {
    model: {
      type: Object,
      default: function () {
        return {}
      }
    },

    options: {
      type: Object,
      default: function () {
        return {}
      }
    },

    depth: {
      type: Number,
      default: 0
    },

    ids: {
      type: Array,
      default: function () {
        return []
      }
    },

    idsWithParent: {
      type: Array,
      default: function () {
        return []
      }
    },

    half: {
      type: Array,
      default: function () {
        return []
      }
    },

    state: {
      type: Number,
      default: 0
    }
  },

  data () {
    return {
      open: false,
      itemState: 0
    }
  },

  computed: {
    toggleIcon () {
      if (this.open === null) {
        return this.options.loadIcon
      } else if (this.open === undefined) {
        return ''
      } else {
        return this.open ? this.options.closeIcon : this.options.openIcon
      }
    },
    itemIcon () {
      return 'item-icon-' + this.model.icon
    },

    labelIcon () {
      if (this.half.indexOf(this.model.id) !== -1) {
        return this.options.halfCheckedIcon
      } else if (this.idsWithParent.indexOf(this.model.id) !== -1) {
        return this.options.checkedIcon
      } else {
        return this.options.uncheckedIcon
      }
    },

    labelStatus () {
      if (this.half.indexOf(this.model.id) !== -1) {
        return 'half-checked'
      } else if (this.idsWithParent.indexOf(this.model.id) !== -1) {
        return 'checked'
      } else {
        return 'unchecked'
      }
    },

    isFolder () {
      return this.model.children
    },

    isBold () {
      return {
        'item-bold': this.isFolder && this.options.folderBold
      }
    },
    isSelected () {
      return this.model.isSelected ? 'item-label-container-selected' : ''
    },

    self () {
      // let self = Object.assign({}, this.model, {children: []})
      // delete self.children
      // return self
      return this.model
    }
  },

  created () {
    if (this.isFolder && this.depth < this.options.depthOpen) {
      this.open = true
    }
    if (this.options.checkbox) {
      if (this.idsWithParent.indexOf(this.model.id) !== -1) {
        this.itemState = this.itemState + 1
        if (this.isFolder && !this.options.idsWithParent) {
          let index = this.ids.indexOf(this.model.id)
          if (index !== -1) {
            this.$delete(this.ids, index)
          }
        }
        this.$emit('child-change', true)
      }
      if (this.state > 0) {
        this.addChecked()
        this.itemState = this.itemState + 1
      }
    }
  },

  watch: {
    state (val, old) {
      if (val > old) {
        this.addChecked()
        this.itemState = this.itemState + 1
      } else {
        this.delChecked()
        this.deleteHalfChecked(this.model.id)
        this.itemState = this.itemState - 1
      }
    }
  },

  methods: {
    toggle () {
      if (this.isFolder) {
        if (this.open) {
          this.open = false
        } else {
          let dir = this.model.path
          if (!dir) {
            this.open = true
            return
          }
          this.open = null
          this.$http.get(`filesystem/file?dir=${dir || ''}&isOnlyDir=true`).then(resp => {
            if (resp.data && resp.data.length) {
              this.model.children = resp.data
              this.open = true
            } else {
              this.model.children = undefined
              this.open = undefined
            }
          }).catch(err => {
            console.err(err)
          })
        }
      }
    },

    handle () {
      this.emitHandle(this.self)
    },

    emitHandle (item) {
      this.$emit('handle', item)
    },

    toggleChecked () {
      if (this.isFolder) {
        this.deleteHalfChecked()
      }
      if (this.idsWithParent.indexOf(this.model.id) !== -1) {
        this.delChecked()
        this.$emit('child-change', false)
        this.itemState = this.itemState - 1
      } else {
        this.addChecked()
        this.$emit('child-change', true)
        if (this.options.checkedOpen && this.isFolder) {
          this.open = true
        }
        this.itemState = this.itemState + 1
      }
    },

    addChecked () {
      if (this.idsWithParent.indexOf(this.model.id) === -1) {
        this.$set(this.idsWithParent, this.idsWithParent.length, this.model.id)
      }
      if (!this.isFolder || this.options.idsWithParent) {
        if (this.ids.indexOf(this.model.id) === -1) {
          this.$set(this.ids, this.ids.length, this.model.id)
        }
      }
    },

    delChecked () {
      let idx = this.idsWithParent.indexOf(this.model.id)
      let index = this.ids.indexOf(this.model.id)
      if (idx !== -1) {
        this.$delete(this.idsWithParent, idx)
      }
      if (index !== -1) {
        this.$delete(this.ids, index)
      }
    },

    setHalfChecked () {
      if (this.half.indexOf(this.model.id) === -1) {
        this.$set(this.half, this.half.length, this.model.id)
      }
    },

    deleteHalfChecked () {
      let idx = this.half.indexOf(this.model.id)
      if (idx !== -1) {
        this.$delete(this.half, idx)
      }
    },

    childChange (checked) {
      if (this.model.children.some((val) => this.half.indexOf(val.id) !== -1)) {
        this.addChecked()
        this.setHalfChecked()
        this.$emit('child-change', true)
        return
      }
      if (checked) {
        this.addChecked()
        if (this.model.children.some((val) => this.idsWithParent.indexOf(val.id) === -1)) {
          this.setHalfChecked()
        } else {
          this.deleteHalfChecked()
        }
        this.$emit('child-change', true)
      } else {
        if (this.model.children.some((val) => this.idsWithParent.indexOf(val.id) !== -1)) {
          this.setHalfChecked()
        } else {
          this.deleteHalfChecked()
          this.delChecked()
        }
        this.$emit('child-change', false)
      }
    }
  }
}
</script>
