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

      //- Leaverequest form
      div(class='card card-top-blue mb-3')
        div(class='card-header text-center') 🏖️ Request leave
        div(class='card-body')
          LeaveRequestForm
</template>

<script>
import store from '../store';
import * as types from '../store/mutation-types';
import moment from 'moment';
import LeaveRequestForm from './forms/LeaveRequestForm.vue';
import PerformanceWidget from './widgets/PerformanceWidget.vue';
import AbsenceWidget from './widgets/AbsenceWidget.vue';
import BirthdayWidget from './widgets/BirthdayWidget.vue';
import DueTimesheetWarningWidget from './widgets/DueTimesheetWarningWidget.vue';
import TimesheetWidget from './widgets/TimesheetWidget.vue';


export default {
  name: 'dashboard',

  computed: {
    timesheet: () => store.getters.my_current_timesheet
  },

  components: {
    LeaveRequestForm,
    PerformanceWidget,
    AbsenceWidget,
    BirthdayWidget,
    DueTimesheetWarningWidget,
    TimesheetWidget,
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
