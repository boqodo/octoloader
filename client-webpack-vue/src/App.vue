<template>
  <router-view/>
</template>

<script>

export default {
  name: 'App',
  components: {

  }
}
</script>

<style lang="scss">
@import "~bulma";
$fa-font-path: "~font-awesome/fonts/";
@import "~font-awesome/scss/font-awesome";

.app-container {
  background: #4776e6;
  background: -webkit-linear-gradient(left, #8e54e9, #4776e6);
  background: -moz-linear-gradient(left, #8e54e9, #4776e6);
  background: -o-linear-gradient(left, #8e54e9, #4776e6);
  background: linear-gradient(90deg, #8e54e9, #4776e6);
  padding: 0 5rem 0rem 5rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}
.app-header {
  padding: 1rem 1rem 2rem 1rem;
}
.app-content {
  flex: 1;
}
.app-footer {
  padding: 1rem 1rem 1rem 1rem;
  margin-bottom: 1rem;
  .columns {
    border: 1px solid white;
  }
}

</style>
