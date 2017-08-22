<template lang="pug">
div(class='calendar')
  //- Quota overview
  .row
    .col
    .col-6.justify-content-center.text-center
      .h6(v-if='month_info') <strong>Total:</strong> {{ month_info.hours_performed }} / {{ month_info.hours_required }}
    .col.align-self-center.text-right
      template(v-if='isAdmin')  
        .btn-group(
          role='group'
          aria-label='Button group with nested dropdown'
        )
          .btn-group
            button.btn.btn-outline-dark.dropdown-toggle#btnUserDrop(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ selectedUser.display_label }}
            .dropdown-menu(aria-labelledby='btnUserDrop')
              a.dropdown-item(v-for='u in users' @click='selectUser(u)') {{ u.display_label }}

  hr

  //- Day-names
  .calendar-header.d-none.d-md-inline(v-for='weekDay in weekDays')
    .calendar-day {{ weekDay }}

  .calendar-body
    //- Dummy day bloc
    .calendar-day.calendar-day-dummy.d-none.d-md-inline.mt-1(v-for='n in dayOffset')

    //- Day-blocks
    .calendar-day.p-1(
      v-for='(n, i) in dayCount'
      v-bind:class='[{ \
        "calendar-day-weekend": isWeekendDay(n), \
        "calendar-day-current": isCurrentDay(n), \
      }, determineLeaveStyle(n)]'
    )

      template
        router-link(:to='{name: "calendar_week", params: { year: getISOYear(n), week: getWeekNumber(n) } }'
                    :event="currentUserSelected ? 'click' : ''"
                    :class="currentUserSelected ? '' : 'unclickable-days'")
          .card.card-block.p-3
            p {{ n }}

              //- Popover showing leaves
              b-popover.float-right(v-if='isExcusedFromWork(n)' triggers='hover' placement='top' class='d-none d-lg-inline')
                i.fa.fa-university(v-if='isHoliday(n)')
                i.fa.fa-plane(v-else-if='getLeaveForDay(n)')
                div.p-2(slot='content')

                  template(v-if='isHoliday(n)')
                    .text-center <strong>Holiday </strong>
                    .text-center {{ isHoliday(n).name }}
                  
                  template(v-for='leave in getLeaveForDay(n)')
                    div.text-center <strong> {{ leave.leave_type }} </strong>
                    div <strong>From: </strong> {{ leave.leave_start | moment('DD MMMM  HH:mm') }}
                    div <strong>Until: </strong> {{ leave.leave_end | moment('DD MMMM  HH:mm') }}

            .row
              .col
                small.badge.float-right(v-bind:class='getDailyQuota(n)' class='d-none d-lg-inline')
                  | {{ getPerformedHours(n) | roundHoursFilter }} /
                  | {{ getRequiredHours(n) | roundHoursFilter}}

</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';
import moment from 'moment';
import RequiredPerformedDayMixin from './mixins/RequiredPerformedDayMixin.vue';

