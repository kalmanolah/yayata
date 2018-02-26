<template lang="pug">
.calendar

  //- Header and control buttons
  .row
    .col
    .col-6.text-sm-center
      h1 {{ selectedYear }} Week {{ selectedWeek }}
    .col.align-self-center.text-right
      .btn-group(
        role='group'
        v-if='!userId'
      )
        button(
          class='btn btn-outline-dark'
          type='button'
          v-on:click.prevent='selectPreviousWeek()'
        )
          i(class='fa fa-angle-double-left')
          |  &nbsp;Previous
        button(
          class='btn btn-outline-dark'
          type='button'
          v-on:click.prevent='selectNextWeek()'
        )
          | Next&nbsp;
          i(class='fa fa-angle-double-right')


  //- Getting the months now shown and allowing routing back to where you came from
  .row
    .col.text-center
      .row.justify-content-center
        .col-auto.text-center
          router-link(:to='{ name: "calendar_month", params: { year: selectedYear, month: periodStartMonth.month()+1, user: selectedUser } }')
            h2 {{ periodStartMonth | moment('MMMM')}}
        .col-auto.text-center
          router-link(v-if='periodEndMonth.month() != periodStartMonth.month()' :to='{ name: "calendar_month", params: { year: selectedYear, month: periodEndMonth.month()+1, user: selectedUser } }')
            h2 {{ periodEndMonth | moment('MMMM')}}

      hr

  //- Buttons to toggle what to display
  .row.justify-content-center
    .btn-group-wrap
      .btn-group.week-format-buttons
        button.btn.btn-outline-dark(v-on:click='setWeekFormat("workweek")') Workweek
        button.btn.btn-outline-dark(v-on:click='setWeekFormat("weekend")') Weekend
        button.btn.btn-outline-dark(v-on:click='setWeekFormat("fullweek")') Full week

  //- Cards
  .calendar-header

    //- Header
    .card-group.card-group--week-performance
      .card(v-for='(weekDay, i) in daysOfWeek')

        .card-header.bg-info.text-white
          .row.justify-content-between.text-center

            h6.col-12.pl-1.pr-1
              strong {{ weekDay | moment('dddd') }}

            h5.col-md-12
              strong {{ weekDay | moment('DD/MM') }}

            .col-md-12.pl-1.pr-1
              .row.justify-content-center
                //- Standby
                //- button.btn.btn-outline-primary.card-header-button(@click='toggleStandby(weekDay)', :class='getStandbyButtonStyle(weekDay)')
                //-   i.fa.fa-phone

                //- Whereabouts
                template.col
                  b-popover(triggers='hover' placement='top' class='hidden-md-down')
                    hovercard(:id='"hc_whereabout_" + i', :component='getHoverCardComponent("LocationSelect", {"date": weekDay, "timesheet": getTimesheetForDay(weekDay)})', @success='onSubmitSuccess')
                      button.btn.btn-outline-primary.card-header-button
                        i.fa.fa-building-o
                    div(slot='content')
                      template(v-for='whereabout in getLocation(weekDay)')
                        div {{ whereabout }}

        //- Performance creation is disabled for future activityPerformances
        .card-head-foot.text-center(v-if='weekDay.month() < new Date().getMonth() + 1')
          //- Check if timesheet status is active
          template(v-if='getTimesheetStatus(weekDay)')

            hovercard(:id='"hc_submit_" + i', :component='getHoverCardComponent("PerformanceForm", {"date": weekDay, "user": selectedUser})', @success='onSubmitSuccess')

              //- Visible text
              button.btn.btn-success.btn-submit
                i.fa.fa-plus

          //- CALCULATED FROM WITHIN THE MIXIN
          small.text-muted
            | {{ getDurationTotal(weekDay) }}<strong> /
            | {{ getHoursTotal(weekDay) }} h</strong>
          .pull-right.quota__icon
            i.fa(:class='getDailyQuotaStyling(weekDay)')

          hr.smaller-horizontal-hr.smaller-vertical-hr

          //- Body of performances
          .card-block.performance-list
            //- Holidays
            template(v-if='holidays')
              li.list-group-item.leave-entry(
                v-for='holiday in getDaysHolidays(weekDay.date())',
                :class='[list-group, performances-list]'
              )
                .list-group-item-heading {{ holiday.name }}
                .list-group-item-text
                  hr.smaller-vertical-hr
                  small.row.justify-content-between.align-items-center
                    i.fa.fa-university.col
                    .col.ml-auto 8 h

              //- Leaves
              template(v-if='leaves')
                li.list-group-item.leave-entry(
                  v-for='leave in getDaysLeaves(weekDay)',
                  :class='[list-group, performance-list]'
                )
                  .list-group-item-heading
                    .row
                      .col {{ leave.leave_type.display_label }}
                        b-tooltip.badge.badge-warning.pull-right(v-if="leave.status=='pending'", :content='leave.status')
                          i.fa.fa-exclamation-triangle.p-1

                  .list-group-item-text
                    div {{ leave.description }}
                    hr.smaller-vertical-hr
                    small.row.justify-content-between.align-items-center
                      i.fa.fa-plane.col
                      .col.ml-auto {{ leave.leaveDuration}} h

          //- Check if timesheet status is active
          template( v-if='currentUserSelected && getTimesheetStatus(weekDay)')
            //- Performances
            li.list-group-item.performance-entry(
              v-for='(perf, i) in getDaysPerformances(weekDay.date())',
              :key='perf.id',
              :class='[list-group, performance-list]'
            )
              hovercard(
              :component='getHoverCardComponent("PerformanceForm", {"date": weekDay, "data": perf, "user": selectedUser})',
              @success='onSubmitSuccess'
              )
                //- Visible text
                .list-group-item-heading {{ perf.contract.display_label }}
                .list-group-item-text
                  div {{ perf.description }}
                  hr.smaller-vertical-hr
                  small.row.justify-content-between.align-items-center
                    .col {{ perf.performance_type.display_label }}
                    .col.ml-auto {{ perf.duration }} h

          //- If timesheet status is NOT active
          template(v-else)
            .card-block.performance-list
            li.list-group-item.performance-entry.disabled(
              v-for='(perf, i) in getDaysPerformances(weekDay.date())',
              :key='perf.id',
              :class='[list-group, performance-list]'
            )
              .list-group-item-heading {{ perf.contract.display_label }}
                a(:href="getBackendURL(perf)", :target='_blank')
                  i.fa.fa-pencil-square-o.pull-right
              .list-group-item-text
                div {{ perf.description }}
                hr.smaller-vertical-hr
                small.row.justify-content-between.align-items-center
                  .col {{ perf.performance_type.display_label }}
                  .col.ml-auto {{ perf.duration }} h
