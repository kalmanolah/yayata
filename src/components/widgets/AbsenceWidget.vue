<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center d-flex justify-content-between')
    span(title='Go to previous day')
      i(class='fa fa-chevron-left chevron' @click='dayEarlier')
    | 😷🌴 Absences for {{ selectedDay | moment('MMMM Do') }}
    span(title='Go to next day')
      i(class='fa fa-chevron-right chevron' @click='dayLater')

  table(class='table my-0' v-if='leaves.length')
    tbody
      tr(v-for="(leave, index) in leaves" v-bind:key="leave.id")
        td
          router-link(:to='{ name: "colleagues", params: { userId: leave.user.id }}') {{ leave.user.display_label }}
        td(class='text-right') {{ leave.leave_type.display_label }}

  table(class='table my-0' v-if='holidays.length')
    tbody
      tr(v-for='holiday in holidays')
        td 🌐 {{ holiday.display_label }}
        td(class='text-right') {{ holiday.country }}

  div(class='card-body text-center' v-if='!holidays.length && !leaves.length') Everyone's present! 🙂
</template>

<script>
import moment from 'moment';
import * as types from '../../store/mutation-types';
import store from '../../store';

export default {
  name: 'AbsenceWidget',

  data () {
    return {
      selectedDay: null,
      leaves: [],
      holidays: []
    }
  },

  created: function() {
    this.selectedDay = moment()
  },

  methods: {
    dayEarlier: function() {
      let orig = this.selectedDay
      orig.subtract(1, 'days')
      this.selectedDay = null
      this.selectedDay = orig
    },

    dayLater: function() {
      let orig = this.selectedDay
      orig.add(1, 'days')
      this.selectedDay = null
      this.selectedDay = orig
    },
  },

  watch: {
    selectedDay: function() {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/leaves/',
        params: {
          status: 'approved',
          leavedate__range: this.selectedDay.format('YYYY-MM-DDT00:00:00') + ',' + this.selectedDay.format('YYYY-MM-DDT23:59:59')
        }
      }).then((res) => {
        this.leaves = res.data.results
      });

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/holidays/',
        params: {
          date: this.selectedDay.format('YYYY-MM-DD')
        }
      }).then((res) => {
        this.holidays = res.data.results
      })
    }
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
