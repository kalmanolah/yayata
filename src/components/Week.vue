<template lang="pug">
div
  div(class='row justify-content-between')
    div(class='col')
      div(class='btn-group' role='group')
        button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectPreviousWeek()')
          i(class='fa fa-angle-double-left')
          | &nbsp;Previous
        button(class='btn btn-sm btn-outline-dark disabled' type='button')
          | {{ date | moment('Wo [week of] YYYY') }}
        button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectNextWeek()')
          | Next&nbsp;
          i(class='fa fa-angle-double-right')


    div(class='col-auto')
      div(class='btn-group' role='group')
        router-link(
          class="btn btn-sm btn-outline-dark"
          :to='{name: "calendar_month", params: { year: date.format("YYYY"), month: date.format("MM") } }'
        ) {{ date | moment('MMMM YYYY') }}
        router-link(
          v-if='moment(date).add(6, "day").format("YYYY-MM") != date.format("YYYY-MM")'
          class="btn btn-sm btn-outline-dark"
          :to='{name: "calendar_month", params: { year: moment(date).add(6, "day").format("YYYY"), month: moment(date).add(6, "day").format("MM") } }'
        ) {{ moment(date).add(6, "day") | moment('MMMM YYYY') }}

  hr

  b-modal(ref='performanceModal' hide-header=true hide-footer=true lazy=true)
    PerformanceWidget(
      :performance='selectedPerformance'
      :day='selectedDay'
      :timesheet='selectedTimesheet'
      :duration='selectedDuration'
      v-on:success='onPerformanceModified()'
    )

  b-modal(ref='standbyModal' hide-header=true hide-footer=true lazy=true)
    StandbyWidget(
      :day='selectedDay'
      :timesheet='selectedTimesheet'
      :performances='selectedStandby'
      v-on:success='onStandbyModified()'
    )

  div(v-if='rangeInfo')
    div
      strong Total:&nbsp;
      | {{ rangeInfo.total_hours | round }} / {{ rangeInfo.work_hours | round }} hours

    hr

    div
      div(
        class='calendar-day'
        v-for='(dayDetails, date) in sortByKey(rangeInfo.details)'
        v-bind:class="{ 'calendar-day-current': isCurrentDay(date), 'calendar-day-nowork': !isWorkingDay(date), 'calendar-day-complete': isDayComplete(date), 'calendar-day-incomplete': !isDayComplete(date) }"
      )
        div(class='card' :id='"calendar-day-" + date')
          div(class='card-header text-center') {{ date | moment('ddd, MMMM Do') }}

          ul(class='list-group list-group-flush' )
            li(class='list-group-item p-2' v-for='holiday in dayDetails.holidays')
              div(class='d-flex mb-0 justify-content-between')
                div {{ holiday.display_label }}
                div 🌐

          ul(class='list-group list-group-flush')
            li(class='list-group-item p-2' v-for='leave in dayDetails.leaves')
              div(class='d-flex justify-content-between')
                div {{ leave.leave_type.display_label }}
                div 🏖️
              div(v-for='leave_date in leave.leavedate_set' v-if='isSameDay(leave_date.starts_at, date)' class='text-muted')
                small {{ leave_date.starts_at | moment('HH:mm') }} - {{ leave_date.ends_at | moment('HH:mm') }}
              div(v-if='leave.description' class='text-muted')
                small {{ leave.description }}

          ul(class='list-group list-group-flush')
            li(
              class='list-group-item list-group-item-action p-2 cursor-pointer'
              v-for='performance in dayDetails.performances'
              v-on:click.prevent='getTimesheetForDay(date) ? editPerformance(date, performance) : null'
            )
              div(class='d-flex justify-content-between')
                div {{ performance.contract.display_label }}
                div {{ performance.duration | round }}h
              div(class='d-flex justify-content-between text-muted')
                small {{ performance.contract_role.display_label }}
                small {{ performance.performance_type.display_label }}
              div(v-if='performance.description' class='text-muted')
                vue-markdown(class='rendered-markdown' :source='performance.description')

          div(class='card-body p-0')
          div(class='card-text p-2 justify-content-center d-flex' v-if='getTimesheetForDay(date)')
            div(class='btn-group')
              button(class='btn btn-outline-dark btn-sm' @click='addPerformance(date)' v-b-tooltip title='Log performance')
                | ⏳
              button(
                v-if='supportContracts && supportContracts.length'
                class='btn btn-outline-dark btn-sm'
                v-b-tooltip title='Standby / On-call'
                @click='editStandby(date)'
              )
                | 💤

          div(class='card-footer text-center')
            small
              strong {{ dayDetails.total_hours | round }}
              | &nbsp;/ {{ dayDetails.work_hours | round }} hours
