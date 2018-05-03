<template lang="pug">
div(class='row')
  div(class='col')
    h3 My timesheets
    p(class='subtitle') Overview of all open timesheets
    div(class='row')
      div(v-for="timesheet in timesheets" class="col-xl-6")
        TimesheetWidget(:timesheet='timesheet' v-on:submit='reloadTimesheets')

    div(v-if='recentlyClosedTimesheets')
      p(class='subtitle') Recently closed timesheets
      div(class='row')
        div(v-for="timesheet in recentlyClosedTimesheets" class="col-xl-6")
          TimesheetWidget(:timesheet='timesheet')
</template>

<script>
import store from '../store';
import * as types from '../store/mutation-types';
import TimesheetWidget from './widgets/TimesheetWidget.vue';

export default {
  name: 'timesheets',

  mixins: [
  ],

  components: {
    TimesheetWidget,
  },

  created: function() {
    new Promise((resolve, reject) => {
      if (!store.getters.my_open_timesheets) {
        store.dispatch(types.NINETOFIVER_RELOAD_MY_OPEN_TIMESHEETS).then(() => resolve())
      } else{
        resolve()
      }
    })

    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_timesheets/',
      params: {
        status: 'closed',
        page_size: 2,
        order_by: '-year,-month',
      },
      full: false
    }).then(res => {
      this.recentlyClosedTimesheets = res.data.results.reverse()
    })
  },

  data: function() {
    return {
      recentlyClosedTimesheets: null,
    }
  },

  computed: {
    timesheets: () => store.getters.my_open_timesheets,
  },

  methods: {
    reloadTimesheets: () => {
      store.dispatch(types.NINETOFIVER_RELOAD_MY_OPEN_TIMESHEETS)
    },
  }
}
</script>

<style>
</style>
