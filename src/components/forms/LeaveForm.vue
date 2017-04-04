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
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types';
import * as constant from '../../store/constants';
import store from '../../store';

export default {

  data: () => {
    return {
      name: 'LeaveForm',

      model: {
        start_date: moment(),
        end_date: moment().add(1, 'days'),
        start_hour: moment('09:00', 'HH:mm').format('HH:mm'),
        end_hour: moment('15:30', 'HH:mm').format('HH:mm'),
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
            type: "pikaday",
            model: "start_date",
            label: "From",
            featured: true,
            required: true,

            pikadayOptions: {
              minDate: moment().toDate(),
              position: "top",
              format: "DD MMMM YYYY",
              formatStrict: true,
              firstDay: 1,
              showWeekNumber: true,
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
            type: "input",
            inputType: "Time",
            model: "start_hour",
            label: "Time",
            required: false,
            step: 60*5,         //Jump by 5 minutes

            styleClasses: 'col-md-4',

            disabled: function(model) {
            //Enabled if full day-duration is false
              return model && model.start_full_day;
            }
          },
          {
            //TO DATE
            type: "pikaday",
            model: "end_date",
            label: "To",
            featured: true,
            required: true,
            validator: VueFormGenerator.validators.date,

            pikadayOptions: {
              minDate: moment().toDate(),
              position: "bottom",
              format: "DD MMMM YYYY",
              formatStrict: true,
              firstDay: 1,
              showWeekNumber: true,
            },

            styleClasses: ['col-md-6', 'clearfix', ],
          },
          {
            //TO DURATION
            type: "checkbox",
            label: "Full day",
            model: "end_full_day",

            styleClasses: 'col-md-2',

            disabled: function(model) {
              //Disabled if end_date == start_date & full_day is selected
              return model && model.start_date === model.end_date && model.start_full_day;
            },
          },
          {
            //TO ENDING_TIME
            type: "input",
            inputType: "Time",
            model: "end_hour",
            label: "Time",
            required: false,
            step: 60*5,         //Jump by 5 minutes,

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
            required: true,

            styleClasses: 'col-md-12',
            validator: VueFormGenerator.validators.required,
          },
          {
            //LEAVE TYPE
            type: "select",
            model: "leave_type",
            label: "Leavetype",
            required: true,
            values: constant.LEAVE_TYPES,

            styleClasses: 'col-md-6',
            validator: VueFormGenerator.validators.required,
          },
          {
            //ATTACHMENT
            type: "input",
            inputType: "file",
            model: "attachment",
            label: "Attachment",

            styleClasses: 'col-md-6',
          },
          {
            //SUBMIT FIELD
            type: "submit",
            validateBeforeSubmit: true,
            onSubmit: function(model, schema) {

              var start_date = moment(model.start_date);
              var start_hour = moment(model.start_hour, "HH:mm");

              start_date = (model.start_full_day) ? start_date.startOf('date') : start_date.hours(start_hour.hours()).minutes(start_hour.minutes());

              var end_date = moment(model.end_date);
              var end_hour = moment(model.end_hour, "HH:mm");

              end_date = (model.end_full_day) ? end_date.endOf('date') : end_date.hours(end_hour.hours()).minutes(end_hour.minutes());

              store.dispatch(
                types.NINETOFIVER_API_REQUEST, 
                { 
                  path: '/my_leaves/',
                  method: 'POST',
                  body: {
                    leave_type: model.leave_type,
                    status: constant.LEAVE_STATUSES[3],      //Get 'DRAFT'
                    description: model.description,
                    attachment: model.attachment,
                  },
                  emulateJSON: true,
                }
              ).then((lvResponse) => {
                console.log(lvResponse);

                store.dispatch(
                  types.NINETOFIVER_API_REQUEST,
                  {
                    path: '/services/my_leave_request/',
                    method: 'POST',
                    body: {
                      leave: lvResponse.body.id,
                      timesheet: 0,
                      starts_at: start_date.format('YYYY-MM-DDTHH:mm:ss'),
                      ends_at: end_date.format('YYYY-MM-DDTHH:mm:ss')
                    },
                    emulateJSON: true,
                  }
                ).then((lvdResponse) => {
                  console.log(lvdResponse);

                  store.dispatch(
                    types.NINETOFIVER_API_REQUEST, 
                    {
                      path: '/my_leaves/' + lvResponse.body.id + '/',
                      method: 'PATCH',
                      body: {
                        status: constant.LEAVE_STATUSES[0],     //Get 'PENDING'
                      },
                      emulateJSON: true,
                    }
                  ).then((updateResponse) => {
                    console.log(updateResponse);
                  });

                });

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