</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';
import moment from 'moment';
import VueMarkdown from 'vue-markdown';
import PerformanceWidget from './widgets/PerformanceWidget.vue';
import StandbyWidget from './widgets/StandbyWidget.vue';

export default {
  name: 'Week',

  mixins: [],

  components: {
    VueMarkdown,
    PerformanceWidget,
    StandbyWidget,
  },

  data () {
    return {
      date: null,
      weekDays: _.range(7).map(x => moment().day(x + 1).format('dddd')),
      rangeInfo: null,
      selectedPerformance: null,
      selectedStandby: null,
      selectedTimesheet: null,
      selectedDuration: null,
      selectedDay: null,
    }
  },

  watch: {
    '$route': function(to, from) {
      this.setDate()
      this.reloadData()
    },
  },

  created: function() {
    this.setDate()
    this.reloadData()

    new Promise((resolve, reject) => {
      if (!store.getters.my_open_timesheets) {
        store.dispatch(types.NINETOFIVER_RELOAD_MY_OPEN_TIMESHEETS).then(() => resolve())
      } else{
        resolve()
      }
    })

    new Promise((resolve, reject) => {
      if (!store.getters.my_contracts) {
        store.dispatch(types.NINETOFIVER_RELOAD_MY_CONTRACTS).then(() => resolve())
      } else{
        resolve()
      }
    })
  },

  computed: {
    supportContracts: function() {
      if (store.getters.my_contracts) {
        return store.getters.my_contracts.filter(contract => {
          return contract.type == 'SupportContract'
        })
      }
    }
  },

  methods: {
    moment: function(args) {
      return moment(args)
    },

    sortByKey: function(obj) {
      let res = {}
      Object.keys(obj).sort().forEach(key => {
        res[key] = obj[key]
      })
      return res
    },

    selectNextWeek: function() {
      let new_date = moment(this.date).add(1, 'week')

      this.$router.push({
        name: 'calendar_week',
        params: {
          week: new_date.format('WW'),
          year: new_date.format('GGGG')
        }
      })
    },

    selectPreviousWeek: function() {
      let new_date = moment(this.date).subtract(1, 'week')

      this.$router.push({
        name: 'calendar_week',
        params: {
          week: new_date.format('WW'),
          year: new_date.format('GGGG')
        }
      })
    },

    setDate: function() {
      this.date = moment().isoWeekYear(this.$route.params.year).isoWeek(this.$route.params.week).startOf('isoWeek')
    },

    reloadData: function() {
      let start = moment(this.date).startOf('isoWeek')
      let end = moment(this.date).endOf('isoWeek')

      // Reload range info
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/services/range_info/',
        params: {
          'from': start.format('YYYY-MM-DD'),
          'until': end.format('YYYY-MM-DD'),
          'daily': true,
          'detailed': true
        }
      }).then(res => {
        this.rangeInfo = res.data
      })
    },

    isCurrentDay: function(val) {
      return moment().format('YYYY-MM-DD') == moment(val).format('YYYY-MM-DD')
    },

    isSameDay: function(valOne, valTwo) {
      return moment(valOne).format('YYYY-MM-DD') == moment(valTwo).format('YYYY-MM-DD')
    },

    isWorkingDay: function(val) {
      return this.rangeInfo.details[val].work_hours
    },

    isDayComplete: function(val) {
      return this.rangeInfo.details[val].remaining_hours === 0
    },

    getTimesheetForDay: function(date) {
      if (store.getters.my_open_timesheets) {
        return store.getters.my_open_timesheets.filter(timesheet => {
          return (timesheet.status == 'active') && (timesheet.year == moment(date).format('YYYY')) && (timesheet.month == moment(date).format('MM'))
        })[0]
      }
    },

    selectDay: function(date) {
      this.selectedTimesheet = this.getTimesheetForDay(date)
      this.selectedDay = moment(date).date()
      this.selectedDuration = Math.round(this.rangeInfo.details[date].remaining_hours, 2)
    },

    editStandby: function(date) {
      this.selectDay(date)
      this.selectedStandby = null
      this.$refs.standbyModal.show()
    },

    onStandbyModified: function() {
      this.$refs.standbyModal.hide()
      this.selectedStandby = null
    },

    editPerformance: function(date, performance) {
      this.selectDay(date)
      this.selectedPerformance = performance
      this.$refs.performanceModal.show()
    },

    addPerformance: function(date) {
      this.selectDay(date)
      this.$refs.performanceModal.show()
    },

    onPerformanceModified: function() {
      this.$refs.performanceModal.hide()
      this.selectedPerformance = null
      this.reloadData()
    }
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

    .card {
      min-height: 30rem;
    }
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

.cursor-pointer {
  cursor: pointer;
}
</style>
