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
    month: moment().format('YYYY-MM-DD'),
  }
},


computed: {
  selectedUser: function() {
    if(this.currentView === 'Calendar') {
      return this.selected;
    }
  },

  selectedMonth: function() {
    if(this.currentView === 'Calendar') {
      return this.month
    }
  },

  options: function() {
    if(store.getters.users){
      var optionsT = [];
      store.getters.users.forEach(u => optionsT.push({text: u.display_label, value: u.id}))
      return optionsT
    }
  }
},

methods: {
  selectNextMonth: function() {
    this.month = moment(this.month).add(1, 'months');
  },

  selectPreviousMonth: function() {
    this.month = moment(this.month).subtract(1, 'months');
  }
 }
}
</script>
<style>

</style>