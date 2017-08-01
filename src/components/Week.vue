<template lang="pug">
.calendar
  .row

    .col-sm-4.text-sm-left
      .btn-group(role='group' aria-label='Calendar controls')
        button.btn.btn-secondary(type='button' @click.prevent='selectPreviousWeek()')
          i.fa.fa-angle-double-left
          |  &nbsp;Previous

    h1.col-sm-4.text-sm-center {{ selectedYear }} Week {{ selectedWeek }}

    .col-sm-4.text-sm-right
      .btn-group(role='group' aria-label='Calendar controls')
        button.btn.btn-secondary(type='button' v-on:click.prevent='selectNextWeek()')
          | Next&nbsp;
          i.fa.fa-angle-double-right
      
    //- Getting the months now shown and allowing routing back to where you came from
    span.col-sm-12.text-sm-center
      router-link(:to='{ name: "calendar_month", params: { year: selectedYear, month: periodStartMonth.month()+1 } }')
        h3 {{ periodStartMonth | moment('MMMM')}}
      div(v-if='periodEndMonth.month() != periodStartMonth.month()')
        router-link(:to='{ name: "calendar_month", params: { year: selectedYear, month: periodEndMonth.month()+1 } }')
          h3 {{ periodEndMonth | moment('MMMM')}}

      hr
  
  //- Buttons to toggle what to display
  .row
    //- .col.align-self-start
    .btn-group-wrap
      div.btn-group.week-format-buttons
        button.btn.btn-secondary(v-on:click='setWeekFormat("workweek")') Workweek
        button.btn.btn-secondary(v-on:click='setWeekFormat("weekend")') Weekend
        button.btn.btn-secondary(v-on:click='setWeekFormat("fullweek")') Full week
    //- .col.align-self-end
  //- Cards
  .calendar-header

    //- Header w days
    .card-group
      .card.card-inverse(v-for='(weekDay, i) in daysOfWeek')
        .btn-group.whereabout(role='group' v-if='whereabouts && timesheet_locations && timesheet')
          button.btn.btn-secondary.btn-sm.dropdown-toggle.whereabout#btnGroupDrop(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" , :class='getWhereaboutClass()') {{ timesheet_locations[i] }}
          .dropdown-menu(aria-labelledby='btnGroupDrop')
            a.dropdown-item(v-for='location in whereabout_locations' @click='setWhereabout(location, weekDay, i)') {{ location }}
        .card-header.card-info
          .pull-left 
            h6(class='hidden-lg-down') <strong>{{ weekDay | moment('dddd') }}</strong>
            h5 &nbsp;<strong>{{ weekDay | moment('DD/MM')}}</strong>
          .pull-right
            .hidden-md-down
              toggle-button(
                @change='toggleStandby(weekDay)', 
                :value='getStandbyStatus(weekDay)', 
                color='#DB4C4C', 
                :sync='true', 
                :labels='toggleButtonLabels', 
                :width='65',
                :disabled='!timesheet || !timesheetActive'
              )
            .hidden-lg-up
              toggle-button(
                @change='toggleStandby(weekDay)', 
                :value='getStandbyStatus(weekDay)', 
                color='#DB4C4C', 
                :sync='true',
                :width='35',
                :disabled='!timesheet || !timesheetActive'
              )


        .card-head-foot.text-xs-center(v-if='weekDay < new Date()')
          //- Check if timesheet status is active
          template(v-if='timesheet && timesheetActive')
            //- Performance creation is disabled for future activityPerformances
            hovercard(:id='"hc_submit_" + i', :component='getHoverCardComponent(weekDay)', @success='onSubmitSuccess')

              //- Visible text
              button.btn.btn-success.btn-submit
                i.fa.fa-plus

            template(v-if='leaves')
              small.text-muted
                | {{ getDurationTotal(weekDay) }}<strong> / {{ getHoursTotal(weekDay) }} h</strong>
            .pull-right.quota__icon
              i.fa(:class='getDailyQuota(weekDay)')
            hr.smaller-horizontal-hr.smaller-vertical-hr

          //- Body of performances
          //- Check if timesheet status status is active
          template( v-if='timesheet && timesheetActive')
            .card-block.performance-list
              //- Add leaves if any
              template(v-if='leaves')
                li.list-group-item.performance_entry(
                  v-for='leave in getDaysLeaves(weekDay.date())',
                  :class='[list-group, performance-list]'
                )
                  .list-group-item-heading {{ leave.leave_type | leaveTypeAsString }}
                  .list-group-item-text
                    div {{ leave.description }}
                    hr.small-vertical-hr
                    small
                      i.fa.fa-plane.pull-left
                      .pull-right {{ leave.leaveDuration}} h 
              li.list-group-item.performance-entry(
                v-for='(perf, i) in getDaysPerformances(weekDay.date())', 
                :key='perf.id',
                :class='[list-group, performance-list]'
              )
                hovercard(:component='getHoverCardComponent(weekDay, perf)', @success='onSubmitSuccess')
                  //- Visible text
                  .list-group-item-heading {{ findContractName(perf.contract) }}
                  .list-group-item-text 
                    div {{ perf.description }}
                    hr.smaller-vertical-hr
                    small
                      .pull-left {{ findPerformanceTypeName(perf.performance_type) }}
                      .pull-right {{ perf.duration }} h
          template(v-else)
            .card-block.performance-list
            li.list-group-item.performance-entry.disabled(
              v-for='(perf, i) in getDaysPerformances(weekDay.date())', 
              :key='perf.id',
              :class='[list-group, performance-list]'
            )
              .list-group-item-heading {{ findContractName(perf.contract) }}
                .list-group-item-text 
                  div {{ perf.description }}
                  hr.smaller-vertical-hr
                  small
                    .pull-left {{ findPerformanceTypeName(perf.performance_type) }}
                    .pull-right {{ perf.duration }} h

