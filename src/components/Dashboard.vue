<template lang="pug">

div
  .row
    .col-md-10.offset-md-1
      .alert.alert-warning.card-top-red(v-if='open_timesheet_count > 0')
        .text-md-center You have {{ open_timesheet_count }} due timesheet(s) still open. Please fix that ASAP or Johan will haunt your dreams.
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
      days: [],
      leaves: [],
    }
  },

  created: function () {

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
    var startOfMonth = this.today.startOf('month');
    var endOfMonth = this.today.endOf('month');
    var range = `${startOfMonth.format('YYYY-MM-DDTHH:mm:ss')},${endOfMonth.format('YYYY-MM-DDTHH:mm:ss')}`;

    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_leaves/',
      params: {
        status: store.getters.leave_statuses[2],
        leavedate__range: range,
        page_size: 31,
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
  },

  computed: {
    
    //Calculates amount of hours that should be worked according to the workschedule
    totalHoursRequired: function() {
      var total = 0;

      //Loop over each entry in the schedule array
      //Check for each property in the entry if it appears in the days var
      //Multiply total hours with times that day appears in this month
      if(store.getters.work_schedule && this.leaves && store.getters.holidays) {
        store.getters.work_schedule.forEach(ws => {
          //Add regular days to total
          for(var w in ws) {
            if(this.days[w])
              total += parseFloat(ws[w]) * this.days[w];
          }

            //Correcting total with holidays
            store.getters.holidays.forEach(h => {
              var date = moment(h.date, 'YYYY-MM-DD');

              if(this.today.month() === date.month())
                total -= ws[date.format('dddd').toLowerCase()];
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
                total -= (startDiff > 0) ? startDiff : ws[lv.leave_start.format('dddd').toLowerCase()];
                total -= (endDiff > 0) ? endDiff : ws[lv.leave_end.format('dddd').toLowerCase()];

                //While the leavedate isn't equal to the enddate
                while(ld.date() !== lv.leave_end.date()) {
                  total -= ws[ld.format('dddd').toLowerCase()];

                  ld = ld.add(1, 'days');
                }
              } else {
                total -= (startDiff > 0) ? startDiff : 0;
                total -= (endDiff > 0) ? endDiff : 0;
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