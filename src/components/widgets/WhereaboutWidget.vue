<template lang="pug">
div(class='card card-top-blue mb-3' v-on:keyup.enter='submit')
  div(class='card-header text-center') 📍&nbsp;
    span(v-if='!model.id') Log whereabout
    span(v-else) Update whereabout
    span(v-if='model.date') &nbsp;for {{ model.date | moment('MMMM Do') }}

  div(class='card-body')
    vue-form-generator(:schema="schema" :model="model" :options="formOptions" ref='form')

    div(class='form-group my-0')
      div(class='row justify-content-between')
        div(class='col')
          input(class='btn btn-primary' type="submit" value="Save" @click="submit()" ref='submitButton')
        div(class='col-auto' v-if='model.id')
          input(class='btn btn-danger' type="submit" value="Delete" @click="remove()")
</template>

<script>
import moment from 'moment';
import VueFormGenerator from 'vue-form-generator';
import toastr from 'toastr';
import utils from '../../utils';
import * as types from '../../store/mutation-types';
import store from '../../store';

var model = {
  id: null,
  location: null,
  date: null,
  start_time: '09:00',
  end_time: null,
  timesheet: null,
  description: null,
};
var dateSet = false;
var submit = null;

export default {
  name: 'WhereaboutWidget',

  mixins: [
  ],

  props: [
    'whereabout',
    'timesheet',
    'day',
  ],

  created: function() {
    submit = this.submit

    Promise.all([
      new Promise((resolve, reject) => {
        if (!store.getters.my_current_timesheet) {
          store.dispatch(types.NINETOFIVER_RELOAD_MY_CURRENT_TIMESHEET).then(() => resolve())
        } else {
          resolve()
        }
      }),
      new Promise((resolve, reject) => {
        if (!store.getters.my_current_work_schedule) {
          store.dispatch(types.NINETOFIVER_RELOAD_MY_CURRENT_WORK_SCHEDULE).then(() => resolve())
        } else {
          resolve()
        }
      }),
      new Promise((resolve, reject) => {
        if (!store.getters.locations) {
          store.dispatch(types.NINETOFIVER_RELOAD_LOCATIONS).then(() => resolve())
        } else {
          resolve()
        }
      })
    ]).then(() => {
      this.resetForm()
    })
  },

  mounted: function() {
    setTimeout(() => {
      this.$refs.submitButton.focus()
    })
  },

  methods: {
    resetForm: function() {
      if (this.whereabout) {
        this.model.id = this.whereabout.id
        this.model.timesheet = this.whereabout.timesheet
        this.model.date = moment(this.whereabout.starts_at)
        this.model.start_time = moment(this.whereabout.starts_at).format('HH:mm')
        this.model.end_time = moment(this.whereabout.ends_at).format('HH:mm')
        this.model.location = this.whereabout.location.id
        this.model.description = this.whereabout.description
      } else {
        this.model.id = null
        this.model.timesheet = this.timesheet ? this.timesheet.id : store.getters.my_current_timesheet.id
        this.model.date = (this.timesheet && this.day) ? moment().year(this.timesheet.year).month(this.timesheet.month - 1).date(this.day) : null
        this.model.start_time = '09:00'
        this.model.end_time = null
        this.model.location = store.getters.locations[0].id
        this.model.description = null

        if (!this.model.end_time && this.model.date && this.model.start_time && store.getters.my_current_work_schedule) {
          let dow_prop = this.model.date.format('dddd').toLowerCase()
          let dow_work = store.getters.my_current_work_schedule[dow_prop]

          let hours = Math.floor(dow_work)
          let minutes = Math.round((dow_work % 1) * 60)

          let start_time = moment(this.model.start_time, 'HH:mm')
          let end_time =  moment(start_time).hour(Number(start_time.format('HH')) + hours).minute(Number(start_time.format('mm')) + minutes)

          this.model.end_time = end_time.format('HH:mm')
        } else {
          this.model.end_time = '17:00'
        }
      }

      dateSet = false
    },

    remove: function() {
      if (this.loading) return
      this.loading = true

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: `/my_whereabouts/${this.model.id}/`,
          method: 'DELETE',
      }).then((response) => {
        this.$emit('success', response)
        toastr.success('Whereabout deleted.')
        this.loading = false
        this.resetForm()
      }).catch((error) => {
        console.log(error)
        this.$emit('error', error)
        toastr.error('Error deleting whereabout.')
        this.loading = false
      });
    },

    validate: function() {
      return true
    },

    submit: function(event) {
      if (this.loading) return
      if (!this.validate()) return
      if (event && (event.target.tagName !== 'INPUT')) return

      this.loading = true

      let body = {
        timesheet: this.model.timesheet,
        description: this.model.description,
        location: this.model.location
      };

      let dt_format = 'YYYY-MM-DDTHH:mm:00ZZ'
      let timezone = moment.tz.guess()

      let start_time = moment(this.model.start_time, "HH:mm")
      let end_time = moment(this.model.end_time, "HH:mm")

      let start_date = moment(this.model.date).tz(timezone).hour(start_time.hour()).minute(start_time.minute()).second(0)
      let end_date = moment(this.model.date).tz(timezone).hour(end_time.hour()).minute(end_time.minute()).second(0)

      body.starts_at = start_date.format(dt_format)
      body.ends_at = end_date.format(dt_format)

      if (!this.model.id) {
        store.dispatch(types.NINETOFIVER_API_REQUEST, {
            path: '/my_whereabouts/',
            method: 'POST',
            body: body,
        }).then((response) => {
          this.$emit('success', response)
          toastr.success('Whereabout logged.')
          this.loading = false
          this.resetForm()
        }).catch((error) => {
          this.$emit('error', error)
          toastr.error('Error saving whereabout.')
          this.loading = false
        });
      } else {
        store.dispatch(types.NINETOFIVER_API_REQUEST, {
            path: `/my_whereabouts/${this.model.id}/`,
            method: 'PUT',
            body: body,
        }).then((response) => {
          this.$emit('success', response)
          toastr.success('Whereabout updated.')
          this.loading = false
        }).catch((error) => {
          this.$emit('error', error)
          toastr.error('Error updating whereabout.')
          this.loading = false
        });
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
            styleClasses: ['third-width']
          },
          {
            type: "input",
            inputType: "time",
            label: "From",
            model: "start_time",
            step: 300,
            required: true,
            validator: VueFormGenerator.validators.time,
            styleClasses: ['third-width']
          },
          {
            type: "input",
            inputType: "time",
            label: "Until",
            model: "end_time",
            step: 300,
            required: true,
            validator: VueFormGenerator.validators.time,
            styleClasses: ['third-width']
          },
          {
            type: "select",
            label: "Location",
            model: "location",
            required: true,
            selectOptions: {
              value: "id",
              name: "display_label"
            },
            values: function() {
              if (store.getters.locations) {
                return store.getters.locations
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
.half-width {
  width: 50%;
  float: left;

  &+ .half-width {
    padding-left: 5px;
  }
}

.third-width {
  width: 33%;
  float: left;

  &+ .third-width {
    padding-left: 5px;
  }
}
</style>
