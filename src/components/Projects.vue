<template lang="pug">
div
  h3 My projects
  p.subtitle Overview of all my projects

  div.col-md-12.card
    h5.text-md-center.card-header 
      | ACTIVE

    div.col-md-6.card-block(v-for='ac in activeContracts')
      div.card-title {{ ac.display_label }} <br>
        small.text-muted {{ ac.company | getCompanyLabelFromID }} → {{ ac.customer | getCompanyLabelFromID }}
      div.card-text {{ac.description}}
      div.card-footer
        div.row
          small.col-md-6 <strong>Total:</strong> {{ ac.total_duration }} hours
          small.col-md-6 <strong>This month:</strong> {{ ac.monthly_duration }} hours
        div.row
          small.col-md-8 <strong>Groups:</strong> {{ ac.contract_groups | getContractGroupAsString }}
          small.col-md-4 <strong>Users:</strong> {{ac.total_users}}
  hr

  //- div.col-md-12.card
  //-   h5.text-md-center.card-header INACTIVE

  //-   div.col-md-6.card-block(v-for='ic in inactiveContracts')
  //-     div.card-title {{ ic.display_label }} <br>
  //-       small.text-muted {{ ic.company | getCompanyLabelFromID }} → {{ ic.customer | getCompanyLabelFromID }}
  //-     div.card-text
  //-       | {{ ic.description }}
  //-     small <strong>Groups: </strong>{{ ic.contract_groups | getContractGroupAsString }}
    

</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'
import * as constant from '../store/constants'
import store from '../store';


export default {
  name: 'projects',

  components: {},

  data () {
    return {

      contracts: [],
      contract_durations: [],

    }
  },

  created: function () {

    store.dispatch(
      types.NINETOFIVER_API_REQUEST, {
        path: '/my_contracts/',
    }).then((mcResponse) => {

      //Get total hours spent for all contracts
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/contract_durations/'
      }).then((cdResponse) => {

        store.dispatch(
          types.NINETOFIVER_API_REQUEST,
          {
            path: '/my_performances/activity/',
            params: {
              timesheet__month: new Date().getMonth(),
              timesheet__year: new Date().getYear()
            }
          }
        ).then((apResponse) => {

          //Get users per project 
          store.dispatch(
            types.NINETOFIVER_API_REQUEST, {
              path: '/contract_users/'
            }
          ).then((cuResponse) => {
            var contracts = mcResponse.data.results;
            var durations = cdResponse.data.results;
            var performances = apResponse.data.results;
            var users = cuResponse.data.results

            for(var cont of contracts) {
              var totalHours = 0;
              var totalUsers = 0;

              for(var p of performances.filter(x => x.contract === cont.id))
                totalHours += parseFloat(p.duration);

              for(var u of users.filter(x => x.contract === cont.id))
                totalUsers++;

              cont.monthly_duration = totalHours;
              cont.total_duration = durations.find(x => x.id === cont.id).total_duration;
              cont.total_users = totalUsers;
            }

            this.contracts = contracts;
          });
        });
      });
    });
  },

  filters: {

    //Returns the label of the company, based on the ID
    getCompanyLabelFromID: function(val) {
      return constant.COMPANIES.find(x => x.id == val).label;
    },

    //Return array as joined strings
    getContractGroupAsString: function(arr) {
      //If we're provided a value
      if(arr.length) {
        var output = '';

        for(var i = 0; i < arr.length; i++) {
          if(i > 0) 
            output += ', ';
          output += constant.CONTRACT_GROUPS.find(x => x.id == arr[i]).label;
        }
        return output 
      }
      return 'None';
    },

  },

  computed: {

    //Gets the projects currently still active
    activeContracts: function() {
      return this.contracts.filter(x => x.active === true);
    },

    //Gets the projects currently unactive
    inactiveContracts: function() {
      return this.contracts.filter(x => x.active === false);
    },

  },

  methods: {  }
}
</script>

<style>
</style>