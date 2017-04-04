<template lang="pug">
div
  h3 My projects
  p.subtitle Overview of all my projects

  h4.text-md-center Active

    ul.list-group(v-for='ac in activeContracts')
      li.list-group-item
  hr

  h4.text-lg-center Inactive

    ul.list-group(v-for='ic in inactiveContracts')
      li.list-group-item
    

</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'
import * as constant from '../store/constants'
import store from '../store';


export default {
  name: 'colleagues',

  components: {},

  created: function () {

    this.types = constant.CONTRACT_TYPES;
    this.contracts = constant.CONTRACTS;
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
      types: [],

    }
  }
}
</script>

<style>
</style>