</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';
import moment from 'moment';
import HoverCard from './tools/HoverCard.vue';
import PerformanceForm from './forms/PerformanceForm.vue';
import StandbyContractSelect from './StandbyContractSelect.vue';
import LocationSelect from './LocationSelect.vue';
import RequiredPerformedDayMixin from './mixins/RequiredPerformedDayMixin.vue';
import ToastMixin from './mixins/ToastMixin.vue';

export default {
  name: 'week',

  mixins: [
    RequiredPerformedDayMixin,
    ToastMixin,
  ],

  components: {
    hovercard: HoverCard,
    performanceform: PerformanceForm,
    StandbyContractSelect,
    LocationSelect,
  },

  watch: {
    '$route': function(to, from) {
      this.selectedWeek = to.params.week;
      this.selectedYear = to.params.year;
      this.selectUser(to.params.user);
    },

    selectedUser: function(newSelectedUser, oldSelectedUser) {
      this.reloadTimesheets(this.selectedUser);
      store.dispatch(types.NINETOFIVER_RELOAD_STANDBY_PERFORMANCES, {
        params: {
          timesheet__user_id: this.selectedUser.id
        }
      });
      store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACTS, {
        params: {
          contractuser__user__id: this.selectedUser.id
        }
      });
      store.dispatch(types.NINETOFIVER_RELOAD_LEAVES, {
          params: {
            user_id: this.selectedUser.id
          }
      });
      store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, {
        params: {
            contractuser__user__id: this.selectedUser.id
          }
      })
    }
  },

  created: function() {
    let user = store.getters.user;
    if(this.$route.params.user){
      user = this.$route.params.user;
      this.selectUser(user);
    }
    store.dispatch(types.NINETOFIVER_RELOAD_STANDBY_PERFORMANCES);
    if(!store.getters.whereabouts) {
      store.dispatch(types.NINETOFIVER_RELOAD_WHEREABOUTS);
    }
    if(!store.getters.users) {
      store.dispatch(types.NINETOFIVER_RELOAD_USERS);
    }
    if(!store.getters.holidays) {
      store.dispatch(types.NINETOFIVER_RELOAD_HOLIDAYS);
    }
    if(!store.getters.contracts) {
      store.dispatch(types.NINETOFIVER_RELOAD_CONTRACTS);
    }
    if(!store.getters.timesheets) {
      store.dispatch(types.NINETOFIVER_RELOAD_TIMESHEETS);
    }
    if (!store.getters.backend_base_url) {
      store.dispatch(types.NINETOFIVER_RELOAD_BACKEND_BASE_URL)
    }
  },

  computed: {
    user: function() {
      if(store.getters.user) {
        if(!this.$route.params.user){
          this.selectUser(store.getters.user);
        }
        return store.getters.user;
      }
    },
    // User dropdown options
    options: function() {
      if(store.getters.users) {
        return store.getters.users.map(user => {
          return { text: user.display_label, value: user.id }
        });
      }
    },

    users: function() {
      if(store.getters.users) {
        return store.getters.users;
      }
    },

    currentUserSelected: function() {
      if(this.user && this.selectedUser)
        return this.user.id == this.selectedUser.id;
    },

    // Get the holidays for this period
    holidays: function() {
      if(store.getters.holidays && this.periodStartMonth && this.periodEndMonth) {
        return store.getters.holidays.filter((h) => {
          return (
            h.country == store.getters.user.userinfo.country && (
              moment(h.date).month() == this.periodStartMonth.month() ||
              moment(h.date).month() == this.periodEndMonth.month()
            )
          );
        });
      }
    },

    // Get the leaves for the currently authenticated user
    leaves: function() {
      if(store.getters.leaves && this.selectedUser.id)
        return store.getters.leaves.filter((leave) => leave.user.id === this.selectedUser.id );
    },

    // Get the timesheets for this week
    timesheets: function() {
      if(store.getters.timesheets && this.periodStartMonth && this.periodEndMonth) {
        return store.getters.timesheets.filter((ts) => {
          return (ts.year === this.periodStartMonth.year() && ts.month === this.periodStartMonth.month() + 1)
            || (ts.year === this.periodEndMonth.year() && ts.month === this.periodEndMonth.month() + 1);
        });
      }
    },

    // Workschedule is necessary for the mixin to work
    workSchedule: function() {
      if(store.getters.user_work_schedule)
        return store.getters.user_work_schedule;
    },

    //Get the month corresponding with the start of the week
    periodStartMonth: function() {
      var year = this.selectedYear || moment().year();
      var week = this.selectedWeek || moment().isoWeek();

      return moment().isoWeekYear(year).isoWeek(week).startOf('isoWeek');
    },

    //Get the month corresponding with the end of the week
    periodEndMonth: function() {
      var year = this.selectedYear || moment().year();
      var week = this.selectedWeek || moment().isoWeek();

      return moment().isoWeekYear(year).isoWeek(week).endOf('isoWeek');
    },

    // Get the days of week from the currently selected format
    daysOfWeek: function() {
      return this.getDaysOfWeek(this.currentWeekFormat);
    },

    userHasSupportContracts: function() {
      if(store.getters.filtered_contracts) {
        return store.getters.filtered_contracts.filter((c) => c.contract_type == 'SupportContract').length > 0;
      }
    }
  },

  methods: {
    getStandbyButtonStyle: function(weekDay) {
      return this.standbyPerformances.find(sbp => sbp.day === moment(weekDay).date())
        ? 'buttonInverse'
        : '';
    },

    toggleStandby: function(weekDay) {
      // Delete existing standby if user is already on stanby
      if(this.standbyPerformances.find(sbp => sbp.day === moment(weekDay).date())) {
        let standby = this.standbyPerformances.find(sbp => sbp.day === moment(weekDay).date())
        store
          .dispatch(types.NINETOFIVER_API_REQUEST, {
            path: '/my_performances/standby/' + standby.id + '/',
            method: 'DELETE' })
          .then(() => {
            this.showInfoToast('Standby Performance Deleted!')
            store
              .dispatch(types.NINETOFIVER_RELOAD_STANDBY_PERFORMANCES)
              .then(() => this.getDaysOfWeek())})
          .catch(error => this.showDangerToast('Something went wrong. Check console for more information'));
      } else {
        // Create new standby if user is not yet on standby
        store
          .dispatch(types.NINETOFIVER_API_REQUEST, {
            path: '/my_performances/standby/',
            method: 'POST',
            body: {
              timesheet: this.timesheets.find(ts => ts.month === moment(weekDay).month() + 1).id,
              day: moment(weekDay).date() }})
          .then(() => {
            this.showSuccessToast('Standby Performance Created!')
            store
              .dispatch(types.NINETOFIVER_RELOAD_STANDBY_PERFORMANCES)
              .then(() => this.getDaysOfWeek())})
          .catch(error => this.showDangerToast('Something went wrong. Check console for more information'));
      }
    },

    getBackendURL: function(performance) {
      let url = store.getters.backend_base_url;
      return url + "/performance/" + performance.id + "/change";
    },

    reloadTimesheets: function(user) {
      let lowMonth = moment(this.periodStartMonth).month() + 1;
      let highMonth = moment(this.periodEndMonth).month() + 1;
      let lowYear = moment(this.periodStartMonth).year();
      let highYear = moment(this.periodEndMonth).year();
      store.dispatch(types.NINETOFIVER_RELOAD_TIMESHEETS, {
        params: {
          year: this.$route.params.year,
          month__lte: highMonth,
          month__gte: lowMonth,
          year__gte: lowYear,
          year__lte: highYear
        }
      });
    },

    selectUser: function(user) {
      this.selectedUser = user;
    },

    // Gets the timesheet for the day
    getTimesheetForDay: function(day) {
      if(this.timesheets) {
        return this.timesheets.find(ts => ts.month == day.month() + 1);
      }
    },

    // Get the standby performances
    getStandbys: function (day) {
      if(store.getters.standby_performances && store.getters.contracts) {
        let ts = this.getTimesheetForDay(day);

        if(ts) {
          let staPerfs = store.getters.standby_performances.filter(p => {
            if(p.day == day.date() && p.timesheet == ts.id) {
              let contr = store.getters.contracts.find(c => c.id === p.contract.id);
              p.contract_label = contr ? contr.display_label : 'Not found';

              return p;
            }
          });

          return staPerfs.length > 0 ? staPerfs : [{'contract_label': 'Not on standby'}];
        }
      }
    },

    // Get the location from the whereabouts linked to the timesheet
    getLocation: function (day) {
      if(store.getters.whereabouts) {
        let ts = this.getTimesheetForDay(day);

        if(ts) {
          let wAbout = store.getters.whereabouts.find((wa) => {
            return wa.day == day.date() && wa.timesheet == ts.id;
          });

          return wAbout ? {'location': wAbout.location} : {'location': 'No location'};
        }
      }
    },

    // Check if the status for the timesheet is active or not
    getTimesheetStatus: function(day) {
      let ts = this.getTimesheetForDay(day);

      return ts ? ts.status == 'active' : null;
    },

    // Returns a style based on how much the user has logged / is supposed to log per day
    getDailyQuotaStyling: function(day) {
      let performed = this.getDurationTotal(day);
      let required = this.getHoursTotal(day);

      let quota = required > 0 ? (performed / required) : 1;

      return quota >= 1 ? 'fa-check' : '';
    },

    //Returns correct component for the hovercard
    getHoverCardComponent: function(name, data) {
      return {
        name: name,
        properties: data
      };
    },

    createNewTimeSheet: function(day) {
      return store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_timesheets/',
        method: 'POST',
        body: {
          month: day.month() + 1,
          year: day.year(),
          closed: false
        },
        emulateJSON: true,
      }).catch((error) => {
        console.log(error);
        this.showDangerToast('Something went wrong. Check console for more information');
      });
    },

    //Sets the popover placement, based on the weekindex and weekformat
    setPopoverPlacement: function(val) {
      var day = val + 1;
      var range = this.currentWeekFormat.end - this.currentWeekFormat.start + 1;

      return ( day / range >= 0.7 ) ? 'left' : 'right';
    },

    //Set Week format
    setWeekFormat: function(format) {
      this.currentWeekFormat = store.getters.week_formatting[format];
    },

    //When performance properly submitted
    onSubmitSuccess: function() {
      this.getDaysOfWeek(this.currentWeekFormat);
    },

    //Go to specified week, get params from URI
    setSelectedWeek: function (year, week) {
      this.$router.push({
        name: 'calendar_week',
        params: {
          year: year,
          week: week,
          user: this.selectedUser,
        },
      })
    },

    //Push params for next week into route
    selectNextWeek: function () {
      var year = parseInt(this.selectedYear);
      var week = parseInt(this.selectedWeek) + 1;
      this.activityPerformances = [];
      this.standbyPerformances = [];

      if (week > moment().isoWeekYear(year).isoWeeksInYear()) {
        week = 1;
        year++;
      }

      this.setSelectedWeek(year, week)
    },

    //Push params for last week into route
    selectPreviousWeek: function () {
      var year = parseInt(this.selectedYear);
      var week = parseInt(this.selectedWeek) - 1;
      this.activityPerformances = [];
      this.standbyPerformances = [];

      if (week == 0) {
        year--;
        week = moment().isoWeekYear(year).isoWeeksInYear();
      }

      this.setSelectedWeek(year, week)
    },

    //Make the days/week to be drawn
    getDaysOfWeek: function() {
      var week = this.selectedWeek;
      var year = this.selectedYear;
      var index = 0;
      var period = this.currentWeekFormat;
      var daysofweek = [];
      var dayOfWeek = moment().isoWeekYear(year).isoWeek(week).startOf('isoWeek');

      for(var i = 1; i < 8; i++) {
        if(i >= period.start && i <= period.end)
          daysofweek[index++] = dayOfWeek;

        dayOfWeek = moment(dayOfWeek).add(1, ('days'));
      }

      var arr = daysofweek.map(o => { return o.date()  });
      this.makePerformances(arr);

      return daysofweek;
    },

    //Calls performance with correct params
    makePerformances: function(arr) {
      var start, end, month;
      this.activityPerformances = [];
      this.standbyPerformances = [];

      //If the index of the lowest value in the array is not the first,
      //the days are transitioning from one month to the other
      if(arr.indexOf(Math.min.apply(Math, arr)) != 0) {

        //Get index of highest in array (automatically final day of month that)
        var maxIndex = arr.indexOf(Math.max.apply(Math, arr));

        start = arr[0],
        end = arr[maxIndex],
        //Months are zeroindexed in MomentJS, not in our DB
        month = this.periodStartMonth.month() + 1;

        this.callPerformance(month, start, end);

        //Reset the vars for use further below
        start = arr[maxIndex + 1],
        end = arr[arr.length - 1],
        month = this.periodEndMonth.month() + 1;

        this.callPerformance(month, start, end);

      } else {
        start = arr[0],
        end = arr[arr.length - 1],
        month = this.periodStartMonth.month() + 1;

        this.callPerformance(month, start, end);
      }
    },

    //Make the my_performances call & push into arr
    callPerformance: function(month, start, end) {
      let user = this.selectedUser ? this.selectedUser : this.user;
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/performances/',
        params: {
          timesheet__user_id: user.id,
          timesheet__year: this.selectedYear,
          timesheet__month: month,
          day__gte: start,
          day__lte: end,
        },
      }).then((response) => {
        // this.activityPerformances = this.activityPerformances.concat( response.data.results );
        response.data.results.forEach(p => {
          if(p.type === 'StandbyPerformance')
            this.standbyPerformances = this.standbyPerformances.concat(p);
          else if(p.type === 'ActivityPerformance')
            this.activityPerformances = this.activityPerformances.concat(p);
          else
            console.log( p );
        });
      }).catch((error) => {
        console.log(error);
        this.showDangerToast('Something went wrong. Check console for more information');
      });
    },

    //Get the activityPerformances linked to a day
    getDaysPerformances: function(day) {
      let result = [];

      for(let i = 0; i < this.activityPerformances.length; i++)
        if(this.activityPerformances[i].day == day)
          result.push(this.activityPerformances[i]);

      return result.reverse();
    },

  },

  data () {

    return {
      selectedYear: parseInt(this.$route.params.year),
      selectedWeek: parseInt(this.$route.params.week),

      activityPerformances: [],
      standbyPerformances: [],
      currentWeekFormat: store.getters.week_formatting["workweek"],

      selectedUser: null,

      }

  },
}
</script>

