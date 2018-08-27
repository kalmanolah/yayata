<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center') 🏖️&nbsp;
    span(v-if='!model.id') Request leave
    span(v-else) Update leave
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

    div(class='form-group')
      div(class='row justify-content-between')
        div(class='col')
          input(class='btn btn-primary' type="submit" value="Save" @click="submit()")
        div(class='col-auto' v-if='model.id')
          input(class='btn btn-danger' type="submit" value="Delete" @click="remove()")
</template>

<script>
import moment from 'moment-timezone';
import VueFormGenerator from 'vue-form-generator';
import toastr from 'toastr';
import * as types from '../../store/mutation-types';
import store from '../../store';
import utils from '../../utils';

var model = {
  id: null,
  leave_type: null,
  description: null,
  start_date: moment(),
  end_date: moment(),
  date: moment(),
  from_time: '09:00',
  until_time: null,
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

  props: [
    'leave',
    'date',
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
      if (this.leave) {
        this.model.id = this.leave.id
        this.model.description = this.leave.description
        this.model.leave_type = this.leave.leave_type.id
        this.model.multiple_days = this.leave.leavedate_set.length > 1
        this.model.date = moment(this.leave.leavedate_set[0].starts_at)
        this.model.start_date = moment(this.leave.leavedate_set[0].starts_at)
        this.model.end_date = moment(this.leave.leavedate_set[this.leave.leavedate_set.length - 1].ends_at)
        this.model.from_time = moment(this.leave.leavedate_set[0].starts_at).format('HH:mm')
        this.model.until_time = moment(this.leave.leavedate_set[this.leave.leavedate_set.length - 1].ends_at).format('HH:mm')
      } else {
        this.model.id = null
        this.model.multiple_days = false
        this.model.leave_type = store.getters.leave_types[0].id
        this.model.description = null
        this.model.start_date = moment(this.date)
        this.model.end_date = moment(this.date)
        this.model.date = moment(this.date)
        this.model.from_time = '09:00'
        this.model.until_time = null

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

      if (this.model.id) {
        body.leave = this.model.id
      }

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/services/leave_request/',
          method: 'POST',
          body: body,
      }).then((response) => {
        this.$emit('success', response)
        toastr.success('Leave requested.')
        this.loading = false
        this.resetForm()
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
    },

    remove: function() {
      if (this.loading) return
      this.loading = true

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: `/my_leaves/${this.model.id}/`,
          method: 'DELETE',
      }).then((response) => {
        this.$emit('success', response)
        toastr.success('Leave deleted.')
        this.loading = false
        this.resetForm()
      }).catch((error) => {
        this.$emit('error', error)
        toastr.error('Error deleting leave.')
        this.loading = false
      });
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
            type: "select",
            label: "From",
            model: "from_time",
            required: true,
            validator: VueFormGenerator.validators.time,
            values: utils.getTimeOptions().map(x => { return {id: x, name: x} }),
            styleClasses: ['third-width-md', 'single-day-input']
          },
          {
            type: "select",
            label: "Until",
            model: "until_time",
            required: true,
            validator: VueFormGenerator.validators.time,
            values: utils.getTimeOptions().map(x => { return {id: x, name: x} }),
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
