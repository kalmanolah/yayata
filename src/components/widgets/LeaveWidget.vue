<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center') 🏖️ Request leave
  div(class='card-body')
    div(class='text-center')
      toggle-button(
        @change='toggleMultipleDays()',
        :value='model.multiple_days',
        :sync='true',
        :color={checked: '#f0ad4e', unchecked: '#5cb85c'},
        :labels={
          checked: 'Multiple days',
          unchecked: 'Single day'
        },
        :width='95',
      )

    vue-form-generator(:schema="schema" :model="model" :options="formOptions" v-bind:class='{ "single-day": !model.multiple_days, "multiple-days": model.multiple_days }')

    b-form-fieldset
      label Attachments
      b-form-file(v-model='model.attachments' :multiple='true' ref='attachments')

    div(class='form-group')
      div(class='row justify-content-between')
        div(class='col')
          input(class='btn btn-primary' type="submit" value="Save" @click="submit()")
</template>

<script>
import moment from 'moment-timezone';
import VueFormGenerator from 'vue-form-generator';
import toastr from 'toastr';
import * as types from '../../store/mutation-types';
import store from '../../store';

var model = {
  id: null,
  leave_type: null,
  description: null,
  start_date: moment(),
  end_date: moment(),
  date: moment(),
  from_time: '09:00',
  until_time: null,
  attachments: [],
  multiple_days: false
}
var submit = null
var dateSet = false
var startDateSet = false
var endDateSet = false

