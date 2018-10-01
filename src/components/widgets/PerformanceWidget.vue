<template lang="pug">
div(class='card card-top-blue mb-3' v-on:keyup.enter='submit')
  div(class='card-header text-center') ⏳&nbsp;
    span(v-if='!model.id') Log performance
    span(v-else) Update performance
    span(v-if='model.date') &nbsp;for {{ model.date | moment('ddd, MMMM Do') }}

  div(class='card-body')
    vue-form-generator(:schema="schema" :model="model" :options="formOptions" ref='form')

    div(class='form-group my-0')
      div(class='row justify-content-between')
        div(class='col')
          input(class='btn btn-primary' type="submit" value="Save" @click="submit()" ref='submitButton')
        div(class='col-auto' v-if='model.id')
          input(class='btn btn-danger' type="submit" value="Delete" @click="remove()")
</template>

<script>
import moment from 'moment';
import VueFormGenerator from 'vue-form-generator';
import toastr from 'toastr';
import utils from '../../utils';
import * as types from '../../store/mutation-types';
import store from '../../store';
import preferences from '../../preferences';

var model = {
  id: null,
  date: null,
  contract: null,
  contract_role: null,
  performance_type: null,
  duration: null,
  description: null,
};
var submit = null;

export default {
  name: 'PerformanceWidget',

  mixins: [
  ],

  props: [
    'performance',
    'date',
    'duration',
  ],

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
  },

  mounted: function() {
    setTimeout(() => {
      this.$refs.submitButton.focus()
    })
  },

  methods: {
    resetForm: function() {
      let contract_field = this.schema.fields.find(f => f.model == 'contract')
      contract_field.set = contract_field.set.bind(this)

      if (this.performance) {
        this.model.id = this.performance.id
        this.model.performance_type = this.performance.performance_type.id
        this.model.contract_role = this.performance.contract_role.id
        this.model.contract = this.performance.contract.id
        this.model.date = this.performance.date
        this.model.duration = this.performance.duration
        this.model.description = this.performance.description
      } else {
        this.model.id = null

        // Attempt to set saved selected contract as selected contract
        let contractIds = contract_field.values.call(this).map(x => x.id)
        let selectedContractId = preferences.get(preferences.key.PERFORMANCE_SELECTED_CONTRACT_ID)
        let contractId = selectedContractId && (contractIds.indexOf(selectedContractId) !== -1) ? selectedContractId : contractIds[0]
        contract_field.set(this.model, contractId)

        this.model.date = this.date ? this.date : moment().format('YYYY-MM-DD')
        this.model.duration = this.duration ? this.duration : 1
        this.model.description = null
      }

      this.model.duration = (Math.round(this.model.duration * 100) / 100).toString()
    },

    remove: function() {
      if (this.loading) return
      this.loading = true

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: `/performances/${this.model.id}/`,
          method: 'DELETE',
      }).then((response) => {
        this.$emit('success', response)
        toastr.success('Performance deleted.')
        this.loading = false
        this.resetForm()
      }).catch((error) => {
        this.$emit('error', error)
        toastr.error('Error deleting performance.')
        this.loading = false
      });
    },

    validate: function() {
      if (!utils.validateDuration(this.model.duration)) {
        toastr.error('Invalid duration provided.')
        return false
      }

      return true
    },

    submit: function(event) {
      if (this.loading) return
      if (!this.validate()) return
      if (event && (event.target.tagName !== 'INPUT')) return

      this.loading = true

      let body = {
        date: this.model.date,
        duration: utils.transformDuration(this.model.duration),
        description: this.model.description,
        performance_type: this.model.performance_type,
        contract: this.model.contract,
        contract_role: this.model.contract_role,
        type: 'ActivityPerformance'
      };

      if (!this.model.id) {
        // Save last selected contract ID so we can select it upon logging new performance
        preferences.set(preferences.key.PERFORMANCE_SELECTED_CONTRACT_ID, body.contract)

        store.dispatch(types.NINETOFIVER_API_REQUEST, {
            path: '/performances/',
            method: 'POST',
            body: body,
        }).then((response) => {
          this.$emit('success', response)
          toastr.success('Performance logged.')
          this.loading = false
          this.resetForm()
        }).catch((error) => {
          this.$emit('error', error)
          toastr.error('Error saving performance.')
          this.loading = false
        });
      } else {
        store.dispatch(types.NINETOFIVER_API_REQUEST, {
            path: `/performances/${this.model.id}/`,
            method: 'PUT',
            body: body,
        }).then((response) => {
          this.$emit('success', response)
          toastr.success('Performance updated.')
          this.loading = false
        }).catch((error) => {
          this.$emit('error', error)
          toastr.error('Error updating performance.')
          this.loading = false
        });
      }
    },
  },

  data: () => {
    return {
      loading: false,

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
            // styleClasses: ['half-width-md'],
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
            type: "input",
            inputType: "text",
            label: "Duration (hours)",
            model: "duration",
            required: true,
            pattern: '^([0-9]{1,2}(?:(?::[0-9]{2})?(?:[\\.,][0-9]{1,2})?)?)$',
            validator: VueFormGenerator.validators.string,
            styleClasses: ['third-width-md'],
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
            styleClasses: ['third-width-md']
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
            styleClasses: ['third-width-md']
          },
          {
            type: "textArea",
            label: "Description",
            model: "description",
            max: 2048,
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
      }
    }
  }
}
</script>

<style lang="less">
</style>
