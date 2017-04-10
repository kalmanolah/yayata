<template lang="pug">

div
  .row
    .col-md-10.offset-md-1
      .alert.alert-warning.card-top-red(v-if='open_timesheet_count > 0')
        | You have {{ open_timesheet_count }} due timesheet(s) still open. Please fix that ASAP or Johan will haunt your dreams.
  .row
    .col-md-10.offset-md-1
      .card
        h4.card-title.text-md-center Timesheets for 
          router-link(:to='{ name: "calendar_month_redirect" }')
            | {{ today | moment('MMMM YYYY') }}
        table.table
          tbody
            tr(v-for="(p, index) in contracts" v-bind:key="p.id")              
              td {{ p.customerName }}: {{ p.name }}
              td.text-md-right {{ p.total_duration }} hours ({{p.total_duration | hoursToDaysFilter }} days)
            tr
              td <strong>Total</strong>
              td.text-md-right <strong>{{ totalContractDuration | roundHoursFilter }} hours ({{totalContractDuration | hoursToDaysFilter}} days)</strong>
            tr
              td <strong>Hours left to fill in</strong>
              td.text-md-right <strong>36 hours (4,5 days)</strong>
  .row
    .col-md-10.offset-md-1
      LeaveForm

</template>

<script>
import { mapState } from 'vuex';
import LeaveForm from './forms/LeaveForm.vue';
import store from '../store';

var data = {
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

  created: function () {},

  computed: {  

    //Calculates total hours of currently active projects
    totalContractDuration: function() {
      var total = 0;

      if(this.contracts)
        this.contracts.forEach(x => { 
          total += x.total_duration 
        });

      return total;
    },

    open_timesheet_count: function() {
      if(store.getters.open_timesheet_count)
        return store.getters.open_timesheet_count;
    },

    contracts: function() {
      if(store.getters.contracts)
        return store.getters.contracts;
    },

  },

  filters: {

    //Calculates amount of days in hours
    //Divides by 8 & sets precision to 1 decimal
    hoursToDaysFilter: function(val) {
      return Math.round(val / 8 * 2) / 2;
    },

    roundHoursFilter: function(val) {
      return Math.round(val * 2) / 2;
    },

  },

  methods: {

  },

  watch: { }

}
</script>

<style>
</style>