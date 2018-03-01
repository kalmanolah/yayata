<template lang="pug">
div
  div(class='row')
    div(class='col')
      DueTimesheetWarningWidget

  div(class='row')
    div(class='col-xl-6')
      PerformanceWidget
      TimesheetWidget(v-if='timesheet' :timesheet='timesheet' v-on:submit='reloadCurrentTimesheet')

    div(class='col-xl-6')
      AbsenceWidget
      BirthdayWidget
      LeaveWidget
</template>

<script>
import store from '../store';
import * as types from '../store/mutation-types';
import moment from 'moment';
import PerformanceWidget from './widgets/PerformanceWidget.vue';
import AbsenceWidget from './widgets/AbsenceWidget.vue';
import BirthdayWidget from './widgets/BirthdayWidget.vue';
import DueTimesheetWarningWidget from './widgets/DueTimesheetWarningWidget.vue';
import TimesheetWidget from './widgets/TimesheetWidget.vue';
import LeaveWidget from './widgets/LeaveWidget.vue';


export default {
  name: 'dashboard',

  computed: {
    timesheet: () => store.getters.my_current_timesheet
  },

  components: {
    PerformanceWidget,
    AbsenceWidget,
    BirthdayWidget,
    DueTimesheetWarningWidget,
    TimesheetWidget,
    LeaveWidget,
  },

  methods: {
    reloadCurrentTimesheet: () => {
      store.dispatch(types.NINETOFIVER_RELOAD_MY_CURRENT_TIMESHEET)
    }
  }
}
</script>

<style lang='less'>
</style>
