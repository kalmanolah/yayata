<template lang="pug">
div
  .row
    .col
      | &nbsp;
    .col-6.text-center
      h1 {{ month | monthFilter }} {{ year }}
    .col
      .btn-group.float-right(
        role='group'
        aria-label='Calendar controls'
      )
        button.btn.btn-outline-dark(
          type='button'
          v-on:click.prevent='selectPreviousMonth()'
        )
          i(class='fa fa-angle-double-left')
          |  &nbsp;Previous
        button.btn.btn-outline-dark(
          type='button'
          v-on:click.prevent='selectNextMonth()'
        )
          | Next&nbsp;
          i(class='fa fa-angle-double-right')
  component(v-bind:is='currentView')
</template>
<script>
import Vue from 'vue'
import Month from './Month.vue'
import store from '../store'
import * as types from '../store/mutation-types'

export default {
name: 'calendar',
components: {
  Month,
},
data() {
  return {
    currentView: Month,
    buttonText: 'Leave overview'
  }
},
methods: {
  switchComponent: function () {
    this.currentView = this.currentView == Month ? LeaveOverviewGrid : Month;
    this.buttonText = this.buttonText === 'Calendar' ? 'Leave overview' : 'Calendar'
  },

  //Calls setSelectedMonth with the next month
  selectNextMonth: function () {
    let year = this.year;
    let month = this.month + 1;
    if(month == 13) {
      month = 1;
      year += 1;
    }

    this.$router.push({
      name: 'calendar_month',
      params: {
        month: month,
        year: year
      }
    })
  },

  //Calls setSelectedMonth with the previous month
  selectPreviousMonth: function () {
    let year = this.year;
    let month = this.month - 1;
    if(month == 0) {
      month = 12;
      year -= 1;
    }

    this.$router.push({
      name: 'calendar_month',
      params: {
        month: month,
        year: year
      }
    })
  },
},

computed: {
  month: function() {
    if(this.$route.params.month){
      return parseInt(this.$route.params.month);
    }
  },

  year: function() {
    if(this.$route.params.year){
      return parseInt(this.$route.params.year);
    }
  },
},
filters: {
  monthFilter: function(val) {
    return moment().month(val - 1).format('MMMM');
  }
}
}
</script>
<style>

</style>
