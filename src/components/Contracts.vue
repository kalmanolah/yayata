<template lang="pug">
div
  .col-md-9
    .row 
      h3 Contracts
      p.subtitle Overview of all contracts
    .row
      .col-md-8
        .btn-group(role='group' aria-label='Button group with nested dropdown')
          button.btn.btn-secondary(type='button' @click='setSortBy("all")') All
          .btn-group(role='group')
            button.btn.btn-secondary.dropdown-toggle#btnGroupDrop(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ customerName }}
            .dropdown-menu(aria-labelledby='btnGroupDrop')
              a.dropdown-item(v-for='name in customers' @click='setSortBy(name)') {{ name }}
      .col-md-4
        .input-group
          span.input-group-addon Search
          input(type='text', class='form-control', placeholder='Name, description, ...', v-model='query')
    .row.card-row
      .col-md-6(v-for='(contract, index) in filteredContracts')
        .card(v-bind:class='getRibbonStyleClass(contract)')
          .card-header 
            div.contract-name {{ contract.name }}
              span.tag.float-md-right(v-bind:class='getTagStyleClass(contract)') {{ contract.active ? 'Active' : 'Inactive'}}
            small.text-muted {{ contract.companyName }} → {{ contract.customerName }}
          .card-block
            .card-text
              .row
                .col-md-3 <strong>Description:</strong> 
                .col-md-9.text-md-right {{ contract.description }}
              hr
              .row
                .col-md-3 <strong>Total:</strong>
                .col-md-9.text-md-right {{ contract.total_duration }} hours
              hr
              .row
                .col-md-3 <strong>This month:</strong>
                .col-md-9.text-md-right {{ contract.monthly_duration }} hours
              hr
              .row
                .col-md-3 <strong>Groups:</strong>
                .col-md-9.text-md-right {{ contract.contract_groups | getContractGroupAsString }}
              hr
              .row
                .col-md-3 <strong>Users:</strong>
                .col-md-9.text-md-right 
                  div(v-for='user in contract.contract_users') {{ user.display_label }}
  .col-md-3
    .row
      h3 Advanced Filter
      p.subtitle more advanced filtering here   

</template>

<script>
import { mapState } from 'vuex';
import * as types from '../store/mutation-types';
import store from '../store';


export default {
  name: 'contracts',

  components: {},

  data () {
    return {
      sortBy: 'all',
      customerName: 'Customer',
      query: '',

      // Stores the unique custoner names
      customers: []
    }
  },

  created: function () {},

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

  },

  computed: {

    //Gets the contracts from the store
    contracts: function() {
      if(store.getters.contracts) {
        // Get each unique customerName
        store.getters.contracts.forEach((contract) => {
          if(this.customers.indexOf(contract.customerName) === -1){
            this.customers.push(contract.customerName);
          }
        }); 
        return store.getters.contracts;
      }
    },

    //Stores extra information about the contracts
    contract_detail: function() {
      if(this.contracts && store.getters.monthly_activity_performances && store.getters.contract_users) {
          var contract_detail = this.contracts.map(x => { return {id: x.id}});

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
    filteredContracts: function() {
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
          if(contract.customerName === this.sortBy){
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
      if(this.contracts && this.contract_detail)
        //First filter for active contracts
        //Then find the corresponding contract_detail
        return this.contracts.map(c => {
            return Object.assign(c, this.contract_detail.find(cd => cd.id === c.id ));
          });
    },

    //Gets the contracts currently unactive
    inactiveContracts: function() {
      if(this.contracts && this.contract_detail)
        return this.contracts.filter(x => x.active === false).map(c => {
            return Object.assign(c, this.contract_detail.find(cd => cd.id === c.id ));
          });
    },

  },

  methods: {
    setSortBy: function(value) {
      if(value === 'all') {
        this.sortBy = 'all';
        this.customerName = 'Customer';
      } else {
        this.sortBy = this.contracts.find(x => x.customerName == value).customerName;
        this.customerName = this.contracts.find(x => x.customerName == value).customerName;
        console.log(this.sortBy)    
        console.log(this.groupLabel)    
      }
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
    }
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
</style>