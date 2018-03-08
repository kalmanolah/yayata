<template lang="pug">
div
  div(class='btn-group' role='group')
    button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectPreviousMonth()')
      i(class='fa fa-angle-double-left')
      | &nbsp;Previous
    button(class='btn btn-sm btn-outline-dark disabled' type='button')
      | {{ date | moment('MMMM YYYY') }}
    button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectNextMonth()')
      | Next&nbsp;
      i(class='fa fa-angle-double-right')

  hr

  div(v-if='rangeInfo')
    div
      strong Total:&nbsp;
      | {{ rangeInfo.total_hours | round }} / {{ rangeInfo.work_hours | round }} hours

    hr

    div(class='weekdays')
      div(class='calendar-day d-none d-md-block' v-for='weekDay in weekDays') {{ weekDay }}
      div(class='calendar-day d-none d-md-block' v-for='n in dayOffset')

      div(
        class='calendar-day'
        v-for='(dayDetails, date) in sortByKey(rangeInfo.details)'
        v-bind:class="{ 'calendar-day-current': isCurrentDay(date), 'calendar-day-nowork': !isWorkingDay(date), 'calendar-day-complete': isDayComplete(date), 'calendar-day-incomplete': !isDayComplete(date) }"
      )
        router-link(:to='{name: "calendar_week", params: { year: getYear(date), week: getWeek(date) } }')
          div(class='card' :id='"calendar-day-" + date')
            div(class='card-body')
              h5(class='card-title row justify-content-between')
                span(class='col') {{ date | moment('D') }}

                span(class='col-auto')
                  small(v-if='dayDetails.holiday_hours' v-b-tooltip title="Holiday") 🌐
                  small(v-if='dayDetails.leave_hours' v-b-tooltip title="Leave") 🏖️

              div(class='card-text text-right')
                small
                  strong {{ dayDetails.total_hours | round }}
                  | &nbsp;/ {{ dayDetails.work_hours | round }} hours
</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';
import moment from 'moment';
import _ from 'lodash';
import ToastMixin from './mixins/ToastMixin.vue';

export default {
  name: 'Month',

  mixins: [
    ToastMixin,
  ],

  data () {
    return {
      date: null,
      rangeInfo: null,
      weekDays: _.range(7).map(x => moment().day(x + 1).format('dddd')),
    }
  },

  components: {
  },

  watch: {
    '$route': function(to, from) {
      this.setDate()
      this.reloadData()
    },
  },

  created: function () {
    this.setDate()
    this.reloadData()
  },

  methods: {
    sortByKey: function(obj) {
      let res = {}
      Object.keys(obj).sort().forEach(key => {
        res[key] = obj[key]
      })
      return res
    },

    selectNextMonth: function() {
      let new_date = moment(this.date).add(1, 'month')

      this.$router.push({
        name: 'calendar_month',
        params: {
          month: new_date.format('MM'),
          year: new_date.format('YYYY')
        }
      })
    },

    selectPreviousMonth: function() {
      let new_date = moment(this.date).subtract(1, 'month')

      this.$router.push({
        name: 'calendar_month',
        params: {
          month: new_date.format('MM'),
          year: new_date.format('YYYY')
        }
      })
    },

    setDate: function() {
      this.date = moment({
        year: this.$route.params.year,
        month: this.$route.params.month - 1
      }).startOf('month')
    },

    reloadData: function() {
      let start = moment(this.date).startOf('month')
      let end = moment(this.date).endOf('month')

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/services/range_info/',
        params: {
          'from': start.format('YYYY-MM-DD'),
          'until': end.format('YYYY-MM-DD'),
          'daily': true
        }
      }).then(res => {
        this.rangeInfo = res.data
      })
    },

    getDayOfWeek: function(day) {
      return (this.dayOffset + day) % 7
    },

    isCurrentDay: function(val) {
      return moment().format('YYYY-MM-DD') == moment(val).format('YYYY-MM-DD')
    },

    isWorkingDay: function(val) {
      return this.rangeInfo.details[val].work_hours
    },

    isDayComplete: function(val) {
      return this.rangeInfo.details[val].remaining_hours === 0
    },

    getYear: function(val) {
      return moment(val).isoWeekYear()
    },

    getWeek: function(val) {
      return moment(val).isoWeek()
    },
  },

  computed: {
    dayOffset: function() {
      let dow = moment(this.date).date(1).day()

      if (dow == 0) {
        dow = 7
      }

      return dow - 1
    },
  },

  filters: {
    round: function(val) {
      return Math.round(val * 100) / 100
    },
  },
}
</script>

<style lang="less" scoped>
.calendar-day {
  padding: 0 5px 5px;

  @media all and (min-width: 768px) {
    width: 14.2857%;
    float: left;
    min-height: 3rem;
    display: block;
  }

  > a {
    color: inherit;
    text-decoration: initial;
  }
}

.calendar-day-nowork {
  .card {
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }
  }
}

.calendar-day-complete {
  .card {
    border-color: rgba(0, 215, 0, 0.5);
  }
}

.calendar-day-incomplete {
  .card {
    border-color: rgba(215, 0, 0, 0.5);
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
