<template lang="pug">
div
  div(class='row justify-content-between align-items-center')
    div(class='col-lg-auto text-center')
      div(class='btn-group' role='group')
        button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectPreviousMonth()')
          i(class='fa fa-angle-double-left')
          | &nbsp;Previous
        button(class='btn btn-sm btn-outline-dark disabled' type='button')
          | {{ date | moment('MMMM YYYY') }}
        button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectNextMonth()')
          | Next&nbsp;
          i(class='fa fa-angle-double-right')

    div(class='col-lg-auto text-center')
      hr(class='d-lg-none')

      div(class='btn-group' role='group')
        button(class='btn btn-outline-dark btn-sm' v-if='timesheet && (timesheet.status === "active")' @click='submitTimesheet()') Submit
        button(class='btn btn-outline-dark btn-sm' v-if='timesheet' @click='editAttachment()')
          | Attachments
          span(v-if='timesheet.attachments.length') &nbsp;({{ timesheet.attachments.length }})
        button(class='btn btn-outline-dark btn-sm' v-if='timesheet && (timesheet.status === "active") && rangeInfo' @click='bulkAdd()') Bulk add
  hr

  b-modal(ref='bulkAddModal' hide-header=true hide-footer=true lazy=true size='lg')
    BulkAddWidget(
      :timesheet='timesheet'
      :range-info='rangeInfo'
      v-on:success='onBulkAdded()'
    )

  b-modal(ref='timesheetSubmissionModal' hide-header=true hide-footer=true lazy=true size='lg')
    TimesheetSubmissionWidget(
      :timesheet='timesheet'
      v-on:success='onTimesheetSubmitted()'
    )

  b-modal(ref='attachmentModal' hide-header=true hide-footer=true lazy=true size='lg')
    AttachmentWidget(
      :timesheet='timesheet'
      v-on:success='onAttachmentModified()'
    )

  div(v-if='rangeInfo')
    div
      strong Total:&nbsp;
      | {{ rangeInfo.total_hours | round }} / {{ rangeInfo.work_hours | round }} hours

    hr

    div(class='weekdays calendar-row row')
      div(class='calendar-day col-md d-none d-md-block' v-for='weekDay in weekDays') {{ weekDay }}
      div(class="w-100")
      div(class='calendar-day calendar-day-filler col-md' v-for='n in startDayOffset')

      template(v-for='(dayDetails, date) in sortByKey(rangeInfo.details)')
        div(
          class='calendar-day col-md'
          v-bind:class="getCalendarDayClasses(date)"
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

        div(v-if='getDayOfWeek(date) == 0' class='w-100')
      div(class='calendar-day col-md' v-for='n in endDayOffset')
</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';
import moment from 'moment';
import _ from 'lodash';
import BulkAddWidget from './widgets/BulkAddWidget.vue';
import TimesheetSubmissionWidget from './widgets/TimesheetSubmissionWidget.vue';
import AttachmentWidget from './widgets/AttachmentWidget.vue';

export default {
  name: 'Month',

  mixins: [
  ],

  data () {
    return {
      date: null,
      rangeInfo: null,
      weekDays: _.range(7).map(x => moment().day(x + 1).format('dddd')),
    }
  },

  components: {
    BulkAddWidget,
    TimesheetSubmissionWidget,
    AttachmentWidget,
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

    new Promise((resolve, reject) => {
      if (!store.getters.my_timesheets) {
        store.dispatch(types.NINETOFIVER_RELOAD_MY_TIMESHEETS).then(() => resolve())
      } else{
        resolve()
      }
    })
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

    getDayOfWeek: function(val) {
      return moment(val).format('d')
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

    getCalendarDayClasses: function(date) {
      let isComplete = this.isDayComplete(date)
      let isCurrent = this.isCurrentDay(date)
      let isWorking = this.isWorkingDay(date)

      return {
        'calendar-day-current': isCurrent,
        'calendar-day-nowork': !isWorking,
        'calendar-day-complete': isComplete,
        'calendar-day-incomplete': !isComplete,
      }
    },

    getYear: function(val) {
      return moment(val).isoWeekYear()
    },

    getWeek: function(val) {
      return moment(val).isoWeek()
    },

    bulkAdd: function() {
      this.$refs.bulkAddModal.show()
    },

    onBulkAdded: function() {
      this.$refs.bulkAddModal.hide()
      this.reloadData()
    },

    submitTimesheet: function() {
      this.$refs.timesheetSubmissionModal.show()
    },

    onTimesheetSubmitted: function() {
      this.$refs.timesheetSubmissionModal.hide()
      store.dispatch(types.NINETOFIVER_RELOAD_MY_TIMESHEETS)
    },

    editAttachment: function() {
      this.$refs.attachmentModal.show()
    },

    onAttachmentModified: function() {
      // this.$refs.attachmentModal.hide()
      store.dispatch(types.NINETOFIVER_RELOAD_MY_TIMESHEETS)
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

    timesheet: function() {
      if (store.getters.my_timesheets) {
        return store.getters.my_timesheets.filter(timesheet => {
          return (timesheet.year == moment(this.date).format('YYYY')) && (timesheet.month == moment(this.date).format('MM'))
        })[0]
      }
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
@calendar-day-padding: 5px;

.calendar-row {
  margin-left: -(@calendar-day-padding);
  margin-right: -(@calendar-day-padding);
}

.calendar-day {
  padding-bottom: @calendar-day-padding;
  padding-left: @calendar-day-padding;
  padding-right: @calendar-day-padding;

  .card {
    border-top-width: 3px;
  }

  &.calendar-day-filler {
    display: none;
  }

  @media all and (min-width: 768px) {
    // width: 14.2857%;
    // float: left;
    min-height: 3rem;
    overflow: auto;
    // display: block;

    .card {
      min-height: 3rem;
    }

    &.calendar-day-filler {
      display: inherit;
    }
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