export default {
  name: 'LeaveWidget',

  mixins: [
  ],

  created: function() {
    submit = this.submit

    Promise.all([
      new Promise((resolve, reject) => {
        if (!store.getters.performance_types) {
          store.dispatch(types.NINETOFIVER_RELOAD_LEAVE_TYPES).then(() => resolve())
        } else{
          resolve()
        }
      }),
      new Promise((resolve, reject) => {
        if (!store.getters.my_current_work_schedule) {
          store.dispatch(types.NINETOFIVER_RELOAD_MY_CURRENT_WORK_SCHEDULE).then(() => resolve())
        } else{
          resolve()
        }
      })
    ]).then(() => {
      this.resetForm()
    })
  },

  methods: {
    toggleMultipleDays: function() {
      this.model.multiple_days = !this.model.multiple_days
    },

    resetForm: function() {
      this.model.leave_type = store.getters.leave_types[0].id
      this.$refs.attachments.reset()

      this.model.description = null
      this.model.start_date = moment()
      this.model.end_date = moment()
      this.model.date = moment()
      this.model.from_time = '09:00'
      this.model.until_time = null
      this.model.attachments = []
      this.model.multiple_days = false

      if (!this.model.until_time && this.model.date && this.model.from_time && store.getters.my_current_work_schedule) {
        let dow_prop = this.model.date.format('dddd').toLowerCase()
        let dow_work = store.getters.my_current_work_schedule[dow_prop]

        let hours = Math.floor(dow_work)
        let minutes = Math.round((dow_work % 1) * 60)

        let from_time = moment(this.model.from_time, 'HH:mm')
        let until_time =  moment(from_time).hour(Number(from_time.format('HH')) + hours).minute(Number(from_time.format('mm')) + minutes)

        this.model.until_time = until_time.format('HH:mm')
      } else {
        this.model.until_time = '17:00'
      }

      dateSet = false
      startDateSet = false
      endDateSet = false
    },

    submit: function() {
      if (this.loading) return
      this.loading = true

      let body = {
        leave_type: this.model.leave_type,
        description: this.model.description,
      };
      let dt_format = 'YYYY-MM-DDTHH:mm:00ZZ'
      let timezone = moment.tz.guess()

      if (this.model.multiple_days) {
        let start_date = moment(this.model.start_date).tz(timezone).startOf('date')
        let end_date = moment(this.model.end_date).tz(timezone).endOf('date')

        body.full_day = true
        body.starts_at = start_date.format(dt_format)
        body.ends_at = end_date.format(dt_format)
      } else {
        let from_time = moment(this.model.from_time, "HH:mm")
        let until_time = moment(this.model.until_time, "HH:mm")

        let start_date = moment(this.model.date).tz(timezone).hour(from_time.hour()).minute(from_time.minute()).second(0)
        let end_date = moment(this.model.date).tz(timezone).hour(until_time.hour()).minute(until_time.minute()).second(0)

        body.full_day = false
        body.starts_at = start_date.format(dt_format)
        body.ends_at = end_date.format(dt_format)
      }

      if (!this.model.id) {
        store.dispatch(types.NINETOFIVER_API_REQUEST, {
            path: '/services/leave_request/',
            method: 'POST',
            body: body,
        }).then((response) => {
          new Promise((resolve, reject) => {
            if (this.model.attachments.length) {
              // Upload all attachments if required
              let attachment_promises = this.model.attachments.map(attachment => {
                let attachment_form = new FormData()
                attachment_form.append('name', attachment.name)
                attachment_form.append('file', attachment)

                return store.dispatch(types.NINETOFIVER_API_REQUEST, {
                  path: '/my_attachments/',
                  method: 'POST',
                  body: attachment_form
                })
              })

              Promise.all(attachment_promises).then(attachment_responses => {
                // Link attachments to leave
                let attachment_ids = attachment_responses.map(attachment_response => {
                  return attachment_response.data.id
                })

                store.dispatch(types.NINETOFIVER_API_REQUEST, {
                  path: '/my_leaves/' + response.data.id + '/',
                  method: 'PATCH',
                  body: {
                    attachments: attachment_ids
                  }
                }).then(() => {
                  resolve()
                })
              })
            } else {
              resolve()
            }
          }).then(() => {
            this.$emit('success', response)
            toastr.success('Leave requested.')
            this.loading = false
            this.resetForm()
          })
        }).catch((error) => {
          this.$emit('error', error)
          toastr.error('Error requesting leave.')

          try {
            for (var key in error.data) {
              error.data[key].forEach((err) => {
                toastr.error(err.message)
              })
            }
          } catch(err) {}

          this.loading = false
        });
      } else {
        // @TODO Implement update?
      }
    },
  },

  data: () => {
    return {
      loading: false,

      model: model,

      schema: {
        fields: [
          {
            type: "pikaday",
            label: "Start date",
            model: "start_date",
            validator: [
              VueFormGenerator.validators.date,
              VueFormGenerator.validators.required
            ],
            pikadayOptions: {
              position: "top left",
              firstDay: 1,
              onDraw: function(pikaday) {
                if ((typeof model.start_date === 'object') && !startDateSet) {
                  startDateSet = true
                  pikaday.setDate(moment(model.start_date).toDate(), true)
                }
              },
              onSelect: function(value) {
                model.start_date = moment(value)

                if (moment(value).isAfter(moment(model.end_date))) {
                  model.end_date = moment(value)
                  endDateSet = false
                }
              },
            },
            // visible: function(model) {
            //   return model.multiple_days
            // },
            styleClasses: ['half-width-md', 'multiple-days-input']
          },
          {
            type: "pikaday",
            label: "End date",
            model: "end_date",
            validator: [
              VueFormGenerator.validators.date,
              VueFormGenerator.validators.required
            ],
            pikadayOptions: {
              position: "top left",
              firstDay: 1,
              onDraw: function(pikaday) {
                if (!pikaday._o.minDate || (moment(pikaday._o.minDate).format('YYYY-MM-DD') != moment(model.start_date).format('YYYY-MM-DD'))) {
                  pikaday.setMinDate(moment(model.start_date).toDate())
                }

                if ((typeof model.end_date === 'object') && !endDateSet) {
                  endDateSet = true
                  pikaday.setDate(moment(model.end_date).toDate(), true)
                }
              },
              onSelect: function(value) {
                model.end_date = moment(value)

                if (moment(value).isBefore(moment(model.start_date))) {
                  model.start_date = moment(value)
                  startDateSet = false
                }
              },
            },
            // visible: function(model) {
            //   return model.multiple_days
            // },
            styleClasses: ['half-width-md', 'multiple-days-input']
          },
          {
            type: "pikaday",
            label: "Date",
            model: "date",
            validator: [
              VueFormGenerator.validators.date,
              VueFormGenerator.validators.required
            ],
            pikadayOptions: {
              position: "top left",
              firstDay: 1,
              onDraw: function(pikaday) {
                if ((typeof model.date === 'object') && !dateSet) {
                  dateSet = true
                  pikaday.setDate(moment(model.date).toDate(), true)
                }
              },
            },
            // visible: function(model) {
            //   return !model.multiple_days
            // },
            styleClasses: ['third-width-md', 'single-day-input']
          },
          {
            type: "input",
            inputType: "time",
            label: "From",
            model: "from_time",
            step: 300,
            required: true,
            validator: VueFormGenerator.validators.time,
            // visible: function(model) {
            //   return !model.multiple_days
            // },
            styleClasses: ['third-width-md', 'single-day-input']
          },
          {
            type: "input",
            inputType: "time",
            label: "Until",
            model: "until_time",
            step: 300,
            required: true,
            validator: VueFormGenerator.validators.time,
            // visible: function(model) {
            //   return !model.multiple_days
            // },
            styleClasses: ['third-width-md', 'single-day-input']
          },
          {
            type: "select",
            label: "Type",
            model: "leave_type",
            required: true,
            selectOptions: {
              value: "id",
              name: "display_label"
            },
            values: () => {
              if (store.getters.leave_types) {
                return store.getters.leave_types
              }

              return []
            },
            validator: VueFormGenerator.validators.required
          },
          {
            type: "textArea",
            label: "Description",
            model: "description",
            max: 255,
            rows: 2,
            validator: VueFormGenerator.validators.string
          },
          {
            type: "submit",
            buttonText: "Save",
            styleClasses: ["d-none"],
            validateBeforeSubmit: true,
            onSubmit: () => {
              submit()
            }
          }
        ]
      },

      formOptions: {
        validateAfterLoad: false,
        validateAfterChanged: true
      }
    }
  }
}
</script>

<style lang="less">
.multiple-days {
  .single-day-input {
    display: none;
  }
}

.single-day {
  .multiple-days-input {
    display: none;
  }
}
</style>
