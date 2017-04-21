<template lang="pug">
div
  .card
    .card-block
      vue-form-generator(:schema="schema", :model="model", :options="formOptions") 
      .row
        .col-md-6
          button.btn.btn-primary.btn-block(@click='submitUserFilterForm') Submit
        .col-md-6
          button.btn.btn-danger.btn-block(@click='resetForm') Reset
      
</template>
<script>
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types';
import store from '../../store';

export default {
    name: 'ColleaguesFilterForm',
    data () {
        return {
            model: {
                first_name__icontains: '',
                last_name__icontains: '',
                username: '',
                email: '',
                is_active: '',
                groups__icontains: '',
                label__icontains: '',
                userinfo__gender__iexact: '',
                userinfo__birth_date__year__gte: '',
                userinfo__birth_date__year__lte: '',
                userrelative__name__icontains: '',
                employmentcontract_type: '',
                employmentcontract__company__name__icontains: '',
                employmentcontract__started_at__year__gte: '',
                employmentcontract__started_at__year__lte: '',
                employmentcontract__ended_at__year__gte: '',
                employmentcontract__ended_at__year__lte: '',
                leave__leavedate__starts_at__lte: '',
                leave__leavedate__ends_at__gte: '',
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
                      label: "User",
                      model: "first_name__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "First name",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // last_name__icontains
                      type: "input",
                      inputType: "text",
                      // label: "Contractuser last name",
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
                      // label: "User groups contract user",
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
                      // label: "Contractuser username internal",
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
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // label__icontains
                      type: "input",
                      inputType: "text",
                      // label: "Customer name",
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
                      type: "input",
                      inputType: "text",
                      // label: "Customer internal",
                      model: "userinfo__gender__iexact",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Gender",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // userinfo__birth_date__year__gte
                      type: "input",
                      inputType: "text",
                      label: "Company",
                      model: "userinfo__birth_date__year__gte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Born after",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // userinfo__birth_date__year__lte
                      type: "input",
                      inputType: "text",
                      // label: "Company internal",
                      model: "userinfo__birth_date__year__lte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Born before",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // userrelative__name__icontains
                      type: "input",
                      inputType: "text",
                      // label: "Company name",
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
                      type: "input",
                      inputType: "text",
                      label: "Employmentcontract",
                      model: "employmentcontract_type",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Type",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
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
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // employmentcontract__started_at__year__gte
                      type: "input",
                      inputType: "text",
                      // label: "Contract Label",
                      model: "employmentcontract__started_at__year__gte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Started after",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // employmentcontract__started_at__year__lte
                      type: "input",
                      inputType: "text",
                      // label: "Description",
                      model: "employmentcontract__started_at__year__lte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Started before",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // employmentcontract__ended_at__year__gte 
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "employmentcontract__ended_at__year__gte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Ended after",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // employmentcontract__ended_at__year__lte 
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "employmentcontract__ended_at__year__lte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Ended before",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // leave__leavedate__starts_at__lte 
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "leave__leavedate__starts_at__lte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Has a leave before",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // leave__leavedate__ends_at__gte
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "leave__leavedate__ends_at__gte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Has a leave that ends after",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
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
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // active_monday
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "active_monday",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Active monday",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // active_tuesday
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "active_tuesday",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Active tuesday",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // active_wednesday
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "active_wednesday",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Active wednesday",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // active_thursday
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "active_thursday",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Active thursday",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // active_firday
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "active_friday",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Active friday",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // active_saturday
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "active_saturday",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Active saturday",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // active_sunday
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "active_sunday",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Active sunday",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
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
        Object.keys(this.model).filter((key) => {
          if(this.model[key] === '')
            delete this.model[key]
        });
        console.log(this.model);
        
        var options = {
            path: '/users/',
            params: this.model
          }                        
        store.dispatch(types.NINETOFIVER_RELOAD_USERS, options);
      },

      resetForm: function() {
        this.model.first_name__icontains= '',
        this.model.last_name__icontains= '',
        this.model.username= '',
        this.model.email= '',
        this.model.is_active= '',
        this.model.groups__icontains= '',
        this.model.label__icontains= '',
        this.model.userinfo__gender__iexact= '',
        this.model.userinfo__birth_date__year__gte= '',
        this.model.userinfo__birth_date__year__lte= '',
        this.model.userrelative__name__icontains= '',
        this.model.employmentcontract_type= '',
        this.model.employmentcontract__company__name__icontains= '',
        this.model.employmentcontract__started_at__year__gte= '',
        this.model.employmentcontract__started_at__year__lte= '',
        this.model.employmentcontract__ended_at__year__gte= '',
        this.model.employmentcontract__ended_at__year__lte= '',
        this.model.leave__leavedate__starts_at__lte= '',
        this.model.leave__leavedate__ends_at__gte= '',
        this.model.workschedule_label__icontains= '',
        this.model.active_monday= '',
        this.model.active_tuesday= '',
        this.model.active_wednesday= '',
        this.model.active_thursday= '',
        this.model.active_friday= '',
        this.model.active_saturday= '',
        this.model.active_sunday= ''
        var options = {
          path: '/users/'
        }
        store.dispatch(types.NINETOFIVER_RELOAD_USERS, options);
      }
    }
}
</script>
<style>
.form-group>label {
  font-weight: bold;
}

.no-label-field {
  margin-top: -1.2rem;
}
</style>