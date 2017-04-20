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
            tr(v-for="(c, index) in contracts" v-bind:key="c.id")              
              td {{ c.customerName }}: {{ c.name }}
              td.text-md-right {{ c.monthly_duration }} hours ({{c.monthly_duration | hoursToDaysFilter }} days)
            tr
              td <strong>Total</strong>
              td.text-md-right <strong>{{ totalHoursPerformed | roundHoursFilter }} hours ({{ totalHoursPerformed | hoursToDaysFilter }} days)</strong>
            tr
              td <strong>Hours left to fill in</strong>
              td.text-md-right <strong>{{ getHoursToFill() }} hours ({{ getHoursToFill() | hoursToDaysFilter }} days)</strong>
    .col-md-5
      .card
        h4.card-title.text-md-center Absent colleagues
        div.text-md-center
          i.fa.fa-chevron-left.chevron-l.chevron(@click='dayEarlier')
          | {{ selectedDay | moment('DD MMMM') }}
          i.fa.fa-chevron-right.chevron-r.chevron(@click='dayLater') 
        .cardblock
          table.table
            tbody
              tr(v-if='sortedLeaves' v-for="(leave, index) in sortedLeaves" v-bind:key="leave.id")
                td {{ leave.user.first_name }} {{ leave.user.last_name }}
                td.text-md-right {{ leave.leave_type }}
              tr(v-if='sortedLeaves.length === 0')
                td.text-md-center <strong>No absent colleagues!</strong>
  .row
    .col-md-5.offset-md-1
      LeaveForm

</template>

<script>
import { mapState } from 'vuex';
import LeaveForm from './forms/LeaveForm.vue';
import store from '../store';
import * as types from '../store/mutation-types';
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
      },
      today: new Date(),
      selectedDay: new Date(),
      earliestLeave: new Date(),
      latestLeave: new Date(),
      leaves: [],
      leavesSelectedDay: []
    }
  },

  created: function () {
    this.earliestLeave = moment();
    this.latestLeave = moment();
    this.selectedDay = moment();
    this.getLeaves();

    //Make days-object containing amount of -days in current month
    var dayOfMonth = moment().startOf('month');
    var endOfMonth = moment().endOf('month');

    while(dayOfMonth <= endOfMonth) {
      var weekday = dayOfMonth.format('dddd').toLowerCase();
      this.days[weekday]++;
      dayOfMonth.add(1, 'days');
    }


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
      var options = {
        path: '/leaves/',
        params: {
          status: 'APPROVED',
          // Between (today - 7 days) and (today + 7 days).
          leavedate__range: range
        }
      }
      store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((response) => {
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
    },
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
.chevron-l {
  margin-right: 4rem;
}

.chevron-r {
  margin-left: 4rem;
}
.chevron {
  color: #0275d8;
}

.chevron:hover {
  cursor: pointer;
}
</style>