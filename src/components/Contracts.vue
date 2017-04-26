<template lang="pug">
div
  .col-md-9
    .row 
      h3 Contracts
      p.subtitle Overview of all contracts
    .row
      .col-md-8
        .btn-group(role='group' aria-label='Button group with nested dropdown')
          button.btn.btn-secondary(type='button' @click='setSortBy("/my_contracts/")' v-if='show_extra_info') My contracts
          button.btn.btn-secondary(type='button' @click='setSortBy("all")') All
          .btn-group(role='group')
            button.btn.btn-secondary.dropdown-toggle#btnGroupDropCustomer(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ customerName }}
            .dropdown-menu(aria-labelledby='btnGroupDropCustomer')
              a.dropdown-item(v-for='name in customers' @click='setSortBy(name)') {{ name }}
          .btn-group(role='group')
            button.btn.btn-secondary.dropdown-toggle#btnGroupDropContractType(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ contractType }}
            .dropdown-menu(aria-labelledby='btnGroupDropContractType')
              a.dropdown-item(v-for='type in contractTypes' @click='setSortByType(type)') {{ type }}
      .col-md-4
        .input-group
          span.input-group-addon Search
          input(type='text', class='form-control', placeholder='Name, description, ...', v-model='query')
    .row.card-row
      .col-md-6(v-for='(contract, index) in queryContracts')
        .card(v-bind:class='getRibbonStyleClass(contract)')
          .card-header 
            div.contract-name {{ contract.name }}
              span.tag.float-md-right(v-bind:class='getTagStyleClass(contract)') {{ contract.active ? 'Active' : 'Inactive'}}
              span.tag.float-md-right(v-bind:class='getTagStyleClassContractType(contract)') {{ contract.type }}
            small.text-muted {{ contract.companyName }} → {{ contract.customerName }}
          .card-block
            .card-text
              .row
                .col-md-4 <strong>Description:</strong> 
                .col-md-8.text-md-right {{ contract.description }}
              hr
              .row
                .col-md-4 <strong>This month:</strong>
                .col-md-8.text-md-right {{ contract.monthly_duration }} hours
              hr
              .row
                .col-md-4 <strong>Groups:</strong>
                .col-md-8.text-md-right {{ contract.contract_groups | getContractGroupAsString }}
              hr
              .row
                .col-md-4 <strong>Users:</strong>
                .col-md-8.text-md-right 
                  div(v-for='user in contract.contract_users') {{ user.display_label }}
              hr
              .row
                .col-md-5 <strong>Total hours allocated:</strong>
                .col-md-7.text-md-right {{ contract.total_duration }} hours
              hr
              .row(v-if='contract.type === "ProjectContract"')
                .col-md-4 <strong>Project estimates:</strong>
                .col-md-8.text-md-right 
                  div(v-for='estimate in contract.project_estimate') 
                    .col-md-6.estimate {{ estimate[1] | getRoleAsString }}: 
                    .col-md-6.estimate {{ estimate[0] }} hours
              hr(v-if='contract.type === "ProjectContract"')
              .row(v-if='contract.type === "ProjectContract"')
                .col-md-4 <strong>Hours to fill in:</strong>
                .col-md-8.text-md-right {{ contract | getHoursLeft }} hours
                

  .col-md-3(v-if='show_extra_info')
    .row
      h3 Advanced Filter
      p.subtitle more advanced filtering here   
    .row
      ContractsFilterForm
</template>

<script>
import { mapState } from 'vuex';
import * as types from '../store/mutation-types';
import store from '../store';
import ContractsFilterForm from './forms/ContractsFilterForm.vue';


