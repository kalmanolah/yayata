<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center') ⏳&nbsp;
    span(v-if='!model.id') Log performance
    span(v-else) Update performance

  div(class='card-body')
    vue-form-generator(:schema="schema" :model="model" :options="formOptions")

    div(class='form-group my-0')
      div(class='row justify-content-between')
        div(class='col')
          input(class='btn btn-primary' type="submit" value="Save" @click="submit()")
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
    'timesheet'
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
        if (!store.getters.my_contracts) {
          store.dispatch(types.NINETOFIVER_RELOAD_MY_CONTRACTS).then(() => resolve())
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

  methods: {
    resetForm: function() {
      if (this.performance) {
        this.model.id = this.performance.id
        this.model.performance_type = this.performance.performance_type.id
        this.model.contract_role = this.performance.contract_role.id
        this.model.contract = this.performance.contract.id
        this.model.timesheet = this.performance.timesheet
        this.model.day = this.performance.day
        this.model.duration = Number(this.performance.duration)
        this.model.description = this.performance.description
      } else {
        this.model.id = null
        this.model.performance_type = store.getters.performance_types[0].id
        this.model.contract_role = store.getters.my_contract_users[0].contract_role.id
        this.model.contract = store.getters.my_contracts[0].id
        this.model.timesheet = this.timesheet ? this.timesheet.id : store.getters.my_current_timesheet.id
        this.model.day = this.day ? this.day : moment().date()
        this.model.duration = 1
        this.model.description = null
      }

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

    submit: function() {
      if (this.loading) return
      this.loading = true

      let body = {
        timesheet: this.model.timesheet,
        day: this.model.day,
        duration: this.model.duration,
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

      model: model,

      schema: {
        fields: [
          {
            type: "select",
            label: "Contract",
            model: "contract",
            required: true,
            selectOptions: {
              value: "id",
              name: "display_label"
            },
            values: () => {
              if (store.getters.my_contracts) {
                return store.getters.my_contracts
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
              if (store.getters.my_contract_users) {
                return store.getters.my_contract_users
                  .filter((x) => x.contract.id == this.model.contract)
                  .map((x) => x.contract_role)
              }

              return []
            },
            validator: VueFormGenerator.validators.required,
            styleClasses: ['half-width']
          },
          {
            type: "input",
            inputType: "number",
            label: "Duration",
            model: "duration",
            required: true,
            min: 0,
            max: 24,
            validator: VueFormGenerator.validators.number,
            styleClasses: ['half-width']
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
              if (this.model.contract) {
                let contract = store.getters.my_contracts.filter((x) => x.id == this.model.contract)[0]

                if (contract.performance_types && contract.performance_types.length) {
                  return contract.performance_types
                }

                if (store.getters.performance_types) {
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
