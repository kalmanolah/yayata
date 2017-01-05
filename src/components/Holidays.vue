<template lang="pug">
div
  h3 Upcoming holidays on {{ today | moment('DD MMMM YYYY') }}
  p.subtitle This is a list of all upcoming holidays in the next few months.
  ul.list-group
    li.list-group-item(v-for='holiday in holidays')
      | {{ [ holiday.date, 'YYYY-MM-DD' ] | moment('DD MMMM YYYY') }} | {{ holiday.display_label }}
</template>

<script>
import { mapState } from 'vuex'
import store from '../store'
import * as types from '../store/mutation-types'

var data = {
    holidays: [],
    today: new Date(),
}

export default {
  name: 'holidays',

  data () {
    return data;
  },

  created: () => {
    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/holidays/',
      params: {
      },
    }).then((response) => {
      data.holidays = response.data.results
    }, () => {
      this.loading = false
    })
  },
}
</script>
