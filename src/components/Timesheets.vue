<template lang="pug">
div.row
  .col
    h3 My timesheets
    p.subtitle Overview of all open timesheets
    div(v-for="(year_group, year) in timesheets")
      
      br

      div.card.card-top-blue.mb-3

        h3.card-header {{ year }}
        
        .card-block.row.no-gutters
          .col-4(v-for='(sheet, i) in year_group')

              .card.m-3

                .card-header
                  h5.text-xs-center 
                    router-link.month-link(:to='{ name: "calendar_month", params: { year: sheet.year, month: sheet.month } }') {{ sheet | outputCorrectMonth }}
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

                .card-block.p-2
                  table.table
                    tbody
                      tr
                        td                  
                          strong Open hours:
                        td
                          .badge.pull-right(:class='getBadgeStyle(sheet)') {{ (sheet.hours_required - sheet.hours_performed).toFixed(1) | negativeToZeroFilter  }}
                      tr
                        td 
                          span Days with leave:
                        td
                          .pull-right {{ getDaysWithLeave(sheet.id) }}

                      template(v-for="(umt, index) in userMonthTotals")
                        template(v-if='sheet.id == index')
                          tr(v-for='(month_total, contract) in umt')
                            td {{ contract | getContractNameFilter }}
                            td
                              .pull-right {{ month_total | roundHoursFilter }} hours ({{ month_total | hoursToDaysFilter }} days)


</template>

<script>
  import { mapState } from 'vuex';
  import store from '../store';
  import * as types from '../store/mutation-types';
  import ToastMixin from './mixins/ToastMixin.vue';


  export default {
    name: 'timesheets',
    mixins: [ToastMixin],

    data () {
      return {
        today: new Date(),
        performances: {},
        leaves: {},
        userMonthTotals: {},
        monthInfo: {},
        daysInMonth: {},
        quotas: {},
        loaded: {},
        called: {},
      }
    },

    created: function() {
      if(store.getters.user){
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, {
          params: { contractuser__user__id: store.getters.user.id }
        });
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
            this.getContractTimesheetPerformances(x); 
          });

          return ts;
        }
     },

      workSchedule: function() {
        if(store.getters.user_work_schedule) {
          return store.getters.user_work_schedule
        }
      },

      fullContracts: function() {
        if(store.getters.full_contracts && this.timesheets) {
          return store.getters.full_contracts;
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

          for(let l in newLoaded) {
            if(!this.called[l])
              this.called[l] = { performances: false, leaves: false, userMonthTotals: false };

            if(!newLoaded[l].leaves && !this.leaves[l] && !this.called[l].leaves) {
              this.getLeavesForTimesheet(l);
              this.called[l].leaves = true;
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
        };

        store.dispatch(
          types.NINETOFIVER_API_REQUEST, 
          {
            path: '/my_timesheets/' + sheet.id + '/',
            method: 'PATCH',
            body: body,
            emulateJSON: true,
          }
        ).then((res) => {

          if(res.status == 200) {
            this.showInfoToast('Timesheet is now pending, you can\'t modify it anymore.');

            
          }
          store.dispatch(types.NINETOFIVER_RELOAD_TIMESHEETS, {
            filter_future_timesheets: true
          });
        }).catch((error) => {
          console.error(error);
          this.showDangerToast('Something went wrong while setting timesheet to pending. Check the console for more information');
        });
      },

      getContractTimesheetPerformances: function(ts) {
        store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/my_performances/activity/',
          params: {
            timesheet: ts.id
          }
        })
        .then((response) => {
          let totals = {};

          response.data.results.forEach((perf) => {
            if(totals[perf.contract]){
              totals[perf.contract] += parseFloat(perf.duration)
            } else {
              totals[perf.contract] = parseFloat(perf.duration)
            }
          });
          this.$set(this.userMonthTotals, ts.id, totals)
        })
        .catch((error) => {
          this.showDangerToast('Something went wrong while getting performances. Check the console for more info');
          console.error(error);
        });
      },

      // get leaves for timesheet
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

      //Call monthinfo api view per timesheet
      getTimesheetInfo: function(ts) {
        store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/services/month_info/',
          params:{
            month: ts.month,
            year: ts.year
          }
        }).then(res => {
          this.$set(this.monthInfo, ts, res.data.results);
        });
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
      getBadgeStyle: function(timesheet) {
        return timesheet.hours_required - timesheet.hours_performed > 0 ? 'badge-warning' : 'badge-success';
      },
    },

    filters: {

      outputCorrectMonth(val) {
        return moment().year(val.year).month(val.month - 1).format('MMMM');
      },

      negativeToZeroFilter (val) {
        return val > 0 ? val : 0;
      },
      hoursToDaysFilter: function(val) {
        return Math.round(val / 8 * 2) / 2;
      },

      roundHoursFilter: function(val) {
        return Math.round(val * 2) / 2;
      },

      getContractNameFilter(val) {
        let contract = store.getters.contracts.find((c) => c.id == val);
        return contract.customerName + ' : ' + contract.name;
      }
    }

  }
</script>
<style>
.month-link {
  cursor: pointer;
}
</style>
