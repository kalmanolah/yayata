<template lang="pug">
div.row
  .col
    //- Header
    .row
      .col
        h3 Contracts
          .btn.btn-outline-primary.pull-right(@click='showFilter = !showFilter') 
            i.fa(aria-hidden='true', :class="showFilter ? 'fa-angle-double-right' : 'fa-filter'")
        p.subtitle Overview of all contracts

    //- Advanced filter panel
    .row
      #contract-filter.col.order-12(v-if='showFilter')
        ContractsFilterForm
      //- Main page
      #contracts.order-1(:class='showFilter ? "col-9" : "col"')
        .row
          .col-8
            .btn-group(role='group' aria-label='Button group with nested dropdown')
              button.btn.btn-outline-dark(type='button' @click='setSortByCustomerName("/my_contracts/")' v-if='show_extra_info') My contracts
              button.btn.btn-outline-dark(type='button' @click='setSortByCustomerName("all")') All

              .btn-group(role='group')
                button.btn.btn-outline-dark.dropdown-toggle#btnGroupDropCustomer(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ customerName }}
                .dropdown-menu(aria-labelledby='btnGroupDropCustomer')
                  a.dropdown-item(v-for='name in customers' @click='setSortByCustomerName(name)') {{ name }}

              .btn-group(role='group')
                button.btn.btn-outline-dark.dropdown-toggle#btnGroupDropContractType(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ contractType }}
                .dropdown-menu(aria-labelledby='btnGroupDropContractType')
                  a.dropdown-item(v-for='type in contractTypes' @click='setSortByType(type)') {{ type }}
                Invoice.pull-right.ml-2

          .col-lg-4
            .input-group
              span.input-group-addon Search
              input(type='text', class='form-control', placeholder='Name, description, ...', v-model='query')

        .row
          .col-sm-12
            .card-columns
              div#accordion(v-for='(contract, index) in queryContracts'  role='tablist' aria-multiselectable='true')
                .card(v-bind:class='getRibbonStyleClass(contract)')
                  .card-header(v-bind:id='"heading-" + index' data-toggle='collapse'  aria-expanded='false' v-bind:data-target='"#collapse-" + index' @click='generate = true') 
                    div.contract-name {{ contract.name }} - {{ contract.end_date}}
                      span.badge.float-md-right.ml-1(v-bind:class='getBadgeStyleClass(contract)') {{ contract.active ? 'Active' : 'Inactive'}}
                      span.badge.float-md-right.ml-1(v-bind:class='getBadgeStyleClassContractType(contract)') {{ contract.type }}
                    small.text-muted {{ contract.companyName }} → {{ contract.customerName }}

                  .collapse(role='tabpanel' v-bind:id='"collapse-" + index' v-bind:aria-labelledby='"heading-" + index')
                    .card-block.p-3
                      .row
                        .col
                          .card-text
                            .row
                              .col-md-4 <strong>Description:</strong> 
                              .col-md-8.text-md-right {{ contract.description }}
                            hr
                            .row
                              .col-md-4 <strong>This month:</strong>
                              .col-md-8.text-md-right {{ contract.hours_spent_this_month}} hours
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
                                .col-md-5 <strong>Total hours spent:</strong>
                                .col-md-7.text-md-right {{ contract.total_hours_spent }} hours
                            hr
                            .row(v-if='contract.type === "ProjectContract"')
                              .col-md-4 <strong>Project estimates:</strong>
                              .col-md-8.text-md-right 
                                .row(v-for='estimate in contract.project_estimate') 
                                  .col-8.estimate {{ estimate[1] | getRoleAsString }}: 
                                  .col.estimate {{ estimate[0] }} h
                            hr(v-if='contract.type === "ProjectContract"')
                            .row(v-if='contract.type === "ProjectContract"')
                              .col-md-4 <strong>Hours to fill in:</strong>
                              .col-md-8.text-md-right(v-bind:class='getStyleClassHoursLeft(contract)') {{ contract.hours_left }} hours
                            hr(v-if='contract.attachments')
                            .row
                              .col-md-4 <strong>Attachments</strong>
                              .col-md-8.text.md-right
                                div(v-for='attachment in contract.attachments')
                                  a(:href='attachment | urlFilter' ) {{ attachment.display_label }}


                        .col(v-if='validChartData(contract)')
                          div(v-if='contract.type === "ProjectContract"')
                            PieChart.chart-container(v-if='generate', :chart-data='generateProjectChart(contract)')
                            p.pt-2.text-center.small.text-muted DISCLAIMER: Outer circle is actual, inner circle is estimate
                          div(v-else)
                            PieChart.chart-container(v-if='generate', :chart-data='generateTimeLeftChart(contract)', :options='chartOptions')

</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';
import ContractsFilterForm from './forms/ContractsFilterForm.vue';
import PieChart from './charts/PieChart.js';
import moment from 'moment';
import Invoice from './Invoice.vue';


