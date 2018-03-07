<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center d-flex justify-content-between')
    span 📝 Summary for&nbsp;
      router-link(:to='{ name: "calendar_month", params: { year: timesheet.year, month: timesheet.month } }')
        | {{ timesheet | timesheetDate | moment('MMMM YYYY') }}
    toggle-button(
      @change='submitTimesheet',
      :color={checked: '#f0ad4e', unchecked: '#5cb85c'},
      :value='timesheet.status === "pending"',
      :sync='true',
      :labels={
        checked: 'Pending',
        unchecked: 'Active'
      },
      :width='70',
      :disabled='timesheet.status === "pending"',
      :ref="'timesheet-submission-toggle-' + timesheet.id"
    )

  table(class='table my-0')
    tbody(v-if='contracts')
      tr(v-if='rangeInfo')
        th Work required
        td
        td(class='text-right') {{ rangeInfo.work_hours | round }} hours

      tr(v-for="(contract, index) in contracts" v-if='loaded && contractPerformances[contract.id]')
        td {{ contract.display_label }}
        td
          button(class='btn-default btn btn-sm fa fa-print' @click='exportContractToPdf(contract)')
        td(class='text-right') {{ contractPerformances[contract.id] | round }} hours

      tr(v-if='rangeInfo')
        th Total performed
        td
        td(class='text-right') {{ rangeInfo.performed_hours | round }} hours

      tr(v-if='rangeInfo')
        td Leave taken
        td
        td(class='text-right') {{ rangeInfo.leave_hours | round }} hours

      tr(v-if='rangeInfo')
        td Holidays
        td
        td(class='text-right') {{ rangeInfo.holiday_hours | round }} hours

      tr(v-if='rangeInfo')
        th Remaining
        td
        td(class='text-right') {{ rangeInfo.remaining_hours | round }} hours

  b-modal(
    v-if='rangeInfo'
    :ref="'timesheet-submission-modal-' + timesheet.id"
    hide-footer=true
    title='Verify submission!'
  )
    p You have&nbsp;
      strong {{ rangeInfo.remaining_hours }}
      | &nbsp;remaining hours.
    p Are you sure you want to submit this timesheet?
    div(class='row')
      div(class='col')
        button(class='btn btn-danger mr-2' @click='closeSubmissionModal') Cancel
        button(class='btn btn-success' @click='confirmSubmissionModal') Submit timesheet
</template>

<script>
import moment from 'moment';
import * as FileSaver from 'file-saver';
import * as types from '../../store/mutation-types';
import store from '../../store';

export default {
  name: 'TimesheetWidget',

  props: [
    'timesheet',
  ],

  data: function() {
    return {
      loaded: null,
      rangeInfo: null,
      contractPerformances: {},
    }
  },

  computed: {
    contracts: () => {
      return store.getters.my_contracts
    },
  },

  created: function() {
    new Promise((resolve, reject) => {
      if (!store.getters.my_contracts) {
        store.dispatch(types.NINETOFIVER_RELOAD_MY_CONTRACTS).then(() => resolve())
      } else{
        resolve()
      }
    })

    this.reloadData()
  },

  filters: {
    round: function(val) {
      return Math.round(val * 100) / 100;
    },

    timesheetDate: function(timesheet) {
      return moment().year(timesheet.year).month(timesheet.month - 1)
    }
  },

  methods: {
    reloadData: function() {
      let start = moment().year(this.timesheet.year).month(this.timesheet.month).startOf('month')
      let end = moment().year(this.timesheet.year).month(this.timesheet.month).endOf('month')

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/services/range_info/',
        params: {
          'from': start.format('YYYY-MM-DD'),
          'until': end.format('YYYY-MM-DD')
        }
      }).then(res => {
        this.rangeInfo = res.data
      })

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_performances/activity/',
        params: {
          timesheet: this.timesheet.id
        }
      }).then(res => {
        res.data.results.forEach(perf => {
          if (!perf.contract) return

          if (!this.contractPerformances[perf.contract.id]) {
            this.contractPerformances[perf.contract.id] = 0
          }

          this.contractPerformances[perf.contract.id] += parseFloat(perf.duration)
          this.loaded = null
          this.loaded = true
        })
      })
    },

    exportContractToPdf: function (contract) {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: `/services/my_timesheet_contract_pdf_export/${this.timesheet.id}/${contract.id}/`,
        method: 'GET',
        responseType: 'arraybuffer'
      }).then((res) => {
        var blob = new Blob([res.body], {
          type: 'application/pdf;charset=utf-8',
          responseType: 'arraybuffer'
        });
        var filename = `timesheet_${this.timesheet.user.display_label}_${this.timesheet.year}-${this.timesheet.month}_${contract.display_label}.pdf`
        filename = filename.replace(/[^a-z_0-9A-Z-\.]/, '')
        filename = filename.replace(' ', '_')
        FileSaver.saveAs(blob, filename);
      })
    },

    closeSubmissionModal: function() {
      let modalRef = `timesheet-submission-modal-${this.timesheet.id}`
      this.$refs[modalRef].hide()
    },

    confirmSubmissionModal: function() {
      var body = {
        month: this.timesheet.month,
        year: this.timesheet.year,
        status: 'pending'
      };

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: `/my_timesheets/${this.timesheet.id}/`,
        method: 'PATCH',
        body: body
      }).then(res => {
        this.closeSubmissionModal()
        this.$emit('submit')
      })
    },

    submitTimesheet: function() {
      if (this.rangeInfo && (this.rangeInfo.remaining_hours <= 0)) {
        this.confirmSubmissionModal()
      } else {
        let confirmRef = `timesheet-submission-modal-${this.timesheet.id}`
        this.$refs[confirmRef].show()
        let ref = `timesheet-submission-toggle-${this.timesheet.id}`
        this.$refs[ref].toggled = false
      }
    },
  }
}
</script>

<style>
</style>
