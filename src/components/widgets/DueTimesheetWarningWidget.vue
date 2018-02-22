<template lang="pug">
div(class='alert alert-warning card-top-red mb-3' v-if='showWarning')
  div(class='text-center') 😱 Your timesheet is due soon, but still incomplete! Please ensure it's filled in properly! 😱
</template>

<script>
import moment from 'moment';
import * as types from '../../store/mutation-types';
import store from '../../store';

export default {
  name: 'DueTimesheetWarningWidget',

  data () {
    return {
      selectedDay: null,
      birthdays: [],
    }
  },

  created: function() {
    this.selectedDay = moment()

    new Promise((resolve, reject) => {
      if (!store.getters.my_current_timesheet) {
        store.dispatch(types.NINETOFIVER_RELOAD_MY_CURRENT_TIMESHEET).then(() => resolve())
      } else{
        resolve()
      }
    })

    new Promise((resolve, reject) => {
      if (!store.getters.my_current_month_info) {
        store.dispatch(types.NINETOFIVER_RELOAD_MY_CURRENT_MONTH_INFO).then(() => resolve())
      } else{
        resolve()
      }
    })
  },

  computed: {
    showWarning: function() {
      // Show warning if:
      // * timesheet is not yet submitted
      // * it is after the 25th
      // * timesheet is more than 25% empty
      if (store.getters.my_current_timesheet && store.getters.my_current_month_info) {
        let allowed_remaining_hours_pct = 25;
        let required_day = 25
        let today = moment();

        let remaining_hours_pct = (store.getters.my_current_month_info.remaining_hours / store.getters.my_current_month_info.work_hours) * 100

        return (today.date() >=required_day) && (remaining_hours_pct > allowed_remaining_hours_pct) && (store.getters.my_current_timesheet.status == 'active')
      }

      return false
    }
  }
}
</script>

<style lang="less" scoped>
.chevron {
  color: #0aa6c9;

  &:hover {
    cursor: pointer;
  }
}
</style>
