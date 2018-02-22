<template lang="pug">
div(class='filter-form card')
  div(class='card-body')
    div(class='text-center')
      h3 Advanced Filter
      p(class='subtitle') In-depth filtering

    div(class='row')
      div(class='col-6')
        button(class='btn btn-primary btn-block' @click='submitUserFilterForm')
          i(class='fa fa-filter' aria-hidden="true") &nbsp;
          span(class='d-none d-xl-inline') Submit

      div(class='col-6')
        button(class='btn btn-danger btn-block' @click='resetForm')
          i(class='fa fa-refresh' aria-hidden="true") &nbsp;
          span(class='d-none d-xl-inline') Reset
    hr

    div(class='pre-scrollable filter-scrollable')
      h4 User
      toggle-button(@change='toggleActive()', :value='getActiveValue()', color='#5CB85C', :sync='true', :labels='toggleButtonLabels', :width='70')
      vue-form-generator(class='mt-3' :schema="schema", :model="model", :options="formOptions")
</template>
<script>
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types';
import store from '../../store';
import ToastMixin from '../mixins/ToastMixin.vue';

export default {
    name: 'ColleaguesFilterForm',

    mixins: [ToastMixin],

    created: function() {
      new Promise((resolve, reject) => {
        if (!store.getters.employment_contract_types) {
          store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACT_TYPES).then(() => resolve())
        } else{
          resolve()
        }
      })
    },

    data () {
        return {
          toggleButtonLabels: {
            checked: 'Active',
            unchecked: 'All'
          },
          daysOfWeek: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ],
           model: {
                first_name__icontains: '',
                last_name__icontains: '',
                username__icontains: '',
                email__icontains: '',
                is_active: true,
                groups__name__icontains: '',
                userinfo__gender__iexact: null,
                userinfo__birth_date__year: '',
                userinfo__birth_date__year__gt: '',
                userinfo__birth_date__year__lt: '',
                userrelative__name__icontains: '',
                employmentcontract__employment_contract_type: null,
                employmentcontract__company__name__icontains: '',
                employmentcontract__started_at__year: '',
                employmentcontract__started_at__year__gt: '',
                employmentcontract__started_at__year__lt: '',
                employmentcontract__ended_at__year: '',
                employmentcontract__ended_at__year__gt: '',
                employmentcontract__ended_at__year__lt: '',
                leave__leavedate__starts_at__lte: null,
                leave__leavedate__ends_at__gte: null,
                workschedule_label__icontains: '',
                active_monday: '',
                active_tuesday: '',
                active_wednesday: '',
                active_thursday: '',
                active_friday: '',
                active_saturday: '',
                active_sunday: ''
            },

            schema: {
                fields: [
                    // USER
                    {
                      // first_name__icontains
                      type: "input",
                      inputType: "text",
                      model: "first_name__icontains",
                      placeholder: "First name",
                      // label: "First name",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // last_name__icontains
                      type: "input",
                      inputType: "text",
                      model: "last_name__icontains",
                      placeholder: "Last name",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // username
                      type: "input",
                      inputType: "text",
                      model: "username__icontains",
                      placeholder: "Username",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // email
                      type: "input",
                      inputType: "text",
                      model: "email__icontains",
                      placeholder: "Email",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // groups__name__icontains
                      type: "input",
                      inputType: "text",
                      model: "groups__name__icontains",
                      placeholder: "Group",
                      styleClasses: "no-label-field",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // userinfo__gender__iexact
                      type: "select",
                      model: "userinfo__gender__iexact",
                      styleClasses: "no-label-field",
                      selectOptions: {
                        noneSelectedText: "-- Gender --"
                      },
                      values: function() {
                        return [
                          { name: "Male", id: "M" },
                          { name: "Female", id: "F" }
                        ]
                      }
                    },
                    {
                      // userinfo__birth_date__year
                      type: "input",
                      inputType: "number",
                      model: "userinfo__birth_date__year",
                      min: 1900,
                      max: moment().year(),
                      placeholder: "Born in year",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.integer,
                    },
                    {
                      // userinfo__birth_date__year__gt
                      type: "input",
                      inputType: "number",
                      model: "userinfo__birth_date__year__gt",
                      min: 1900,
                      max: moment().year(),
                      placeholder: "Born after year",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.integer,
                    },
                    {
                      // userinfo__birth_date__year__lt
                      type: "input",
                      inputType: "number",
                      model: "userinfo__birth_date__year__lt",
                      min: 1900,
                      max: moment().year(),
                      placeholder: "Born before year",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.integer
                    },
                    {
                      // userrelative__name__icontains
                      type: "input",
                      inputType: "text",
                      model: "userrelative__name__icontains",
                      placeholder: "Name of relative",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.string
                    },
                    // EMPLOYMENTCONTRACT
                    {
                      // employmentcontract__employment_contract_type
                      type: "select",
                      model: "employmentcontract__employment_contract_type",
                      selectOptions: {
                        noneSelectedText: "-- Employment contract type --"
                      },
                      styleClasses: 'no-label-field',
                      values: () => {
                        if (store.getters.employment_contract_types) {
                          return store.getters.employment_contract_types
                        }

                        return []
                      }
                    },
                    {
                      // employmentcontract__company__name__icontains
                      type: "input",
                      inputType: "text",
                      model: "employmentcontract__company__name__icontains",
                      placeholder: "Company name",
                      styleClasses: "no-label-field",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // employmentcontract__started_at__year
                      type: "input",
                      inputType: "number",
                      model: "employmentcontract__started_at__year",
                      min: 0,
                      max: moment().year(),
                      placeholder: "Started in year",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.integer
                    },
                    {
                      // employmentcontract__started_at__year__gt
                      type: "input",
                      inputType: "number",
                      model: "employmentcontract__started_at__year__gt",
                      min: 0,
                      max: moment().year(),
                      placeholder: "Started after year",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.integer
                    },
                    {
                      // employmentcontract__started_at__year__lt
                      type: "input",
                      inputType: "number",
                      model: "employmentcontract__started_at__year__lt",
                      min: 0,
                      max: moment().year(),
                      placeholder: "Started before year",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.integer
                    },
                    {
                      // employmentcontract__ended_at__year
                      type: "input",
                      inputType: "number",
                      model: "employmentcontract__ended_at__year",
                      min: 0,
                      max: moment().year(),
                      placeholder: "Ended in year",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.integer
                    },
                    {
                      // employmentcontract__ended_at__year__gt
                      type: "input",
                      inputType: "number",
                      model: "employmentcontract__ended_at__year__gt",
                      min: 0,
                      max: moment().year(),
                      placeholder: "Ended after year",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.integer
                    },
                    {
                      // employmentcontract__ended_at__year__lt
                      type: "input",
                      inputType: "number",
                      model: "employmentcontract__ended_at__year__lt",
                      min: 0,
                      max: moment().year(),
                      placeholder: "Ended before year",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.integer
                    },
                    {
                      // leave__leavedate__starts_at__lte
                      type: "pikaday",
                      placeholder: "Has a leave before",
                      model: "leave__leavedate__starts_at__lte",
                      validator: VueFormGenerator.validators.date,
                      defaultDate: moment(),
                      setDefaultDate: false,
                      format: 'YYYY-MM-DDTHH:mm:ss',
                      styleClasses: 'no-label-field',
                      pikadayOptions: {
                        position: "top right"
                      }
                    },
                    {
                      // leave__leavedate__ends_at__gte
                      type: "pikaday",
                      placeholder: "Has a leave that ends after",
                      model: "leave__leavedate__ends_at__gte",
                      validator: VueFormGenerator.validators.date,
                      format: 'YYYY-MM-DDTHH:mm:ss',
                      styleClasses: 'no-label-field',
                      pikadayOptions: {
                        position: "top right"
                      }
                    },
                    {
                      // workschedule_label__icontains
                      type: "input",
                      inputType: "text",
                      model: "workschedule_label_icontains",
                      placeholder: "Work schedule",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // active_days
                      type: "checklist",
                      label: "Active days",
                      model: "active_days",
                      listBox: true,
                      values: [
                          { name: "Monday", value: 'monday' },
                          { name: "Tuesday", value: 'tuesday' },
                          { name: "Wednesday", value: 'wednesday' },
                          { name: "Thursday", value: 'thursday' },
                          { name: "Friday", value: 'friday' },
                          { name: "Saturday", value: 'saturday' },
                          { name: "Sunday", value: 'sunday' }
                      ]
                   }
                 ]
            },

            formOptions: {
              validateAfterLoad: true,
              validateAfterChanged: true
            }
        }
    },

    methods: {
      submitUserFilterForm: function() {
        this.daysOfWeek.forEach(day => {
          this.model[`active_${day}`] = ''
        })
        if (this.model.active_days) {
          this.model.active_days.forEach(day => {
            this.model[`active_${day}`] = 'True'
          });
        }

        Object.keys(this.model).filter((key) => {
          if(this.model[key] === '' || this.model[key] === null)
            delete this.model[key];
        });

        var options = {
            path: '/users/',
            params: this.model
          }
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_USERS, options)
          .catch((error) => {
            this.showDangerToast('Something went wrong while getting the results. Check the console for more info.')
            console.error(error)
          });
      },

      resetForm: function() {
        this.model.first_name__icontains= '',
        this.model.last_name__icontains= '',
        this.model.username__icontains = '',
        this.model.email__icontains = '',
        this.model.is_active= true,
        this.model.groups__name__icontains= '',
        this.model.userinfo__gender__iexact= null,
        this.model.userinfo__birth_date__year = null,
        this.model.userinfo__birth_date__year__gt = null,
        this.model.userinfo__birth_date__year__lt = null,
        this.model.userrelative__name__icontains= '',
        this.model.employmentcontract__employment_contract_type = null,
        this.model.employmentcontract__company__name__icontains = '',
        this.model.employmentcontract__started_at__year = '',
        this.model.employmentcontract__started_at__year__gt = '',
        this.model.employmentcontract__started_at__year__lt = '',
        this.model.employmentcontract__ended_at__year = '',
        this.model.employmentcontract__ended_at__year__gt = '',
        this.model.employmentcontract__ended_at__year__lt = '',
        this.model.leave__leavedate__starts_at__lte = null,
        this.model.leave__leavedate__ends_at__gte = null,
        this.model.workschedule_label__icontains= null,
        this.model.active_monday = '',
        this.model.active_tuesday = '',
        this.model.active_wednesday = '',
        this.model.active_thursday = '',
        this.model.active_friday = '',
        this.model.active_saturday = '',
        this.model.active_sunday = '',
        this.model.active_days = []

        var options = {
          path: '/users/'
        }
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_USERS, options);
      },

      toggleActive: function() {
        this.model.is_active = !this.model.is_active;
      },

      getActiveValue: function() {
        return this.model.is_active;
      }
    }
}
</script>

<style scoped>
.filter-scrollable {
  max-height: 60vh;
  overflow-x: hidden;
}

.form-group {
  padding: 0px 6px;
}
.form-group > label {
  font-weight: bold;
  padding-bottom: .5em;
  padding-top: .5em;
}

.active-toggle {
  margin-top: 0.5rem;
}
</style>
