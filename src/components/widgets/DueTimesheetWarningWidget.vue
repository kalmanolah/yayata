<template lang="pug">
div(class='alert alert-warning card-top-red mb-3' v-if='showWarning')
  div(class='text-center') 😱 Your timesheet is due soon! Please ensure it's filled in properly! 😱
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
  },

  computed: {
    showWarning: function() {
      // Show warning if:
      // * timesheet is not yet submitted
      // * it is after the 25th
      if (store.getters.my_current_timesheet) {
        let required_day = 25
        let today = moment();

        return (today.date() >=required_day) && (store.getters.my_current_timesheet.status == 'active')
      }

      return false
    }
  }
}
</script>

<style lang="less" scoped>
</style>
