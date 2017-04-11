<template lang="pug">

div
  .row
    .col-md-10.offset-md-1
      .alert.alert-warning.card-top-red(v-if='open_timesheet_count > 0')
        | You have {{ open_timesheet_count }} due timesheet(s) still open. Please fix that ASAP or Johan will haunt your dreams.
  .row
    .col-md-5.offset-md-1
      .card
        h4.card-title.text-md-center Timesheets for 
          router-link(:to='{ name: "calendar_month_redirect" }')
            | {{ today | moment('MMMM YYYY') }}
        table.table
          tbody
            tr(v-for="(p, index) in contracts" v-bind:key="p.id")              
              td {{ p.customerName }}: {{ p.name }}
              td.text-md-right {{ p.total_duration }} hours ({{p.total_duration | hoursToDaysFilter }} days)
            tr
              td <strong>Total</strong>
              td.text-md-right <strong>{{ totalContractDuration | roundHoursFilter }} hours ({{totalContractDuration | hoursToDaysFilter}} days)</strong>
            tr
              td <strong>Hours left to fill in</strong>
              td.text-md-right <strong>36 hours (4,5 days)</strong>
    .col-md-5
      .card
        h4.card-title.text-md-center Absent collegues
        div.text-md-center
          i.fa.fa-chevron-left(@click='dayEarlier')
          | {{ selectedDay | moment('DD-MM') }}
          i.fa.fa-chevron-right(@click='dayLater') 
        .cardblock
          table.table
            tbody
              tr(v-for="(leave, index) in leavesSelectedDay" v-bind:key="leave.id")
                td {{ leave.display_label }}
        
  .row
    .col-md-10.offset-md-1
      LeaveForm

</template>

<script>
import { mapState } from 'vuex';
import LeaveForm from './forms/LeaveForm.vue';
import store from '../store';
import * as types from '../store/mutation-types';
import moment from 'moment';

var data = {
  today: new Date(),
  selectedDay: new Date(),
  earliestLeave: new Date(),
  latestLeave: new Date(),
  leaves: [],
  leavesSelectedDay: []
}

export default {
  name: 'dashboard',

  components: {
    LeaveForm: LeaveForm,
  },

  data () {
    return data;
  },

  created: function () {
    this.earliestLeave = moment();
    this.latestLeave = moment();
    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/leaves/',
    }).then((response) => {
      this.selectedDay = moment()
      response.body.results.forEach((leave) => {
        this.leaves.push(leave);
        leave.leavedate_set.forEach(ld => {
          ld.starts_at = moment(ld.starts_at, 'YYYY-MM-DD HH:mm:ss');
          this.earliestLeave = ld.starts_at.isBefore(this.earliestLeave, 'day') ? ld.starts_at : this.earliestLeave;
          ld.ends_at = moment(ld.ends_at, 'YYYY-MM-DD HH:mm:ss');
          this.latestLeave = ld.ends_at.isAfter(this.latestLeave, 'day') ? ld.ends_at : this.latestLeave;          
        });
        if(leave.leavedate_set.length > 1){
          //Check if today is between the start of the first leavedate and the last leavedate
          if(this.selectedDay.isBetween(leave.leavedate_set[0].starts_at, leave.leavedate_set[leave.leavedate_set.length - 1].starts_at)){
            this.leavesSelectedDay.push(leave);
          }
        } else {
          if(leave.leavedate_set[0].starts_at.isSame(this.selectedDay, 'day')){
            this.leavesSelectedDay.push(leave);              
          }
        }
      });         
    });
  },

  computed: {  

    //Calculates total hours of currently active projects
    totalContractDuration: function() {
      var total = 0;

      if(this.contracts)
        this.contracts.forEach(x => { 
          total += x.total_duration 
        });

      return total;
    },

    open_timesheet_count: function() {
      if(store.getters.open_timesheet_count)
        return store.getters.open_timesheet_count;
    },

    contracts: function() {
      if(store.getters.contracts)
        return store.getters.contracts;
    }

  },

  filters: {

    //Calculates amount of days in hours
    //Divides by 8 & sets precision to 1 decimal
    hoursToDaysFilter: function(val) {
      return Math.round(val / 8 * 2) / 2;
    },

    roundHoursFilter: function(val) {
      return Math.round(val * 2) / 2;
    }
  },

  methods: {
    dayEarlier: function() {
      this.leavesSelectedDay.splice(0);
      this.selectedDay.subtract(1, 'days');      
      // Check if selected day is between the start of the firs and last leave of the leaves
      if(this.selectedDay.isBetween(this.earliestLeave, this.latestLeave)){
        // Selected day is between leaves
        this.leaves.filter((leave) => {
          if(leave.leavedate_set.length > 1){
            if(this.selectedDay.isBetween(leave.leavedate_set[0].starts_at, leave.leavedate_set[leave.leavedate_set.length - 1].starts_at)){
              this.leavesSelectedDay.push(leave);
            }
          } else {
            if(leave.leavedate_set[0].starts_at.isSame(this.selectedDay, 'day')){
              this.leavesSelectedDay.push(leave);              
            }
          }
        });
      } else {
        // Selected day is not between leaves
        // Get next set of leaves
      }
    },

    dayLater: function() {
      this.leavesSelectedDay.splice(0);
      this.selectedDay.add(1, 'days');      
      // Check if selected day is between the start of the firs and last leave of the leaves
      // Selected day is not between leaves
      // Selected day is between leaves
      this.leaves.filter((leave) => {
        if(this.selectedDay.isBetween(leave.leavedate_set[0].starts_at, leave.leavedate_set[leave.leavedate_set.length - 1].starts_at)){
          this.leavesSelectedDay.push(leave);
        } else {
          if(leave.leavedate_set[0].starts_at.isSame(this.selectedDay, 'day')){
            this.leavesSelectedDay.push(leave);              
          }
        }
      });
    }
  },

  watch: { }

}
</script>

<style>
</style>