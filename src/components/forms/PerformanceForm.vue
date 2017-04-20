<template lang="pug">
  div
    vue-form-generator(:schema="schema", :model="model", :options="formOptions")
    button.col-md-12.btn-success.fa.fa-check(v-on:click='submitForm')
</template>

<script>
import moment from 'moment';
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types';
import store from '../../store';

export default {
  props: [ 'selectedDate' ],

  computed: {
    today: function() { 
      return this.selectedDate; 
    },

    timesheets: function() {
      if(store.getters.timesheets)
        return store.getters.timesheets;
    },

  },

  watch: {},

  methods: {

    submitForm: function() {
      var timesheet = this.timesheets.find(x => 
        x.month == (this.today.month() + 1)
        &&
        x.year == this.today.year()
      );

      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        {
          path: '/my_performances/activity/',
          method: 'POST',
          body: {
            timesheet: timesheet.id,
            day: this.today.date(),
            duration: this.model.duration,
            description: this.model.description,
            performance_type: this.model.performance_type,
            contract: this.model.contract,
          },
          emulateJSON: true,
        }
      ).then((response) => {
        if(response.status == 201)
          this.$emit('success', response);
      });
    },

  },

  data: () => {
    return {
      name: 'PerformanceForm',

      //VUE FORM GENERATOR FIELDS
      model: {
        contract: null,
        duration: 0,
        performance_type: null,
        description: "",
      },

      schema: {
        fields: [
          {
            //CONTRACT
            type: "select",
            model: "contract",
            required: true,

            values: function() {
              if(store.getters.contracts) {
                var activeContracts = store.getters.contracts.filter(x => { return x.active === true });

                return activeContracts.map(x => {
                  return { id: x.id, name: x.customerName + ':' + x.name }
                });                
              }
            },

            styleClasses: 'col-md-8',
            validator: VueFormGenerator.validators.required
          },
          {
            //DURATION
            type: "input",
            inputType: "number",
            model: "duration",
            required: true,
            step: 0.5,
            min: 0,

            styleClasses: 'col-md-4',
            validator: VueFormGenerator.validators.number
          },
          {
            //DESCRIPTION
            type: "textArea",
            model: "description",
            required: true,

            styleClasses: 'col-md-12',
            validator: VueFormGenerator.validators.string
          },
          {
            //PERFORMANCE_TYPE
            type: "select",
            model: "performance_type",
            required: true,
            values: function(model) {
              if(store.getters.performance_types && store.getters.contracts && model.contract) {
                var cont = store.getters.contracts.find(c => {
                  return c.id === model.contract
                });

                return store.getters.performance_types.filter(pt => {
                  return cont.performance_types.includes(pt.id);
                });
              }
            },

            styleClasses: 'col-md-12',
            validator: VueFormGenerator.validators.required
          }
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
