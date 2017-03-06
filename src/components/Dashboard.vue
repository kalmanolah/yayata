<template lang="pug">

div
  .row
    .col-md-8
      .alert.alert-warning.card-top-red(v-if='timesheets')
        | You have 1 due timesheet that is still open. Please fix that ASAP or Johan will haunt your dreams.
  .row
    .col-md-8
      .card
        h4.card-title.text-md-center
          | Timesheet for {{ today | moment('MMMM YYYY') }}
        table.table
          tbody
            tr(v-for="p in projects")              
              td {{ p.customerLabel }} ({{ p.projectLabel }})
              td.text-md-right 92 hours ({{92 | hoursToDaysFilter }} days)
            tr
              td <strong>Total</strong>
              td.text-md-right <strong>132 hours (16,5 days)</strong>
            tr
              td <strong>Hours left to fill in</strong>
              td.text-md-right <strong>36 hours (4,5 days)</strong>
  .row
    .col-md-8
      LeaveForm

</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'
import LeaveForm from './forms/LeaveForm.vue'
import store from '../store'

var data = {
  timesheets: false,
  contracts: [],
  projects: [],

  today: new Date(),
}

export default {
  name: 'dashboard',

  components: {
    LeaveForm: LeaveForm,
  },

  data () {
    return data;
  },

  created: function () {

    let self = this;

    //Get whether user has open timesheets
    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_timesheets/'
    }).then((response) => {
      if(response.body.count > 0)
        data.timesheets = true;
    }, () => {
      this.loading = false
    });


    //Get contracts of current user
    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_contracts/',
      params: {
        'active': true
      }
    }).then((response) => {
      data.contracts = response.data.results;
    }, () => {
      this.loading = false;
    });

  },

  computed: {  },

  filters: {

    //Computes amount of days in hours
    hoursToDaysFilter: function(value) {
      return Math.round(value / 24);
    }

  },

  methods: {

    //Constructs project array to show data
    makeProjectsArray: function(contracts) {
      data.projects = [];

      for (var i = 0; i < contracts.length; i++)  
        data.projects.push({ 
          id: contracts[i].customer,
          projectLabel: contracts[i].label,
        });
    },

    //Gets the company names from the API, pushes into projects.customerLabel
    getCustomersFromID: function(value) {

       store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/companies/' + value + '/'
      }).then((response) => {
        //Finds correct project in arr, then sets correct value for key according to VueJS datachange detection method
        for(var i = 0; i < data.projects.length; i++)
          if(data.projects[i].id == value)
            this.$set(data.projects[i], 'customerLabel', response.data.name)
      });

    },
    
    //Gets the total hours spent for the user per contract

  },

  watch: {

    //Watches contracts to make correct changes to projectsArr & call getCustomers
    contracts: function(newContracts) {
      for(var i = 0; i < newContracts.length; i++)
        this.getCustomersFromID(newContracts[i].customer);
      
      this.makeProjectsArray(newContracts); 
    },

  }

}
</script>

<style>
</style>