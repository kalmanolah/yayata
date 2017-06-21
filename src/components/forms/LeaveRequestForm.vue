<template lang="pug">
div
  .card.card-top-blue.col-md-12
    h4.card-title.text-md-center
      i.fa.fa-plane
      | &nbsp; Request a Leave

    .card-block
      form.form
        .row
          .col-md-6
            b-form-fieldset(:feedback='fromDateFeedback', label='From', :state='fromDateState', :label-size='1')
              input.form-control#fromDatepicker(ref='fromDatePicker' v-model='fromDate')
          .col-md-2
            b-form-checkbox(v-model='fromFullDay') <strong>Full day</strong>
          .col-md-4
            b-form-fieldset(label='Time')
              b-form-input.form-control(type='time' step='300' v-model='fromTime', :disabled='fromFullDay')
        .row
          .col-md-6
            b-form-fieldset(:feedback='toDateFeedback', label='To', :state='toDateState', :label-size='1')
              input.form-control#toDatepicker(ref='toDatePicker' v-model='toDate')
          .col-md-2
            b-form-checkbox(v-model='toFullDay') <strong>Full day</strong>
          .col-md-4
            b-form-fieldset(label='Time')
              b-form-input.form-control(type='time' step='300' v-model='toTime', :disabled='toFullDay')
        .row
          .col-md-12
            b-form-fieldset(:feedback='descriptionFeedback', label='Description', :state='descriptionState', :label-size='1')
              b-form-input.form-control(textarea v-model='description' placeholder='why are you leaving us')
        .row
          .col-md-6(v-if='leaveTypes')
            b-form-fieldset(:feedback='leaveTypeFeedback', label='Leavetype', :state='leaveTypeState', :label-size='1', input-selector='select')
              b-form-select(:options='leaveTypes' v-model='leaveType', :class='getSelectClass()')
          .col-md-6
            b-form-fieldset(label='Attachments')
              b-form-file(v-model='attachments', :multiple='true', placeholder='upload file(s)', drop-label='file', choose-label='Attachment')
        button.btn.btn-success.col-md-12(@click='submitLeaveRequest()', v-if='buttonState')
          i.fa.fa-spinner.fa-pulse.fa-fw(v-if='requestLoading')
          i.fa.fa-plus.submit-icons(v-else)
        button.btn.btn-success.col-md-12(@click='submitLeaveRequest()', v-else, disabled)
          i.fa.fa-spinner.fa-pulse.fa-fw(v-if='requestLoading')
          i.fa.fa-plus.submit-icons(v-else)
</template>
<script>
// import VueTimepicker from 'vue2-timepicker';
import store from '../../store'
import * as types from '../../store/mutation-types.js'

var upcoming_leaves = [];

