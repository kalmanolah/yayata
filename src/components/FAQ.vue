<template lang="pug">
div
  h3 Frequently Asked Questions
  p(class='subtitle') Frequently asked questions and answers

  div(role='tablist')
    b-card(
      no-body
      class='mb-1'
      v-for='item in items'
    )
      b-card-header(
        header-tag='header'
        class='p-2'
        role='tab'
      )
        b-btn(
          block
          href='#'
          v-b-toggle='item.id'
          variant='info'
          class='white-space-normal'
        )
          | {{ item.title }}
      b-collapse(
        v-bind:id='item.id'
        :visible='item.visible'
        accordion='faq-accordion'
        role='tabpanel'
      )
        b-card-body
          vue-markdown(class='rendered-markdown' :source='item.description')
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
      items: [],
    }
  },

  computed: {
    baseUrl: () => store.getters.oauth2.config.baseUrl
  },

  created: function() {
    this.items = [
      {
        title: 'How do I access my leave as an iCal feed for use in Thunderbird, Google Calendar, Zimbra, etc.?',
        id: 'ical-feed',
        description: `
In most applications, you can add an external calendar from a URL.
To generate a feed URL which external applications can access, you will need an API key. You can generate one by visiting [this page](${this.baseUrl}/accounts/api_keys/create/).
Use the following URL to access your personal leave feed, **making sure to replace "\`XXXXXXXX\`" with your API key**:
\`\`\`
${this.baseUrl}/api/v1/services/feeds/leave/me.ics?api_key=XXXXXXXX
\`\`\`
        `,
      },
      {
        id: 'open-source',
        title: 'I\'ve heard YAYATA is open source software. Where can I get involved?',
        description: `
Both YAYATA (the front-end) and 925r (the back-end + API) are released under the GPLv3, and their sources are available on github.
The source for YAYATA can be found [here](https://github.com/kalmanolah/yayata), whereas the source for 925r can be found [here](https://github.com/kalmanolah/925r).
Pull requests, issues and other contributions are encouraged and welcome.
        `
      },
      {
        id: 'other-questions',
        title: 'I have a question that isn\'t answered here. What should I do?',
        description: `
Consider contacting your friendly neighbourhood YAYATA administrator. Chances are they'll know what to do.
Alternately, you can also open a [new issue](https://github.com/kalmanolah/yayata/issues/new?labels=question) over at the github repository.
Once your question has been answered, you can ask for it to be considered for addition to the FAQ.
        `
      }
    ]
  }
}
</script>

<style lang='less'>
</style>
