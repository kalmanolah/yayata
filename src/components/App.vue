<template lang="pug">
div(
  id='app'
  class='container-fluid'
)
  navbar
  div(class='my-1')
  router-view
</template>

<script>
import * as types from '../store/mutation-types'
import Navbar from './Navbar.vue'

export default {
  name: 'app',
  components: {
    navbar: Navbar
  },
  computed: {
    foo () {
      return 'bar'
    }
  },
  data () {
    return {
    }
  }
}
</script>

<style lang="less" scoped>
#app {
  padding-top: 3.5rem;
}
</style>