export default {
  name: 'calendar',
  mixins: [RequiredPerformedDayMixin],
  
  watch: {

    // Watches selected user from parent component.
    selectedUser: function(oldUserid, newUserId) {
      this.buildPageInfo();
    },

    selected_month: function(oldUserid, newUserId) {
      this.buildPageInfo();
    },

  },

  created: function () {
    this.buildPageInfo();
  },

  methods: {

    //Requests all data
    buildPageInfo: function() {
      this.reloadEmploymentContracts();
    },

    //Reload the user's employment contracts
    reloadEmploymentContracts: function() {
      if(this.selectedUser || this.user) {
        let ec_user = this.selectedUser.id || this.user.id;

        store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACTS, {
          params: {
            user: ec_user,
            ended_at__isnull: 'True'
          }
        });        
      }
    },

    //Get all leaves for this month
    getLeaves: function(month) {
        //Make param for month's range
        if(this.selectedUser && this.leaveTypes) {
          let startOfMonth = moment().year(this.year).month(month - 1).startOf('month');
          let endOfMonth = moment().year(this.year).month(month - 1).endOf('month');
          let range = startOfMonth.format('YYYY-MM-DDTHH:mm:ss') + ',' + endOfMonth.format('YYYY-MM-DDTHH:mm:ss');

          store.dispatch(types.NINETOFIVER_API_REQUEST, {
            path: '/leaves/',
            params: {
              user_id: this.selectedUser.id,
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

              lv['leave_type'] = !this.leaveTypes ? 'UNKNOWN TYPE' : this.leaveTypes.find(x => {
                return x.id === lv.leave_type; 
              }).display_label;
            });

            this.leaves = response.data.results;
          }, () => {
            this.loading = false;
        });
      }
    },



    //Return style based on quota
    getDailyQuota: function(day) {
      let performed = this.getPerformedHours(day);
      let required = this.getRequiredHours(day);

      let quota = required > 0 ? performed / required : 1;

      return quota >= 1 ? 'badge-success' : quota <= 0.7 ? 'badge-danger' : 'badge-warning';
    },

    //Get hours required per day, based on workschedule, holiday & leave
    getRequiredHours: function(day) {

      if(this.work_schedule && this.month && this.year) {
        let date = moment().year(this.year).month(this.month - 1).date(day);
        return this.getHoursTotal(date);
      }
    },

    //Get hours performed per day
    getPerformedHours: function(day) {
      if(this.work_schedule && this.month && this.year) {
        let date = moment().year(this.year).month(this.month - 1).date(day);
        return this.getDurationTotal(date);
      }
    },

    //Check whether holiday / user is on leave
    isExcusedFromWork: function(day) {
      return this.isHoliday(day) || this.getLeaveForDay(day)[0];
    },

    // Checks whether the day is a holiday
    isHoliday: function(day) {
      if(this.year && this.month){
        let holiday = false;
        let today = moment().year(this.year).month(this.month - 1).date(day);
  
        if(store.getters.employment_contracts) {
          let emplContr = store.getters.employment_contracts.find(ec => {
            return ec.user === this.selectedUser.id;
          });
          if(emplContr && store.getters.companies) {
            let comp = store.getters.companies.find(c => {
              return c.id === emplContr.company;
            });
            if(comp && store.getters.holidays) {
              holiday = store.getters.holidays.find(h => {
                return (today.format('YYYY-MM-DD') == h.date && h.country == comp.country);
              });
            }
          }
        }
  
        return holiday
      }
    }, 

    //Check whether user is on a requested leave on that particular day
    getLeaveForDay: function(day) {
      if(this.year && this.month){
        let today = moment().year(this.year).month(this.month - 1).date(day);
  
        return this.leaves.filter(x => {
          return today.isBetween(x.leave_start, x.leave_end, 'date', '[]');
        });
      }
    },

    //Return style according to leave/no-leave
    determineLeaveStyle: function(day) {
      if(this.isExcusedFromWork(day))
        return this.isCurrentDay(day) ? 'calendar-day-current-on-leave' : 
                this.isWeekendDay(day) ? 'calendar-day-weekend-on-leave' :
                'calendar-day-on-leave';
    },

    //Returns the day of the week on which the day provided resides
    getDayOfWeek: function (day) {
      return (this.dayOffset + day) % 7;
    },

    //Checks if the day provided is in the weekend
    isWeekendDay: function (day) {
      let dow = this.getDayOfWeek(day);
      return dow > 5 || dow < 1;
    },

    //Checks if the day provided is the current day
    isCurrentDay: function (day) {
      if(this.year && this.month){
        let today = moment();
        let date = moment().year(this.year).month(this.month - 1).date(day);
  
        return today.startOf('day').isSame(date.startOf('day'));
      }
    },

    //Gets the ISO year, not just the selected year, for specific dates like Jan 1st 2017 its necessary
    getISOYear: function(val) {
      if(this.year && this.month){
        return moment().year(this.year).month(this.month - 1).date(val).isoWeekYear();
      }
    },

    //Calculate the current weeknumber
    getWeekNumber: function(val) {
      if(this.year && this.month){
        return moment().year(this.year).month(this.month - 1).date(val).isoWeek();
      }
    },

    selectUser: function(val) {
      this.selectedUser = val;
    },

    reloadPerformances: function(month) {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/performances/activity',
        params: {
          timesheet__user_id: this.selectedUser.id,
          timesheet__month: month,
          timesheet__year: this.year
        }
      }).then((res) => {
        this.activityPerformances = res.data.results;
      }).catch((error) => {
        console.log(error)
      })
    }
  },

  computed: {
    // Returns whether the currently authenticated user is selected.
    currentUserSelected: function() {
      if(this.user && this.selectedUser)
        return this.user.id == this.selectedUser.id;
    },

    // Builds an array for the dropdown
    options: function() {
      return this.users.map(u => {
        return { text: u.display_label, value: u.id }
      });
    },

    // Returns true if the currently authenticated user belongs to the admin-group
    isAdmin: function() {
      return store.getters.user.groups.find(g => g.name == 'admin');
    },

    params: function() {
      if(this.$route.params.year) {
        let date = moment({ year: this.$route.params.year, month: this.$route.params.month - 1 }).startOf('month');

        store.dispatch(types.NINETOFIVER_RELOAD_CALENDAR_SELECTED_MONTH, {
          params: {
            date: date.format('YYYY-MM-DDThh:mm:ss')
          }
        });

        return this.$route.params;
      }
    },

    month_info: function() {
      if(store.getters.month_info && this.month){
        return store.getters.month_info;
      }
    },

    users: function() {
      if(store.getters.users)
        return store.getters.users;
    },

    user: function() {
      if(store.getters.user) {
        this.selectUser(store.getters.user);
        return store.getters.user;
      }
    },

    holidays: function() {
      if(store.getters.holidays && this.selectedUser && this.month) {
        return store.getters.holidays.filter((holiday) => {
          return moment(holiday.date).month() == this.month && holiday.country == this.selectedUser.country;
        });
      }
    },

    year: function() {
      if(this.$route.params.year) {
        return parseInt(this.$route.params.year);
      }
    },

    timesheet: function() {
      if(this.month && this.year && this.selectedUser && store.getters.timesheets) {
        return store.getters.timesheets.find((ts) => {
          return ts.user == this.selectedUser.id && ts.month ==  parseInt(this.month) && ts.year == parseInt(this.year);
        });
      }
    },

    month: function() {
      if(this.$route.params.month && this.$route.params.year && this.user){
        store.dispatch(types.NINETOFIVER_RELOAD_MONTH_INFO, {
          params: {
            user_id:this.selectedUser.id,
            month: this.$route.params.month,
            year: this.$route.params.year
          }
        });
        this.getLeaves(this.$route.params.month);
        this.reloadPerformances(this.$route.params.month);
        return parseInt(this.$route.params.month)
      }
    },

    days: function() {
      if(this.year && this.month) {
        let daysInWeek = [];

        //Make days-object containing amount of -days in current month
        let dayOfMonth = moment().year(this.year).month(this.month - 1).startOf('month');
        let endOfMonth = moment().year(this.year).month(this.month - 1).endOf('month');

        while(dayOfMonth <= endOfMonth) {
          let weekday = dayOfMonth.format('dddd').toLowerCase();

          if(!daysInWeek[weekday])
            daysInWeek[weekday] = 0;

          daysInWeek[weekday]++;
          dayOfMonth.add(1, 'days');
        }

        return daysInWeek;
      }
    },

    contracts: function() {
      if(store.getters.contracts && this.activtyPerformances) {
        let contrs = store.getters.contracts;
        //Calculate total perf duration for each entry
        contrs.forEach(c => {
          let total = 0;

          this.activityPerformances.forEach(p => {
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

    work_schedule: function() {
      if(store.getters.user_work_schedule) 
        return store.getters.user_work_schedule;
    },

    dayOffset: function() {
      if(this.month && this.year){
        let dow = moment().year(this.year).month(this.month - 1).date(1).day();
        if (dow == 0)
          dow = 7;

        return dow - 1
      }
    },

    dayCount: function() {
      if(this.year && this.month) {
        let days = moment().year(this.year).month(this.month - 1).endOf('month').date();
        return days;
      }
    }

  },

  filters: {

    roundHoursFilter: function(val) {
      if(val % 1 != 0) {
        return parseFloat(val).toFixed(1);
      } else {
        return parseInt(val);
      }
    },
  },

  data () {

    return {
      selectedUser: null,
      activityPerformances: [],
      leaves: [],
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
  }

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
    background: rgba(150, 150, 150, 0.15);
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

.unclickable-days {
  text-decoration: none;
  cursor: default;
}
</style>