<style lang="less" scoped>

.performance-list {
  background-color: #f5f5f5;
  font-size: 95%;
  color: rgb(15,15,15);
  position: relative;
  padding: 0px;

  .list-group-item-heading {
    font-weight: bold;
  }
}


.calendar-header {
  .card {
    background-color: #f8f8f8;
  }
}

.pre-scrollable {
  max-height: 55vh;
  overflow: visible;
}

.performance-entry {
  padding: 5px;
  margin: 2px;
  position: relative;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.08);
}

.leave-entry {
  padding: 5px;
  padding-bottom: 20px;
  margin: 2px;
  position: relative;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.08);
}

.performance-entry.disabled {
  padding-bottom: 20px;
}

.smaller-horizontal-hr {
  margin-left: 6px;
  margin-right: 6px;
}

.smaller-vertical-hr {
  margin-top: 2px;
  margin-bottom: 8px;
}


.card-head-foot {
  position: relative;
  padding: 0px;
  float: none;
  vertical-align: bottom;

  .btn-submit {
    width: 100%;
    border-radius: 0;
  }

  .quota__icon {
    color: rgba(0,0,0,0.5);
    position: relative;
    top: 1px;
    left: -10px;
  }
}

.btn-group-wrap {
    text-align: center;
    margin-bottom: .5rem;
}

div.btn-group {
    margin: 0 auto;
    text-align: center;
    width: inherit;
    display: inline-block;
}

.card-header-button {
  margin-left: 3px;
  margin-bottom: 3px;
  color: #fff;
  border-color: #fff;
}
.card-header-button:hover {
  color: #5bc0de;
  border-color: #5bc0de;
  background: #fff;
}

.buttonInverse {
  color: #5bc0de;
  border-color: #5bc0de;
  background: #fff;
}

.card-group {
  &--week-performance {

    @media (min-width: 992px) {
      display: -ms-flexbox;
      display: flex;
    }

    @media (max-width: 992px) {
      display: inline;
    }
  }
  .card {
    @media (max-width: 992px) {
      margin-bottom: 20px;
    }
  }
}
</style>
