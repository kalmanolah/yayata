<template lang="pug">
  div
    h3 My timesheets
    p.subtitle Overview of all open timesheets
    div(v-for="(year_group, year) in timesheets")
      
      br

      div.card.card-top-blue

        h3.card-header {{ year }}
        
        .card-block.row
          .col-lg-4(v-for='(sheet, i) in year_group')

              .card

                .card-header
                  h5.text-xs-center 
                    router-link(:to='{ name: "calendar_month", params: { year: sheet.year, month: sheet.month } }') {{ sheet | outputCorrectMonth }}
                    toggle-button.pull-right(
                      @change='setPending(sheet)',
                      :color={checked: '#f0ad4e', unchecked: '#5cb85c'},
                      :value='sheet.status === "PENDING"',
                      :sync='true',
                      :labels={
                        checked: 'Pending',
                        unchecked: 'Active'
                      },
                      :width='70',
                      :disabled='sheet.status === "PENDING"'
                    )

                .card-block
                  div
                    strong Open hours:  
                    .tag.pull-right(:class='getTagStyle(quotas[sheet.id])') {{ quotas[sheet.id] }}

                  div 
                    span Days with leave:
                    .pull-right {{ getDaysWithLeave(sheet.id) }}

  </template>

  <script>
  import { mapState } from 'vuex'
  import store from '../store'
  import * as types from '../store/mutation-types'


  export default {
    name: 'timesheets',

    data () {
      return {
        today: new Date(),
        performances: {},
        leaves: {},
        daysInMonth: {},
        quotas: {},
        loaded: {},
        called: {},
      }
    },

    computed: {

      timesheets: function() {

        if(store.getters.timesheets) {
          var ts = {};
          this.performances = {};

          store.getters.timesheets.forEach(x => {
            if(!ts[x.year])
              ts[x.year] = {};

            ts[x.year][x.month] = x;
            this.$set(this.loaded, x.id, {performances: false, leaves: false})
          });

          return ts;
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

    },

    created: () => { 
      store.dispatch(types.NINETOFIVER_RELOAD_TIMESHEETS, {
        filter_future_timesheets: true
      });
      store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACTS,  {
        params: {
          user: store.getters.user.id,
          ended_at__gte: moment().format('YYYY-MM-DD')
        }
      });
    },

    watch: {

      loaded: {
        handler: function(newLoaded) {

          for(var l in newLoaded) {
            if(!this.called[l])
              this.called[l] = { performances: false, leaves: false };

            if(!newLoaded[l].performances && !this.performances[l] && !this.called[l].performances) {
              this.getPerformancesForTimesheet(l);
              this.called[l].performances = true;
            }
            else if(!newLoaded[l].leaves && !this.leaves[l] && !this.called[l].leaves) {
              this.getLeavesForTimesheet(l);
              this.called[l].leaves = true;
            }
            else if( newLoaded[l].performances && newLoaded[l].leaves && this.called[l].performances && this.called[l].leaves) {
              this.getDaysInMonth(l);
            }
          }

        }, 
        deep: true,   //When the object's nested props need to be watched as well
      },

    },

    methods: {
      // Set the status of this sheet to PENDING.
      setPending: function(sheet) {
        var body = {
          month: sheet.month,
          year: sheet.year,
          status: 'PENDING'
        }
        store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/my_timesheets/' + sheet.id + '/',
          method: 'PATCH',
          body: body,
          emulateJSON: true,
        }).then((res) => {
          if(res.status == 200) {
            this.$toast('Timesheet is now pending, you can\'t modify it anymore.', {
              id: 'pending-toast',
              horizontalPosition: 'right',
              verticalPosition: 'top',
              duration: 1000,
              transition: 'slide-down',
              mode: 'override'
            });
            store.dispatch(types.NINETOFIVER_RELOAD_TIMESHEETS, {
              filter_future_timesheets: true
            });
          } else {
            console.error(res);
            this.$toast('Something went wrong while setting timesheet to pending. Check the console for more information', {
              id: 'pending-failed-toast',
              horizontalPosition: 'right',
              verticalPosition: 'top',
              duration: 1000,
              transition: 'slide-down',
              mode: 'override'
            });
          }
        });
      },

      //Get all performances for a timesheet
      getPerformancesForTimesheet: function(ts) {

        store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/my_performances/activity/',
          params: {
            timesheet: ts,
          }
        }).then((response) => {
          this.$set(this.performances, ts, response.data.results);
          this.$set(this.loaded[ts], 'performances', true);
        }, () => {
          this.loading = false;
        });
      },

      //Get accepted leaves for timesheet
      getLeavesForTimesheet: function(ts) {

        store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/my_leaves/',
          params: {
            status: store.getters.leave_statuses[2],
            leavedate__timesheet: ts,
          }
        }).then((response) => {

          response.data.results.forEach(lv => {
            lv.leavedate_set.forEach(lvd => {
              lvd.starts_at = moment(lvd.starts_at, 'YYYY-MM-DD HH:mm:ss');
              lvd.ends_at = moment(lvd.ends_at, 'YYYY-MM-DD HH:mm:ss');
            });
          
            lv['leave_start'] = lv.leavedate_set[0].starts_at;
            lv['leave_end'] = lv.leavedate_set[lv.leavedate_set.length-1].ends_at;
          });

          this.$set(this.leaves, ts, response.data.results);
          this.$set(this.loaded[ts], 'leaves', true );
        }, () => {
          this.loading = false;
        });
      },

      //Calculates amount of days the user should be working this timesheet's month
      getDaysInMonth: function(ts) {

        if(store.getters.timesheets) {

          var timesheet = store.getters.timesheets.find(x => { 
            return x.id == ts; 
          });

          if(timesheet) {

            var daysInWeek = [];
            var dayOfMonth = moment().year(timesheet.year).month(timesheet.month-1).startOf('month');
            var endOfMonth = moment().year(timesheet.year).month(timesheet.month-1).endOf('month');

            while(dayOfMonth <= endOfMonth) {
              var weekDay = dayOfMonth.format('dddd').toLowerCase();

              if(!daysInWeek[weekDay])
                daysInWeek[weekDay] = 0;

              daysInWeek[weekDay]++;
              dayOfMonth.add(1, 'days');
            }

            this.$set(this.daysInMonth, ts, daysInWeek);
            this.getQuota(timesheet);

          }
        }
      },

      //Make the calls and decide what to return
      getQuota: function(timesheet) {
        var required = this.getRequiredHours(timesheet);
        var performed = this.getPerformedHours(timesheet.id);

        var diff = (required - performed > 0) ? required - performed : 0;
        
        this.$set(this.quotas, timesheet.id, diff);
      },

      //Calculate performed hours for a certain timesheet
      getPerformedHours: function(ts) {
        var total = 0;

        if(this.performances[ts]) {
          this.performances[ts].forEach(x => {
            total += parseFloat(x.duration);
          });
        }
        return total;
      },

      //Calculate required hours for a certain timesheet
      getRequiredHours: function(timesheet) {
        if(this.work_schedule && this.leaves[timesheet.id] && this.daysInMonth[timesheet.id] && store.getters.holidays) {
          var total = 0;

          this.work_schedule.forEach(ws => {

            //Add regular days to total
            for(var w in ws)
              if(store.getters.days[w] >= 0)
                total += parseFloat(ws[w]) * this.daysInMonth[timesheet.id][w];
            
            console.log(total)
            //Correcting total with holidays
            store.getters.holidays.forEach(h => {
              var date = moment(h.date, 'YYYY-MM-DD');

              if(timesheet.month - 1 === date.month())
                total -= ws[date.format('dddd').toLowerCase()];
            });

            console.log(total)

            //Correcting total with leaves
            this.leaves[timesheet.id].forEach(lv => {
              let startOfDay = moment(lv.leave_start).hour(9).startOf('hour');
              let endOfDay = moment(lv.leave_end).hour(17).minute(30);
              let ld = moment(lv.leave_start).add(1, 'days');

              let startDiff = lv.leave_start.diff(startOfDay, 'hours');
              let endDiff = endOfDay.diff(lv.leave_end, 'hours');
              console.log(endDiff)
              console.log(startDiff)

              console.log(8 - (startDiff + endDiff))
              //Do not occur on the same day
              if(lv.leave_start.date() !== lv.leave_end.date()) {

                //Subtract either the hours gone, or the complete day
                total -= (startDiff > 0) ? (ws[lv.leave_start.format('dddd').toLowerCase()] - startDiff) : ws[lv.leave_start.format('dddd').toLowerCase()];
                total -= (endDiff > 0) ? (ws[lv.leave_start.format('dddd').toLowerCase()] - endDiff) : ws[lv.leave_end.format('dddd').toLowerCase()];

                //While the leavedate isn't equal to the enddate
                while(ld.date() !== lv.leave_end.date()) {
                  total -= ws[ld.format('dddd').toLowerCase()];

                  ld = ld.add(1, 'days');
                }
              } else {
                let leaveHours = (ws[lv.leave_start.format('dddd').toLowerCase()] - (startDiff + endDiff));
                total -= (leaveHours > 0) ? leaveHours : 0;
              }
            });
          });
          console.log('req ' + total)
          return total;
        }
      },

      //Get amount of days on leave for timesheet
      getDaysWithLeave: function(ts) {
        if(this.leaves[ts]) {
          var total = 0;

          this.leaves[ts].forEach(lv => {
            var startOfDay = moment(lv.leave_start).hour(9).startOf('hour');
            var endOfDay = moment(lv.leave_end).hour(17).minute(30);

            if(startOfDay.format('DD/MM/YYYY') === endOfDay.format('DD/MM/YYYY'))
              total++;
            else 
              total += endOfDay.diff(startOfDay, 'days') + 1;
          });

          return total;
        }
      },

      //Get the tagstyle according to the quota
      getTagStyle: function(val) {
        return val > 0 ? 'tag-warning' : 'tag-success';
      },
    },

    filters: {

      outputCorrectMonth(sheet) {
        return moment().year(sheet.year).month(sheet.month - 1).format('MMMM');
      },

    }

  }
  </script>
