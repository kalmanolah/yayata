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
  timesheets: [],
  contracts: [],
  customers: {},

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

  created: () => {

    //Get timesheets of current user
    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_timesheets/',
      params: {}
    }).then((response) => {
      var timesheets = {};

      response.data.results.forEach(function(sheet) {
        if(!timesheets[sheet.year]) 
          timesheets[sheet.year] = {};
      });

      data.timesheets = timesheets;
    }, () => {
      this.loading = false
    });


    //Get contracts of current user
    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_contracts/',
      params: {}
    }).then( (response) => {
      data.contracts = response.data.results;
    }, () => {
      this.loading = false
    });

  },

  computed: {  },

  filters: {

    hoursToDaysFilter: function(value) {
      return Math.round(value / 24);
    }

  },

  methods: {

    //Constructs project array to show data
    makeProjectsArray: function() {
      if(data.contracts.length > 0) {
        data.projects = [];

        for (var i = 0; i < data.contracts.length; i++)  
          data.projects.push( { 
            customerLabel: data.customers[data.contracts[i].customer],
            projectLabel: data.contracts[i].label
          });
      }
    },

    //Gets the company names from the API, pushes into customers-dict
    getCustomersFromID: function(value) {

       store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/companies/' + value + '/'
      }).then((response) => {
        data.customers[value] = response.data.name;

        //Construct the projects-array
        this.makeProjectsArray();
      });

    },

  },

  watch: {

    //Watches contracts
    //On change -> request to getCustomersFromID()
    contracts: function(newContracts) {
      for(var i = 0; i < newContracts.length; i++)
        this.getCustomersFromID(newContracts[i].customer); 
    },

  }

}
</script>

<style>
</style>