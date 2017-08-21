<template lang="pug">
div
  component(v-bind:is='currentView', :user-id='selectedUser', :selected-month-prop='selectedMonth')

</template>
<script>
import Vue from 'vue';
import moment from 'moment';
import store from '../store';
import * as types from '../store/mutation-types.js'

export default {
  name: 'admin',
  components: {
  },
  data() {
    return {
      selected: 1,
      month: moment().startOf('month').format('YYYY-MM-DD')
    }
  },


  computed: {
    selectedUser: function() {
      if(this.currentView === 'Calendar') {
        return this.selected;
      }
    },

  },

  methods: {
  }
}
</script>
<style>

</style>