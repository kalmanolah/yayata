<template lang='pug'>
div#invoice-modal
  b-btn.btn-outline-dark(v-b-modal="'printModal'")
    i.fa.fa-print
  b-modal(
    id='printModal',
    ref='printModal',
    title='Select contract to create invoice',
    @ok='handleOk')
    form.text-center(@submit.stop.prevent='handleSubmit')
      b-form-select(v-model='date', :options='months', class='mb-3')
      b-form-select(v-if='contracts', v-model='selected', :options='contracts', class='mb-3')
    .row(v-if='performances')
      .col
        table.table.table-sm
          thead#performances-table-head
            tr
              th Date
              th Description
              th Duration
              th Performance type
          tbody
            tr(v-for='performance in performances')
              td {{ performance.day | day_filter(timesheet) }} {{ performance.day }}
              td {{ performance.description }}
              td {{ performance.duration }}
              td {{ performance.performance_type | performance_type_filter }}
            tr
              td &nbsp;
              td 
                strong.pull-right Total:
              td 
                strong {{ totalPerformances }}
            tr
              td &nbsp;
              td 
                strong.pull-right Total in 8 hour days:
              td 
                strong {{ totalPerformances | eight_hour_days_filter }}
    .row
      .col
        .signature-box-parent.d-flex.d-flex-row
          #consultant
            span.p-2.ml-2 Signature consultant
            .signature-box
          #customer
            span.p-2.ml-2 Signature customer
            .signature-box
      .col
        .signature-box-parent
          #remarks
            span.p-2.ml-2 Remarks
            .signature-box
</template>

<script>
import store from '../store';
import * as types from '../store/mutation-types';
import moment from 'moment'

export default {
  name: 'invoice',
  data() {
      return {
        selected: null,
        date: moment().month() + 1,
        months: [1, 2, 3, 4, 5, 6 , 7, 8, 9, 10, 11, 12]
      }
  },
  created () {
    this.reloadContracts();
  },
  methods: {
    handleOk(e) {
      e.cancel();
      this.handleSubmit()
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
    }
  },
  computed: {
    contracts: function() {
      if(store.getters.filtered_contracts) {
        let options = [];
        store.getters.filtered_contracts.forEach((contract) => {
          options.push(contract.display_label);
        });
        return options;
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
      if(store.getters.activity_performances && store.getters.filtered_contracts && this.timesheet) {
        let contract = store.getters.filtered_contracts.find((contract) => contract.display_label === this.selected );
        if(contract) {
          return store.getters.activity_performances.filter((perf) => {
            return perf.contract == contract.id && perf.timesheet == this.timesheet.id;
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
#printModal>.modal-dialog.modal-md {
  max-width: 100%;
}  

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