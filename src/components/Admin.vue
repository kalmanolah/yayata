<template lang="pug">
div
  .btn-group(role='group')
    button.btn.btn-secondary(@click='currentView="LeaveOverviewGrid"') Leave Overview Grid
    button.btn.btn-secondary(@click='currentView="Calendar"') Calendar 
  .btn-group.pull-right(role='group' v-if='currentView === "Calendar"')
    b-form-select(v-model='selected', :options='options')
    button(
        class='btn btn-secondary'
        type='button'
        v-on:click.prevent='selectPreviousMonth()'
      )
        i(class='fa fa-angle-double-left')
        |  &nbsp;Previous
    button(
        class='btn btn-secondary'
        type='button'
        v-on:click.prevent='selectNextMonth()'
      )
        | Next&nbsp;
        i(class='fa fa-angle-double-right')
  component(v-bind:is='currentView', :user-id='selectedUser', :selected-month-prop='selectedMonth')

</template>
<script>
import Vue from 'vue'
import LeaveOverviewGrid from './LeaveOverviewGrid.vue'
import Calendar from './Calendar.vue'
import moment from 'moment'
import store from '../store';
import * as types from '../store/mutation-types.js'

export default {
name: 'admin',
components: {
    LeaveOverviewGrid,
    Calendar
},
data() {
  return {
    currentView: 'LeaveOverviewGrid',
    selected: 1,
    month: moment().startOf('month').format('YYYY-MM-DD')
  }
},


computed: {
  selectedUser: function() {
    if(this.currentView === 'Calendar') {
      return this.selected;
    }
  },

  options: function() {
    if(store.getters.users){
      var optionsT = [];
      store.getters.users.forEach(u => optionsT.push({text: u.display_label, value: u.id}))
      return optionsT
    }
  },

  selectedMonth: function() {
    if(this.currentView === 'Calendar'){
      return store.getters.calendar_selected_month;
    } 
  }
},

methods: {
  selectNextMonth: function () {
    var date = moment(this.selectedMonth).add(1, 'month')
    var options = {
      params: {
        date: date
      }
    };
    store.dispatch(types.NINETOFIVER_RELOAD_CALENDAR_SELECTED_MONTH, options);
  },

  selectPreviousMonth: function () {
    var date = moment(this.selectedMonth).subtract(1, 'month')
    var options = {
      params: {
        date: date 
      }
    };
    store.dispatch(types.NINETOFIVER_RELOAD_CALENDAR_SELECTED_MONTH, options);
  },
}
}
</script>
<style>

</style>