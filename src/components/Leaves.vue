<template lang="pug">
div(class='calendar')
  div.row
    div.col-md-6
      h3 My Leaves
      p Here, have an overview of all your leaves. Whatever
        div
          #accordion(role='tablist', aria-multiselectable='true')
            .card(v-for='(leave, i) in leaves').card-top-blue
              div.card-header(role='tab', v-bind:id='"heading-" + i', data-toggle='collapse', data-parent='#accordion', aria-expanded='false', 'v-bind:aria-controls='"collapse-" + i', 'v-bind:href='"#collapse-" + i')
                div.row
                  div.col-md-10
                    a
                      | {{ leave.description }}
                  div.col-md-2
                    span.tag.tag-primary.float-md-right {{ leave.status }}
              div.collapse(role='tabpanel', v-bind:id='"collapse-" + i', v-bind:aria-labelledby='"heading-" + i')
                div.card-block
                  div
                    ul.list-group
                      li.list-group-item(v-for='leave_date in leave.leavedate_set')
                        | <strong>From:</strong> {{ leave_date.starts_at | moment('DD MMM YYYY hh:mm') }}<br>
                        | <strong>To:</strong> {{ leave_date.ends_at | moment('DD MMM YYYY hh:mm') }}
    div.col-md-6
      cmpHolidays
</template>
<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'
import store from '../store'
import Holidays from './Holidays.vue'

var data = {
  leaves: [],
}

export default {
  name: 'my_leaves',

  data () {
    return data;
  },

  components: {
    cmpHolidays: Holidays,
  },

  created: () => {
    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_leaves/',
      params: {
      },
    }).then((response) => {
      data.leaves = response.data.results
    }, () => {
      this.loading = false
    })
  },
}
</script>

<style lang="less" scoped>

</style>
