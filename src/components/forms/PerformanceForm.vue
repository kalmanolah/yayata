<template lang="pug">
  div
    .text-xs-center
      i.fa.fa-calendar-check-o
      span &nbsp; {{ today | moment('DD/MM/YYYY') }}
    vue-form-generator(:id='"vfg-" + i', :schema="schema", :model="model", :options="formOptions")

    button.btn.btn-success(v-bind:class='submitButtonStyle', @click='validateForm', v-if='formHasData')
      i.fa.fa-check
      span &nbsp; Submit
    button.btn.btn-success(v-bind:class='submitButtonStyle', @click='validateForm', v-if='!formHasData', disabled)
      i.fa.fa-check
      span &nbsp; Submit
    button.btn.btn-danger.col-sm-6(v-if='defaultPerformance', @click='deleteEntry')
      i.fa.fa-remove
      span &nbsp; Delete
</template>

<script>
import moment from 'moment';
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types';
import store from '../../store';

var model = { contract: null };

export default {

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
    model.duration = this.defaultPerformance ? this.defaultDuration : 0;
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
        return Object.keys(this.defaultProperties).length > 0 ? this.defaultProperties.performance : null;
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

  },

  watch: {},

  methods: {

    //Displays a toast with message
    showToast(text) {
      this.$toast(text, 
        { 
          id: 'performance-toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 1000,
          transition: 'slide-down',
          mode: 'override'
        });
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
            this.showToast('Performance successfully deleted.');
          } else {
            console.log(response);
            this.showToast('Error deleting performance. Console has more information.');
          }

      })
    },

    //Validates the form & sends data according to its value
    validateForm: function() {
      // Check if the selected contract is a projectcontract
      this.isProjectContract = (store.getters.contracts.find(c => c.id === this.model.contract).contract_type === 'ProjectContract') ? true : false;

      // if the selected contract is not a project contract, give contract_role an empty value so we don't trip the validation.
      if(!this.isProjectContract){
        this.model.contract_role = '';
      }
      var modelValidationCheck = Object.keys(this.model).every(x => {
          return this.model[x] != null;
      });

      if( !modelValidationCheck || this.model.duration <= 0) {
        this.showToast('Please fill in all information before submitting.');
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
              params: {
                year: this.today.year(),
                month: this.today.month() + 1
              }
            }
          ).then((response) => {
            console.log( response );
            if(response.status == 201)
              this.submitForm(response.data.id);
            else
              this.showToast('Timesheet could not be created for this performance');
          });
        }
      }
    },

    //Submits the form & makes correct call based on data
    submitForm: function(timesheetID) {
      var body = {};
      if(this.isProjectContract){
        body = {
          timesheet: timesheetID,
          day: this.today.date(),
          duration: this.model.duration,
          description: this.model.description,
          performance_type: this.model.performance_type,
          contract: this.model.contract,
          contract_role: this.model.contract_role
        };
      } else {
        body = {
          timesheet: timesheetID,
          day: this.today.date(),
          duration: this.model.duration,
          description: this.model.description,
          performance_type: this.model.performance_type,
          contract: this.model.contract,
        };
      }

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
            this.showToast('Performance successfully patched.');
          } else {
            console.log(response);
            this.showToast('Error patching performance. Console has more information.');
          }
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
          this.showToast('Performance successfully added');
        } else {
          console.log(response);
          this.showToast('Error adding performance. Console has more information.');
        }
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

                return activeContracts.map(x => {
                  return { id: x.id, name: x.name +  ' → ' + x.customerName }
                });                
              }
            },

            styleClasses: ['compact-field', 'col-md-8'],
          },
          {
            //DURATION
            type: "input",
            inputType: "number",
            model: "duration",
            required: true,
            step: 0.5,
            min: 0,

            styleClasses: ['compact-field', 'col-md-4'],
          },
          {
            //DESCRIPTION
            type: "textArea",
            model: "description",
            required: true,
            max: 500,
            rows: 3,

            styleClasses: ['compact-field', 'col-md-12'],
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
          },
          {
            //CONTRACT_ROLE
            type: "select",
            model: "contract_role",
            required: false,
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
            styleClasses: ['compact-field', 'col-md-12'],
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

  .compact-field {
    font-size: 10px;
    margin: -15px 0px 2px 0px;
    padding: 3px;
  }

</style>