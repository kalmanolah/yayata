<template lang="pug">
div
  div(class='row')
    div(class='col')
      //- WARNING
      div(class='alert alert-warning card-top-red mb-3' v-if='openTimesheetCount > 0')
        div(class='text-center') You have {{ openTimesheetCount }} due timesheet(s).

  div(class='row')
    div(class='col-xl-6')
      //- PERFORMANCE FORM
      div(class='card card-top-blue mb-3')
        div(class='card-header text-center') ⏳ Log performance
        div(class='card-body')
          PerformanceForm(:properties='{user: user}')

      //- TIMESHEETS
      div(class='card card-top-blue mb-3')
        div(class='card-header text-center') 📝 Timesheet for&nbsp;
          router-link(:to='{ name: "calendar_month_redirect" }') {{ today | moment('MMMM YYYY') }}

        table(class='table my-0')
          tbody(v-if='contracts && user')
            tr(v-for="(c, index) in contracts")
              td {{ c.customerName }} {{ c.name }}
              td(class='text-right') {{ c.monthly_duration }} hours

            tr(v-if='monthInfo')
              th Total Performed
              td(class='text-right') {{ monthInfo.performed_hours | roundHoursFilter }} hours</strong>

            tr(v-if='monthInfo')
              td Work required
              td(class='text-right') {{ monthInfo.work_hours | roundHoursFilter }} hours</strong>

            tr(v-if='monthInfo')
              td Leave taken
              td(class='text-right') {{ monthInfo.leave_hours | roundHoursFilter }} hours</strong>

            tr(v-if='monthInfo')
              td Holidays
              td(class='text-right') {{ monthInfo.holiday_hours | roundHoursFilter }} hours</strong>

            tr(v-if='monthInfo')
              th Remaining
              td(class='text-right') {{ monthInfo.remaining_hours | roundHoursFilter }} hours</strong>

    div(class='col-xl-6')
      //- ABSENT COLLEAGUES
      div(class='card card-top-blue mb-3')
        div(class='card-header text-center d-flex justify-content-between')
          span(title='Go to previous day')
            i(class='fa fa-chevron-left chevron-l chevron' @click='dayEarlierAbsences')
          | 😷🌴 Absences for {{ selectedAbsenceDay | moment('MMMM Do') }}
          span(title='Go to next day')
            i(class='fa fa-chevron-right chevron-r chevron' @click='dayLaterAbsences')

        table(class='table my-0' v-if='leavesSelectedDay.length')
          tbody
            tr(v-if='leavesSelectedDay' v-for="(leave, index) in leavesSelectedDay" v-bind:key="leave.id")
              td
                router-link(:to='{ name: "colleagues", params: { userId: leave.user.id }}') {{ leave.user.display_label }}
              td(class='text-right') {{ leave.leave_type.display_label }}

        table(class='table my-0' v-if='holidaysSelectedDay.length')
          tbody
            tr(v-if='holidays' v-for='holiday in holidaysSelectedDay')
              td 🌐 {{ holiday.display_label }}
              td(class='text-right') {{ holiday.country }}

        div(class='card-body text-center' v-if='!holidaysSelectedDay.length && !leavesSelectedDay.length') Everyone's present! 🙂

      //- BIRTHDAYS
      div(class='card card-top-blue mb-3')
        div(class='card-header text-center d-flex justify-content-between')
          span(title='Go to previous day')
            i(class='fa fa-chevron-left chevron-l chevron' @click='dayEarlierBirthdays')
          | 🎂 Birthdays for {{ selectedBirthdayDay | moment('MMMM Do') }}
          span(title='Go to next day')
            i(class='fa fa-chevron-right chevron-r chevron' @click='dayLaterBirthdays')
        ul(class='list-group list-group-flush')
          router-link(
            v-for='(user, index) in birthdaysSelectedDay'
            :to='{ name: "colleagues", params: { userId: user.id }}'
            class='list-group-item'
          ) {{ user.display_label }}
        div(class='card-body text-center' v-if='!birthdaysSelectedDay.length') Nothing to see here. 😞

      //- Leaverequest form
      div(class='card card-top-blue mb-3')
        div(class='card-header text-center') 🏖️ Request leave
        div(class='card-body')
          LeaveRequestForm
