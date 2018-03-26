<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center')
    | ⌛ Bulk add performance
  div(class='card-body' v-if='performances.length')
    vue-form-generator(:schema="schema" :model="model" :options="formOptions" ref='form')

    table(class='table table-sm table-striped table-bordered')
      thead
        tr
          th Date
          th Duration
          th
            b-form-checkbox(v-model='selectAll' class='my-0') Add?
      tbody
        tr(v-for='performance in performances')
          td {{ performance.date | moment('ddd, MMMM Do') }}
          td
            b-form-input(size='sm' v-model='performance.duration' type='text' required)
          td
            b-form-checkbox(v-model='performance.add') &nbsp;

    div(class='form-group my-0')
      div(class='row justify-content-between')
        div(class='col')
          input(class='btn btn-primary' type="submit" value="Save" @click="submit()" ref='submitButton')
  div(class='card-body text-center' v-else) Nothing to see here. Only days with no logged performance are shown here, you know? 🙂
</template>

<script>
import VueFormGenerator from 'vue-form-generator';
import moment from 'moment';
import toastr from 'toastr';
import * as types from '../../store/mutation-types';
import store from '../../store';
import utils from '../../utils';

var model = {
  contract: null,
  contract_role: null,
  performance_type: null,
  description: null,
};
var submit = null;

export default {
  name: 'BulkAddWidget',

  props: [
    'timesheet',
    'rangeInfo',
  ],

  data () {
    return {
      loading: false,
      selectAll: false,
      performances: null,

      model: model,
      schema: {
        fields: [
          {
            type: "vueMultiSelect",
            label: "Contract",
            model: "contract",
            required: true,
            selectOptions: {
              key: "id",
              label: "display_label",
              trackBy: 'id',
              showLabels: false,
              allowEmpty: false
            },
            values: function() {
              if (store.getters.my_active_contracts) {
                return store.getters.my_active_contracts
              }

              return []
            },
            validator: VueFormGenerator.validators.required,
            // styleClasses: ['half-width'],
            get: function() {
              if (store.getters.my_active_contracts) {
                return store.getters.my_active_contracts.find(contract => contract.id == model.contract)
              }
            },
            set: function(model, value) {
              this.model.contract = value.id ? value.id : value
              this.model.performance_type = this.schema.fields.find(f => f.model == 'performance_type').values.call(this)[0].id
              this.model.contract_role = this.schema.fields.find(f => f.model == 'contract_role').values.call(this)[0].id
            }
          },
          {
            type: "select",
            label: "Type",
            model: "performance_type",
            required: true,
            selectOptions: {
              value: "id",
              name: "display_label"
            },
            values: function() {
              if (store.getters.my_active_contracts && store.getters.performance_types && this.model.contract) {
                let contract = store.getters.my_active_contracts.find(contract => contract.id == this.model.contract)

                if (contract) {
                  if (contract.performance_types && contract.performance_types.length) {
                    return contract.performance_types
                  }

                  return store.getters.performance_types
                }
              }

              return []
            },
            validator: VueFormGenerator.validators.required,
            styleClasses: ['half-width']
          },
          {
            type: "select",
            label: "Role",
            model: "contract_role",
            required: true,
            selectOptions: {
              value: "id",
              name: "display_label"
            },
            values: function() {
              if (store.getters.my_contract_users && this.model.contract) {
                return store.getters.my_contract_users
                  .filter(contract_user => contract_user.contract.id == this.model.contract)
                  .map(contract_user => contract_user.contract_role)
              }

              return []
            },
            validator: VueFormGenerator.validators.required,
            styleClasses: ['half-width']
          },
          {
            type: "textArea",
            label: "Description",
            model: "description",
            max: 255,
            rows: 2,
            validator: VueFormGenerator.validators.string
          },
          {
            type: "submit",
            buttonText: "Save",
            validateBeforeSubmit: true,
            styleClasses: ["d-none"],
            onSubmit: () => {
              submit()
            }
          }
        ]
      },
      formOptions: {
        validateAfterLoad: false,
        validateAfterChanged: true
      },
    }
  },

  created: function() {
    submit = this.submit

    Promise.all([
      new Promise((resolve, reject) => {
        if (!store.getters.performance_types) {
          store.dispatch(types.NINETOFIVER_RELOAD_PERFORMANCE_TYPES).then(() => resolve())
        } else{
          resolve()
        }
      }),
      new Promise((resolve, reject) => {
        if (!store.getters.my_contract_users) {
          store.dispatch(types.NINETOFIVER_RELOAD_MY_CONTRACT_USERS).then(() => resolve())
        } else{
          resolve()
        }
      }),
      new Promise((resolve, reject) => {
        if (!store.getters.my_active_contracts) {
          store.dispatch(types.NINETOFIVER_RELOAD_MY_ACTIVE_CONTRACTS).then(() => resolve())
        } else{
          resolve()
        }
      }),
    ]).then(() => {
      this.resetForm()
    })

    // Reload performance objects
    let performances = []
    Object.keys(utils.sortByKey(this.rangeInfo.details)).forEach(date => {
      let day_detail = this.rangeInfo.details[date]
      if (day_detail.work_hours && (day_detail.work_hours == day_detail.remaining_hours)) {
        performances.push({
          'date': date,
          'duration': day_detail.remaining_hours,
          'add': false,
        })
      }
    })
    this.performances = performances
  },

  methods: {
    resetForm: function() {
      let contract_field = this.schema.fields.find(f => f.model == 'contract')
      contract_field.set = contract_field.set.bind(this)

      contract_field.set(this.model, contract_field.values.call(this)[0].id)
      this.model.description = null
    },

    validate: function() {
      for (var key in this.performances) {
        let performance = this.performances[key]

        if (!utils.validateDuration(performance.duration)) {
          toastr.error('Invalid duration provided.')
          return false
        }
      }

      return true
    },

    submit: function(event) {
      if (this.loading) return
      if (!this.validate()) return
      if (event && (event.target.tagName !== 'INPUT')) return

      this.loading = true

      let promises = this.performances.filter(performance => performance.add).map(performance => {
        let body = {
          timesheet: this.timesheet.id,
          day: moment(performance.date).format('DD'),
          duration: utils.transformDuration(performance.duration),
          description: this.model.description,
          performance_type: this.model.performance_type,
          contract: this.model.contract,
          contract_role: this.model.contract_role
        };

        return store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/my_performances/activity/',
          method: 'POST',
          body: body,
        })
      })

      Promise.all(promises).then((response) => {
        this.$emit('success', response)
        toastr.success('Performance logged.')
        this.loading = false
        this.resetForm()
      }).catch((error) => {
        this.$emit('error', error)
        toastr.error('Error saving performance.')
        this.loading = false
      });
    },
  },

  watch: {
    selectAll: function(state) {
      this.performances.forEach(performance => {
        performance.add = state
      })
    },
  }
}
</script>

<style lang="less" scoped>
</style>
