<template lang="pug">
.col-sm-12
  .card
    .card-block
      .row
        .col-sm-12.text-sm-center
          h3 Advanced Filter
          p.subtitle.hidden-md-down More indepth filtering

      .row
        .col-md-6.form-buttons
          .btn.btn-primary.btn-block(@click='submitForm')
            i.fa.fa-filter(aria-hidden="true") &nbsp;
            span.hidden-lg-down Submit

        .col-md-6.form-buttons
          .btn.btn-danger.btn-block(@click='resetForm')
            i.fa.fa-refresh(aria-hidden="true") &nbsp; 
            span.hidden-lg-down Reset
      hr

      .pre-scrollable.filter-scrollable
        .row
          .col-sm-12
            strong.active-toggle Contract status
          .col-sm-12
            toggle-button.active-toggle(@change='toggleActive()', :value='getActiveValue()', color='#5CB85C', :sync='true', :labels='toggleButtonLabels', :width='70') 
          .col-sm-12
            vue-form-generator(:schema="schema", :model="model", :options="formOptions")
      
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
              performance_types__id: null,
              customer__internal: '',
              contractuser__user__first_name__icontains: '',
              company__internal: null,
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
                    // Company_internal
                    type: "select",
                    label: "Company",                      
                    model: "company__internal",
                    selectOptions: {
                      noneSelectedText: 'internal company'
                    },
                    values: function() {
                      if(store.getters.companies)
                        return store.getters.companies.filter(c => c.internal === true);
                    },
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
                    //PERFORMANCE_TYPE
                    type: "select",
                    model: "performance_types__id",
                    styleClasses: 'no-label-field',
                    selectOptions: {
                      noneSelectedText: 'performance type'
                    },
                    values: function() {
                      if(store.getters.performance_types)
                        return store.getters.performance_types;
                    },
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
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, options);
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
        this.model.performance_types__id = '',
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
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, options);
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
.form-group {
  padding: 0px 6px;
}
.form-group > label {
  font-weight: bold;
  padding: 4px 0px;
  margin-bottom: 2px;
}

.no-label-field {
  margin-top: -1.2rem;
}

.active-toggle {
  margin-top: 0.5rem;
}

.filter-scrollable {
  max-height: 60vh;
}

</style>