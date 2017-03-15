<template lang="pug">
div
  .card.card-top-blue.col-md-12
    h4.card-title.text-md-center
      i.fa.fa-plane
      | &nbsp; Request a Leave
    .card-block
      vue-form-generator(:schema="schema", :model="model", :options="formOptions")
</template>

<script>
import moment from 'moment';
import { datetimepicker } from 'eonasdan-bootstrap-datetimepicker'
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types'
import store from '../../store'

export default {

  components: {
    dateTimePicker: datetimepicker,
  },

  data: () => {
    return {

      name: 'LeaveForm',

      model: {
        start_date: moment().add(1, 'days').toISOString(),
        end_date: moment().add(2, 'days').toISOString(),
        start_hour: moment('00:00:00', 'HH:mm:ss').format('YYYY HH:mm:ss'),
        end_hour: moment('00:00:00', 'HH:mm:ss').format('YYYY HH:mm:ss'),
        start_full_day: true,
        end_full_day: true,
        description: "",
        leave_type: null,
        attachment: null,
      },

      schema: {
        fields: [
          {
            //FROM DATE
            type: "dateTimePicker",
            model: "start_date",
            label: "From",
            featured: true,
            required: true,
            validator: VueFormGenerator.validators.date,

            dateTimePickerOptions: {
              format: 'DD MMMM YYYY',
              minDate: moment().add(1, 'days'),
              icons: {
                date: 'fa fa-calendar',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-calendar-check-o ',           
              },
              showTodayButton: true,
            },
            styleClasses: ['col-md-6', 'clearfix']
          },
          {
            //FROM DURATION
            type: "checkbox",
            model: "start_full_day",
            label: "Full day",

            styleClasses: 'col-md-2'
          },
          {
            //FROM STARTING_TIME
            type: "dateTimePicker",
            model: "start_hour",
            label: "Time",
            placeholder: "HH:mm",
            required: false,

            dateTimePickerOptions: {
              format: 'HH:mm',
              stepping: 30,
              icons: {
                time: 'fa fa-clock-o',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',                
              }
            },
            styleClasses: 'col-md-4',

            disabled: function(model) {
            //Enabled if full day-duration is false
              return model && model.start_full_day;
            }
          },
          {
            //TO DATE
            type: "dateTimePicker",
            model: "end_date",
            label: "To",
            featured: true,
            required: true,
            validator: VueFormGenerator.validators.date,

            dateTimePickerOptions: {
              format: 'DD MMMM YYYY',
              icons: {
                date: 'fa fa-calendar',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-calendar-check-o ',           
              },
              showTodayButton: true,
            },
            styleClasses: ['col-md-6', 'clearfix', ],
          },
          {
            //TO DURATION
            type: "checkbox",
            label: "Full day",
            model: "end_full_day",

            styleClasses: 'col-md-2'
          },
          {
            //TO STARTING_TIME
            type: "dateTimePicker",
            model: "end_hour",
            label: "Time",
            placeholder: "HH:mm",
            required: false,

            dateTimePickerOptions: {
              format: 'HH:mm',
              stepping: 30,
              icons: {
                time: 'fa fa-clock-o',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',            
              },
            },
            styleClasses: 'col-md-4',

            disabled: function(model) {
              //Enabled if full day-duration is false
              return model && model.end_full_day;
            }
          },
          {
            //DESCRIPTION
            type: "textArea",
            model: "description",
            label: "Description",

            styleClasses: 'col-md-12'
          },
          {
            //LEAVE TYPE
            type: "checklist",
            model: "leave_type",
            label: "Leavetype",
            listBox: false,
            values: types.LEAVE_TYPES.map(x => { return x['label'] }),

            styleClasses: 'col-md-6'
          },
          {
            //ATTACHMENT
            type: "input",
            inputType: "file",
            model: "attachment",
            label: "Attachment",

            styleClasses: 'col-md-6'
          },
          {
            //SUBMIT FIELD
            type: "submit",
            validateBeforeSubmit: true,
            onSubmit: function(model, schema) {

              store.dispatch(
                types.NINETOFIVER_API_REQUEST, 
                {
                  path: '/my_leaves/',
                  method: 'POST',
                  data: {
                    leave_type: 0,
                    status: 'PENDING',
                  },
                  emulateJSON: true,
                }
              ).then((response) => {
                console.log(response);
              }, () => {
                this.loading = false
              });

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

  }

}
</script>
