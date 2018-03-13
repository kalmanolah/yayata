<template lang="pug">
div(class='row')
  div(class='col')
    h3 My timesheets
    p(class='subtitle') Overview of all open timesheets
    div(class='row')
      div(v-for="(timesheet) in timesheets" class="col-xl-6")
        TimesheetWidget(:timesheet='timesheet' v-on:submit='reloadTimesheets')
</template>

<script>
import * as FileSaver from 'file-saver';
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
  },

  computed: {
    timesheets: () => store.getters.my_open_timesheets,
  },

  methods: {
    reloadTimesheets: () => {
      store.dispatch(types.NINETOFIVER_RELOAD_MY_OPEN_TIMESHEETS)
    }
  }
}
</script>

<style>
</style>
