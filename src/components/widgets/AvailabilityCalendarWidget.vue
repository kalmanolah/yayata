<template lang="pug">
div(v-if='availability')
  div(class='card card-top-blue mb-3')
    div(class='card-header text-center d-flex justify-content-between')
      span(title='Select previous month')
        i(class='fa fa-chevron-left chevron' @click='selectPreviousMonth')
      | 👔 Availability for {{ date | moment('MMMM YYYY') }}
      span(title='Select next month')
        i(class='fa fa-chevron-right chevron' @click='selectNextMonth')
    div(class='card-body text-center')
      div(class='row no-gutters')
        div(v-for='weekDay in weekDays' class='col')
          strong {{ weekDay }}
      div(class='row no-gutters')
        div(v-for='n in startDayOffset' class='col')
        template(v-for='(day_data, day, idx) in sortByKey(availability)')
          div(v-if='(getDayOfWeek(day) == 1) && (idx)' class='w-100')
            hr(class='my-0')
          div(class='col calendar-day')
            span(v-bind:class='{"font-weight-bold text-primary": isToday(day)}') {{ day | moment('DD') }}
            br
            template(v-if='!day_data.work_hours')
              span(title='Not working') 💤
            template(v-else v-if='day_data.holidays.length')
              span(title='Holiday') 🌐
            template(v-else v-if='day_data.leave.length')
              span(title='Leave') 🏖️
            template(v-else v-if='day_data.sickness.length')
              span(title='Sickness') 😷
        div(v-for='n in endDayOffset' class='col')
</template>

<script>
import moment from 'moment';
import * as types from '../../store/mutation-types';
import store from '../../store';
import utils from '../../utils';
import _ from 'lodash';

export default {
  name: 'AvailabilityCalendarWidget',

  props: [
    'user',
  ],

  watch: {
    date: function(to, from) {
      this.reloadData()
    },

    user: function(to, from) {
      this.reloadData()
    }
  },

  data () {
    return {
      weekDays: [...Array(7).keys()].map(x => moment().day(x + 1).format('ddd')),
      date: moment().startOf('month'),
      availability: null,
    }
  },

  created: function() {
    this.reloadData()
  },

  methods: {
    sortByKey: utils.sortByKey,

    selectNextMonth: function() {
      this.date = moment(this.date).add(1, 'month')
    },

    selectPreviousMonth: function() {
      this.date = moment(this.date).subtract(1, 'month')
    },

    reloadData: function() {
      let start = moment(this.date).startOf('month')
      let end = moment(this.date).endOf('month')

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/range_availability/',
        params: {
          from: start.format('YYYY-MM-DD'),
          until: end.format('YYYY-MM-DD'),
          user: this.user.id,
        }
      }).then(res => {
        this.availability = res.data[this.user.id]
      })
    },

    getDayOfWeek: function(val) {
      return moment(val).format('d')
    },

    isToday: function(val) {
      return moment().format('YYYY-MM-DD') == moment(val).format('YYYY-MM-DD')
    }
  },

  computed: {
    startDayOffset: function() {
      let dow = moment(this.date).date(1).day()

      if (dow == 0) {
        dow = 7
      }

      return dow - 1
    },

    endDayOffset: function() {
      let dow = moment(this.date).endOf('month').day()

      if (dow == 0) {
        dow = 7
      }

      return 6 - (dow - 1)
    },
  }
}
</script>

<style lang="less" scoped>
.chevron {
  color: #0aa6c9;

  &:hover {
    cursor: pointer;
  }
}
</style>
