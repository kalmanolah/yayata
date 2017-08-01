<template lang="pug">

div
  .row
    .col-md-12
      //- WARNING
      .alert.alert-warning.card-top-red(v-if='open_timesheet_count > 0')
        .text-xs-center You have {{ open_timesheet_count }} due timesheet(s) still open. Please fix that ASAP or Johan will haunt your dreams.
  .row
    .col-lg-6
      //- BIRTHDAYS
      .card.card-top-blue
        h4.card-title.text-xs-center Birthdays
        .text-xs-center
          i.fa.fa-chevron-left.chevron-l.chevron(@click='dayEarlierBirthdays')
          | {{ selectedBirthday | moment('DD MMMM')}}
          i.fa.fa-chevron-right.chevron-r.chevron(@click='dayLaterBirthdays')
        .card-blocd
          table.table
            tbody
              tr(v-for="(user, index) in birthdaysSelectedDay")
                td
                  router-link(:to='{ name: "colleagues", params: { userId: user.id }}') {{ user.display_label }}
                  .fa.fa-birthday-cake.pull-right
              tr(v-if='users && birthdaysSelectedDay.length === 0')
                td.text-xs-center <strong>No rijsttaart today :(</strong>

      //- TIMESHEETS
      .card.card-top-blue
        h4.card-title.text-xs-center Timesheets for 
          router-link(:to='{ name: "calendar_month_redirect" }')
            | {{ today | moment('MMMM YYYY') }}
        table.table
          tbody(v-if='contracts && user')
            tr(v-for="(c, index) in contracts")              
              td {{ c.customerName }}: {{ c.name }}
              td.text-sm-right {{ c.monthly_duration }} hours ({{c.monthly_duration | hoursToDaysFilter }} days)
            tr
              td <strong>Total</strong>
              td.text-sm-right <strong>{{ totalHoursPerformed | roundHoursFilter }} hours ({{ totalHoursPerformed | hoursToDaysFilter }} days)</strong>
            tr
              td <strong>Open hours</strong>
              td.text-sm-right <strong>{{ getHoursToFill() }} hours ({{ getHoursToFill() | hoursToDaysFilter }} days)</strong>
   
    .col-lg-6
      //- ABSENT COLLEAGUES
      .card.card-top-blue
        h4.card-title.text-xs-center Absent colleagues
        div.text-xs-center
          i.fa.fa-chevron-left.chevron-l.chevron(@click='dayEarlier')
          | {{ selectedDay | moment('DD MMMM') }}
          i.fa.fa-chevron-right.chevron-r.chevron(@click='dayLater') 
        .card-block
          table.table
            tbody
              tr(v-if='sortedLeaves' v-for="(leave, index) in sortedLeaves" v-bind:key="leave.id")
                td
                  router-link(:to='{ name: "colleagues", params: { userId: leave.user }}') {{ leave.user | getUsername }}
                td.text-md-right {{ leave.leave_type }}
              tr(v-if='sortedLeaves.length === 0')
                td.text-xs-center <strong>No absent colleagues!</strong>
          table.table
            tbody
              tr(v-if='holidays' v-for='holiday in holidaysSelectedDay')
                td {{ holiday.name }} [{{ holiday.country }}]
                td.text-md-right {{ holiday.date }}
              tr(v-if='holidaysSelectedDay.length === 0')
                td.text-xs-center <strong>No holidays!</strong>
  .row
    .col-lg-6
      //- Leaverequest form
      LeaveRequestForm

</template>

<script>
import { mapState } from 'vuex';
import LeaveRequestForm from './forms/LeaveRequestForm.vue'
import store from '../store';
import * as types from '../store/mutation-types';
import moment from 'moment';


export default {
  name: 'dashboard',

  components: {
    LeaveRequestForm
  },

  data () {
    return {
      today: moment(),
      days: [],
      leaves: [],
      // today: new Date(),
      selectedDay: new Date(),
      earliestLeave: new Date(),
      latestLeave: new Date(),
      leavesWidget: [],
      leavesSelectedDay: [],
      holidaysSelectedDay: [],
      birthdaysSelectedDay: [],
      selectedBirthday: moment()
    }
  },

  created: function () {
    // Reload the users in the store which may have been changed by the colleagues filter
    store.dispatch(types.NINETOFIVER_RELOAD_USERS);
    this.earliestLeave = moment();
    this.latestLeave = moment();
    this.selectedDay = moment();
    this.getLeaves();

    //Make days-object containing amount of -days in current month
    var dayOfMonth = moment().startOf('month');
    var endOfMonth = moment().endOf('month');

    while(dayOfMonth <= endOfMonth) {
      var weekday = dayOfMonth.format('dddd').toLowerCase();

      if(!this.days[weekday])
        this.days[weekday] = 0;

      this.days[weekday]++;
      dayOfMonth.add(1, 'days');
    }
    
    //Reload to get most recent data
    store.dispatch(types.NINETOFIVER_RELOAD_MONTHLY_ACTIVITY_PERFORMANCES);

    //Get all leaves for this month
    //Make param for month's range
    var startOfMonth = moment().startOf('month');
    var endOfMonth = moment().endOf('month');
    var range = `${startOfMonth.format('YYYY-MM-DDTHH:mm:ss')},${endOfMonth.format('YYYY-MM-DDTHH:mm:ss')}`;

    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_leaves/',
      params: {
        status: store.getters.leave_statuses[2],
        leavedate__range: range,
      }
    }).then((response) => {      
      response.data.results.forEach(lv => {
        lv.leavedate_set.forEach(lvd => {
          lvd.starts_at = moment(lvd.starts_at, 'YYYY-MM-DD HH:mm:ss');
          lvd.ends_at = moment(lvd.ends_at, 'YYYY-MM-DD HH:mm:ss');
        });
        lv['leave_start'] = lv.leavedate_set[0].starts_at;
        lv['leave_end'] = lv.leavedate_set[lv.leavedate_set.length-1].ends_at;
      });
      this.leaves = response.data.results;
    }, () => {
      this.loading = false;
    });
    if(store.getters.user) {
      store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, {
        params: {
          contractuser__user__id: store.getters.user.id
        }
      });
    }
  },

  computed: {
    user: function() {
      if(store.getters.user){
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, {
          params: {
            contractuser__user__id: store.getters.user.id
          }
        });
        store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACTS, {
          params: {
            user: store.getters.user.id
          }
        });
        return store.getters.user
      }
    },

    holidays: function() {
      if(store.getters.holidays)
        // return store.getters.holidays.filter(holiday => moment(holiday.date).format('MM-DD') === moment(this.selectedDay).format('MM-DD'));
        return store.getters.holidays
    },

    workschedule: function() {
      if(store.getters.user_work_schedule)
        return store.getters.user_work_schedule;
    },


    //Calculates amount of hours that should be worked according to the workschedule
    totalHoursRequired: function() {
      var total = 0;

      //Loop over each entry in the schedule array
      //Check for each property in the entry if it appears in the days var
      //Multiply total hours with times that day appears in this month
      if(store.getters.work_schedules && this.leaves && store.getters.holidays && store.getters.employment_contracts) {
        var work_schedules = [];
        store.getters.employment_contracts.forEach( (ec) => {
          var work_schedule = store.getters.work_schedules.find((ws) => ws.id === ec.work_schedule);
          if(work_schedule){
            work_schedules.push(work_schedule);
          }
        });
        work_schedules.forEach(ws => {
          //Add regular days to total
          for(var w in ws) {
            if(this.days[w])
              total += parseFloat(ws[w]) * this.days[w];
          }

            //Correcting total with holidays 
            var startOfMonth = moment().startOf('month');
            var endOfMonth = moment().endOf('month');
      
            store.getters.holidays.forEach(holiday => {
              if(this.user.country === holiday.country){
                var date = moment(holiday.date).format('YYYY-MM-DD');

                if(moment(date).isBetween(startOfMonth, endOfMonth, 'month', '[]')){
                  total -= 8;
                }
              }
            });
            
            //Correcting total with leaves
            this.leaves.forEach(lv => {
              var startOfDay = moment(lv.leave_start).hour(9).startOf('hour');
              var endOfDay = moment(lv.leave_end).hour(17).minute(30);
              var ld = moment(lv.leave_start).add(1, 'days');

              var startDiff = lv.leave_start.diff(startOfDay, 'hours');
              var endDiff = endOfDay.diff(lv.leave_end, 'hours');

              //Do not occur on the same day
              if(lv.leave_start.date() !== lv.leave_end.date()) {

                //Subtract either the hours gone, or the complete day
                total -= (startDiff > 0) ? (ws[lv.leave_start.format('dddd').toLowerCase()] - startDiff) : ws[lv.leave_start.format('dddd').toLowerCase()];
                total -= (endDiff > 0) ? (ws[lv.leave_start.format('dddd').toLowerCase()] - endDiff) : ws[lv.leave_end.format('dddd').toLowerCase()];

                //While the leavedate isn't equal to the enddate
                while(ld.date() !== lv.leave_end.date()) {
                  total -= ws[ld.format('dddd').toLowerCase()];

                  ld = ld.add(1, 'days');
                }
              } else {
                let leaveHours = (ws[lv.leave_start.format('dddd').toLowerCase()] - (startDiff + endDiff));
                total -= (leaveHours > 0) ? leaveHours : 0;
              }
            });
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
      if(store.getters.filtered_contracts && store.getters.monthly_activity_performances && this.user) {
        var active_contrs = store.getters.filtered_contracts.filter(x => x.active === true);

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
      };
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
    getUsername: function(val) {
      if(store.getters.users){
        return store.getters.users.find(u => u.id === val).display_label
      }
    },

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
      this.filterHolidays();      
    },

    dayLater: function() {
      this.selectedDay.add(1, 'days');      
      this.filterLeaves();
      this.filterHolidays(); 
    },

    dayEarlierBirthdays: function() {
      this.selectedBirthday.subtract(1, 'days');
      this.filterBirthdays()
    },

    dayLaterBirthdays: function() {
      this.selectedBirthday.add(1, 'days');
      this.filterBirthdays();
    },

    filterBirthdays: function() {
      this.birthdaysSelectedDay = [];
      this.users.filter((user) => {
        if(moment(user.birth_date).isSame(this.selectedBirthday, 'day')){
          this.birthdaysSelectedDay.push(user);
        }
      });
    },

    filterHolidays: function() {
      this.holidaysSelectedDay = [];
      this.holidays.filter(holiday => {
        if(moment(holiday.date).format('MM-DD-YYYY') === moment(this.selectedDay).format('MM-DD-YYYY')){
          this.holidaysSelectedDay.push(holiday)
        }
      });
    },

    filterLeaves: function() {
      // Empty leaveSelectedDay array.
      this.leavesSelectedDay = [];    
      // Check if selected day is between the start of the first and last leave of the leaves.
      if(this.selectedDay.isBetween(this.earliestLeave, this.latestLeave)){
        // Selected day is between leaves.
        this.leavesWidget.filter((lv) => {
          if(this.selectedDay.isBetween(lv.leavedate_set[0].starts_at, moment(lv.leavedate_set[lv.leavedate_set.length - 1].starts_at).add(1, 'day'), null, '[]')
            || lv.leavedate_set[0].starts_at.isSame(this.selectedDay, 'day')){
            this.leavesSelectedDay.push(lv);

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
        this.leavesWidget = [];
        response.body.results.forEach((leave) => {
          this.leavesWidget.push(leave);
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
    getHoursToFill: function() {
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