</template>

<script>
import { mapState } from 'vuex';
import * as types from '../store/mutation-types';
import store from '../store';
import moment from 'moment';
import HoverCard from './tools/HoverCard.vue';
import PerformanceForm from './forms/PerformanceForm.vue';

export default {
  name: 'week',

  components: {
    hovercard: HoverCard,
    performanceform: PerformanceForm,
  },

  watch: {
    '$route' (to, from) {
      this.selectedWeek = to.params.week;
      this.selectedYear = to.params.year;
    },
  },

  computed: {
    leaves: function() {
      if(store.getters.leaves) {
        return store.getters.leaves.filter((leave) => {
          return leave.user === store.getters.user.id
        });
      }
    },
    
    timesheetActive: function() {
      if(this.timesheet){
        return this.timesheet.status === store.getters.timesheet_statuses[1];
      }
    },

    timesheet: function() {
      if(store.getters.timesheets && this.selectedYear && this.selectedWeek){
        var month = moment(this.selectedYear).add(this.selectedWeek, 'weeks').month() + 1;
        return store.getters.timesheets.find((ts) => {
          return ts.year === this.selectedYear && ts.month === month;
        });
      }
    },

    selectedYear: function() {
      return this.$route.params.year * 1;
    },

    selectedWeek: function() {
      return this.$route.params.week * 1;
    },

    whereabouts: function() {
      if(store.getters.whereabouts && this.daysOfWeek){
        var whereabouts = []
        store.getters.whereabouts.filter((w) => {
          this.daysOfWeek.forEach((day) => {
            if(day.format('D') == w.day){
              whereabouts.push(w);
            }
          })
        });
        return whereabouts
      }
    },

    // Gets the locations of this week
    timesheet_locations: function() {
      if(this.whereabouts && this.daysOfWeek && store.getters.whereabouts){
        var day = this.daysOfWeek[0];
        var timesheet = store.getters.timesheets.find(x => 
          x.month == (day.month() + 1)
          &&
          x.year == day.year()
        );

        var timesheet_locations = [];
        this.daysOfWeek.forEach((day) => {
          if(timesheet){
            var wa = this.whereabouts.find(w => w.day == day.format('D') && w.timesheet == timesheet.id)
            wa = wa ? wa.location : 'Select whereabout';
          } else {
            var wa = 'Select whereabout';
          }
          timesheet_locations.push(wa);
        });
        return timesheet_locations
      }
    },

    work_schedule: function() {
      if(store.getters.work_schedules && store.getters.user && store.getters.employment_contracts){
        var work_schedules = [];
        store.getters.employment_contracts.forEach((ec) => {
          var work_schedule = store.getters.work_schedules.find((ws) => ws.id === ec.work_schedule);
          if(work_schedule){
            work_schedules.push(work_schedule);
          }
        });
        return work_schedules
      }
    },

    //Get the month corresponding with the start of the week
    periodStartMonth: function() {
      var year = this.selectedYear ? this.selectedYear : moment().year();
      var week = this.selectedWeek ? this.selectedWeek : moment().isoWeek();

      return moment().isoWeekYear(year).isoWeek(week).startOf('isoWeek');
    },

    //Get the month corresponding with the end of the week
    periodEndMonth: function() {
      var year = this.selectedYear ? this.selectedYear : moment().year();
      var week = this.selectedWeek ? this.selectedWeek : moment().isoWeek();

      return moment().isoWeekYear(year).isoWeek(week).endOf('isoWeek');
    },

    daysOfWeek: function() {
      return this.getDaysOfWeek(this.currentWeekFormat);
    },

  },

  created: function() {
    this.reloadWhereabouts();
    store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACTS, {
      params: {
        contractuser__user__id: store.getters.user.id
      }
    });
    if(!store.getters.leaves){
      store.dispatch(types.NINETOFIVER_RELOAD_LEAVES, {
        params: {
          user_id: store.getters.user.id
        }
      });
    }
  },

  methods: {
    getWhereaboutClass: function() {
      // Check if status is active
      return (this.timesheet && this.timesheetActive) ? '' : 'disabled';
    },

    reloadWhereabouts: function() {
      if(store.getters.user){
        store.dispatch(types.NINETOFIVER_RELOAD_TIMESHEETS, {
          filter_future_timesheets: false
        })
        
        return store.dispatch(types.NINETOFIVER_RELOAD_WHEREABOUTS, {
        });
      }
    },
    
    patchWhereabout: function(whereaboutId, location, day, timesheetId) {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/whereabouts/' + whereaboutId + '/',
        method: 'PATCH',
        body: {
          location: location,
          day: day.date(),
          timesheet: timesheetId
        },
        emulateJSON: true
      }).then( () => {
        this.reloadWhereabouts();
        this.$toast('Updated whereabout to ' + location + '!', 
          {
            id: 'whereabout-toast',
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 1000,
            transition: 'slide-down',
            mode: 'override'
          }
        );
      });
    },

    createWhereabout: function(location, day, timesheetId) {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/whereabouts/',
        method: 'POST',
        body: {
          location: location,
          day: day.date(),
          timesheet: timesheetId
        },
        emulateJSON: true
      }).then((res) => {
        if(res){
          this.reloadWhereabouts();
          this.$toast('Set whereabout to ' + location + '!',
            { 
              id: 'whereabout-toast',
              horizontalPosition: 'right',
              verticalPosition: 'top',
              duration: 1000,
              transition: 'slide-down',
              mode: 'override'
            });
        } else {
          this.$toast('Something went wrong, check the console for more info.', {
            id: 'wherabout-toast',
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 2000,
            transition: 'slide-dorn',
            mode: 'override'
          });
        }
      });
    },

    // Create new whereabout
    setWhereabout: function(location, day, index) {
      // Get timesheet
      store.dispatch(types.NINETOFIVER_RELOAD_TIMESHEETS, {
        filter_future_timesheets: false,
      }).then( () => {
        var timesheet = store.getters.timesheets.find(x => 
          x.month == (day.month() + 1)
          &&
          x.year == day.year()
        );
        // Timesheet not found; make a new one
        if(!timesheet) {
          this.createNewTimeSheet(day).then( (response) => {
            var whereabout = store.getters.whereabouts.find(w => w.day == day.format('D') && w.timesheet === response.data.id)
            // Whereabout already exists
            if(whereabout){
              this.patchWhereabout(whereabout.id, location, day, response.data.id);
            // Whereabout does not exist
            } else {
              this.createWhereabout(location, day, response.data.id);
            }
          });
        } else {
          var whereabout = store.getters.whereabouts.find(w => w.day == day.format('D') && w.timesheet === timesheet.id)
          // Whereabout already exists
          if(whereabout){
            this.patchWhereabout(whereabout.id, location, day, timesheet.id);
          // Whereabout does not exist
          } else {
            this.createWhereabout(location, day, timesheet.id);
          }
        }
      })
    },

    getDailyQuota: function(day) {
      var performed = this.getDurationTotal(day);
      var required = this.getHoursTotal(day);

      var quota = required > 0 ? performed / required : 1;

      return quota >= 1 ? 'fa-check' : '';
    },

    //Returns correct component for the hovercard
    getHoverCardComponent: function(date, perf) {

      return {
        name: 'PerformanceForm',
        properties: {
          performance: perf,
          date: date
        }
      };
    },

    //Get whether user is on standby
    getStandbyStatus: function(day) {
      return (this.standbyPerformances.findIndex(x => x.day == day.format('D')) !== -1)
    },

    //Get the amount of hours spent 
    getDurationTotal: function(day) {
      let total = 0;

      for(let val of this.activityPerformances.filter(x => x.day == day.format('D'))){
        total += parseFloat(val.duration);
      }
      
      let date = day.date();
      // Add hours with leave of this day to total
      if(this.leaves) {
        this.leaves.forEach((leave) => {
          let ld = leave.leavedate_set.find((ld) => moment(ld.starts_at).isSame(moment([this.selectedYear, 5, date ]), 'day'));
          let leaveDuration = 0;
          if(ld && leave.leavedate_set.length > 1){
            // do things with leaves that span multiple days here
            // if ld is the first or last leavedate calculate amount of hours in leave
            if(ld === leave.leavedate_set[0] || ld === leave.leavedate_set[leave.leavedate_set.length -1]){
              let endOfDay = moment([this.selectedYear, 5, date, 17, 30]);
              let startOfDay = moment([this.selectedYear, 5, date, 9]);
              
              let startDiff = moment(ld.starts_at).subtract(2, 'hours').diff(startOfDay, 'hours');
              let endDiff = moment(endOfDay).add(2, 'hours').diff(ld.ends_at, 'hours');

              startDiff = startDiff > 0 ? startDiff : 0;
              endDiff = endDiff > 0 ? endDiff : 0;

              let leaveHours = startDiff + endDiff;
              leaveHours = leaveHours < 0 || leaveHours > 8 ? 0 : leaveHours;
              leaveDuration = 8 - leaveHours;
            } else {
              // else assume that 8 leave hours are consumed
              leaveDuration = 8;
            }
            total += leaveDuration;
          } else if (ld) {
            let endOfDay = moment([this.selectedYear, 5, date, 17, 30]);
            let startOfDay = moment([this.selectedYear, 5, date, 9]);

            let startDiff = moment(ld.starts_at).subtract(2, 'hours').diff(startOfDay, 'hours');
            let endDiff = moment(endOfDay).add(2, 'hours').diff(ld.ends_at, 'hours');
            leaveDuration = (8 - (startDiff + endDiff));

            startDiff < 0 ? total += 8 : total += leaveDuration;
          }
        });
      }
      return total;
    },

    //Get total hours/day from the work_schedule per user
    getHoursTotal: function(day) {
      if(this.work_schedule)
        return this.work_schedule[0][day.format('dddd').toLowerCase()];
    },

    //Make the call to standby
    toggleStandby: function(day) {
      if(this.getStandbyStatus(day))
        this.deleteStandby(this.standbyPerformances.find(x => x.day == day.format('D')));
      else
        this.setStandby(day);
    },

    //Delete standbyperformance for specific day
    deleteStandby: function(standby) {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST,
        {
          path: '/my_performances/standby/' + standby.id + '/',
          method: 'DELETE',
          params: {
            id: standby.id
          }
        }).then((delRes) => {
          if(delRes.status == 204) {
            this.$toast('User no longer on standby', 
              { 
                id: 'standby-toast',
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 1000,
                transition: 'slide-down',
                mode: 'override'
              });
            this.onSubmitSuccess();
          } else {
            console.log( delRes );
            this.$toast('Something went wrong. Check console for more information', 
              { 
                id: 'standby-toast',
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 1000,
                transition: 'slide-down',
                mode: 'override'
              });  
          }
        });
    },

    //Set standbyperformance for specific day
    setStandby: function(day) {

      //Get the timesheet corresponding to the date of the day
      var timesheet = store.getters.timesheets.find(x => 
        x.month == (day.month() + 1)
        &&
        x.year == day.year()
      );

      if(timesheet) {
        store.dispatch(
          types.NINETOFIVER_API_REQUEST,
          {
            path: '/my_performances/standby/',
            method: 'POST',
            body: {
              timesheet: timesheet.id,
              day: day.date()
            },
            emulateJSON: true,
          }
        ).then((response) => {
          if(response.status == 201) {
            this.$toast('User on standby', 
              { 
                id: 'standby-toast',
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 1000,
                transition: 'slide-down',
                mode: 'override'
              });
            this.onSubmitSuccess();
          } else {
            console.log(response);
            this.$toast('Something went wrong. Check console for more information', 
              { 
                id: 'standby-toast',
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 1000,
                transition: 'slide-down',
                mode: 'override'
              });            
          }
        });
      } else {
        //Timesheet was not found, so a new one is made for that date
        store.dispatch(
          types.NINETOFIVER_API_REQUEST,
          {
            path: '/my_timesheets/',
            method: 'POST',
            body: {
              month: day.month() + 1,
              year: day.year(),
              closed: false
            },
            emulateJSON: true,
          }
        ).then((tsRes) => {
          store.dispatch(
            types.NINETOFIVER_API_REQUEST,
            {
              path: '/my_performances/standby/',
              method: 'POST',
              body: {
                timesheet: tsRes.data.id,
                day: day.date()
              },
              emulateJSON: true,
            }
          ).then((spRes) => {
            if(spRes.status == 201) {
              this.$toast('User on standby', 
                { 
                  id: 'standby-toast',
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  duration: 1000,
                  transition: 'slide-down',
                  mode: 'override'
                });
              this.onSubmitSuccess();
            } else {
              console.log(spRes);
              this.$toast('Something went wrong. Check console for more information', 
                { 
                  id: 'standby-toast',
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  duration: 1000,
                  transition: 'slide-down',
                  mode: 'override'
                });
            }
          });
        });
      }

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

    //Find the contract's name that belongs to the contract id
    findContractName: function(id) {
      if(store.getters.contracts) {
        return store.getters.contracts.find(x => x.id == id)['name'];
      }
    },

    //Find the contract's customerName that belongs to the contract id
    findCustomerName: function(contractID) {
      if(store.getters.contracts) {
        return store.getters.contracts.find(x => x.id == contractID)['customerName'];
      }
    },

    //Find the performance_type's name
    findPerformanceTypeName: function(id) {
      if(store.getters.performance_types) {
        return store.getters.performance_types.find(x => x.id == id)['name'];
      }
    },

    //Go to specified week, get params from URI
    setSelectedWeek: function (year, week) {
      this.$router.push({
        name: 'calendar_week',
        params: {
          year: year,
          week: week,
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

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_performances/',
        params: {
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
      });
    },

    //Get the activityPerformances linked to a day
    getDaysPerformances: function(day) {
      var result = [];

      for(var i = 0; i < this.activityPerformances.length; i++)
        if(this.activityPerformances[i].day == day)
          result.push(this.activityPerformances[i]);

      return result.reverse();
    },

    getDaysLeaves: function(day) {
      let result = [];
      let month = moment().week(this.selectedWeek).month();
      this.leaves.forEach((leave) => {
        let ld = leave.leavedate_set.find((ld) => moment(ld.starts_at).isSame(moment([this.selectedYear, month, day ]), 'day'));
        let leaveDuration = 0;
        if(ld && leave.leavedate_set.length > 1) {
          // if ld is the first or last leavedate calculate amount of hours in leave
          if(ld === leave.leavedate_set[0] || ld === leave.leavedate_set[leave.leavedate_set.length -1]){
            let endOfDay = moment([this.selectedYear, month, day, 17, 30]);
            let startOfDay = moment([this.selectedYear, month, day, 9]);

            let startDiff = moment(ld.starts_at).subtract(2, 'hours').diff(startOfDay, 'hours');
            let endDiff = moment(endOfDay).add(2, 'hours').diff(ld.ends_at, 'hours');

            startDiff = startDiff > 0 ? startDiff : 0;
            endDiff = endDiff > 0 ? endDiff : 0;

            let leaveHours = startDiff + endDiff;
            leaveHours = leaveHours < 0 || leaveHours > 8 ? 0 : leaveHours;
            leaveDuration = 8 - leaveHours;
          } else {
            // else assume that 8 leave hours are consumed
            leaveDuration = 8;
          }
          leave.leaveDuration = leaveDuration + '.00';
          result.push(leave)
        } else if (ld) {
          let endOfDay = moment([this.selectedYear, month, day, 17, 30]);
          let startOfDay = moment([this.selectedYear, month, day, 9]);

          let startDiff = moment(ld.starts_at).subtract(2, 'hours').diff(startOfDay, 'hours');
          let endDiff = moment(endOfDay).add(2, 'hours').diff(ld.ends_at, 'hours');

          leaveDuration = (8 - (startDiff + endDiff));
          leave.leaveDuration = leaveDuration + '.00';
          result.push(leave);
        }
      })
      return result;
    }
  },

  data () {

    return {
      // selectedYear: this.$route.params.year,
      // selectedWeek: this.$route.params.week,

      activityPerformances: [],
      standbyPerformances: [],
      currentWeekFormat: store.getters.week_formatting["workweek"],

      toggleButtonLabels: {
        checked: 'On call',
        unchecked: 'Off call'
      },

      whereabout_locations: store.getters.whereabout_locations,
    }

  },

  filters: {
    leaveTypeAsString: function(val) {
      return store.getters.leave_types.find(lt => lt.id === val).display_label;
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

.performance-entry.disabled {
  height: 80px;
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

.whereabout {
  width: 100%
}

</style>
