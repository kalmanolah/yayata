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
      v-bind:class='{ \
        "calendar-day-weekend": isWeekendDay(n), \
        "calendar-day-current": isCurrentDay(n), \
      }'
    )
      router-link(:to='{name: "calendar_week", params: { year: selectedMonth.getFullYear(), week: getWeekNumber(n) } }')
        div(class='card card-block' v-bind:class='determineLeave(n)' )
          h4 {{ n }}
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
      this.selectedMonth = new Date(to.params.year, to.params.month - 1, 1)
    }
  },

  created: function () {
    
    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_leaves/',
    }).then((response) => {
      response.data.results.forEach(x => {
        x.leavedate_set.forEach(x => {
          x.starts_at = moment(x.starts_at, 'YYYY-MM-DD HH:mm:ss');
          x.ends_at = moment(x.ends_at, 'YYYY-MM-DD HH:mm:ss');
        });
      });

      this.leaves = response.data.results;
    }, () => {
      this.loading = false
    });

  },

  methods: {

    //Check whether user is on leave on that particular day
    isOnLeave: function(day) {
      var today = moment(this.selectedMonth).date(day);

      return this.leaves.some(x => {

        var start = x.leavedate_set[0].starts_at.hours(0).minutes(0);
        var end = x.leavedate_set[x.leavedate_set.length - 1].ends_at.hours(23).minutes(59);

        return (start <= today && end >= today);
      });
    },

    //Return style according to leave/no-leave
    determineLeave: function(day) {
      return (this.isOnLeave(day)) ? 'bg-info' : 'bg-faded';
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
  background: rgba(0, 0, 0, 0.1);
}

.calendar-day-weekend {
  .card {
    background: rgba(255, 0, 0, 0.2);
  }
}

.calendar-day-current {
  .card {
    background: rgba(0, 255, 0, 0.2);
  }
}

</style>
