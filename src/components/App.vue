<template lang="pug">
div(class='container-fluid')
  div(class='my-1')
  router-view
</template>

<script>
import * as types from '../store/mutation-types'

export default {
  name: 'app',
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

<style scoped>
</style>
