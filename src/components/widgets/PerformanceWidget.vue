<template lang="pug">
div(class='card card-top-blue mb-3' v-on:keyup.enter='submit')
  div(class='card-header text-center') ⏳&nbsp;
    span(v-if='!model.id') Log performance
    span(v-else) Update performance
    span(v-if='date') &nbsp;for {{ date | moment('MMMM Do') }}

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
import * as types from '../../store/mutation-types';
import store from '../../store';
import ToastMixin from '../mixins/ToastMixin.vue';

var model = {
  id: null,
  day: null,
  contract: null,
  contract_role: null,
  performance_type: null,
  timesheet: null,
  duration: null,
  description: null,
};
var submit = null;

export default {
  name: 'PerformanceWidget',

  mixins: [
    ToastMixin
  ],

  props: [
    'performance',
    'day',
    'timesheet',
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
      new Promise((resolve, reject) => {
        if (!store.getters.my_current_timesheet) {
          store.dispatch(types.NINETOFIVER_RELOAD_MY_CURRENT_TIMESHEET).then(() => resolve())
        } else{
          resolve()
        }
      })
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
        this.model.timesheet = this.performance.timesheet
        this.model.day = this.performance.day
        this.model.duration = this.performance.duration
        this.model.description = this.performance.description
      } else {
        this.model.id = null
        contract_field.set(this.model, contract_field.values.call(this)[0].id)
        this.model.timesheet = this.timesheet ? this.timesheet.id : store.getters.my_current_timesheet.id
        this.model.day = this.day ? this.day : moment().date()
        this.model.duration = this.duration ? this.duration : 1
        this.model.description = null
      }

      this.model.duration = (Math.round(this.model.duration * 100) / 100).toString()
      this.date = this.timesheet ? moment().year(this.timesheet.year).month(this.timesheet.month - 1).date(this.model.day) : null
    },

    remove: function() {
      if (this.loading) return
      this.loading = true

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: `/my_performances/activity/${this.model.id}/`,
          method: 'DELETE',
      }).then((response) => {
        this.$emit('success', response)
        this.showSuccessToast('Performance deleted.')
        this.loading = false
        this.resetForm()
      }).catch((error) => {
        this.$emit('error', error)
        this.showDangerToast('Error deleting performance.')
        this.loading = false
      });
    },

    validate: function() {
      // Process duration
      if (
        !this.model.duration ||
        !(/^([0-9]{1,2}(?:(?::[0-9]{2})?(?:[\.,][0-9]{1,2})?)?)$/gm.test(this.model.duration))
      ) {
        this.showDangerToast('Invalid duration provided.')
        return false
      }

      return true
    },

    transformDuration: function(duration) {
      // Replace all commas with decimal points
      duration = duration.replace(',', '.')

      // If the duration contains a colon, split the duration on the colon and convert the minute part from base60
      if (duration.indexOf(':') > -1) {
        let duration_parts = duration.split(':')
        duration = `${duration_parts[0]}.${Math.round(duration_parts[1] / 0.6)}`
      }

      // Parse duration as a number
      duration = Number(duration)

      // Round duration to two decimals
      duration = Math.round(duration * 100) / 100

      return duration
    },

    submit: function(event) {
      if (this.loading) return
      if (!this.validate()) return
      if (event && (event.target.tagName !== 'INPUT')) return

      this.loading = true

      let body = {
        timesheet: this.model.timesheet,
        day: this.model.day,
        duration: this.transformDuration(this.model.duration),
        description: this.model.description,
        performance_type: this.model.performance_type,
        contract: this.model.contract,
        contract_role: this.model.contract_role
      };

      if (!this.model.id) {
        store.dispatch(types.NINETOFIVER_API_REQUEST, {
            path: '/my_performances/activity/',
            method: 'POST',
            body: body,
        }).then((response) => {
          this.$emit('success', response)
          this.showSuccessToast('Performance logged.')
          this.loading = false
          this.resetForm()
        }).catch((error) => {
          this.$emit('error', error)
          this.showDangerToast('Error saving performance.')
          this.loading = false
        });
      } else {
        store.dispatch(types.NINETOFIVER_API_REQUEST, {
            path: `/my_performances/activity/${this.model.id}/`,
            method: 'PUT',
            body: body,
        }).then((response) => {
          this.$emit('success', response)
          this.showSuccessToast('Performance updated.')
          this.loading = false
        }).catch((error) => {
          this.$emit('error', error)
          this.showDangerToast('Error updating performance.')
          this.loading = false
        });
      }
    },
  },

  data: () => {
    return {
      loading: false,
      date: null,

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
            styleClasses: ['half-width'],
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
            type: "input",
            inputType: "text",
            label: "Duration (hours)",
            model: "duration",
            required: true,
            pattern: '^([0-9]{1,2}(?:(?::[0-9]{2})?(?:[\\.,][0-9]{1,2})?)?)$',
            validator: VueFormGenerator.validators.string,
            styleClasses: ['half-width'],
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
      }
    }
  }
}
</script>

<style lang="less">
.half-width {
  width: 50%;
  float: left;

  &+ .half-width {
    padding-left: 5px;
  }
}

.third-width {
  width: 33%;
  float: left;

  &+ .third-width {
    padding-left: 5px;
  }
}
</style>
