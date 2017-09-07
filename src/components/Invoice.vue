<template lang='pug'>
div#invoice-modal
  b-btn.btn-outline-dark(v-b-modal="'printModal'")
    i.fa.fa-print
  b-modal(
    id='printModal',
    ref='printModal',
    title='Select contract to create invoice',
    @ok='handleOk',
    ok-title='Download')
    form.text-center(@submit.stop.prevent='handleSubmit')
      b-form-select(v-model='date', :options='months', class='mb-3')
      b-form-select(v-if='contracts', v-model='selected', :options='contracts', class='mb-3')
</template>

<script>
import store from '../store';
import * as types from '../store/mutation-types';
import moment from 'moment'
import jspdf from 'jspdf'
import * as inuitsLogoURL from '../assets/InuitsLogo.js'

export default {
  name: 'invoice',
  data() {
      return {
        selected: null,
        date: moment().month() + 1,
        months: [
          {'text': 'Jan', 'value': 1},
          {'text': 'Feb', 'value': 2},
          {'text': 'Mar', 'value': 3},
          {'text': 'Apr', 'value': 4},
          {'text': 'May', 'value': 5},
          {'text': 'Jun', 'value': 6},
          {'text': 'Jul', 'value': 7},
          {'text': 'Aug', 'value': 8},
          {'text': 'Sep', 'value': 9},
          {'text': 'Oct', 'value': 10},
          {'text': 'Nov', 'value': 11},
          {'text': 'Dec', 'value': 12},
        ]
      }
  },
  created () {
    this.reloadContracts();
  },
  methods: {
    handleOk(e) {
      e.cancel();
      this.generatePdf()
    },
    handleSubmit() {
        this.$refs.printModal.hide()
    },
    reloadContracts() {
      let options = { 
        path: '/contracts/', 
        params: {
          contractuser__user__id: store.getters.user.id
        } 
      };
      store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, options);
    },

    generatePdf() {
      let baseX = 15;
      let baseY = 28;
      let month = moment().month(this.date - 1).format('MMMM');
      let inuitsLogo = inuitsLogoURL.inuitsLogo;
      let doc = new jspdf({
        orientation: 'portrait'
      });
      if(this.contract) {
        doc.setFontSize(12)
        // header
        doc.text('Consultant: ' + this.user.display_label, 60, 8)
        doc.text(month + ' ' + moment().year(), 140, 8)
        doc.addImage(inuitsLogo, 'JPEG', 20, 5, 30, 10)
        doc.text('Project: ' + this.contract.display_label, 140, 13)
        doc.text('Customer: ' + this.contract.customerName, 60, 13)

        doc.setFontSize(10)
        // Table header
        doc.text('Day', baseX, baseY)
        doc.text('Description', baseX + 20, baseY)
        doc.text('hours', baseX + 130, baseY)
        doc.text('Performance type', baseX + 150, baseY)
        doc.line(baseX, baseY + 2, baseX + 190, baseY + 2)
        baseY += 7;
        // Performances
        this.performances.forEach((perf) => {
          // check if baseY is greater than max
          if(baseY >= 250) {
            // Create a new page and continue
            doc.addPage();
            baseY = 20;
          }
          doc.text(moment().month(month).date(perf.day).format('ddd'), baseX, baseY) 
          doc.text(perf.day.toString(), baseX + 10, baseY)
          if(perf.description.length > 70) {
            doc.text(perf.description.slice(1, 70) + '...', baseX + 20, baseY)
          } else {
            doc.text(perf.description, baseX + 20, baseY)
          }
          doc.text(perf.duration.toString(), baseX + 130, baseY)
          doc.text(perf.performance_type_label, baseX + 150, baseY)
          doc.setDrawColor(224,224,224);
          doc.line(baseX, baseY + 1, baseX + 190, baseY + 2)
          baseY += 6;
        });
        if(baseY >= 250) {
            doc.addPage();
            baseY = 20;
        }
        // totals
        doc.text('Total: ' + this.totalPerformances.toString(), baseX + 120, baseY + 3)
        doc.text('Total in 8-hour days: ' + parseInt(this.totalPerformances / 8) + 'd ' + (parseFloat(this.totalPerformances) % 8), baseX + 88, baseY + 10)
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
      this.contract ? doc.save(this.contract.display_label+ '-' + month + '.pdf') : doc.save('invoice-' + month + '.pdf')
    }
  },
  computed: {
    user: function() {
      if(store.getters.user) {
        return store.getters.user;
      }
    },

    contract: function() {
      if(this.selected && store.getters.filtered_contracts) {
        return store.getters.filtered_contracts.find((c) => c.id === this.selected);
      }
    },

    contracts: function() {
      if(store.getters.filtered_contracts) {
        let contracts = store.getters.filtered_contracts.map((contract) => {
          return {'text': contract.display_label, 'value': contract.id};
        });
        this.selected = contracts ? contracts[0].value: 'No contracts'
        return contracts
      }
    },
    timesheet: function() {
      if(store.getters.timesheets && store.getters.user) {
        console.log('in ts')
        return store.getters.timesheets.find((ts) => {
          return ts.user == store.getters.user.id && ts.month == this.date;
        });
      }
    },
    performances: function() {
      if(store.getters.activity_performances && this.timesheet && this.contract) {
        if(this.contract) {
          return store.getters.activity_performances.filter((perf) => {
            if(perf.contract == this.contract.id && perf.timesheet == this.timesheet.id) {
              perf.performance_type_label = store.getters.performance_types.find((pt) => perf.performance_type == pt.id).name
              return perf;
            }
          }).sort((a, b) => {
            a = a.day;
            b = b.day;
            return a > b ? 1 : (a < b ? -1 : 0);
          });
        }
      }
    },

    totalPerformances: function() {
      if(this.performances) {
        let totalPerformed = 0;
        this.performances.forEach((performance) => {
          totalPerformed += parseFloat(performance.duration);
        });
        return totalPerformed;
      }
    }
  },

  filters: {
    month_filter: function(val) {
      return moment().month(val - 1).format('MMMM')
    },

    day_filter: function (val, timesheet) {
      if(timesheet) {
        return moment().year(timesheet.year).month(timesheet.month - 1).date(val).format('ddd')
      }
    },
    performance_type_filter: function(val) {
      if(store.getters.performance_types) {
        return store.getters.performance_types.find((x) => x.id == val).name
      }
    },
    eight_hour_days_filter: function(val) {
      return parseInt(val / 8) + 'd ' + (parseFloat(val) % 8)
    }
  }
}
</script>

<style>

.signature-box-parent {
  border: 2px solid black;
  height: 150px;
  width: 460px;
}
.signature-box {
  margin-left: 15px;
  margin-right: 15px;
  border: 1px solid black;
  height: 100px;
  width: 200px;
}
#remarks>.signature-box {
  width: 430px;
}
</style>