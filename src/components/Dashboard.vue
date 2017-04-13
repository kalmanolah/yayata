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
              tr(v-if='sortedLeaves' v-for="(leave, index) in sortedLeaves" v-bind:key="leave.id")
                td {{ leave.user.first_name }} {{ leave.user.last_name }}
                td.text-md-right {{ leave.leave_type }}
              tr(v-if='sortedLeaves.length == 0')
                td.text-md-center <strong>No absent collegues!</strong>
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
    this.selectedDay = moment();
    this.getLeaves();
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

    // Alphabetical sort.
    sortedLeaves: function() {
      if(this.leavesSelectedDay){
        return this.leavesSelectedDay.sort(function(a, b) {
        a = a.user.first_name;
        b = b.user.first_name;

        return a > b ? -1 : (a < b ? 1 : 0);
      });
      }
    },

    open_timesheet_count: function() {
      if(store.getters.open_timesheet_count)
        return store.getters.open_timesheet_count;
    },

    contracts: function() {
      if(store.getters.contracts)
        return store.getters.contracts;
    },

    users: function() {
      if(store.getters.users)
        return store.getters.users;
    },

    leave_types: function() {
      if(store.getters.leave_types)
        return store.getters.leave_types;
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
      this.selectedDay.subtract(1, 'days');      
      this.filterLeaves();      
    },

    dayLater: function() {
      this.selectedDay.add(1, 'days');      
      this.filterLeaves();
    },

    filterLeaves: function() {
      // Empty leaveSelectedDay array.
      this.leavesSelectedDay = [];    
      // Check if selected day is between the start of the first and last leave of the leaves.
      if(this.selectedDay.isBetween(this.earliestLeave, this.latestLeave)){
        // Selected day is between leaves.
        this.leaves.filter((lv) => {
          if(this.selectedDay.isBetween(lv.leavedate_set[0].starts_at, lv.leavedate_set[lv.leavedate_set.length - 1].starts_at)
            || lv.leavedate_set[0].starts_at.isSame(this.selectedDay, 'day')){
            this.leavesSelectedDay.push(lv);
          }
          if(this.users){
            this.users.forEach(u => {
              if(u.id == lv.user)
                lv.user = u
            });
          }
          if(this.leave_types){
            this.leave_types.forEach(lt => {
              if(lt.id == lv.leave_type)
                lv.leave_type = lt.display_label
            });
          }
        });
      } else {
        // Selected day is not between leaves.
        this.getLeaves();
      }
    },

    getLeaves: function() {
      var range = this.earliestLeave.subtract(7, 'days').format('YYYY-MM-DDTHH:mm:ss')
                  + ','
                  + this.latestLeave.add(7, 'days').format('YYYY-MM-DDTHH:mm:ss')
      this.tempDate = moment(this.selectedDay);
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/leaves/',
      params: {
        status: 'APPROVED',
        // Between (today - 7 days) and (today + 7 days).
        leavedate__range: range
      }
      }).then((response) => {
        this.leaves = [];
        response.body.results.forEach((leave) => {
          this.leaves.push(leave);
          leave.leavedate_set.forEach(ld => {
            ld.starts_at = moment(ld.starts_at, 'YYYY-MM-DD HH:mm:ss');
            ld.ends_at = moment(ld.ends_at, 'YYYY-MM-DD HH:mm:ss');
            // Keep track of the earliest and latest leave in this set.
            this.earliestLeave = ld.starts_at.isBefore(this.earliestLeave, 'day') ? ld.starts_at : this.earliestLeave;
            this.latestLeave = ld.ends_at.isAfter(this.latestLeave, 'day') ? ld.ends_at : this.latestLeave;          
          });
          this.filterLeaves();
        });         
      });
    }
  },

  watch: { }

}
</script>

<style>
</style>