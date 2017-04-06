<template lang="pug">
  div
    vue-form-generator(:schema="schema", :model="model", :options="formOptions")
    button.col-md-12.btn-success(v-on:click='submitForm') +
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

    contracts: function() {
      if(store.getters.contracts)
        return store.getters.contracts;
    },

    leave_types: function() {
      if(store.getters.leave_types)
        return store.getters.leave_types;
    }

  },

  watch: {},

  methods: {

    submitForm: function() {
      var model = this.model;
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
            duration: model.duration,
            description: model.description,
            performance_type: model.performance_type,
            contract: model.project,
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
        project: null,
        duration: 0,
        performance_type: null,
        description: "",
      },

      schema: {
        fields: [
          {
            //PROJECT
            type: "select",
            model: "project",

            values: function() {
              if(store.getters.contracts) {
                console.log( store.getters.contracts );
                return store.getters.contracts.map(x => {
                  return { id: x.id, name: x.customer + ':' + x.name }
                });                
              }
            },

            styleClasses: 'col-md-8'
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

            styleClasses: 'col-md-12'
          },
          {
            //PERFORMANCE_TYPE
            type: "select",
            model: "performance_type",
            required: true,
            values: function() {
              if(store.getters.performance_types)
                return store.getters.performance_types;
            },

            styleClasses: 'col-md-12',
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
