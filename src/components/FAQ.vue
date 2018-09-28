<template lang="pug">
div
  h3 Frequently Asked Questions
  p(class='subtitle') Frequently asked questions and answers

  div(role='tablist')
    b-card(
      no-body
      class='mb-1'
    )
      b-card-header(
        header-tag='header'
        class='p-2'
        role='tab'
      )
        b-btn(
          block
          href='#'
          v-b-toggle='"ical-feed"'
          variant='info'
          class='white-space-normal'
        ) How do I access leave or whereabouts as an iCal feed for use in Thunderbird, Google Calendar, Zimbra, etc.?
      b-collapse(
        v-bind:id='"ical-feed"'
        accordion='faq-accordion'
        role='tabpanel'
      )
        b-card-body
          div
            | In most applications, you can add an external calendar from a URL.<br>
            | To generate a feed URL which external applications can access, you will need an API key. You can generate one by visiting <a :href="`${baseUrl}/accounts/api_keys/create/`">this page</a>.<br>
            | Use one of the URLs below (depending on your use case) to access a feed, <strong>making sure to replace "<code>XXXXXXXX</code>" with your API key</strong>.<br>
            | <br>
            | Leave:<br>
            ul
              li Your own leave:
                pre
                  code {{ baseUrl }}/api/v2/feeds/leave/me.ics?api_key=XXXXXXXX
              li All leave:
                pre
                  code {{ baseUrl }}/api/v2/feeds/leave/all.ics?api_key=XXXXXXXX
              li  A specific user's leave (replace <code>USERNAME</code> with their username):
                pre
                  code {{ baseUrl }}/api/v2/feeds/leave/USERNAME.ics?api_key=XXXXXXXX

            | Whereabouts:<br>
            ul
              li Your own whereabouts:
                pre
                  code {{ baseUrl }}/api/v2/feeds/whereabouts/me.ics?api_key=XXXXXXXX
              li All whereabouts:
                pre
                  code {{ baseUrl }}/api/v2/feeds/whereabouts/all.ics?api_key=XXXXXXXX
              li A specific user's whereabouts (replace <code>USERNAME</code> with their username):
                pre
                  code {{ baseUrl }}/api/v2/feeds/whereabouts/USERNAME.ics?api_key=XXXXXXXX

    b-card(
      no-body
      class='mb-1'
    )
      b-card-header(
        header-tag='header'
        class='p-2'
        role='tab'
      )
        b-btn(
          block
          href='#'
          v-b-toggle='"open-source"'
          variant='info'
          class='white-space-normal'
        ) I've heard YAYATA is open source software. Where can I get involved?
      b-collapse(
        v-bind:id='"open-source"'
        accordion='faq-accordion'
        role='tabpanel'
      )
        b-card-body
          div
            | Both YAYATA (the front-end) and 925r (the back-end + API) are released under the GPLv3, and their sources are available on github.<br>
            | The source for YAYATA can be found <a href="https://github.com/kalmanolah/yayata">here</a>, whereas the source for 925r can be found <a href="https://github.com/kalmanolah/925r">here</a>.<br>
            | Pull requests, issues and other contributions are encouraged and welcome.<br>

    b-card(
      no-body
      class='mb-1'
    )
      b-card-header(
        header-tag='header'
        class='p-2'
        role='tab'
      )
        b-btn(
          block
          href='#'
          v-b-toggle='"change-gravatar"'
          variant='info'
          class='white-space-normal'
        ) How do I change the avatar on my profile page?
      b-collapse(
        v-bind:id='"change-gravatar"'
        accordion='faq-accordion'
        role='tabpanel'
      )
        b-card-body
          div
            | The profile picture used for a user of YAYATA is sourced from <a href="https://gravatar.com">Gravatar</a>.<br>
            | Simply <a href="https://en.gravatar.com/connect/">upload an image</a> linked to the email address listed on your profile page (<code>{{ user.email }}</code>) and it will appear automatically.<br>

    b-card(
      no-body
      class='mb-1'
    )
      b-card-header(
        header-tag='header'
        class='p-2'
        role='tab'
      )
        b-btn(
          block
          href='#'
          v-b-toggle='"other-questions"'
          variant='info'
          class='white-space-normal'
        ) I have a question that isn't answered here. What should I do?
      b-collapse(
        v-bind:id='"other-questions"'
        accordion='faq-accordion'
        role='tabpanel'
      )
        b-card-body
          div
            | Consider contacting your friendly neighbourhood YAYATA administrator. Chances are they'll know what to do.<br>
            | Alternately, you can also open a <a href="https://github.com/kalmanolah/yayata/issues/new?labels=question">new issue</a> over at the github repository.<br>
            | Once your question has been answered, you can ask for it to be considered for addition to the FAQ.<br>
</template>

<script>
import store from '../store'
import VueMarkdown from 'vue-markdown'

export default {
  name: 'faq',

  components: {
    VueMarkdown,
  },

  data: function() {
    return {
    }
  },

  computed: {
    baseUrl: () => store.getters.oauth2.config.baseUrl,
    user: () => store.getters.user,
  },

  created: function() {
  }
}
</script>

<style lang='less'>
</style>
