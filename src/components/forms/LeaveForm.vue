<template lang="pug">
div
  .card.card-top-blue.col-md-12
    h4.card-title.text-md-center
      i.fa.fa-plane
      | &nbsp; Request a Leave

    .card-block
      vue-form-generator(v-if='upcomingLeaves', :schema="schema", :model="model", :options="formOptions")
      .btn.btn-success.col-md-12(@click='submitLeaveRequest()')
        i.fa.fa-spinner.fa-pulse.fa-3x.fa-fw(v-if='requestLoading')
        i.fa.fa-plus.submit-icons(v-else)
</template>

<script>
import moment from 'moment';
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types';
import store from '../../store';

var upcoming_leaves = [];
var model = { end_date: null };

export default {

  components: {
  },

  created: function() {
    store.dispatch(types.NINETOFIVER_RELOAD_UPCOMING_LEAVES);
  },

  computed: {

    upcomingLeaves: function() {
      if(store.getters.upcoming_leaves) {
        var leavedate_arr = [];
        var today = moment();

        // For each leave object in the response w/out rejected status
        // push the date for each leavedate object into a global array.
        store.getters.upcoming_leaves.forEach(lv => {

          if(lv.status !== store.getters.leave_statuses[1]) {
            lv.leavedate_set.forEach(ld => {
              var start = moment(ld.starts_at, 'YYYY-MM-DD HH:mm:ss');
              var end = moment(ld.ends_at, 'YYYY-MM-DD HH:mm:ss');

              // If today is same date as lvd's start/end
              // && lvd's start && end are at the start <> end of the day
              if( today.startOf('day').isSameOrBefore(start)
                && today.endOf('day').isSameOrAfter(end)) {
                today = today.add(1, 'days');
              }

              leavedate_arr.push(start.toDate());
            });
          }
        });

        this.initializeModel(today, null);
        upcoming_leaves = leavedate_arr;
        return store.getters.upcoming_leaves;
      }
    }

  },

  methods: {

    //Sets up model, needs to be called when upcoming_leaves are fully loaded to set start_- & end_date
    initializeModel: function(start_date, end_date) {
      model.start_date = start_date;
      model.start_full_day = true;
      model.start_hour = moment('09:00', 'HH:mm').format('HH:mm');
      model.end_date = model.start_date;
      model.end_full_day = true;
      model.end_hour = moment('17:30', 'HH:mm').format('HH:mm');
      model.attachments = null;
      model.description = '';
      model.leave_type = null;
    },

    //Shows a toast with a message
    showToast: function(message) {
      this.$toast(
        message,
        { 
          id: 'leave-toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 1500,
          transition: 'slide-down',
          mode: 'override'
      });
    },

    //Submit form manually to get around styling obstructions from VFG-library
    submitLeaveRequest: function() {

      if( this.model['start_date'] && this.model['end_date'] && this.model['leave_type'] && this.model['description'] ) {
        this.requestLoading = true;

        var s_time = moment(model.start_hour, "HH:mm");
        var s_date = moment(model.start_date).startOf('date');

        if(!model.start_full_day)
          s_date.hours(s_time.hours()).minutes(s_time.minutes());

        var e_time = moment(model.end_hour, "HH:mm");
        var e_date = moment(model.end_date).endOf('date');

        if(!model.end_full_day)
          e_date.hours(e_time.hours()).minutes(e_time.minutes());

        //Make leave object
        store.dispatch(
          types.NINETOFIVER_API_REQUEST, 
          { 
            path: '/my_leaves/',
            method: 'POST',
            body: {
              leave_type: model.leave_type,
              status: store.getters.leave_statuses[3],      //Get 'DRAFT'
              description: model.description,
            },
            emulateJSON: true,
          }
        ).then((lvResponse) => {

          if(lvResponse.status == 201) {

            //Make leavedates and bind them to the leave
            store.dispatch(
              types.NINETOFIVER_API_REQUEST,
              {
                path: '/services/my_leave_request/',
                method: 'POST',
                body: {
                  leave: lvResponse.body.id,
                  timesheet: 0,
                  starts_at: s_date.format('YYYY-MM-DDTHH:mm:ss'),
                  ends_at: e_date.format('YYYY-MM-DDTHH:mm:ss')
                },
                emulateJSON: true,
              }
            ).then((lvdResponse) => {

              //SUCCESS
              if(lvdResponse.status == 201) {

                this.showToast('Leave successfully requested.');
                this.initializeModel();
                this.requestLoading = false;

                //Update the leave object's status
                store.dispatch(
                  types.NINETOFIVER_API_REQUEST, 
                  {
                    path: '/my_leaves/' + lvResponse.body.id + '/',
                    method: 'PATCH',
                    body: {
                      status: store.getters.leave_statuses[0],     //Get 'PENDING'
                    },
                    emulateJSON: true,
                  }
                );

                //If attachments were added to the leaverequest
                if(model.attachments) {
                  var attachIDs = [];

                  for(var i = 0; i < model.attachments.length; i++) {
                    var formData = new FormData();
                    formData.append('label', model.attachments[i].name)
                    formData.append('file', model.attachments[i]);

                    //Make attachment
                    store.dispatch(
                      types.NINETOFIVER_API_REQUEST,
                      {
                        path: '/my_attachments/',
                        method: 'POST',
                        body: formData
                      }
                    ).then((attResponse) => {

                      attachIDs.push(attResponse.data.id);

                      if(attachIDs.length === model.attachments.length) {
                        //Make patchcall to my_leaves to link attachment_id
                        store.dispatch(
                          types.NINETOFIVER_API_REQUEST,
                          {
                            path: '/my_leaves/' + lvResponse.body.id + '/',
                            method: 'PATCH',
                            body: {
                              attachments: attachIDs 
                            }
                          }
                        );
                      }      
                    });
                  }
                }

              // Leaverequest did not go through properly
              } else {
                this.requestLoading = false;
                this.showToast('Something went wrong during the request. Check console for more info.');
                console.log(lvdResponse);
              }

            });
          } else {
            this.requestLoading = false;
            console.log(lvResponse);
          }
        });

      //Model did not properly validate
      } else {
        this.showToast('Properly fill out the form please.')
      }
    }
  },

  data: () => {
    return {
      name: 'LeaveForm',

      requestLoading: false,

      model: model,
      
      schema: {
        fields: [
          {
            //FROM DATE
            type: "pikaday",
            model: "start_date",
            label: "From",
            featured: true,
            required: true,
            placeholder: 'Start of leave',
            validator: VueFormGenerator.validators.date,

            pikadayOptions: {
              minDate: moment().toDate(),
              position: "top",
              format: "DD MMMM YYYY",
              formatStrict: true,
              firstDay: 1,
              showWeekNumber: true,
              showDaysInNextAndPreviousMonths: true,

              disableDayFn: val => {
                return upcoming_leaves.find(x => {
                  return x.setHours(0,0,0,0) === val.setHours(0,0,0,0)
                });
              }
            },

            styleClasses: ['col-md-6', 'clearfix'],

            onChanged: function(model, newVal, oldVal, field) {
                model.end_date = newVal;
            },
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
            step: 60 * 5,         //Jump by 5 minutes

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
            placeholder: 'End of leave',
            validator: VueFormGenerator.validators.date,

            pikadayOptions: {
              minDate: moment().toDate(),
              position: "bottom",
              format: "DD MMMM YYYY",
              formatStrict: true,
              firstDay: 1,
              showWeekNumber: true,
              showDaysInNextAndPreviousMonths: true,

              disableDayFn: val => {
                return val < model.start_date ? true : upcoming_leaves.find(x => {
                  return x.getTime() === val.getTime()
                });
              }
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
            step: 60 * 5,         //Jump by 5 minutes,

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
            values: function() {
              if(store.getters.leave_types)
                return store.getters.leave_types;
            },

            styleClasses: 'col-md-6',
            validator: VueFormGenerator.validators.required,
          },
          {
            //ATTACHMENT
            type: "input",
            inputType: "file",
            model: "attachments",
            label: "Attachment",
            files: true,
            multiple: true,

            styleClasses: 'col-md-6',
          }
        ]
      },

      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true
      }
    }
  },

}
</script>

<style>
.submit-icons {
  font-size: 21px;
}
</style>