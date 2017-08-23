<template lang="pug">
div
  .row
    //- Multiple days
    .col-6.form-field
      .form-field
        .col.form-header-title <strong>From</strong>
      .form-field
        b-form-fieldset(:feedback='fromDateFeedback', :state='fromDateState', :label-size='1')
          input.form-control#fromDatepicker(ref='fromDatePicker' v-model='fromDate')
    .col-6.form-field
      .form-field
        .col.form-header-title <strong>To</strong>
      .form-field
        b-form-fieldset(:feedback='toDateFeedback', :state='toDateState', :label-size='1')
          input.form-control#toDatepicker(ref='toDatePicker' v-model='toDate')

  .row
    .col-12
      .col.form-header-title <strong>Description</strong>
    .col
      b-form-fieldset(:feedback='descriptionFeedback', :state='descriptionState')
        b-form-input.form-control(textarea v-model='description' placeholder='Why are you leaving us')

  .row
    .col-6
      .col.form-header-title <strong>Leave type</strong>
      b-form-fieldset(v-if='leaveTypes', :feedback='leaveTypeFeedback', :state='leaveTypeState', :label-size='1', input-selector='select')
        b-form-select(:options='leaveTypes' v-model='leaveType', :class='getSelectClass()')
    .col-6
      .col.form-header-title <strong>Attachments</strong>
      b-form-fieldset
        b-form-file(v-model='attachments', :multiple='true', placeholder='Upload files', drop-label='file', choose-label='Select')
  .row
    .col
      .col
        button.btn.btn-success.col.mt-2.mb-2(@click='submitLeaveRequest()', :disabled='!buttonState')
          i.fa.fa-spinner.fa-pulse.fa-fw(v-if='requestLoading')
          i.fa.fa-plus.submit-icons(v-else)
</template>
<script>
import store from '../../store';
import * as types from '../../store/mutation-types.js';
import ToastMixin from '../mixins/ToastMixin.vue';

export default {
  name: 'leaveperiodform',
  mixins: [ToastMixin],
  components: {},
  data() {
    return {
        // Date
        fromDate: null,
        fromDatePicker: null,
        toDate: null,
        toDatePicker: null,

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
      minDate: moment().toDate(),
      formatStrict: true,
      showWeekNumber: true,
      showDaysInNextAndPreviousMonths: true,
      format: 'DD MMM YYYY',
      disableDayFn: val => {
        if(this.upcomingLeaves) {
          return this.upcomingLeaves.find(x => {
            return moment(val).isBetween(x.leave_start, x.leave_end, null, '[]');
          });          
        }
      },
      onSelect: val => {
        this.fromDate = moment(val).format('DD MMM YYYY');
      }
    });

    // initialize the to date picker
    this.toDatePicker = new Pikaday({
      field: this.$refs.toDatePicker,
      firstDay: 1,
      minDate: moment().toDate(),
      format: 'DD MMM YYYY',
      formatStrict: true,
      showWeekNumber: true,
      showDaysInNextAndPreviousMonths: true,
      disableDayFn: val => {
        if(this.upcomingLeaves) {
          // Return true if date falls before this.fromDate OR if it's in upcomingleaves
          return moment(val).isBefore(moment(this.fromDate).add(1, 'day')) ? true : this.upcomingLeaves.find(x => {
            return moment(val).isBetween(x.leave_start, x.leave_end, null, '[]');
          });          
        }
      },
      onSelect: val => {
        this.toDate = moment(val).format('DD MMM YYYY');
      }
    });
  },

  methods: {

    submitLeaveRequest: function() {
      if( this.buttonState ) {
        this.requestLoading = true;

        let start = moment(this.fromDate).startOf('date');
        let end = moment(this.toDate).endOf('date');

        //Make leavedates and bind them to the leave
        store.dispatch(
          types.NINETOFIVER_API_REQUEST,
          {
            path: '/services/my_leave_request/',
            method: 'POST',
            body: {
              description: this.description,
              leave_type: this.leaveType,
              full_day: true,
              starts_at: start.format('YYYY-MM-DDTHH:mm:ss'),
              ends_at: end.format('YYYY-MM-DDTHH:mm:ss')
            },
            emulateJSON: true,
          }
        ).then((lvdResponse) => {

          //SUCCESS
          if(lvdResponse.status == 201) {

            this.showSuccessToast('Leave successfully requested.');
            store.dispatch(types.NINETOFIVER_RELOAD_UPCOMING_LEAVES);
            this.requestLoading = false;

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
                }, (res) => {
                  this.requestLoading = false;
                  this.showDangerToast("ERROR: " + res.bodyText);
                  console.log(res);
                });
              }
            } else {
              // reset form
              this.resetForm();
            }

          // Leaverequest did not go through properly
          } else {
            this.requestLoading = false;
            this.showDangerToast('Something went wrong during the request. Check console for more info.');
            console.log(lvdResponse);
          }

        }, (res) => {
            this.requestLoading = false;
            this.showDangerToast("ERROR: " + res.bodyText);
            console.log(res);
        });

      //Model did not properly validate
      } else {
        this.showWarningToast('Properly fill out the form please.')
      }
    },
    resetForm: function() {

      this.determineMinDate(this.upcomingLeaves);
      this.attachments = null;
      this.description = '';
      this.fromFullDay = true;
      this.leaveType = null;
      this.toFullDay = true;
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
    // BEGIN OF VALIDATION
    buttonState: function() {
      return (this.fromDateState === "success" && this.toDateState === "success" && this.descriptionState === "success" && this.leaveTypeState === "success");
    },
    fromDateFeedback: function() {
      return moment(this.fromDate, 'DD MMM YYYY').isValid() ? '' : 'Please provide a correct date.'
    },
    fromDateState: function() {
      return moment(this.fromDate, 'DD MMM YYYY').isValid() ? 'success' : 'warning'
    },
    toDateFeedback: function() {
      return moment(this.toDate, 'DD MMM YYYY').isValid() ? '' : 'Please provide a correct date.'
    },
    toDateState: function() {
      return moment(this.toDate, 'DD MMM YYYY').isValid() ? 'success' : 'warning'
    },
    descriptionFeedback: function() {
      return this.description.length ? '' : 'Please provide a description.'
    },
    descriptionState: function() {
      return this.description.length ? 'success' : 'warning'
    },
    leaveTypeFeedback: function() {
      return this.leaveType ? '' : 'Please provide a leave type.'
    },
    leaveTypeState: function() {
      return this.leaveType ? 'success' : 'warning'
    },
    // END OF VALIDATION
    
    upcomingLeaves: function() {
      if(store.getters.upcoming_leaves)
        return store.getters.upcoming_leaves;
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
</style>
