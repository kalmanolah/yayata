<template lang="pug">
div
  h3 Import performance
  p(class='subtitle') Import performance entries from external sources

  div(class='row')
    div(class='col')
      div(class='btn-group' role='group')
        div(class='btn-group')
          button(class='btn btn-outline-dark dropdown-toggle' id='btnGroupDropContract' type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false')
            span(v-if='contract') {{ contract.display_label }}
            span(v-else) All contracts
          div(class='dropdown-menu' aria-labelledby='btnGroupDropContract')
            a(class='dropdown-item' @click='selectContract(null)') All contracts
            a(class='dropdown-item' v-for='contract in contracts' @click='selectContract(contract)') {{ contract.display_label }}
        div(class='btn-group')
          button(class='btn btn-outline-dark dropdown-toggle' id='btnGroupDropTimesheet' type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false')
            span(v-if='timesheet') Timesheet: {{ timesheet.display_label }}
          div(class='dropdown-menu' aria-labelledby='btnGroupDropTimesheet')
            a(class='dropdown-item' v-for='timesheet in timesheets' @click='selectTimesheet(timesheet)') {{ timesheet.display_label }}

    div(class='col-auto btn-group' v-if='performances && performances.length')
        button(class='btn btn-outline-primary' @click='executeImport()') Import

  hr

  table(class='table table-striped table-bordered' v-if='performances && performances.length')
    thead
      tr
        th Date
        th Duration
        th Contract
        th Description
        th Type
        th
          b-form-checkbox(v-model='selectAll' class='my-0') Import?

    tbody
      tr(v-for='(performance, i) in performances')
        td {{ performance.date | moment('DD/MM/YYYY') }}
        td {{ performance.duration | round }} hours
        td {{ contracts[performance.contract].display_label }}
        td
          vue-markdown(class='rendered-markdown' :source='performance.description')
        template(v-if='!performance.id')
          td
            select(class='form-control form-control-sm col' v-model='performance.performance_type')
              option(
                v-for='performance_type in contracts[performance.contract].performance_types'
                :value='performance_type.id'
              ) {{ performance_type.display_label }}
          td
            b-form-checkbox(v-model='performancesToImport[i]' class='col') &nbsp;
        template(v-else)
          td(colspan='2') Imported

  div(class='alert alert-info text-center' v-else) No importable performances found. 😞
</template>

<script>
import store from '../store';
import moment from 'moment';
import * as types from '../store/mutation-types'
import ToastMixin from './mixins/ToastMixin.vue';
import VueMarkdown from 'vue-markdown'

export default {
  name: 'import',

  mixins: [
    ToastMixin,
  ],

  components: {
    VueMarkdown
  },

  data() {
    return {
      contract: null,
      timesheet: null,
      selectAll: false,
      performances: [],
      performancesToImport: [],
    }
  },

  created: function() {
    new Promise((resolve, reject) => {
      if (!store.getters.my_contracts) {
        store.dispatch(types.NINETOFIVER_RELOAD_MY_CONTRACTS).then(() => resolve())
      } else {
        resolve()
      }
    })

    new Promise((resolve, reject) => {
      if (!store.getters.my_contract_users) {
        store.dispatch(types.NINETOFIVER_RELOAD_MY_CONTRACT_USERS).then(() => resolve())
      } else {
        resolve()
      }
    })

    new Promise((resolve, reject) => {
      if (!store.getters.my_open_timesheets) {
        store.dispatch(types.NINETOFIVER_RELOAD_MY_OPEN_TIMESHEETS).then(() => resolve())
      } else {
        resolve()
      }
    }).then(() => {
      if (store.getters.my_open_timesheets.length) {
        this.timesheet = store.getters.my_open_timesheets[0]
      }
    })
  },

  computed: {
    timesheets: function() {
      if (store.getters.my_open_timesheets) {
        return store.getters.my_open_timesheets.filter(timesheet => {
          return timesheet.status == 'active'
        })
      }
    },

    contracts: function() {
      if (store.getters.my_contracts) {
        let contracts = {}

        store.getters.my_contracts.forEach(contract => {
          contracts[contract.id] = contract
        })

        return contracts
      }
    },

    contractUsers: function() {
      if (store.getters.my_contract_users) {
        let contractUsers = []

        store.getters.my_contract_users.forEach(contractUser => {
          if (!contractUsers[contractUser.contract.id]) {
            contractUsers[contractUser.contract.id] = []
          }

          contractUsers[contractUser.contract.id].push(contractUser)
        })

        return contractUsers
      }
    }
  },

  watch: {
    selectAll: function(state) {
      this.performancesToImport.forEach((value, idx) => {
        this.performancesToImport[idx] = state
      })
    },

    timesheet: function() {
      this.reloadPerformances()
    }
  },

  methods: {
    selectContract: function(contract) {
      this.contract = contract
    },

    selectTimesheet: function(timesheet) {
      this.timesheet = timesheet
    },

    reloadPerformances: function() {
      let from = moment([this.timesheet.year, this.timesheet.month - 1])
      let to = moment(from).endOf('month')

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/services/performance_import/',
        params: {
          from: from.format('YYYY-MM-DD'),
          to: to.format('YYYY-MM-DD')
        }
      }).then((res) => {
        let performances = res.data

        if (this.filterContract) {
          performances = performances.filter(performance => {
            return performance.contract === this.filterContract.id
          })
        }

        performances.forEach(performance => {
          performance.performance_type = this.contracts[performance.contract].performance_types[0].id
          performance.contract_role = this.contractUsers[performance.contract][0].contract_role.id
        })

        this.performances = performances
        this.performancesToImport = Array(this.performances.length).fill(false)
      })
    },

    executeImport: function() {
      let promises = []

      this.performances.forEach((performance, idx) => {
        if (!this.performancesToImport[idx]) {
          return
        }

        promises.push(store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/my_performances/activity/',
          method: 'POST',
          body: {
            'timesheet': this.timesheet.id,
            'contract': performance.contract,
            'description': performance.description,
            'day': moment(performance.date).format('DD'),
            'duration': performance.duration,
            'performance_type': performance.performance_type,
            'contract_role': performance.contract_role,
            'redmine_id': performance.redmine_id
          }
        }))
      })

      Promise.all(promises).then(() => {
        this.reloadPerformances()
      })
    }
  },

  filters: {
    round: function(value) {
      return Math.round(value * 100) / 100
    }
  }
}
</script>
