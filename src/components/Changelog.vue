<template lang="pug">
div
  div(v-if='changelogContent')
    b-card
      vue-markdown(class='rendered-markdown' :source='changelogContent')
</template>

<script>
import store from '../store'
import Vue from 'vue'
import VueMarkdown from 'vue-markdown'

export default {
  name: 'changelog',

  components: {
    VueMarkdown,
  },

  data: function() {
    return {
      changelogContent: null
    }
  },

  computed: {
  },

  created: function() {
    Vue.http({
      method: 'GET',
      url: `https://api.github.com/repos/kalmanolah/yayata/contents/CHANGELOG.md?t=${(new Date().getTime())}`,
      headers: {
        Accept: 'application/vnd.github.v3.full+json',
      },
    }).then((res) => {
      this.changelogContent = atob(res.data.content)
    })
  }
}
</script>

<style lang='less'>
</style>
