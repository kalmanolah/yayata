<template lang="pug">
div(class='calendar')
  .row
    .col-md-3
    h1(class='col-md-6 text-md-center') {{ month }} {{ year }}
    .col-md-3.text-md-right
      div(
        class='btn-group'
        role='group'
        aria-label='Calendar controls'
        v-if='!userId'
      )
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
    .col-md-4
    h5.col-md-4.text-md-center
      small <strong>Total:</strong> {{ totalHoursPerformed }} / {{ totalHoursRequired }}
    .col-md-4
  hr

  //- Day-names
  div(class='calendar-header' class='hidden-sm-down')
    div(v-for='weekDay in weekDays')
      div(class='calendar-day') {{ weekDay }}
  div(class='calendar-body')
    div(
      v-for='n in dayOffset'
      class='calendar-day calendar-day-dummy hidden-sm-down'
    )

    //- Day-blocks
    div(
      v-for='(n, i) in dayCount'
      class='calendar-day'
      v-bind:class='[{ \
        "calendar-day-weekend": isWeekendDay(n), \
        "calendar-day-current": isCurrentDay(n), \
      }, determineLeaveStyle(n)]'
    )
      template(v-if='!userId')
        router-link(:to='{name: "calendar_week", params: { year: year, week: getWeekNumber(n) } }')
          div(class='card card-block')
            p {{ n }}
              b-popover.pull-right(v-if='isOnLeave(n)' triggers='hover' placement='top' class='hidden-md-down')
                i.fa.fa-plane
                div(slot='content')
                  div.text-sm-center <strong> {{ getLeaveRange(n).leave_type }} </strong>
                  div <strong>From: </strong> {{ getLeaveRange(n).leave_start | moment('DD MMMM  HH:mm') }}
                  div <strong>Until: </strong> {{ getLeaveRange(n).leave_end | moment('DD MMMM  HH:mm') }}
            small.tag.pull-right(v-bind:class='getDailyQuota(n)' class='hidden-md-down')
              |  {{ getPerformedHours(n) | roundHoursFilter }} /
              | {{ getRequiredHours(n) | roundHoursFilter}}
      template(v-else)
        div(class='card card-block')
          p {{ n }}
            b-popover.pull-right(v-if='isOnLeave(n)' triggers='hover' placement='top' class='hidden-md-down')
              i.fa.fa-plane
              div(slot='content')
                div.text-sm-center <strong> {{ getLeaveRange(n).leave_type }} </strong>
                div <strong>From: </strong> {{ getLeaveRange(n).leave_start | moment('DD MMMM  HH:mm') }}
                div <strong>Until: </strong> {{ getLeaveRange(n).leave_end | moment('DD MMMM  HH:mm') }}
          small.tag.pull-right(v-bind:class='getDailyQuota(n)' class='hidden-md-down')
            |  {{ getPerformedHours(n) | roundHoursFilter }} /
            | {{ getRequiredHours(n) | roundHoursFilter}}

</template>

<script>
import { mapState } from 'vuex';
import * as types from '../store/mutation-types';
import store from '../store';
import moment from 'moment';

