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
                  div
                    strong Open hours:  
                    .badge.pull-right(:class='getBadgeStyle(sheet)') {{ (sheet.hours_required - sheet.hours_performed).toFixed(1) | negativeToZeroFilter  }}
                    
                  div 
                    span Days with leave:
                    .pull-right {{ getDaysWithLeave(sheet.id) }}

</template>

<script>
  import { mapState } from 'vuex';
  import store from '../store';
  import * as types from '../store/mutation-types';
  import ToastMixin from './mixins/ToastMixin.vue';


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
      if(store.getters.user_work_schedule) {
        return store.getters.user_work_schedule
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
              this.called[l] = { performances: false, leaves: false };

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

            store.dispatch(types.NINETOFIVER_RELOAD_TIMESHEETS, {
              filter_future_timesheets: true
            });
            
          }
        }).catch((error) => {
          console.error(error);
          this.showDangerToast('Something went wrong while setting timesheet to pending. Check the console for more information');
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
      }
    }

  }
</script>
<style>
.month-link {
  cursor: pointer;
}
</style>
