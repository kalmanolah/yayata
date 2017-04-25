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
                is_active: true,
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
                      type: "input",
                      inputType: "text",
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
                      placeholder: "Born after year",
                      validator: VueFormGenerator.validators.date
                    },
                    {
                      // userinfo__birth_date__year__lte
                      type: "input",
                      inputType: "text",
                      model: "userinfo__birth_date__year__lte",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Born before year",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
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
                      type: "input",
                      inputType: "text",
                      label: "Employmentcontract",
                      model: "employmentcontract_type",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Type",
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
                      styleClasses: "no-label-field",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // employmentcontract__started_at__year__gte
                      type: "input",
                      inputType: "text",
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
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      type: "checklist",
                      label: "Active days",
                      model: "active_days",
                      listBox: true,
                      values: [
                          { name: "Monday", value: "active_monday" },
                          { name: "Tuesday", value: "active_tuesday" },
                          { name: "Wednesday", value: "active_wednesday"},
                          { name: "Thursday", value: "active_thursday" },
                          { name: "Friday", value: "active_friday" },
                          { name: "Saturday", value: "active_saturday" },
                          { name: "Sunday", value: "actvive_sunday" }
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
        Object.keys(this.model).filter((key) => {
          if(key === 'active_days'){
            this.model[key].forEach( val => {
              // How do we do this?
            });
          }
          if(this.model[key] === '')
            delete this.model[key]
        });
        if(this.model.active_days){
          Object.values(this.model['active_days']).filter((day) => {
            console.log(day);
            if(day === 'active_monday'){
              this.model.active_monday = 'True';
            } else if (day === 'active_tuesday'){
              this.model.active_tuesday = 'True';
            } else if (day === 'active_wednesday'){
              this.model.active_wednesday = 'True';
            } else if (day === 'active_thursday') {
              this.model.active_thursday = 'True';
            } else if (day === 'active_friday') {
              this.model.active_friday = 'True';
            } else if (day === 'active_saturday') {
              this.model.active_saturday = 'True';
            } else {
              this.model.active_sunday = 'True';
            }
          });
        }
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
        this.model.active_sunday= '',
        this.model.active_days = []
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