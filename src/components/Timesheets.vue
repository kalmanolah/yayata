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

            router-link(:to='{ name: "calendar_month", params: { year: sheet.year, month: sheet.month } }')
              .card

                .card-header
                  h5.text-xs-center {{ sheet | outputCorrectMonth }}

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
    },

    created: () => { },

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

      //Get all performances for a timesheet
      getPerformancesForTimesheet: function(ts) {

        store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/my_performances/activity/',
          params: {
            timesheet: ts,
            page_size: 500
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
            page_size: 31,
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
        if(store.getters.work_schedule && this.leaves[timesheet.id] && this.daysInMonth[timesheet.id] && store.getters.holidays) {
          var total = 0;

          store.getters.work_schedule.forEach(ws => {

            //Add regular days to total
            for(var w in ws)
              if(store.getters.days[w] >= 0)
                total += parseFloat(ws[w]) * this.daysInMonth[timesheet.id][w];

            //Correcting total with holidays
            store.getters.holidays.forEach(h => {
              var date = moment(h.date, 'YYYY-MM-DD');

              if(timesheet.month - 1 === date.month())
                total -= ws[date.format('dddd').toLowerCase()];
            });


            //Correcting total with leaves
            this.leaves[timesheet.id].forEach(lv => {
              var startOfDay = moment(lv.leave_start).hour(9).startOf('hour');
              var endOfDay = moment(lv.leave_end).hour(17).minute(30);
              var ld = moment(lv.leave_start).add(1, 'days');

              var startDiff = lv.leave_start.diff(startOfDay, 'hours');
              var endDiff = endOfDay.diff(lv.leave_end, 'hours');

              //Do not occur on the same day
              if(lv.leave_start.date() !== lv.leave_end.date()) {

                //Subtract either the hours gone, or the complete day
                total -= (startDiff > 0) ? startDiff : ws[lv.leave_start.format('dddd').toLowerCase()];
                total -= (endDiff > 0) ? endDiff : ws[lv.leave_end.format('dddd').toLowerCase()];

                //While the leavedate isn't equal to the enddate
                while(ld.date() !== lv.leave_end.date()) {
                  total -= ws[ld.format('dddd').toLowerCase()];

                  ld = ld.add(1, 'days');
                }
              } else {
                total -= (startDiff > 0) ? startDiff : 0;
                total -= (endDiff > 0) ? endDiff : 0;
              }
            });
          });
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