export default {
  name: 'contracts',

  components: {
    ContractsFilterForm,
    PieChart,
    Invoice
  },

  data () {
    return {
      sortBy: 'all',
      customerName: 'Customer',
      contractType: 'Contract type',
      query: '',
      // Stores the unique custoner names
      customers: [],
      contractTypes: [],
      generate: false,
      showFilter: false,
      chartOptions: {
        legend: {
          labels: {
            fontSize: 20
          }
        }
      }
    }
  },

  created: function () {
    store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, {
      params: {
        // page_size: 10
      }
    });
    if(!store.getters.contract_roles){
      store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_ROLES)
    }
    if(!store.getters.attachments){
      store.dispatch(types.NINETOFIVER_RELOAD_ATTACHMENTS)
    }

  },

  filters: {
    urlFilter: function(attachment){
      // base url is localhost:8080 but files are served from 127.0.0.1:8080
      return 'http://127.0.0.1:8000' + attachment.file_url;
    },

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

    //Gets the full contracts containing attachtments, contractusers, hours estimated and allocated. 
    fullContracts: function() {
      if(store.getters.full_contracts && store.getters.filtered_contracts && this.customers && this.contractTypes) {

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

        return store.getters.full_contracts;
      }
    },

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
        return store.getters.filtered_contracts;
      }
    },

    // Filter by user input
    queryContracts: function() {
       if(this.sortedContracts) {
        return this.sortedContracts.filter( contract => {
          // Fields to filter on
          if(contract.name) {
            return contract.name.toLowerCase().indexOf(this.query.toLowerCase()) !== -1;
                  // Not all contracts have a description; this causes an error.
                  // || contract.description.toLowerCase().indexOf(query.toLowerCase()) !== -1;
          }
        });
      }
    },

    // Sort by customerName
    sortedContracts: function() {
      if(this.sortBy !== 'all' && this.fullContracts && store.getters.activity_performances){
        let contracts = [];

        this.fullContracts.forEach(contract => {
          if(contract.customerName === this.sortBy || contract.type === this.sortBy)
            contracts.push(contract)
        });

        return this.activeSort(contracts);
      } else {
        if(this.fullContracts && store.getters.activity_performances)
          return this.activeSort(this.fullContracts);
      }
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
    // Generates a chart based on a project contract
    generateProjectChart: function(contract) {
      if(this.project_estimates && store.getters.contract_roles && store.getters.activity_performances) {
        let data = [];
        let labels = [];
        let total_allocated = 0;
        let total_spent_per_role = {};

        this.project_estimates.forEach(estimate => {
          if(estimate.project === contract.id) {
            data.push(estimate.hours_estimated);

            let cRole = store.getters.contract_roles.find(r => estimate.role === r.id);

            if(cRole) {
              // Push contractrole objects in labels so we can use their .name and .id properties later on
              // Make the total_spent_per_role object with the names, so the ids dont get mixed up with the indices..
              labels.push(cRole);
              total_spent_per_role[cRole.name] = 0;              
            }
          }
        });

        let performances = store.getters.activity_performances.filter((p) => p.contract === contract.id);

        // Loop over performances and allocate each to the corresponding contractrole
        performances.forEach((perf) => {
          let crole = labels.find(x => { return perf.contract_role == x.id});
          if(crole) {
            total_spent_per_role[crole.name] += parseFloat(perf.duration);
          }
        });

        // Display hours spent per role and hours left
        let time_spent_data = Object.values(total_spent_per_role);
        let labellos = labels.map(x => {return x.name});

        labellos.push('Hours left')
        time_spent_data.push(contract.hours_left);

        return {
          labels: labellos,
          datasets :[
            {
              label: 'Time left',
              backgroundColor: ['#41B883', '#E46651', '#00D8FF'],
              data: time_spent_data
            },
            {
              label: 'Estimates',
              backgroundColor: ['#41B883', '#E46651', '#00D8FF'],
              data: data
            },
          ]
        }
      }
    },

    // Generates a chart based on a support or consultancy contract.
    generateTimeLeftChart: function(contract) {
      var data = [];
      var daysLeft = moment().diff(moment(contract.end_date), 'days');
      daysLeft = daysLeft > 0 ? 0 : -daysLeft; 
      var daysSinceStart = moment(contract.start_date).diff(moment(), 'days');
      daysSinceStart = daysSinceStart < 0 ? 0 :daysSinceStart;
      
      var datacollection = {
        labels: ['Days left', 'Days spent'],
        datasets :[
          {
            label: 'Data One',
            backgroundColor: ['#41B883', '#E46651'],
            data: [daysLeft, daysSinceStart]
          },
        ]
      }
      return datacollection;
    },

    //Checks to see if there is some actual data for the chart to be rendered
    validChartData: function(contract) {
      let data = contract.type == 'ProjectContract' ? this.generateProjectChart(contract) : this.generateTimeLeftChart(contract);
      return data ? data.datasets[0].data.length >= 2 : null;
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
        let options = { 
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

    getBadgeStyleClass: function(contract) {
      return contract.active ? 'badge-success' : 'badge-danger';
    },

    getBadgeStyleClassContractType: function(contract) {
      // var contract_type = store.getters.contract_types.find(c => contract.type === c);
      if(contract){
        var tempObj = {
          [store.getters.contract_types[2]]: 'badge-danger',        
          [store.getters.contract_types[1]]: 'badge-primary',
          [store.getters.contract_types[0]]: 'badge-success',
        }
        return (tempObj[contract.type]) ? tempObj[contract.type] : 'badge-primary';   
      }
    },

    getStyleClassHoursLeft: function(contract){
      return contract.hours_left >= 0 ? 'text-success' : 'text-danger'
    },
  }
}
</script>

<style>
#contracts {
  order: 1;
}

#contract-filter {
  order: 2;
}

.dropdown-item:hover {
  cursor: pointer;
}

.contract-name {
  font-weight: bold;
}

.estimate {
  padding-right: 0;
}

.card-columns {
  column-count: 1;
}

.show-filter-button {
  margin-right: 0px;
}

.chart-container {
  max-height: 600px;
  max-width: 600px;
}
</style>