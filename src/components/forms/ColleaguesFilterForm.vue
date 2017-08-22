<template lang="pug">
.card.p-3.fixed.filter-form
  .card-block
    .row
      .col.text-center
        h3 Advanced Filter
        p.subtitle More indepth filtering

    .row
      .col-6.form-buttons
        button.btn.btn-primary.btn-block(@click='submitUserFilterForm')
          i.fa.fa-filter(aria-hidden="true") &nbsp;
          span.d-none.d-xl-inline Submit

      .col-6.form-buttons
        button.btn.btn-danger.btn-block(@click='resetForm')
          i.fa.fa-refresh(aria-hidden="true") &nbsp; 
          span.d-none.d-xl-inline Reset
    hr

    .pre-scrollable.filter-scrollable
      .row
        .col
          strong.active-toggle User
      .row
        .col
          toggle-button.active-toggle(@change='toggleActive()', :value='getActiveValue()', color='#5CB85C', :sync='true', :labels='toggleButtonLabels', :width='70') 
      .row
        .col
          vue-form-generator(:schema="schema", :model="model", :options="formOptions") 
      
</template>
<script>
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types';
import store from '../../store';

export default {
    name: 'ColleaguesFilterForm',
    data () {
        return {
          toggleButtonLabels: {
            checked: 'Active',
            unchecked: 'All'
          },
           model: {
                first_name__icontains: '',
                last_name__icontains: '',
                username: '',
                email: '',
                is_active: true,
                groups__icontains: '',
                label__icontains: '',
                userinfo__gender__iexact: null,
                userinfo__birth_date__year__gte: '',
                userinfo__birth_date__year__lte: '',
                userrelative__name__icontains: '',
                employmentcontract_type: null,
                employmentcontract__company__name__icontains: '',
                employmentcontract__started_at__year__gte: '',
                employmentcontract__started_at__year__lte: '',
                employmentcontract__ended_at__year__gte: '',
                employmentcontract__ended_at__year__lte: '',
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
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "First name",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // last_name__icontains
                      type: "input",
                      inputType: "text",
                      model: "last_name__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Last name",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // username
                      type: "input",
                      inputType: "text",
                      model: "username",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Username",
                      styleClasses: 'no-label-field',                                            
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // email
                      type: "input",
                      inputType: "text",
                      model: "email",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Email",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // groups__icontains
                      type: "input",
                      inputType: "text",
                      model: "groups__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Group",
                      styleClasses: "no-label-field",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // label__icontains
                      type: "input",
                      inputType: "text",
                      model: "label__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Label",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // userinfo__gender__iexact
                      type: "select",
                      model: "userinfo__gender__iexact",
                      styleClasses: "no-label-field",
                      selectOptions: {
                        noneSelectedText: "Select gender"
                      },
                      values: function() {
                        return [
                          { name: "Male", id: "M" },
                          { name: "Female", id: "F" }
                        ]
                      }
                    },
                    {
                      // userinfo__birth_date__year__gte
                      type: "input",
                      inputType: "number",
                      model: "userinfo__birth_date__year__gte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      min: 1900,
                      max: moment().year(),
                      placeholder: "Born after year",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.integer,
                    },
                    {
                      // userinfo__birth_date__year__lte
                      type: "input",
                      inputType: "number",
                      model: "userinfo__birth_date__year__lte",
                      readonly: false,
                      required: false,
                      disabled: false,
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
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Name relative",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    // EMPLOYMENTCONTRACT
                    {
                      // employmentcontract_type
                      type: "select",
                      label: "Employmentcontract",
                      model: "employmentcontract_type",
                      selectOptions: {
                        noneSelectedText: "Select type"
                      },
                      values: function() {
                        if(store.getters.employment_contract_types) {
                          return store.getters.employment_contract_types.map(ect => {
                            return ect.name;
                          });
                        }
                      }
                    },
                    {
                      // employmentcontract__company__name__icontains 
                      type: "input",
                      inputType: "text",
                      model: "employmentcontract__company__name__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Company name",
                      styleClasses: "no-label-field",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // employmentcontract__started_at__year__gte
                      type: "input",
                      inputType: "number",
                      model: "employmentcontract__started_at__year__gte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      min: 0,
                      max: moment().year(),
                      placeholder: "Started after year",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.integer
                    },
                    {
                      // employmentcontract__started_at__year__lte
                      type: "input",
                      inputType: "number",
                      model: "employmentcontract__started_at__year__lte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      min: 0,
                      max: moment().year(),
                      placeholder: "Started before year",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.integer
                    },
                    {
                      // employmentcontract__ended_at__year__gte 
                      type: "input",
                      inputType: "number",
                      model: "employmentcontract__ended_at__year__gte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      min: 0,
                      max: moment().year(),
                      placeholder: "Ended after year",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.integer
                    },
                    {
                      // employmentcontract__ended_at__year__lte 
                      type: "input",
                      inputType: "number",
                      model: "employmentcontract__ended_at__year__lte",
                      readonly: false,
                      required: false,
                      disabled: false,
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
                      label: "Workschedule",
                      model: "workschedule_label_icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Workschedule label",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // active_days
                      type: "checklist",
                      label: "Active days",
                      model: "active_days",
                      listBox: true,
                      values: [
                          { name: "Monday", value: {active_monday: 'True'} },
                          { name: "Tuesday", value: { active_tuesday: 'True'}},
                          { name: "Wednesday", value: { active_wednesday: 'True'}},
                          { name: "Thursday", value: { active_thursday: 'True'} },
                          { name: "Friday", value: { active_friday: 'True' } },
                          { name: "Saturday", value: { active_saturday: 'True' } },
                          { name: "Sunday", value: { active_saturday: 'True' } }
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

        console.log( this.model.leave__leavedate__starts_at__lte );
        Object.keys(this.model).filter((key) => {
          if(this.model[key] === '' || this.model[key] === null)
            delete this.model[key];
        });

        if(this.model.active_days) {
          this.model.active_days.forEach( (day) => {
            this.model[Object.keys(day)] = Object.values(day)[0];
          });

          delete this.model.active_days;
        }
        
        var options = {
            path: '/users/',
            params: this.model
          }                        
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_USERS, options);
      },

      resetForm: function() {
        this.model.first_name__icontains= '',
        this.model.last_name__icontains= '',
        this.model.username= '',
        this.model.email= '',
        this.model.is_active= true,
        this.model.groups__icontains= '',
        this.model.label__icontains= '',
        this.model.userinfo__gender__iexact= null,
        this.model.userinfo__birth_date__year__gte= '',
        this.model.userinfo__birth_date__year__lte= '',
        this.model.userrelative__name__icontains= '',
        this.model.employmentcontract_type= null,
        this.model.employmentcontract__company__name__icontains= '',
        this.model.employmentcontract__started_at__year__gte= '',
        this.model.employmentcontract__started_at__year__lte= '',
        this.model.employmentcontract__ended_at__year__gte= '',
        this.model.employmentcontract__ended_at__year__lte= '',
        this.model.leave__leavedate__starts_at__lte= null,
        this.model.leave__leavedate__ends_at__gte= null,
        this.model.workschedule_label__icontains= '',
        this.model.active_monday= '',
        this.model.active_tuesday= '',
        this.model.active_wednesday= '',
        this.model.active_thursday= '',
        this.model.active_friday= '',
        this.model.active_saturday= '',
        this.model.active_sunday= '',
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
<style>
.form-group {
  padding: 0px 6px;
}
.form-group > label {
  font-weight: bold;
  padding-bottom: .5em;
  padding-top: .5em;
}

.no-label-field {
  margin-top: -1.2rem;
}

.field-wrap {
  padding-bottom: 5px;
}

.filter-scrollable {
  max-height: 60vh;
}

.active-toggle {
  margin-top: 0.5rem;
}
</style>