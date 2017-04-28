<template lang="pug">
div
  .col-md-9
    .row 
      h3 Contracts
      p.subtitle Overview of all contracts
    .row
      .col-md-8
        .btn-group(role='group' aria-label='Button group with nested dropdown')
          button.btn.btn-secondary(type='button' @click='setSortByCustomerName("/my_contracts/")' v-if='show_extra_info') My contracts
          button.btn.btn-secondary(type='button' @click='setSortByCustomerName("all")') All
          .btn-group(role='group')
            button.btn.btn-secondary.dropdown-toggle#btnGroupDropCustomer(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ customerName }}
            .dropdown-menu(aria-labelledby='btnGroupDropCustomer')
              a.dropdown-item(v-for='name in customers' @click='setSortByCustomerName(name)') {{ name }}
          .btn-group(role='group')
            button.btn.btn-secondary.dropdown-toggle#btnGroupDropContractType(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ contractType }}
            .dropdown-menu(aria-labelledby='btnGroupDropContractType')
              a.dropdown-item(v-for='type in contractTypes' @click='setSortByType(type)') {{ type }}
      .col-md-4
        .input-group
          span.input-group-addon Search
          input(type='text', class='form-control', placeholder='Name, description, ...', v-model='query')
    .row
      .card-columns
        div#accordion(v-for='(contract, index) in queryContracts'  role='tablist' aria-multiselectable='true')
          .card(v-bind:class='getRibbonStyleClass(contract)')
            .card-header(v-bind:id='"heading-" + index' data-toggle='collapse'  aria-expanded='false' v-bind:data-target='"#collapse-" + index') 
              div.contract-name {{ contract.name }}
                span.tag.float-md-right(v-bind:class='getTagStyleClass(contract)') {{ contract.active ? 'Active' : 'Inactive'}}
                span.tag.float-md-right(v-bind:class='getTagStyleClassContractType(contract)') {{ contract.type }}
              small.text-muted {{ contract.companyName }} → {{ contract.customerName }}
            .collapse(role='tabpanel' v-bind:id='"collapse-" + index' v-bind:aria-labelledby='"heading-" + index')
              .card-block
                .col-md-6
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
                        div(v-for='user in contract.contract_users') 
                          router-link(:to='{ name: "colleagues", params: { userId: user.user }}') {{ user.display_label }}
                    div(v-if='contract.type !== "SupportContract"')
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
                      .col-md-8.text-md-right(v-bind:class='getStyleClassHoursLeft(contract)') {{ contract.totalHoursAllocated - contract.total_duration }} hours
                .col-md-6
                  PieChart(:chart-data='contract.datacollection')
                    

  .col-md-3.fixed(v-if='show_extra_info')
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
import PieChart from './charts/PieChart.js';
import moment from 'moment';


export default {
  name: 'contracts',

  components: {
    ContractsFilterForm,
    PieChart
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

  },

  computed: {
    user_groups: function() {
      if(store.getters.user){
        return store.getters.user.groups;
      }
    },

    project_estimates: function() {
      if(store.getters.project_estimates){
        return store.getters.project_estimates;
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

            var totalHoursAllocated = 0;
            var contract = store.getters.contracts.find(c => c.id === cd.id);
            // Calculate total nuber of hours allocated from project contract.
            if(contract.type === 'ProjectContract'){
              contract.project_estimate.forEach(estimate => {
                totalHoursAllocated += estimate[0];
              });
              cd.totalHoursAllocated = totalHoursAllocated;
            }

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
    generateCharts: function(contracts){
      contracts.forEach(c => {
        if(c.type === "ProjectContract"){
          this.generateProjectChart(c);
        } else {
          this.generateTimeLeftChart(c);
        }
      });
    },

    // Generates a chart based on a project contract
    generateProjectChart: function(contract) {
      var data = [];
      var labels = [];
      var total_allocated = 0;
      this.project_estimates.forEach(estimate => {
        if(estimate.project === contract.id){
          total_allocated += estimate.hours_estimated;
          data.push(estimate.hours_estimated);
          labels.push(store.getters.contract_roles.find(role => estimate.role === role.id).name);
        }
      })

      // Should be hours allocated: project_estimates needs refactoring first.
      var hoursToFillIn = total_allocated- contract.total_duration;
      var datacollection = {
        labels: labels,
        datasets :[
          {
            label: 'Estimates',
            backgroundColor: ['#41B883', '#E46651', '#00D8FF'],
            data: data
          },
          {
            label: 'Time left',
            backgroundColor: ['#41B883', '#E46651'],
            data: [contract.total_duration, hoursToFillIn]
          },
        ]
      }
      contract.datacollection = datacollection;
    },

    // Generates a chart based on a support or consultancy contract.
    generateTimeLeftChart: function(contract) {
      var data = [];
      var daysLeft = moment().diff(moment(contract.start_date), 'days');
      var daysSinceStart = moment(contract.end_date).diff(moment(), 'days');
      
      var datacollection = {
        labels: ['Days left', 'Days spent'],
        datasets :[
          {
            label: 'Data One',
            backgroundColor: ['#41B883', '#E46651'],
            data: [daysSinceStart, daysLeft]
          },
        ]
      }
      contract.datacollection = datacollection;
    },

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
      this.generateCharts(contracts);
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

    HoursLeft: function(contract) {
      var output = 0;
      if(contract.project_estimate){
        contract.project_estimate.forEach(estimate => {
          output += estimate[0]
        });
      }
      return output -= contract.total_duration;
    },

    getStyleClassHoursLeft: function(contract){
      return this.HoursLeft(contract) >= 0 ? 'text-success' : 'text-danger'
    },
  }
}
</script>

<style>
.dropdown-item:hover {
  cursor: pointer;
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

.card-columns {
  column-count: 1;
  margin-right: 15px;
}

.fixed {
  position: fixed;
  left: 77vw;
  width: 21vw;
}

</style>