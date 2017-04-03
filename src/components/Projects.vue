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
      div
        div.col-md-6 Total hours: {{ ac.total_duration }}
        div.col-md-6 Month hours
      small <strong>Groups: </strong>{{ ac.contract_groups | getContractGroupAsString }}

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

  created: function () {

    store.dispatch(
      types.NINETOFIVER_API_REQUEST, {
        path: '/my_contracts/',
    }).then((response) => {
      this.contracts = response.data.results;
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
        var output = '', i = 0;

        do {
          if(i > 0) 
            output += ', ';

          output += constant.CONTRACT_GROUPS.find(x => x.id == arr[i]).label;
          i++;
        } while(i < arr.length)

        return output 
      }

      return 'None';
    },

    //Get total hours spent per contract
    getTotalHoursPerProject: function(val) {

    }

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

  data () {
    return {

      contracts: [],

    }
  },

  methods: {  }
}
</script>

<style>
</style>