export default {
  name: 'contracts',

  components: {
    ContractsFilterForm
  },

  data () {
    return {
      sortBy: 'all',
      customerName: 'Customer',
      contractType: 'Contract type',
      query: '',
      // Stores the unique custoner names
      customers: [],
      contractTypes: []
    }
  },

  created: function () {
    if(!store.getters.filtered_contracts){
      store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS)
    }
    if(!store.getters.contract_roles){
      store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_ROLES)
    }
  },

  filters: {
    //Return array as joined strings
    getContractGroupAsString: function(arr) {
      //If we're provided a value
      if(arr && arr.length > 0 && store.getters.contract_groups) {
        var output = '';

        for(var i = 0; i < arr.length; i++) {
          if(i > 0) 
            output += ', ';
          output += store.getters.contract_groups.find(x => x.id == arr[i]).name;
        }
        return output;
      }

      return 'None';
    },

    getRoleAsString: function(val) {
      if(val && store.getters.contract_roles){
        var output = '';

        output += store.getters.contract_roles.find(x => x.id == val).name;
        return output;
      }
    },

    getHoursLeft: function(val) {
      var output = 0;
      if(val.project_estimate){
        val.project_estimate.forEach(estimate => {
          output += estimate[0]
        });

        return output - val.total_duration;
      }
    }

  },

  computed: {
    user_groups: function() {
      if(store.getters.user){
        return store.getters.user.groups;
      }
    },

    show_extra_info: function() {
      if(store.getters.show_extra_info){
        return store.getters.show_extra_info
      }
    },

   //Gets the contracts from the store
    filtered_contracts: function() {
      if(store.getters.filtered_contracts) {
        // Get each unique customerName
        store.getters.filtered_contracts.forEach((contract) => {
          if(this.customers.indexOf(contract.customerName) === -1){
            this.customers.push(contract.customerName);
          }
        });
        // Get each unique contractType
        store.getters.filtered_contracts.forEach((contract) => {
          if(this.contractTypes.indexOf(contract.type) === -1){
            this.contractTypes.push(contract.type);
          }
        });
        return store.getters.filtered_contracts;
      }
    },

    //Stores extra information about the contracts
    contract_detail: function() {
      if(this.filtered_contracts && store.getters.monthly_activity_performances && store.getters.contract_users) {
          var contract_detail = this.filtered_contracts.map(x => { return {id: x.id}});

          for(var cd of contract_detail) {
            var totalHours = 0;

            store.getters.monthly_activity_performances.forEach(x => {
              if(x.contract === cd.id)
                totalHours += parseFloat(x.duration);
            });

            cd.monthly_duration = totalHours;
            cd.total_users = store.getters.contract_users_count;
            
            var contract_users = [];
            store.getters.contract_users.forEach((cu) =>{
              if(cu.contract === cd.id){
                contract_users.push(cu);
              }
            });
            cd.contract_users = contract_users;
          }

          return contract_detail;
      }
    },

    // Filter by user input
    queryContracts: function() {
       if(this.sortedContracts){
        var query = this.query;
        return this.sortedContracts.filter( contract => {
          // Fields to filter on
          return contract.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
                || contract.description.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
      }
    },

    // Sort by customerName
    sortedContracts: function() {
      if(this.sortBy !== 'all' && this.fullContracts){
        var contracts = [];
        this.fullContracts.forEach(contract => {
          if(contract.customerName === this.sortBy || contract.type === this.sortBy){
            contracts.push(contract)
          }
        });
        return this.activeSort(contracts);
      } else {
        if(this.fullContracts)
          return this.activeSort(this.fullContracts);
      }
    },

    //Gets the contracts currently still active
    fullContracts: function() {
      if(this.filtered_contracts && this.contract_detail)
        //First filter for active contracts
        //Then find the corresponding contract_detail
        return this.filtered_contracts.map(c => {
            return Object.assign(c, this.contract_detail.find(cd => cd.id === c.id ));
          });
    },

    //Gets the contracts currently unactive
    inactiveContracts: function() {
      if(this.filtered_contracts && this.contract_detail)
        return this.filtered_contracts.filter(x => x.active === false).map(c => {
            return Object.assign(c, this.contract_detail.find(cd => cd.id === c.id ));
          });
    },

  },

  methods: {
    setSortByCustomerName: function(value) {
      // Get all contracts.
      if(value === 'all') {
        this.sortBy = 'all';
        this.customerName = 'Customer';
        this.contractType = 'Contract type';
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, options);
      // Get user contracts.
      } else if(value === '/my_contracts/') {
        var options = { 
          path: '/contracts/', 
          params: {
            contractuser__user__id: store.getters.user.id
          } 
        };
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, options);
      // Get contracts of company.
      } else {
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, options);
        this.sortBy = this.filtered_contracts.find(x => x.customerName == value).customerName;
        this.customerName = this.filtered_contracts.find(x => x.customerName == value).customerName;
      }
    },

    setSortByType: function(type) {
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS);
        this.sortBy = this.filtered_contracts.find(x => x.type == type).type;
        this.contractType = this.filtered_contracts.find(x => x.type == type).type;      
    },

    activeSort: function(contracts) {
      if(contracts){
        return contracts.sort(function(a, b) {
          a = a.active;
          b = b.active;

          return a > b ? -1 : (a < b ? 1 : 0);
        });
      }
    },

    getRibbonStyleClass: function(contract) {
      return contract.active ? 'card-top-green' : 'card-top-red';                           
    },

    getTagStyleClass: function(contract) {
      return contract.active ? 'tag-success' : 'tag-danger';
    },

    getTagStyleClassContractType: function(contract) {
      // var contract_type = store.getters.contract_types.find(c => contract.type === c);
      if(contract){
        var tempObj = {
          [store.getters.contract_types[2]]: 'tag-danger',        
          [store.getters.contract_types[1]]: 'tag-primary',
          [store.getters.contract_types[0]]: 'tag-success',
        }
        return (tempObj[contract.type]) ? tempObj[contract.type] : 'tag-primary';   
      }
    },
  }
}
</script>

<style>
.dropdown-item:hover {
  cursor: pointer;
}

.card-row {
  margin-top: 1rem;
   display: flex;
   flex-wrap: wrap;
}

.card-row > div[class*='col-'] {
  display: flex;

}

.card {
  width: 100%;
}

.contract-name {
  font-weight: bold;
}

.estimate {
  padding-right: 0;
}

</style>