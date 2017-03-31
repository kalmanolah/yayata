<template lang="pug">

div
  .row
    .col-md-10.offset-md-1
      .alert.alert-warning.card-top-red(v-if='openTS > 0')
        | You have {{openTS}} due timesheet(s) still open. Please fix that ASAP or Johan will haunt your dreams.
  .row
    .col-md-10.offset-md-1
      .card
        h4.card-title.text-md-center Timesheets for 
          router-link(:to='{ name: "calendar_month_redirect" }')
            | {{ today | moment('MMMM YYYY') }}
        table.table
          tbody
            tr(v-for="p in projects")              
              td {{ p.custLabel }}: {{ p.projectLabel }}
              td.text-md-right {{ p.total_duration }} hours ({{p.total_duration | hoursToDaysFilter }} days)
            tr
              td <strong>Total</strong>
              td.text-md-right <strong>{{ totalProjectDuration }} hours ({{totalProjectDuration | hoursToDaysFilter}} days)</strong>
            tr
              td <strong>Hours left to fill in</strong>
              td.text-md-right <strong>36 hours (4,5 days)</strong>
  .row
    .col-md-10.offset-md-1
      LeaveForm

</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'
import * as constant from '../store/constants'
import LeaveForm from './forms/LeaveForm.vue'
import store from '../store'

var data = {
  openTS: 0,
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

    //Get whether user has open timesheets
    data.openTS = constant.MY_TIMESHEETS.length;

    //Get contracts for current user
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

  computed: {  

    //Calculates total hours of currently active projects
    totalProjectDuration: function() {
      var total = 0;

      for(var i = 0; i < data.projects.length; i++)
        total += data.projects[i].total_duration;

      return total;
    }

  },

  filters: {

    //Calculates amount of days in hours
    //Divides by 8 & sets precision on 1 decimal
    hoursToDaysFilter: function(val) {
      return Math.round(val / 8 * 2) / 2;
    },

  },

  methods: {

    //Constructs project array to show data
    makeProjectsArray: function(contracts) {
      data.projects = [];

      for (var i = 0; i < contracts.length; i++)  
        data.projects.push({ 
          contID: contracts[i].id,
          custID: contracts[i].customer,
          projectLabel: contracts[i].label,
          custLabel: constant.COMPANIES.find(x => x.id == contracts[i].customer).label
        });

    },

    //Gets the company names from the API, pushes into projects.customerLabel
    getCustomersFromID: function(value) {

       store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/companies/' + value + '/'
      }).then((response) => {
        //Finds correct project in arr, then sets correct value for key according to VueJS datachange detection method
        for(var i = 0; i < data.projects.length; i++)
          if(data.projects[i].custID == value)
            this.$set(data.projects[i], 'customerLabel', response.data.name)
      });

    },

    //Get hours per project for current user
    getHoursPerProject: function(value) {

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_contract_durations/' + value + '/'
      }).then( (response) => {
        for(var i = 0; i < data.projects.length; i++) 
          if(data.projects[i].contID == value)
            this.$set(data.projects[i], 'total_duration', response.data.total_duration)
      });

    },

  },

  watch: {

    //Watches contracts to make correct changes to projectsArr & call getCustomers
    contracts: function(newContracts) {
      for(var i = 0; i < newContracts.length; i++) 
        this.getHoursPerProject(newContracts[i].id);
      
      this.makeProjectsArray(newContracts); 
    },

  }

}
</script>

<style>
</style>