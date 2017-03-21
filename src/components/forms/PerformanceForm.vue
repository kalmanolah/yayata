<template lang="pug">
  div
    vue-form-generator(:schema="schema", :model="model", :options="formOptions")
    button.col-md-12.btn-success(v-on:click='submitForm') +
</template>

<script>
import moment from 'moment';
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types';
import * as constant from '../../store/constants';
import store from '../../store';

var self = this;

export default {
  props: [ 'selectedDate' ],

  computed: {
    today: function() { 
      return this.selectedDate; 
    }
  },

  watch: {},

  methods: {

    submitForm: function() {

      var model = this.model;
      var timesheet = constant.MY_TIMESHEETS.find(x => 
          x.month == (this.today.month() + 1)
          &&
          x.year == this.today.year()
        );


      if(model.standby) {
        store.dispatch(
          types.NINETOFIVER_API_REQUEST,
          {
            path: '/my_performances/standby/',
            method: 'POST',
            body: {
              timesheet: timesheet.id,
              day: this.today.date()
            },
            emulateJSON: true,
          }
        ).then((response) => {
          console.log(response);

          if(response.status == 201)
            this.$emit('success', response);
        });
      
      } else {
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
      }
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
        standby: false,
      },

      schema: {
        fields: [
          {
            //PROJECT
            type: "select",
            model: "project",

            values: function() {
              var arr = [];
              constant.CONTRACTS.forEach(x => {
                arr.push({
                  id: x.id,
                  name: x.customer + ': ' + x.label
                });
              });              
              return arr;
            },

            styleClasses: 'col-md-8'
          },
          {
            //DURATION
            type: "input",
            inputType: "number",
            model: "duration",

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
            values: constant.PERFORMANCE_TYPES,

            styleClasses: 'col-md-8',
          },
          {
            //STANDY OR PERFORMANCE
            type: "switch",
            label: "Standby",
            model: "standby",
            textOn: "Activity",
            textOff: "Standby",

            styleClasses: 'col-md-4',
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
