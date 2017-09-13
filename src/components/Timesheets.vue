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
          .col-6(v-for='(sheet, i) in year_group')

              b-modal#confirmModal(
                :ref="'confirmModal' + i",
                hide-footer=true,
                title='Careful!'
              )
                p You still have 
                  strong {{ sheet.hours_required - sheet.hours_performed }} 
                  | open hours.
                p Are you sure you want to close this timesheet?
                .row
                  .col
                    button.btn.btn-danger.mr-2(@click='closeModal(i)') Cancel
                    button.btn.btn-success(@click='modalOk(sheet, i)') Close timesheet
              .card.m-3

                .card-header
                  h5.text-xs-center 
                    router-link.month-link(:to='{ name: "calendar_month", params: { year: sheet.year, month: sheet.month } }') {{ sheet | outputCorrectMonth }}
                    toggle-button.pull-right(
                      @change='checkOpenHours(sheet, i)',
                      :color={checked: '#f0ad4e', unchecked: '#5cb85c'},
                      :value='sheet.status === "PENDING"',
                      :sync='true',
                      :labels={
                        checked: 'Pending',
                        unchecked: 'Active'
                      },
                      :width='70',
                      :disabled='sheet.status === "PENDING"',
                      :ref='"toggle-" + i'
                    )

                .card-block.p-2
                  table.table
                    tbody
                      tr
                        td                  
                          strong Open hours:
                        td
                        td
                          .badge.pull-right(:class='getBadgeStyle(sheet)') {{ (sheet.hours_required - sheet.hours_performed).toFixed(1) | negativeToZeroFilter  }}
                      tr
                        td 
                          span Days with leave:
                        td
                        td
                          .pull-right {{ getDaysWithLeave(sheet.id) }}

                      template(v-for="(umt, index)  in userMonthTotals")
                        template(v-if='sheet.id == index')
                          tr(v-for='(month_total, contract) in umt')
                            td {{ contract | getContractNameFilter }}
                            td
                              .pull-right {{ month_total | roundHoursFilter }} hours ({{ month_total | hoursToDaysFilter }} days)
                            td 
                              b-btn.btn-outline-dark.pull-right(@click='generatePdf(sheet, contract)')
                                i.fa.fa-print

</template>

<script>
  import { mapState } from 'vuex';
  import store from '../store';
  import * as types from '../store/mutation-types';
  import ToastMixin from './mixins/ToastMixin.vue';
  import jspdf from 'jspdf'
  import * as inuitsLogoURI from '../assets/InuitsLogo.js';

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
      generatePdf: function(sheet, contractId) {
        let contract = store.getters.filtered_contracts.find((c) => c.id == contractId);
        let performances = store.getters.activity_performances.filter((p) => p.contract == contractId && p.timesheet == sheet.id);
        let totalPerformances = 0;
        let baseX = 15;
        let baseY = 28;
        let inuitsLogo = inuitsLogoURI.inuitsLogo;
        let doc = new jspdf({
          orientation: 'portrait'
        });
        if(contract) {
          doc.setFontSize(12)
          // header
          doc.text('Consultant: ' + store.getters.user.display_label, 60, 8)
          doc.text(moment().month(sheet.month - 1).format('MMM') + ' ' + sheet.year.toString(), 140, 8)
          doc.addImage(inuitsLogo, 'JPEG', 20, 5, 30, 10)
          doc.text('Project: ' + contract.display_label, 140, 13)
          doc.text('Customer: ' + contract.customerName, 60, 13)

          doc.setFontSize(10)
          // Table header
          doc.text('Day', baseX, baseY)
          doc.text('Description', baseX + 20, baseY)
          doc.text('hours', baseX + 130, baseY)
          doc.text('Performance type', baseX + 150, baseY)
          doc.line(baseX, baseY + 2, baseX + 190, baseY + 2)
          baseY += 7;
          // Performances
          performances.forEach((perf) => {
            totalPerformances += parseFloat(perf.duration);
            let performance_type_label = store.getters.performance_types.find((pType) => pType.id == perf.performance_type).name | 'ERROR';
            // check if baseY is greater than max
            if(baseY >= 250) {
              // Create a new page and continue
              doc.addPage();
              baseY = 20;
            }
            doc.text(moment().year(sheet.year).month(sheet.month).date(perf.day).format('ddd'), baseX, baseY) 
            doc.text(perf.day.toString(), baseX + 10, baseY)
            if(perf.description.length > 70) {
              doc.text(perf.description.slice(1, 70) + '...', baseX + 20, baseY)
            } else {
              doc.text(perf.description, baseX + 20, baseY)
            }
            doc.text(perf.duration.toString(), baseX + 130, baseY)
            doc.text(performance_type_label.toString(), baseX + 150, baseY)
            doc.setDrawColor(224,224,224);
            doc.line(baseX, baseY + 1, baseX + 190, baseY + 2)
            baseY += 6;
          });
          if(baseY >= 250) {
              doc.addPage();
              baseY = 20;
          }
          // totals
          doc.text('Total: ' + totalPerformances.toString() + 'h', baseX + 120, baseY + 3)
          doc.text('Total in 8-hour days: ' + parseInt(totalPerformances / 8) + 'd ' + (parseFloat(totalPerformances) % 8), baseX + 96, baseY + 10)
          // Signature boxes
          doc.setFontSize(10)
          doc.text('Signature Conultant', baseX, baseY + 18)
          doc.rect(baseX, baseY + 20, 50, 20)
          doc.text('Signature Customer', baseX + 55, baseY + 18)
          doc.rect(baseX + 55 , baseY + 20, 50, 20)
          doc.text('Remarks', baseX + 125, baseY + 18)
          doc.rect(baseX + 125 , baseY + 20, 60, 20)
        }
        // doc.autoPrint()
        contract ? doc.save(contract.display_label+ '-' + sheet.month + '.pdf') : doc.save('invoice-' + sheet.month + '.pdf')
      },

      closeModal: function(index) {
        let modalRef = 'confirmModal' + index;
        this.$refs[modalRef][0].hide();
      },
      
      modalOk: function(sheet, index) {
        this.setPending(sheet);
        this.closeModal(index)
      },

      checkOpenHours: function(sheet, index) {
        if(sheet.hours_required - sheet.hours_performed <= 0) {
            this.setPending(sheet)
          } else {
            let confirmRef = 'confirmModal' + index
            this.$refs[confirmRef][0].show();
            let ref = 'toggle-' + index
            this.$refs[ref][0].toggled = false;
          }
      },
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
        if(store.getters.contracts) {
          let contract = store.getters.contracts.find((c) => c.id == val);
          return contract.customerName + ' : ' + contract.name;
        }
      }
    }

  }
</script>
<style>
.month-link {
  cursor: pointer;
}
</style>
