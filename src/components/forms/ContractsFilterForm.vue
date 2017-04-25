<template lang="pug">
div
  .card
    .card-block
      .row.form-buttons
        .col-md-6
          button.btn.btn-primary.btn-block(@click='submitForm')
            <i class="fa fa-filter" aria-hidden="true"></i> Submit
        .col-md-6
          button.btn.btn-danger.btn-block(@click='resetForm') 
            <i class="fa fa-refresh" aria-hidden="true"></i> Reset
      hr
      .pre-scrollable
        vue-form-generator(:schema="schema", :model="model", :options="formOptions")
        div.active-toggle Contract status
          toggle-button.pull-right(@change='toggleActive()', :value='getActiveValue()', color='#5CB85C', :sync='true', :labels='toggleButtonLabels', :width='70') 
      
</template>
<script>
import VueFormGenerator from 'vue-form-generator';
import * as types from '../../store/mutation-types';
import store from '../../store';

export default {
    name: 'ContractsFilterForm',
    data () {
        return {
            toggleButtonLabels: {
              checked: 'Active',
              unchecked: 'Inactive'
            },
            model: {
                company__country: '',
                contractuser__user__last_name__icontains: '',
                customer__vat_identification_number: '',
                label__icontains: '',
                customer__name__icontains: '',
                description__icontains: '',
                contractuser__user__groups__icontains: '',
                active: true,
                performance_types__label__icontains: '',
                customer__internal: '',
                contractuser__user__first_name__icontains: '',
                company__internal: '',
                company__name__icontains: '',
                contractuser__user__username__icontains: '',
                company__vat_identification_number: '',
                contract_groups__label__icontains: ''
            },

            schema: {
                fields: [
                    // CONTRACTUSER
                    {
                      // contractuser__user__first_name__icontains
                      type: "input",
                      inputType: "text",
                      label: "Contractuser",
                      model: "contractuser__user__first_name__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "First name",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // contractuser__user__last_name_icontains
                      type: "input",
                      inputType: "text",
                      // label: "Contractuser last name",
                      model: "contractuser__user__last_name_icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Last name",
                      styleClasses: 'no-label-field',
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // contractuser__user__groups__icontains
                      type: "input",
                      inputType: "text",
                      // label: "User groups contract user",
                      model: "contractuser__user__groups__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Usergroup",
                      styleClasses: 'no-label-field',                                            
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // contractuser__user__username__icontainsany__internal
                      type: "input",
                      inputType: "text",
                      // label: "Contractuser username internal",
                      model: "contractuser__user__username__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Username",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    // CUSTOMER
                    {
                      // customer__vat_identification_number
                      type: "input",
                      inputType: "text",
                      label: "Customer",
                      model: "customer__vat_identification_number",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "VAT indentification number",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // customer__name__icontains
                      type: "input",
                      inputType: "text",
                      // label: "Customer name",
                      model: "customer__name__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Name",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // customer__internal
                      type: "input",
                      inputType: "text",
                      // label: "Customer internal",
                      model: "customer__internal",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Customer internal",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    // COMPANY
                    {
                      // Company__country
                      type: "input",
                      inputType: "text",
                      label: "Company",
                      model: "company__country",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Country",
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // company__internal
                      type: "input",
                      inputType: "text",
                      // label: "Company internal",
                      model: "company__internal",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "internal",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // company__name__icontains
                      type: "input",
                      inputType: "text",
                      // label: "Company name",
                      model: "company__name__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Name",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // company__vat_identification_number
                      type: "input",
                      inputType: "text",
                      // label: "Company VAT",
                      model: "company__vat_identification_number",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "VAT identification number",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    // CONTRACT
                    {
                      // contract_groups__label__icontains
                      type: "input",
                      inputType: "text",
                      label: "Contract",
                      model: "contract_groups__label__icontains",
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
                      // label: "Contract Label",
                      model: "label__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Label",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // description__icontains
                      type: "input",
                      inputType: "text",
                      // label: "Description",
                      model: "description__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Description",
                      styleClasses: 'no-label-field',                      
                      validator: VueFormGenerator.validators.string
                    },
                    {
                      // performance_types__label__icontains
                      type: "input",
                      inputType: "text",
                      // label: "Performance type",
                      model: "performance_types__label__icontains",
                      readonly: false,
                      required: false,
                      disabled: false,
                      placeholder: "Performance type",
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
      submitForm: function() {
        Object.keys(this.model).filter((key) => {
          if(this.model[key] === '')
            delete this.model[key]
        });
        var options = {
            path: '/contracts/',
            params: this.model
          }                        
        store.dispatch(types.NINETOFIVER_RELOAD_CONTRACTS, options);
      },

      resetForm: function() {
        this.model.company__country = '',
        this.model.contractuser__user__last_name__icontains = '',
        this.model.customer__vat_identification_number = '',
        this.model.label__icontains = '',
        this.model.customer__name__icontains = '',
        this.model.description__icontains = '',
        this.model.contractuser__user__groups__icontains = '',
        this.model.active = true,
        this.model.performance_types__label__icontains = '',
        this.model.customer__internal = '',
        this.model.contractuser__user__first_name__icontains = '',
        this.model.company__internal = '',
        this.model.company__name__icontains = '',
        this.model.contractuser__user__username__icontains = '',
        this.model.company__vat_identification_number = '',
        this.model.contract_groups__label__icontains = ''
        var options = {
          path: '/contracts/'
        }
        store.dispatch(types.NINETOFIVER_RELOAD_CONTRACTS, options);
      },

      toggleActive: function() {
        this.model.active = !this.model.active;
      },

      getActiveValue: function() {
        return this.model.active ? this.model.active : false;
      }
    },
}
</script>
<style>
.form-group>label {
  font-weight: bold;
}

.no-label-field {
  margin-top: -1.2rem;
}

.active-toggle {
  margin-top: 1rem;
}

.form-buttons {
  margin-bottom: .5rem;
}
</style>