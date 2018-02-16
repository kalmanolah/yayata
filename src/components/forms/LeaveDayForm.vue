<template lang="pug">
div
  .row
    .col-6
      b-form-fieldset(:feedback='fromDateFeedback', :state='fromDateState', :label-size='1')
        label Date
        input.form-control#fromDatepicker(ref='fromDatePicker' v-model='fromDate')

    .col-3
      b-form-fieldset(:label-size='1')
        label From
        b-form-input.form-control(type='time' step='300' v-model='fromTime')

    .col-3
      b-form-fieldset(:label-size='1')
        label To
        b-form-input.form-control(type='time' step='300' v-model='toTime')

  .row
    .col-12
      b-form-fieldset(:feedback='descriptionFeedback', :state='descriptionState')
        label Description
        b-form-input.form-control(textarea v-model='description')

  .row
    .col-6
      b-form-fieldset(v-if='leaveTypes', :feedback='leaveTypeFeedback', :state='leaveTypeState', :label-size='1', input-selector='select')
        label Type
        b-form-select.form-control(:options='leaveTypes' v-model='leaveType')
    .col-6
      b-form-fieldset
        label Attachments
        b-form-file(v-model='attachments', :multiple='true', placeholder='Upload files', drop-label='file', choose-label='Select')
  .row
    .col
      button.btn.btn-success.btn-block(@click='submitLeaveRequest()', :disabled='!buttonState')
        i.fa.fa-spinner.fa-pulse.fa-fw(v-if='requestLoading')
        i.fa.fa-plus.submit-icons(v-else)
</template>

<script>
import store from '../../store';
import * as types from '../../store/mutation-types.js';
import ToastMixin from '../mixins/ToastMixin.vue';

export default {
  name: 'leavedayform',
  mixins: [ToastMixin],
  components: {},
  data() {
    return {
      // Date
      fromDate: null,
      fromDatePicker: null,
      fromTime: '09:00',
      toTime: '17:30',

      // General
      description: '',
      leaveType: null,
      attachments: null,
      requestLoading: false,
    }
  },

  watch: {
  },

  mounted: function() {
    // initialize the from date picker
    this.fromDatePicker = new Pikaday({
      field: this.$refs.fromDatePicker,
      firstDay: 1,
      defaultDate: this.format,
      minDate: moment().subtract(1, 'month').toDate(),
      formatStrict: true,
      showWeekNumber: true,
      showDaysInNextAndPreviousMonths: true,
      format: 'DD MMM YYYY',
      onSelect: (val) => {
        this.fromDate = moment(val).format('DD MMM YYYY');
      }
    });
  },

  methods: {
    submitLeaveRequest: function() {
      if (this.buttonState) {
        this.requestLoading = true;

        let fTime = moment(this.fromTime, "HH:mm");
        let tTime = moment(this.toTime, "HH:mm");

        let start = moment(this.fromDate).hour(fTime.hour()).minute(fTime.minute());
        let end = moment(this.fromDate).hour(tTime.hour()).minute(tTime.minute());


        //Make leavedates and bind them to the leave
        store.dispatch(
          types.NINETOFIVER_API_REQUEST,
          {
            path: '/services/my_leave_request/',
            method: 'POST',
            body: {
              description: this.description,
              leave_type: this.leaveType,
              full_day: false,
              starts_at: start.format('YYYY-MM-DDTHH:mm:ss'),
              ends_at: end.format('YYYY-MM-DDTHH:mm:ss')
            },
            emulateJSON: true,
          }
        ).then((lvdResponse) => {

          //SUCCESS
          if(lvdResponse.status == 201) {

            this.showSuccessToast('Leave successfully requested.');
            this.requestLoading = false;

            //If attachments were added to the leaverequest
            if (this.attachments) {
              var attachIDs = [];

              for(var i = 0; i < this.attachments.length; i++) {
                var formData = new FormData();
                formData.append('name', this.attachments[i].name)
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
                        path: '/my_leaves/' + lvdResponse.data.leave + '/',
                        method: 'PATCH',
                        body: {
                          attachments: attachIDs
                        }
                      }
                    );
                  }

                  this.resetForm();
                }, (res) => {
                  this.requestLoading = false;
                  this.showDangerToast("ERROR: " + res.bodyText);
                  console.error(res);
                });
              }
            } else {
              this.resetForm();
            }

          // Leaverequest did not go through properly
          } else {
            this.requestLoading = false;
            this.showDangerToast('Something went wrong during the request. Check console for more info.');
            console.error(lvdResponse);
          }

        }, (res) => {
            this.requestLoading = false;
            this.showDangerToast("ERROR: " + res.bodyText);
            console.error(res);
        });

      //Model did not properly validate
      } else {
        this.showWarningToast('Properly fill out the form please.')
      }
    },

    resetForm: function() {
      this.attachments = null;
      this.description = null;
      this.leaveType = null;
    },
  },

  computed: {
    // BEGIN OF VALIDATION
    buttonState: function() {
      return (this.fromDateState === "valid" && this.descriptionState === "valid" && this.leaveTypeState === "valid");
    },
    fromDateFeedback: function() {
      return moment(this.fromDate, 'DD MMM YYYY').isValid() ? '' : 'Please provide a correct date.'
    },
    fromDateState: function() {
      return moment(this.fromDate, 'DD MMM YYYY').isValid() ? 'valid' : 'invalid'
    },
    descriptionFeedback: function() {
      return null
    },
    descriptionState: function() {
      return 'valid'
    },
    leaveTypeFeedback: function() {
      return this.leaveType ? '' : 'Please provide a leave type';
    },
    leaveTypeState: function() {
      return this.leaveType ? 'valid' : 'invalid';
    },
    // END OF VALIDATION

    leaveTypes: function() {
      let leave_types = [{ text: 'Select leave type', value: null }];

      if (store.getters.leave_types) {
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
</style>
