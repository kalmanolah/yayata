<template lang="pug">
div(class='calendar')
  div(class='row')
    div(class='col-md-3')
    h1(class='col-md-6 text-md-center') {{ months[selectedMonth.getMonth()] }} {{ selectedMonth.getFullYear() }}
    div(class='col-md-3 text-md-right')
      div(
        class='btn-group'
        role='group'
        aria-label='Calendar controls'
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
      v-for='n in dayCount'
      class='calendar-day'
      v-bind:class='[{ \
        "calendar-day-weekend": isWeekendDay(n), \
        "calendar-day-current": isCurrentDay(n), \
      }, determineLeaveStyle(n)]'
    )
      router-link(:to='{name: "calendar_week", params: { year: selectedMonth.getFullYear(), week: getWeekNumber(n) } }')
        div(class='card card-block')
          p {{ n }}
            b-popover.pull-right(v-if='isOnLeave(n)' triggers='hover' placement='top')
              i.fa.fa-plane
              div(slot='content')
                div.text-sm-center <strong> {{ getLeaveRange(n).leave_type }} </strong>
                div <strong>From: </strong> {{ getLeaveRange(n).leave_start | moment('DD MMMM  HH:mm') }}
                div <strong>Until: </strong> {{ getLeaveRange(n).leave_end | moment('DD MMMM  HH:mm') }}
          small.pull-right.tag(v-bind:class='getDailyQuota(n)')
            |  {{ getPerformedHours(n) | roundHoursFilter }} /
            | {{ getRequiredHours(n) | roundHoursFilter}}

</template>

<script>
import { mapState } from 'vuex';
import * as types from '../store/mutation-types';
import store from '../store';
import moment from 'moment';

var daysInMonth = (d) => {
  return  new Date(d.getYear(), d.getMonth() + 1, 0).getDate()
}

export default {
  name: 'calendar',

  watch: {
    '$route' (to, from) {
      this.selectedMonth = new Date(to.params.year, to.params.month - 1, 1);
      this.getPerformances();
      this.getLeaves();
    }
  },

  created: function () {
    
    //Get most recent data
    this.getPerformances();
    this.getLeaves();

  },

  methods: {

    //Return style based on quota
    getDailyQuota: function(day) {
      var quota = this.getRequiredHours(day) - this.getPerformedHours(day);

      return quota <= 0 ? 'tag-success' : 'tag-danger';
    },

    //Get all leaves for this month
    getLeaves: function() {
      //Make param for month's range
      var startOfMonth = moment(this.selectedMonth).startOf('month');
      var endOfMonth = moment(this.selectedMonth).endOf('month');
      var range = startOfMonth.format('YYYY-MM-DDTHH:mm:ss') + ',' + endOfMonth.format('YYYY-MM-DDTHH:mm:ss');

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_leaves/',
        params: {
          status: store.getters.leave_statuses[2],
          leavedate__range: range
        }
      }).then((response) => {

        response.data.results.forEach(lv => {
          lv.leavedate_set.forEach(lvd => {
            lvd.starts_at = moment(lvd.starts_at, 'YYYY-MM-DD HH:mm:ss');
            lvd.ends_at = moment(lvd.ends_at, 'YYYY-MM-DD HH:mm:ss');
          });
        
          lv['leave_start'] = lv.leavedate_set[0].starts_at;
          lv['leave_end'] = lv.leavedate_set[lv.leavedate_set.length-1].ends_at;

          lv['leave_type'] = this.leaveTypes.find(x => { return x.id === lv.leave_type}).name;

        });

        this.leaves = response.data.results;
      }, () => {
        this.loading = false;
      });
    },

    //Get all performances for this month
    getPerformances: function() {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_performances/activity/',
        params: {
          timesheet__month: this.selectedMonth.getMonth() + 1,
          timesheet__year: this.selectedMonth.getFullYear()
        }
      }).then((response) => {
        this.performances = response.data.results;
      }, () => {
        this.loading = false;
      });
    },

    //Get hours required per day
    getRequiredHours: function(day) {
      var total = 0;

      if(this.workschedule) {
        var date = moment(this.selectedMonth).date(day);

        this.workschedule.forEach(x => {
          total += parseFloat(x[date.format('dddd').toLowerCase()]);
        });        
      }

      return total;
    },

    //Get hours performed per day
    getPerformedHours: function(day) {
      var total = 0;

      if(this.performances) {
        this.performances.forEach(x => {
          if(x.day === day)
            total += parseFloat(x.duration);
        });
      }

      return total;
    },

    //Check whether user is on leave on that particular day
    isOnLeave: function(day) {
      var today = moment(this.selectedMonth).date(day);

      return this.leaves.some(x => {
        var start = x.leavedate_set[0].starts_at.hours(0).minutes(0);
        var end = x.leavedate_set[x.leavedate_set.length - 1].ends_at.hours(23).minutes(59);
        
        return (start <= today && end >= today);
      });
    },

    getLeaveRange: function(day) {
      var today = moment(this.selectedMonth).date(day);
      return this.leaves.find(x => {
        return today.isSameOrAfter(x.leave_start) 
          && today.isSameOrBefore(x.leave_end);
      });
    },

    //Return style according to leave/no-leave
    determineLeaveStyle: function(day) {
      if(this.isOnLeave(day))
        return this.isCurrentDay(day) ? 'calendar-day-current-on-leave' : 
                this.isWeekendDay(day) ? 'calendar-day-weekend-on-leave' :
                'calendar-day-on-leave';
    },

    getDayOfWeek: function (day) {
      return (this.dayOffset + day) % 7
    },

    isWeekendDay: function (day) {
      var dow = this.getDayOfWeek(day)
      return dow > 5 || dow < 1
    },

    isCurrentDay: function (day) {
      var now = new Date()

      if (
        (day == now.getDate()) &&
        (now.getMonth() == this.selectedMonth.getMonth()) &&
        (now.getFullYear() == this.selectedMonth.getFullYear())
      ) {
        return true;
      }

      return false
    },

    setSelectedMonth: function (year, month) {
      this.$router.push({
        name: 'calendar_month',
        params: {
          year: year,
          month: month,
        },
      })

      // this.selectedMonth = new Date(year, month - 1, 1)
    },

    selectNextMonth: function () {
      var year = this.selectedMonth.getFullYear(),
      month = this.selectedMonth.getMonth() + 1 + 1

      if (month == 13) {
        month = 1
        year += 1
      }

      this.setSelectedMonth(year, month)
    },

    selectPreviousMonth: function () {
      var year = this.selectedMonth.getFullYear(),
      month = this.selectedMonth.getMonth() + 1 - 1

      if (month == 0) {
        month = 12
        year -= 1
      }

      this.setSelectedMonth(year, month)
    },

    getWeekNumber: function(val) {
      return moment({ 
        day: val, 
        month: this.selectedMonth.getMonth(),
        year: this.selectedMonth.getFullYear()
      }).isoWeek();
    }

  },

  data () {

    return {
      leaves: [],
      performances: [],

      weekDays: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
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

      selectedMonth: new Date(this.$route.params.year, this.$route.params.month - 1, 1),
    }
  },

  computed: {

    leaveTypes: function() {
      if(store.getters.leave_types)
        return store.getters.leave_types;
    },

    workschedule: function() {
      if(store.getters.work_schedule)
        return store.getters.work_schedule;
    },

    dayOffset: (vm) => {
      var dow = vm.selectedMonth.getDay()

      if (dow == 0) {
        dow = 7
      }

      return dow - 1
    },

    dayCount: (vm) => {
      return daysInMonth(vm.selectedMonth)
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