</template>

<script>
import store from '../store';
import * as types from '../store/mutation-types';
import moment from 'moment';
import LeaveRequestForm from './forms/LeaveRequestForm.vue';
import PerformanceForm from './forms/PerformanceForm.vue';


export default {
  name: 'dashboard',

  components: {
    LeaveRequestForm,
    PerformanceForm
  },

  data () {
    return {
      today: moment(),
      selectedAbsenceDay: null,
      selectedBirthdayDay: null,
      leavesSelectedDay: []
    }
  },

  created: function () {
    if (!store.getters.month_info)
      store.dispatch(types.NINETOFIVER_RELOAD_MONTH_INFO)
    if (!store.getters.users)
      store.dispatch(types.NINETOFIVER_RELOAD_USERS)
    if (!store.getters.holidays)
      store.dispatch(types.NINETOFIVER_RELOAD_HOLIDAYS)

    this.selectedAbsenceDay = moment()
    this.selectedBirthdayDay = moment()
  },

  computed: {
    holidaysSelectedDay: function() {
      return this.holidays ? this.holidays.filter((holiday) => {
        return moment(holiday.date).format('MM-DD-YYYY') === moment(this.selectedAbsenceDay).format('MM-DD-YYYY');
      }) : [];
    },

    birthdaysSelectedDay: function() {
      return this.users ? this.users.filter((user) => {
        return user.userinfo && user.userinfo.birth_date &&
          (moment(user.userinfo.birth_date).format('MM-DD-YYYY') === this.selectedBirthdayDay.format('MM-DD-YYYY'));
      }) : [];
    },

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
      return store.getters.users
    },

    holidays: function() {
      return store.getters.holidays
    },

    openTimesheetCount: function() {
      return store.getters.open_timesheet_count
    },

    monthInfo: function() {
      return store.getters.month_info
    },

    workSchedule: function() {
      return store.getters.user_work_schedule
    }
  },

  filters: {
    realisticNumberFilter: function(val) {
      return val >= 0 ? val : 0;
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
    dayEarlierAbsences: function() {
      let orig = this.selectedAbsenceDay
      orig.subtract(1, 'days')
      this.selectedAbsenceDay = null
      this.selectedAbsenceDay = orig
    },

    dayLaterAbsences: function() {
      let orig = this.selectedAbsenceDay
      orig.add(1, 'days')
      this.selectedAbsenceDay = null
      this.selectedAbsenceDay = orig
    },

    dayEarlierBirthdays: function() {
      let orig = this.selectedBirthdayDay
      orig.subtract(1, 'days')
      this.selectedBirthdayDay = null
      this.selectedBirthdayDay = orig
    },

    dayLaterBirthdays: function() {
      let orig = this.selectedBirthdayDay
      orig.add(1, 'days')
      this.selectedBirthdayDay = null
      this.selectedBirthdayDay = orig
    },
  },

  watch: {
    selectedAbsenceDay: function() {
      var range = this.selectedAbsenceDay.format('YYYY-MM-DDT00:00:00') + ',' + this.selectedAbsenceDay.format('YYYY-MM-DDT23:59:59')
      var options = {
        path: '/leaves/',
        params: {
          status: 'approved',
          leavedate__range: range
        }
      }

      store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
        this.leavesSelectedDay = res.data.results
      });
    }
  }

}
</script>

<style lang='less'>
.chevron-l {
  margin-right: 4rem;
}

.chevron-r {
  margin-left: 4rem;
}
.chevron {
  color: #0aa6c9;
}

.chevron:hover {
  cursor: pointer;
}
</style>
