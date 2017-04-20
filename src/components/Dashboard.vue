<template lang="pug">

div
  .row
    .col-md-10.offset-md-1
      .alert.alert-warning.card-top-red(v-if='open_timesheet_count > 0')
        | You have {{ open_timesheet_count }} due timesheet(s) still open. Please fix that ASAP or Johan will haunt your dreams.
  .row
    .col-md-10.offset-md-1
      .card
        h4.card-title.text-md-center Timesheets for 
          router-link(:to='{ name: "calendar_month_redirect" }')
            | {{ today | moment('MMMM YYYY') }}
        table.table
          tbody
            tr(v-for="(c, index) in contracts" v-bind:key="c.id")              
              td {{ c.customerName }}: {{ c.name }}
              td.text-md-right {{ c.monthly_duration }} hours ({{c.monthly_duration | hoursToDaysFilter }} days)
            tr
              td <strong>Total</strong>
              td.text-md-right <strong>{{ totalHoursPerformed | roundHoursFilter }} hours ({{ totalHoursPerformed | hoursToDaysFilter }} days)</strong>
            tr
              td <strong>Hours left to fill in</strong>
              td.text-md-right <strong>{{ getHoursToFill() }} hours ({{ getHoursToFill() | hoursToDaysFilter }} days)</strong>
  .row
    .col-md-10.offset-md-1
      LeaveForm

</template>

<script>
import { mapState } from 'vuex';
import LeaveForm from './forms/LeaveForm.vue';
import * as types from '../store/mutation-types'
import store from '../store';
import moment from 'moment';


export default {
  name: 'dashboard',

  components: {
    LeaveForm: LeaveForm,
  },

  data () {
    return {
      today: moment(),
      days: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      }
    }
  },

  created: function () {

    //Make days-object containing amount of -days in current month
    var dayOfMonth = moment().startOf('month');
    var endOfMonth = moment().endOf('month');

    while(dayOfMonth <= endOfMonth) {
      var weekday = dayOfMonth.format('dddd').toLowerCase();
      this.days[weekday]++;
      dayOfMonth.add(1, 'days');
    }
    
    //Reload to get most recent data
    store.dispatch(types.NINETOFIVER_RELOAD_MONTHLY_ACTIVITY_PERFORMANCES);


  },

  computed: {

    workschedule: function() {
      if(store.getters.work_schedule)
        return store.getters.work_schedule;
    },
    
    //Calculates amount of hours that should be worked according to the workschedule
    totalHoursRequired: function() {
      var total = 0;

      //Loop over each entry in the schedule array
      //Check for each property in the entry if it appears in the days var
      //Multiply total hours with times that day appears in this month
      if(this.workschedule) {
        this.workschedule.forEach(wschedule => {
          for(var ws in wschedule)
            if(this.days[ws])
              total += parseFloat(wschedule[ws]) * this.days[ws];
        });
      }


      return total;
    },

    //Calculates total hours of currently active projects
    totalHoursPerformed: function() {
      var total = 0;

      if(this.contracts)  
        this.contracts.forEach(x => { 
          total += x.monthly_duration
        });

      return total;
    },

    open_timesheet_count: function() {
      if(store.getters.open_timesheet_count)
        return store.getters.open_timesheet_count;
    },

    monthlyActivityPerformances: function() {      
      if(store.getters.monthly_activity_performances) 
        return store.getters.monthly_activity_performances;
    },

    contracts: function() {
      if(store.getters.contracts && store.getters.monthly_activity_performances) {
        var active_contrs = store.getters.contracts.filter(x => x.active === true);

        //For each entry, calculate the total performances duration
        active_contrs.forEach(c => {
          var total = 0;

          this.monthlyActivityPerformances.forEach(x => {
            if(x.contract === c.id)
              total += parseFloat(x.duration);
          });

          c.monthly_duration = total;
        });

        return active_contrs;
      }
    },

  },

  filters: {

    //Calculates amount of days in hours
    //Divides by 8 & sets precision to 1 decimal
    hoursToDaysFilter: function(val) {
      return Math.round(val / 8 * 2) / 2;
    },

    roundHoursFilter: function(val) {
      return Math.round(val * 2) / 2;
    },

  },

  methods: {

    //Subtracts hours worked from hours supposed to work. Returns 0 if negative result
    getHoursToFill() {
      var remaining = this.totalHoursRequired - this.totalHoursPerformed;
      return remaining > 0 ? remaining : 0;
    }

  },

  watch: { }

}
</script>

<style>
</style>