<template lang="pug">
div
  h3.text-md-center Upcoming holidays on {{ today | moment('DD MMMM YYYY') }}
  p.text-md-center.subtitle This is a list of all upcoming holidays in the next few months.
  ul.list-group(v-if='holidays && holidays.length > 0')
    li.list-group-item(v-for='holiday in holidays')
      .row
        .col-auto.align-self-center
          | {{ [ holiday.date, 'YYYY-MM-DD' ] | moment('DD MMMM YYYY') }}
        .col.pull-right {{ holiday.display_label }}

  p.text-center(v-else) <strong>No upcoming holidays.</strong>
</template>

<script>
import { mapState } from 'vuex'
import store from '../store'
import * as types from '../store/mutation-types'

export default {
  name: 'holidays',

  data: function() {
    return {
      today: moment(),
    }
  },

  created: function() {
    new Promise((resolve, reject) => {
      if (!store.getters.holidays) {
        store.dispatch(types.NINETOFIVER_RELOAD_HOLIDAYS).then(() => resolve())
      } else{
        resolve()
      }
    })
  },

  computed: {
    holidays: function() {
      if (store.getters.holidays) {
        return store.getters.holidays.filter( holiday => {
          if(moment(holiday.date, 'YYYY-MM-DD').isSameOrAfter(moment()))
            return holiday;
        });
      }

      return []
    }
  },
}
</script>
