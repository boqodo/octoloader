<template>
  <div>
    <div class="field has-addons">
    <div class="control is-expanded">
      <input class="input is-large" type="text"
      :placeholder="ph"
      :disabled="isStart"
      :class="statusType"
      v-model="keyword">
    </div>
    <div class="control">
      <a class="button is-large" :class="isLoading" @click="query">
        <span class="icon">
          <i class="fa fa-search" aria-hidden="true"></i>
        </span>
      </a>
    </div>
  </div>
    <p class="help" :class="statusType">{{statusMessage}}</p>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: ['ph', 'isStartSearch', 'status'],
  created () {

  },
  data () {
    return {
      keyword: void 0
    }
  },
  methods: {
    query () {
      if (this.keyword) {
        this.$emit('queryEvent', this.keyword)
      }
    }
  },
  computed: {
    isLoading () {
      return this.isStartSearch ? 'is-loading' : ''
    },
    isStart () {
      return this.isStartSearch
    },
    statusType () {
      let type = this.status.type || 0
      return {'0': '', '1': 'is-success', '-1': 'is-danger'}[type]
    },
    statusMessage () {
      return this.status.message || ''
    }
  }
}
</script>

<style scoped>
.button {
  width: 8rem;
}
</style>
