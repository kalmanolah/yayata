<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center') 💤&nbsp;
    span Standby / On-call

  div(class='card-body')
    vue-form-generator(:schema="schema" :model="model" :options="formOptions")

    div(class='form-group my-0')
      div(class='row justify-content-between')
        div(class='col')
          input(class='btn btn-primary' type="submit" value="Save" @click="submit()")
</template>

<script>
import moment from 'moment';
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types';
import store from '../../store';
import ToastMixin from '../mixins/ToastMixin.vue';

var model = {
  day: null,
  contracts: null,
  timesheet: null,
  performances: null
};
var submit = null;

export default {
  name: 'StandbyWidget',

  mixins: [
    ToastMixin
  ],

  props: [
    'day',
    'timesheet',
    'performances'
  ],

  created: function() {
    submit = this.submit

    Promise.all([
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
      new Promise((resolve, reject) => {
        this.model.timesheet = this.timesheet ? this.timesheet.id : store.getters.my_current_timesheet.id
        this.model.day = this.day ? this.day : moment().date()

        if (this.performances) {
          resolve(this.performances)
        } else {
          store.dispatch(types.NINETOFIVER_API_REQUEST, {
            path: '/my_performances/standby/',
            params: {
              timesheet: this.model.timesheet,
              day: this.model.day,
            }
          }).then(res => {
            resolve(res.data.results)
          })
        }
      }).then(performances => {
        this.model.performances = performances

        this.model.contracts = this.model.performances.map(performance => {
          return performance.contract.id
        })
      })
    },

    submit: function() {
      if (this.loading) return
      this.loading = true

      let contracts = this.model.contracts.slice(0)
      let contractsWithPerformances = this.model.performances.map(performance => performance.contract.id)


      // Every performance not belonging to a selected contract is deleted
      let performancesToDelete = this.model.performances.filter(performance => !contracts.includes(performance.contract.id))
      Promise.all(performancesToDelete.map(performance => {
        return store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: `/my_performances/standby/${performance.id}/`,
          method: 'DELETE',
        })
      })).then(() => {
        // Create performances for all contracts for which there is not yet a performance
        let contractsRequiringPerformances = contracts.filter(contractId => !contractsWithPerformances.includes(contractId))
        Promise.all(contractsRequiringPerformances.map(contractId => {
          let body = {
            timesheet: this.model.timesheet,
            day: this.model.day,
            contract: contractId
          }

          return store.dispatch(types.NINETOFIVER_API_REQUEST, {
            path: '/my_performances/standby/',
            method: 'POST',
            body: body,
          })
        })).then(response => {
          this.$emit('success', response)
          this.showSuccessToast('Performances updated.')
          this.loading = false
          this.resetForm()
        })
      }).catch((error) => {
        this.$emit('error', error)
        this.showDangerToast('Error updating performances.')
        this.loading = false
      })
    },
  },

  data: () => {
    return {
      loading: false,

      model: model,

      schema: {
        fields: [
          {
            type: "checklist",
            label: "Contracts",
            model: "contracts",
            required: true,
            listBox: true,
            checklistOptions: {
              value: "id",
              name: "display_label"
            },
            values: () => {
              if (store.getters.my_contracts) {
                return store.getters.my_contracts.filter(contract => {
                  return contract.type == 'SupportContract'
                })
              }

              return []
            },
            validator: VueFormGenerator.validators.required,
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
