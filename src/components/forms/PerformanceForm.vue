<template lang="pug">
  div {{ test }}
    vue-form-generator(:schema="schema", :model="model", :options="formOptions")
    
</template>

<script>
import moment from 'moment';
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types'
import * as constant from '../../store/constants'
import store from '../../store'

export default {

  components: {
  },

  props: [ 'test' ],
  
  data: () => {
    return {

      name: 'PerformanceForm',

      //VUE FORM GENERATOR FIELDS
      model: {
        project: null,
        duration: 0,
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

              console.log(arr);
              
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
            //STANDY OR PERFORMANCE
            type: "switch",
            label: "Standby",
            model: "standby",
            textOn: "Activity",
            textOff: "Standby"
          },
          {
            //SUBMIT FIELD
            type: "submit",
            validateBeforeSubmit: true,
            onSubmit: function(model, schema) {

              console.log(this.test);

              // store.dispatch(types.NINETOFIVER_API_REQUEST, {
              //   path: '/my_timesheets/',
              //   params: {
              //     month: 
              //   }
              // })

              // store.dispatch(
              //   types.NINETOFIVER_API_REQUEST, 
              //   {
              //     path: '/my_performances/',
              //     method: 'POST',
              //     data: {
              //       timesheet: ,
              //       day: ,
              //       duration: ,
              //       description: ,
              //       performance_type: ,
              //       contract: ,
              //     },
              //     emulateJSON: true,
              //   }
              // ).then((response) => {
              //   console.log(response);
              // }, () => {
              //   this.loading = false
              // });

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
  },

  watch: {
    test: function(newTest) {
      console.log(newTest);
    }
  }
}
</script>
