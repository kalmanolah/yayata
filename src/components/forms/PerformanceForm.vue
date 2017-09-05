<template lang="pug">
  div
    .text-center
      i.fa.fa-calendar-check-o
      span &nbsp; {{ today | moment('DD/MM/YYYY') }}
    vue-form-generator(:id='"vfg-" + i', :schema="schema", :model="model", :options="formOptions")

    button.btn.btn-success.col(v-bind:class='submitButtonStyle', @click='validateForm', :disabled='!formHasData')
      i.fa.fa-check
      span &nbsp; Submit

    button.btn.btn-danger.col-6(v-if='defaultPerformance', @click='deleteEntry')
      i.fa.fa-remove
      span &nbsp; Delete
</template>

<script>
import moment from 'moment';
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types';
import store from '../../store';
import ToastMixin from '../mixins/ToastMixin.vue';
import RequiredPerformedDayMixin from '../mixins/RequiredPerformedDayMixin.vue';
var model = { contract: null };

export default {
  mixins: [ ToastMixin, RequiredPerformedDayMixin ],
  props: {

    properties: {
      type: Object,
      default: null,
      validator(value) {
        return (value !== null && value !== undefined && typeof value === 'object')
      }
    }

  },

  created: function() {
    model.contract = this.defaultContract;
    model.duration = this.defaultPerformance ? this.defaultDuration : this.getHours();
    model.performance_type = this.defaultPerformanceType ? this.defaultPerformanceType : store.getters.performance_types[0].id ;
    model.description = this.defaultDescription;
    model.contract_role = this.defaultContractRole ? this.defaultContractRole : store.getters.contract_roles[0].id;

    // Reload filtered contracts so that the user only sees contracts he's working on.
    store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, {
      params: {
        contractuser__user__id: store.getters.user.id
      }
    });
  },

  computed: {
    today: function() { 
      return this.defaultProperties ? this.defaultProperties.date : moment(); 
    },

    submitButtonStyle: function() {
      return this.defaultPerformance ? 'col-sm-6' : 'col-sm-12';
    },

    defaultProperties: function() {
      return this.properties || null;
    },

    defaultPerformance: function() {
      if(this.defaultProperties)
        return Object.keys(this.defaultProperties).length > 0 ? this.defaultProperties.data : null;
    },

    defaultContract: function() {
      return this.defaultPerformance ? this.defaultPerformance.contract : null;
    },

    defaultDuration: function() {
      return this.defaultPerformance ? this.defaultPerformance.duration : 0;
    },
    defaultContractRole: function() {
      return this.defaultPerformance ? this.defaultPerformance.contract_role: null;
    },

    defaultPerformanceType: function() {
      return this.defaultPerformance ? this.defaultPerformance.performance_type : null;
    },

    defaultDescription: function() {
      return this.defaultPerformance ? this.defaultPerformance.description : "";
    },

    timesheets: function() {
      if(store.getters.timesheets)
        return store.getters.timesheets;
    },

    formHasData: function() {
      if(this.model.contract 
        // && this.model.duration 
        && this.model.performance_type 
        && this.model.contract_role) {
        return true;
      } else {
        return false;
      };
    },

    activityPerformances: function() {
      if(store.getters.monthly_activity_performances) {
        return store.getters.monthly_activity_performances; 
      }
    },

    workSchedule: function() {
      if(store.getters.user_work_schedule) {
        return store.getters.user_work_schedule;
      }
    },

    leaves: function() {
      if(store.getters.leaves && store.getters.user) {
        return store.getters.leaves.filter( (leave) => {
          return leave.user == store.getters.user.id
        })
      }
    },

    holidays: function() {
      if(store.getters.holidays && store.getters.user && this.today) {
        return store.getters.holidays.filter((holiday) => {
          return holiday.country == store.getters.user.userinfo.country && moment(holiday.date).isSame(moment(this.today), 'day')
        })
      }
    },

    contracts: function() {
      if(store.getters.filtered_contracts) {
      var activeContracts = store.getters.filtered_contracts.filter(x => { return x.active === true });

      return activeContracts.map(x => {
        return { id: x.id, name: x.name +  ' → ' + x.customerName }
        });                
      }
    },

    performance_types: function() {
      if(store.getters.performance_types && store.getters.contracts && model.contract) {
        var cont = store.getters.contracts.find(c => {
          return c.id === model.contract;
        });

        return store.getters.performance_types.filter(pt => {
          return cont.performance_types.includes(pt.id);
        });
      }
    },

    contract_roles: function() {
      if(store.getters.contract_users && store.getters.user && model.contract){
        var contract_users = store.getters.contract_users.filter( cu => {
          return (cu.user === store.getters.user.id && cu.contract === model.contract)
        })
        var contract_roles = [];
        contract_users.forEach( cu => {
          contract_roles.push(store.getters.contract_roles.find( cr => cr.id === cu.contract_role));
        });
        
        return contract_roles;
      } 
    }
  },

  watch: {
    model: {
      handler: function(newModel, oldModel) {
        // On selecting a contract; select the first performance type and contract role
        if(this.performance_types) {
          this.model['performance_type'] = this.performance_types[0].id;
        }
        if(this.contract_roles) {
          this.model['contract_role'] = this.contract_roles[0].id;
        }
      },
      deep: true
    }
  },

  methods: {
    getHours: function() {
      let hours = this.today ? (parseFloat(this.getHoursTotal(this.today)) - parseFloat(this.getDurationTotal(this.today))) : 8;
      return hours < 0 ? 0 : hours;
    },
    //Deletes performance-entry
    deleteEntry: function() {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST,
        {
          path: '/my_performances/activity/' + this.defaultPerformance['id'] + '/',
          method: 'DELETE'
        }
      ).then((response) => {
        if(response.status == 200 || response.status == 204) {
            this.$emit('success', response);
            this.showInfoToast('Performance successfully deleted.');
        }
        store.dispatch(types.NINETOFIVER_RELOAD_ACTIVITY_PERFORMANCES);
      }).catch((error) => {
        console.log(error);
        this.showDangerToast('Error deleting performance. Console has more information.');
      })
    },

    //Validates the form & sends data according to its value
    validateForm: function() {
      // // Check if the selected contract is a projectcontract
      // this.isProjectContract = (store.getters.contracts.find(c => c.id === this.model.contract).contract_type === 'ProjectContract') ? true : false;

      // // if the selected contract is not a project contract, give contract_role an empty value so we don't trip the validation.
      // if(!this.isProjectContract)
      //   this.model.contract_role = '';

      var modelValidationCheck = Object.keys(this.model).every(x => {
          return this.model[x] != null;
      });

      if( !modelValidationCheck || this.model.duration <= 0) {
        this.showWarningToast('Please fill in all information before submitting.');
      } else {

        var timesheet = this.timesheets.find(x => 
          x.month == (this.today.month() + 1)
          &&
          x.year == this.today.year()
        );

        if(timesheet) {
          this.submitForm(timesheet.id);
        } else {

          store.dispatch(
            types.NINETOFIVER_API_REQUEST,
            {
              path: '/my_timesheets/',
              method: 'POST',
              body: {
                year: this.today.year(),
                month: this.today.month() + 1
              },
              emulateJSON: true,
            }
          ).then((response) => {
            console.log( response );
            if(response.status == 201)
              this.submitForm(response.data.id);
            store.dispatch(types.NINETOFIVER_RELOAD_TIMESHEETS);
          }).catch((error) => {
            console.log(error);
            this.showDangerToast('Timesheet could not be created for this performance');
          });
        }
      }
    },

    //Submits the form & makes correct call based on data
    submitForm: function(timesheetID) {
      var body = {};

      body = {
        timesheet: timesheetID,
        day: this.today.date(),
        duration: this.model.duration,
        description: this.model.description,
        performance_type: this.model.performance_type,
        contract: this.model.contract,
        contract_role: this.model.contract_role
      };

      if(this.defaultPerformance)
        this.patchRequest(this.defaultPerformance['id'], body);
      else
        this.postRequest(body);
    },

    //Patches an existing performance with the new params
    patchRequest: function(id, body) {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST,
        {
          path: '/my_performances/activity/' + id + '/',
          method: 'PATCH',
          body: body,
          emulateJSON: true,
        }
      ).then((response) => {

          if(response.status == 200) {
            this.$emit('success', response);
            this.showInfoToast('Performance successfully patched.');
            store.dispatch(types.NINETOFIVER_RELOAD_ACTIVITY_PERFORMANCES);
            store.dispatch(types.NINETOFIVER_RELOAD_MONTHLY_ACTIVITY_PERFORMANCES);
          }
        }).catch((error) => {
          console.log(error);
          this.showDangerToast('Error patching performance. Console has more information.');
        });
    },

    //Posts the new performance
    postRequest: function(body) {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        {
          path: '/my_performances/activity/',
          method: 'POST',
          body: body,
          emulateJSON: true,
        }
      ).then((response) => {
        console.log(response)
        if(response.status == 201) {
          this.$emit('success', response);
          this.showSuccessToast('Performance successfully added');
          store.dispatch(types.NINETOFIVER_RELOAD_ACTIVITY_PERFORMANCES);
          store.dispatch(types.NINETOFIVER_RELOAD_MONTHLY_ACTIVITY_PERFORMANCES);
        }
      }).catch((error) => {
        console.log(error);
        this.showDangerToast('Error adding performance. Console has more information.');
      });
    }
  },

  data: () => {
    return {
      name: 'PerformanceForm',
      isProjectContract: false,
      model: model,

      schema: {
        fields: [
          {
            //CONTRACT
            type: "select",
            model: "contract",

            values: function() {
              if(store.getters.filtered_contracts) {
              var activeContracts = store.getters.filtered_contracts.filter(x => { return x.active === true });

              return activeContracts
                .map(x => {
                  return { id: x.id, name: x.customerName +  ' → ' + x.name }
                })
                .sort((a, b) =>{
                  let aName = a.name.toLowerCase();
                  let bName = b.name.toLowerCase();
                  return aName > bName ? 1 : (aName < bName ? -1 : 0)
                });                
            }
          },

            styleClasses: ['compact-field', 'd-inline-flex', 'col-8'],
          },
          {
            //DURATION
            type: "input",
            inputType: "number",
            model: "duration",
            required: true,
            step: 0.5,
            min: 0,

            styleClasses: ['compact-field', 'd-inline-flex', 'col-4'],
          },
          {
            //DESCRIPTION
            type: "textArea",
            model: "description",
            placeholder: "What did you do today?",
            required: true,
            max: 500,
            rows: 3,

            styleClasses: ['compact-field', 'col-12'],
          },
          {
            //PERFORMANCE_TYPE
            type: "select",
            model: "performance_type",
            values: () => {
              if(store.getters.performance_types && store.getters.contracts && model.contract) {
                var cont = store.getters.contracts.find(c => {
                  return c.id === model.contract;
                });

                return store.getters.performance_types.filter(pt => {
                  return cont.performance_types.includes(pt.id);
                });
              }
            },
            styleClasses: ['compact-field', 'col-12'],
          },
          {
            //CONTRACT_ROLE
            type: "select",
            model: "contract_role",
            required: true,
            values: () => {
              if(store.getters.contract_users && store.getters.user && model.contract){
                var contract_users = store.getters.contract_users.filter( cu => {
                  return (cu.user === store.getters.user.id && cu.contract === model.contract)
                })
                var contract_roles = [];
                contract_users.forEach( cu => {
                  contract_roles.push(store.getters.contract_roles.find( cr => cr.id === cu.contract_role));
                });
                
                return contract_roles;
              }
            },
            styleClasses: ['compact-field', 'col-12'],
          },
        ]
      },

      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true
      }
    }
  }
}
</script>

<style>

  #vfg-undefined > fieldset {
    padding-top: 1.5rem;
    flex-direction: row;
  }

  .compact-field {
    font-size: 10px;
    margin: -15px 0px 2px 0px;
    padding: 3px;
  }

  .field-wrap {
    width: 100%;
  }

</style>