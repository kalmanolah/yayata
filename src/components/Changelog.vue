<template lang="pug">
div
  h3 Changelog
  p(class='subtitle') The most recent changes made to YAYATA

  div(v-if='changelogHtml')
    b-card
      div(v-html='changelogHtml') {{ changelogHtml }}
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
      changelogHtml: null
    }
  },

  computed: {
  },

  created: function() {
    Vue.http({
      method: 'GET',
      url: `https://api.github.com/repos/kalmanolah/yayata/contents/CHANGELOG.md?t=${(new Date().getTime())}`,
      headers: {
        Accept: 'application/vnd.github.v3.html+json',
      },
    }).then((res) => {
      this.changelogHtml = res.body
    })
  }
}
</script>

<style lang='less'>
</style>