export default {
  name: 'leaverequestform',
  components: {
    // VueTimepicker
  },
  data() {
      return {
        // Date
        fromDate: moment().format('DD MMM YYYY'),
        fromDatePicker: '',
        toDate: moment().format('DD MMM YYYY'),
        toDatePicker: '',
        // full day
        fromFullDay: true,
        toFullDay: true,
        // Time
        fromTime: '09:00',
        toTime: '17:30',
        description: '',
        leaveType: null,
        attachments: null,
        requestLoading: false,
      }
  },

  watch: {
    fromDate: function(newFromDate, oldFromdate) {
      this.toDate = moment(newFromDate).format('DD MMM YYYY');
    },
    
    upcomingLeaves:function(newUpcomingLeaves, oldUpcomingLeaves) {
      // This is needed so that the from date is updated correctly on first load.
    }
  },

  mounted: function() {
    this.fromDatePicker = new Pikaday({
      field: this.$refs.fromDatePicker,
      firstDay: 1,
      defaultDate: this.format,
      minDate: moment().toDate(),
      formatStrict: true,
      showWeekNumber: true,
      showDaysInNextAndPreviousMonths: true,
      format: 'DD MMM YYYY',
      disableDayFn: val => {
        return this.upcomingLeaves.find(x => {
          return moment(x.leave_start).isSame(val, 'day');
        });
      },
      onSelect: val => {
        this.fromDate = moment(val).format('DD MMM YYYY');
      }
    });
    this.toDatePicker = new Pikaday({
      field: this.$refs.toDatePicker,
      firstDay: 1,
      minDate: moment().toDate(),
      format: 'DD MMM YYYY',
      formatStrict: true,
      showWeekNumber: true,
      showDaysInNextAndPreviousMonths: true,
      disableDayFn: val => {
        return moment(val).isBefore(this.toDate) ? true : this.upcomingLeaves.find(x => {
          return moment(x.leave_start).isSame(val, 'day');
        });
      }
    });
  },

  methods: {
    submitLeaveRequest: function() {
      if( (this.fromdate instanceof moment) && (this.toDate instanceof moment) && this.leaveType && this.description) {
        this.requestLoading = true;

        let s_time = moment(this.fromTime, "HH:mm");
        let s_date = moment(this.fromDate).startOf('date');

        if(!this.fromFullDay)
          s_date.hours(s_time.hours()).minutes(s_time.minutes());

        let e_time = moment(this.toTime, "HH:mm");
        let e_date = moment(this.toDate).endOf('date');

        if(!this.toFullDay)
          e_date.hours(e_time.hours()).minutes(e_time.minutes());
        
        //Make leave object
        store.dispatch(
          types.NINETOFIVER_API_REQUEST, 
          { 
            path: '/my_leaves/',
            method: 'POST',
            body: {
              leave_type: this.leaveType,
              status: store.getters.leave_statuses[3],      //Get 'DRAFT'
              description: this.description,
            },
            emulateJSON: true,
          }
        ).then((lvResponse) => {

          if(lvResponse.status == 201) {
            console.log(s_date.format('YYYY-MM-DDTHH:mm:ss'))
            console.log(e_date.format('YYYY-MM-DDTHH:mm:ss'))
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
                store.dispatch(types.NINETOFIVER_RELOAD_UPCOMING_LEAVES);
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
                if(this.attachments) {
                  var attachIDs = [];

                  for(var i = 0; i < this.attachments.length; i++) {
                    var formData = new FormData();
                    formData.append('label', this.attachments[i].name)
                    formData.append('file', this.attachments[i]);

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

                      if(attachIDs.length === this.attachments.length) {
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
                      // reset form
                      this.resetForm();
                    });
                  }
                } else {
                  // reset form
                  this.resetForm();
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
    },

    //Shows a toast with a message
    showToast: function(message) {
      this.$toast(
        message,
        { 
          id: 'leave-toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 2000,
          transition: 'slide-down',
          mode: 'override'
      });
    },

    resetForm: function() {

      this.determineMinDate(this.upcomingLeaves);
      this.attachments = null;
      this.description = '';
      this.fromFullDay = true;
      this.fromTime = '09:00';
      this.leaveType = null;
      this.toFullDay = true;
      this.toTime = '17:30';
    },
    
    determineMinDate: function(leaves) {
      let today = moment();
      leaves.forEach(lv => {
        
          if(lv.status !== store.getters.leave_statuses[1]) {
            lv.leavedate_set.forEach(ld => {
              let start = moment(ld.starts_at, 'YYYY-MM-DD HH:mm:ss');
              let end = moment(ld.ends_at, 'YYYY-MM-DD HH:mm:ss');

              // If today is same date as lvd's start/end
              // && lvd's start && end are at the start <> end of the day
              if( today.startOf('day').isSameOrBefore(start)
                && today.endOf('day').isSameOrAfter(end)) {
                today = today.add(1, 'days');
              }

            });
          }
        });
      this.fromDate = moment(today).format('DD MMM YYYY');
      this.toDate = moment(today).format('DD MMM YYYY');
    },

    // Check if leaveType is null and return the coresponding class
    getSelectClass: function() {
      return this.leaveType ? '' : 'select-warning';
    }
  },

  computed: {
    buttonState: function() {
      return this.fromDateState === "success" && this.toDateState === "success" && this.descriptionState === "success" && this.leaveTypeState === "success"
    },

    fromDateFeedback: function() {
      return moment(this.fromDate).isValid() ? '' : 'Please provide a correct date'
    },

    fromDateState: function() {
      return moment(this.fromDate).isValid() ? 'success' : 'warning'
    },

    toDateFeedback: function() {
      return moment(this.toDate).isValid() ? '' : 'Please provide a correct date'
    },

    toDateState: function() {
      return moment(this.toDate).isValid() ? 'success' : 'warning'
    },
    descriptionFeedback: function() {
      return this.description.length ? '' : 'Please provide a description'
    },

    descriptionState: function() {
      return this.description.length ? 'success' : 'warning'
    },

    leaveTypeFeedback: function() {
      return this.leaveType ? '' : 'Please provide a leave type'
    },

    leaveTypeState: function() {
      return this.leaveType ? 'success' : 'warning'
    },
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

        this.fromDate = moment(today).format('DD MMM YYYY');
        upcoming_leaves = leavedate_arr;
        return store.getters.upcoming_leaves;
      }
    },

    leaveTypes: function() {
      let leave_types = [{ text: 'Select leavetype', value: null }];
      if(store.getters.leave_types){
        store.getters.leave_types.forEach((lt) => {
          leave_types.push({
            text: lt.display_label,
            value: lt.id
          });
        });
      }
      return leave_types;
    }
  }
}
</script>
<style lang='less'>

.select-warning {
  border: solid 1px #f0ad4e;
  border-radius: .25em;
}

.form-group {
  margin: 0px;
}
</style>
