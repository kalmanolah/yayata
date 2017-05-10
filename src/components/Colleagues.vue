<template lang="pug">
div
  h3 My colleagues
  p.subtitle Overview of all my colleagues
</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'

var data = {}

export default {
  name: 'colleagues',

  components: {},

  data () {
    return data;
  },

  created: () => {}

}
</script>

<style>
</style>