export default {
  name: 'calendar',

  props: [
    'userId',
    'selectedMonthProp'
  ],

  watch: {
    '$route' (to, from) {
      if(this.$route.params.year && this.$route.params.month){
        this.getPerformances();
        this.getLeaves();
        this.reloadEmploymentContracts()
      }
    },

    // Watches selected user from parent component.
    userId: function(oldUserid, newUserId) {
      this.getPerformances();
      this.getLeaves();
      this.reloadEmploymentContracts()
    },

    selected_month: function(oldUserid, newUserId) {
      this.getPerformances();
      this.getLeaves();
      this.reloadEmploymentContracts()
    },

    user: function(oldUser, newUser) {
      this.getPerformances();
      this.getLeaves();
      this.reloadEmploymentContracts();
    },

    // Watches selected month from parent component.
    selectedMonthProp: function(oldSelectedMonthProp, newSelectedMonthProp){
      this.getPerformances();
      this.getLeaves();
      this.reloadEmploymentContracts()
    }
  },

  created: function () {
    this.getPerformances();
    this.getLeaves();
    this.reloadEmploymentContracts()
 },

  methods: {
    reloadEmploymentContracts: function() {
      let ec_user = this.userId ? this.userId : this.user.id;
      let today = moment(store.getters.calendar_selected_month).format('YYYY-MM-DD');
      store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACTS, {
        params: {
          user: ec_user,
          ended_at__gte: today
        }
      });
    },

    //Return style based on quota
    getDailyQuota: function(day) {
      let performed = this.getPerformedHours(day);
      let required = this.getRequiredHours(day);

      let quota = required > 0 ? performed / required : 1;

      return quota >= 1 ? 'tag-success' : quota <= 0.6 ? 'tag-danger' : 'tag-warning';
    },

    //Get all leaves for this month
    getLeaves: function() {
      //Make param for month's range
      let startOfMonth = moment(store.getters.calendar_selected_month).startOf('month');
      let endOfMonth = moment(store.getters.calendar_selected_month).endOf('month');
      let range = startOfMonth.format('YYYY-MM-DDTHH:mm:ss') + ',' + endOfMonth.format('YYYY-MM-DDTHH:mm:ss');
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/leaves/',
        params: {
          user_id: this.user.id,
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

          lv['leave_type'] = this.leaveTypes.find(x => { return x.id === lv.leave_type}).display_label;

        });

        this.leaves = response.data.results;
      }, () => {
        this.loading = false;
      });
    },

    //Get all performances for this month
    getPerformances: function() {
      let month = moment(store.getters.calendar_selected_month).month() + 1;
      let year = moment(store.getters.calendar_selected_month).year();
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/performances/',
        params: {
          timesheet__user_id: this.user.id,
          timesheet__month: month,
          timesheet__year: year,
        }
      }).then((response) => {
        this.performances = response.data.results;
      }, () => {
        this.loading = false;
      });
    },

    //Get hours required per day
    getRequiredHours: function(day) {
      let total = 0;
      if(this.workschedule && !this.isHoliday(day)) {
        let date = moment(store.getters.calendar_selected_month).date(day);
        this.workschedule.forEach(x => {
          total += parseFloat(x[date.format('dddd').toLowerCase()]);
        });        
      }
      // TODO: take into account hours on leave
      if(this.leaves) {
        let date = day;
        let year = store.getters.calendar_selected_month.year();
        let month = store.getters.calendar_selected_month.month();
        this.leaves.forEach((leave) => {
          let ld = leave.leavedate_set.find((ld) => moment(ld.starts_at).isSame(moment([year, month, date ]), 'day'));
          if(ld){
            let endOfDay = moment([year, month, date, 17, 30]);
            let startOfDay = moment([year, month, date, 9]);

            let startDiff = moment(ld.starts_at._i).subtract(2, 'hours').diff(startOfDay, 'hours');
            let endDiff = moment(endOfDay).add(2, 'hours').diff(ld.ends_at._i, 'hours');
            
            startDiff = startDiff > 0 ? startDiff : 0;
            endDiff = endDiff > 0 ? endDiff : 0;

            let leaveDuration = (8 - (startDiff + endDiff));
            total -= leaveDuration;
          }
        });
      }

      return total;
    },

    //Get hours performed per day
    getPerformedHours: function(day) {
      let total = 0;

      if(this.performances) {
        this.performances.forEach(x => {
          if(x.duration && x.day === day)
            total += parseFloat(x.duration);
        });
      }

      return total;
    },

    isHoliday: function(day) {
      let today = moment(store.getters.calendar_selected_month).date(day);
      let holiday = false;
      let companyId = store.getters.employment_contracts.find((ec) => {
        return ec.user === this.user.id;
      }).company;
      let companyCountry = store.getters.companies.find((c) => {
        return c.id === companyId;
      }).country;

      if(store.getters.holidays) {
        store.getters.holidays.forEach(x => {
          if (today.format('YYYY-MM-DD') === x.date && x.country === companyCountry)
            holiday = true;
        });
      }
      return holiday
    }, 

    //Check whether holiday / user is on leave
    isExcusedFromWork: function(day) {
      let today = moment(store.getters.calendar_selected_month).date(day);
      let onLeave = false;
      let companyId = store.getters.employment_contracts.find((ec) => {
        return ec.user === this.user.id;
      }).company;
      let companyCountry = store.getters.companies.find((c) => {
        return c.id === companyId;
      }).country;

      if(store.getters.holidays) {
        store.getters.holidays.forEach(x => {
          if (today.format('YYYY-MM-DD') === x.date && x.country === companyCountry)
            onLeave = true;
        });
      }

      return onLeave || this.isOnLeave(day);
    },

    //Check whether user is on requested leave on that particular day
    isOnLeave: function(day) {
      let today = moment(store.getters.calendar_selected_month).date(day);

      return this.leaves.some(x => {
        let start = x.leavedate_set[0].starts_at.hours(0).minutes(0);
        let end = x.leavedate_set[x.leavedate_set.length - 1].ends_at.hours(23).minutes(59);
        
        return (start <= today && end >= today);
      });
    },

    //Formatting to help display in calendar
    getLeaveRange: function(day) {
      let today = moment(store.getters.calendar_selected_month).date(day);
      return this.leaves.find(x => {
        return today.isSameOrAfter(x.leave_start) 
          && today.isSameOrBefore(x.leave_end);
      });
    },

    //Return style according to leave/no-leave
    determineLeaveStyle: function(day) {
      if(this.isExcusedFromWork(day))
        return this.isCurrentDay(day) ? 'calendar-day-current-on-leave' : 
                this.isWeekendDay(day) ? 'calendar-day-weekend-on-leave' :
                'calendar-day-on-leave';
    },

    getDayOfWeek: function (day) {
      return (this.dayOffset + day) % 7
    },

    isWeekendDay: function (day) {
      let dow = this.getDayOfWeek(day)
      return dow > 5 || dow < 1
    },

    isCurrentDay: function (day) {
      let now = new Date()

      if (
        (day == now.getDate()) &&
        (now.getMonth() == moment(store.getters.calendar_selected_month).month()) &&
        (now.getFullYear() == moment(store.getters.calendar_selected_month).year())
      ) {
        return true;
      }

      return false
    },

    setSelectedMonth: function (year, month) {
      if(!this.userId){
        this.$router.push({
          name: 'calendar_month',
          params: {
            year: year,
            month: month + 1,
          },
        })
      } else {
        this.getPerformances();
        this.getLeaves();
      }
    },

    selectNextMonth: function () {
      let date = moment(this.selected_month).add(1, 'month')
      let options = {
        params: {
          date:date
        }
      };
      store.dispatch(types.NINETOFIVER_RELOAD_CALENDAR_SELECTED_MONTH, options);
      this.setSelectedMonth(moment(date).year(), moment(date).month());
    },

    selectPreviousMonth: function () {
      let date = moment(this.selected_month).subtract(1, 'month')
      let options = {
        params: {
          date:date
        }
      };
      store.dispatch(types.NINETOFIVER_RELOAD_CALENDAR_SELECTED_MONTH, options);
      this.setSelectedMonth(moment(date).year(), moment(date).month());
    },

    getWeekNumber: function(val) {
      return moment({ 
        day: val, 
        month: moment(store.getters.calendar_selected_month).month(),
        year: moment(store.getters.calendar_selected_month).year()
      }).isoWeek();
    }

  },

  data () {

    return {
      leaves: [],
      performances: [],
      // selectedMonth: moment().startOf('month').format('YYYY-MM-DD'),
      weekDays: Object.keys(store.getters.days).map(x => { return x[0].toUpperCase() + x.slice(1); }),
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],

    }
  },

  computed: {
    selected_month: function() {
      if(store.getters.calendar_selected_month){
        return store.getters.calendar_selected_month;
      }
    },

    // If no userId prop is passed get the details of the current user.
    user: function() {
      if(!this.userId && store.getters.user) {
        return store.getters.user;
      } else if(this.userId && store.getters.users) {
        return store.getters.users.find(u => u.id === this.userId);
      }
    },

    year: function() {
      if(store.getters.calendar_selected_month)
        return moment(store.getters.calendar_selected_month).format('YYYY');
    },

    month: function() {
      if(store.getters.calendar_selected_month)
        return moment(store.getters.calendar_selected_month).format('MMMM');
    },

    days: function() {
      let daysInWeek = [];

      //Make days-object containing amount of -days in current month
      let dayOfMonth = moment(this.selectedMonth).startOf('month');
      let endOfMonth = moment(this.selectedMonth).endOf('month');

      while(dayOfMonth <= endOfMonth) {
        let weekday = dayOfMonth.format('dddd').toLowerCase();

        if(!daysInWeek[weekday])
          daysInWeek[weekday] = 0;

        daysInWeek[weekday]++;
        dayOfMonth.add(1, 'days');
      }

      return daysInWeek;
    },

    //Hours required according to workschedules
    totalHoursRequired: function() {
      let total = 0;
      // Get workschedule from active contracts

      if(this.workschedule && this.leaves && store.getters.holidays && this.selected_month) {
        this.workschedule.forEach(ws => {
          //Add regular days to total
          for(let w in ws) {
            if(store.getters.days[w] >= 0){
              total += parseFloat(ws[w]) * this.days[w];
            }
          }

          //Correcting total with holidays
          let startOfMonth = moment(this.selected_month).startOf('month');
          let endOfMonth = moment(this.selected_month).endOf('month');
    
          store.getters.holidays.forEach(holiday => {
            if(this.user.country === holiday.country){
              let date = moment(holiday.date).format('YYYY-MM-DD');

              if(moment(date).isBetween(startOfMonth, endOfMonth, 'month', '[]')){
                total -= 8;
              }
            }
          });

          //Correcting total with leaves
          this.leaves.forEach(lv => {
            let startOfDay = moment(lv.leave_start).hour(9).startOf('hour');
            let endOfDay = moment(lv.leave_end).hour(17).minute(30);
            let ld = moment(lv.leave_start).add(1, 'days');

            let startDiff = lv.leave_start.diff(startOfDay, 'hours');
            let endDiff = endOfDay.diff(lv.leave_end, 'hours');

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

    //Hours already logged
    totalHoursPerformed: function() {
      let total = 0;

      if(this.contracts) {
        this.contracts.forEach(x => {
          total += x.monthly_duration;
        });
      }
      
      return total;
    },

    contracts: function() {
      if(store.getters.contracts && this.performances) {
        let contrs = store.getters.contracts;
        //Calculate total perf duration for each entry
        contrs.forEach(c => {
          let total = 0;

          this.performances.forEach(p => {
            if(p.contract === c.id)
              total += parseFloat(p.duration);
          });

          c.monthly_duration = total;
        });

        return contrs;
      }
    },

    leaveTypes: function() {
      if(store.getters.leave_types)
        return store.getters.leave_types;
    },

    employment_contracts: function() {
      if(store.getters.employment_contracts)
        return store.getters.employment_contracts
    },

    workschedule: function() {
      if(store.getters.work_schedules && this.employment_contracts){
        return store.getters.work_schedules.filter((ws) => {
          return this.employment_contracts.find((ec) => ec.work_schedule === ws.id);
        });
      }
    },

    dayOffset: (vm) => {
      let dow = moment(store.getters.calendar_selected_month).day()
      if (dow == 0) {
        dow = 7
      }
      return dow - 1
    },

    dayCount: function() {
      let days = moment(this.selected_month).endOf('month').date();
      return days;
    }

  },

  filters: {

    roundHoursFilter: function(val) {
      return Math.round(val * 2) / 2;
    },
  },

}
</script>

<style lang="less" scoped>
@media all and (min-width: 768px) {
  .calendar-day {
    width: 14.2857%;
    float: left;
    padding: 0 5px;
    min-height: 3rem;
  }
}

.calendar-day-dummy {
  background: rgba(0, 0, 0, 0.05);
}

.calendar-day-weekend {
  .card {
    background: rgba(150, 150, 150, 0.25);
  }
}

.calendar-day-on-leave {
  .card {
    background: rgba(150, 150, 150, 0.1);
  }
}

.calendar-day-current {
  .card {
    background: repeating-linear-gradient(
      45deg,
      rgba(0, 215, 0, 0.25),
      rgba(0, 215, 0, 0.25) 10px,
      rgba(0, 215, 0, 0.1) 10px,
      rgba(0, 215, 0, 0.1) 20px
    );
  }
}


</style>
