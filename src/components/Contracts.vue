<template lang="pug">
div
  h3 My contracts
  p.subtitle Overview of all my contracts

  .col-md-12
    h4.text-md-center ACTIVE
    hr

    .card-deck

      .card.contract-card.col-md-4(v-for='ac in activeContracts')

        .card-block
          h4.card-title {{ ac.display_label }}
          small.text-muted {{ ac.companyName }} → {{ ac.customerName }}

          .card-text {{ac.description}}

          hr
          small
            .row
              .col-md-7.col-sm-6 <strong>Total:</strong> {{ ac.total_duration }} hours
              .col-md-5.col-sm-6 <strong>This month:</strong> {{ ac.monthly_duration }} hours
            .row
              .col-md-7.col-sm-6 <strong>Groups:</strong> {{ ac.contract_groups | getContractGroupAsString }}
              .col-md-5.col-sm-6 <strong>Users:</strong> {{ ac.total_users }}



  .col-md-12
    h4.text-md-center INACTIVE
    hr

    .card-deck

      .card.contract-card(v-for='ic in inactiveContracts')

        .card-block
          h4.card-title {{ ic.display_label }}
          small.text-muted {{ ic.companyName }} → {{ ic.customerName }}

          .card-text {{ic.description}}

          hr
          small
            .row
              .col-md-7.col-sm-6 <strong>Total:</strong> {{ ic.total_duration }} hours
              .col-md-5.col-sm-6 <strong>This month:</strong> {{ ic.monthly_duration }} hours
            .row
              .col-md-7.col-sm-6 <strong>Groups:</strong> {{ ic.contract_groups | getContractGroupAsString }}
              .col-md-5.col-sm-6 <strong>Users:</strong> {{ ic.total_users }}
    

</template>

<script>
import { mapState } from 'vuex';
import * as types from '../store/mutation-types';
import store from '../store';


export default {
  name: 'contracts',

  components: {},

  data () {
    return {}
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
      if(store.getters.contracts) 
        return store.getters.contracts;
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
          }

          return contract_detail;
      }
    },

    //Gets the contracts currently still active
    activeContracts: function() {
      if(this.contracts && this.contract_detail)
        //First filter for active contracts
        //Then find the corresponding contract_detail
        return this.contracts.filter(x => x.active === true).map(c => {
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

  methods: {}
}
</script>

<style>
.contract-card {
  margin: 5px 10px;
  .card-block {
    padding: 0px;
    text-overflow: ellipsis;
  }
}
</style>