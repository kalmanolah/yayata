<template lang="pug">
div
  .row
    .col-md-8
      .alert.alert-warning.card-top-red
        | You have 1 due timesheet that is still open. Please fix that ASAP or Johan will haunt your dreams.
  .row
    .col-md-8
      .card
        h4.card-title.text-md-center
          | COLLEAGUES
        table.table
          tbody
            tr
              td Port of Antwerp (Amaris Consultancy)
              td.text-md-right 92 hours (11,5 days)
            tr
              td Fabricom (LPA Track &amp; trace)
              td.text-md-right 24 hours (3 days)
            tr
              td Google (Search Engine Optimisation)
              td.text-md-right 16 hours (2 days)
            tr
              td <strong>Total</strong>
              td.text-md-right <strong>132 hours (16,5 days)</strong>
            tr
              td <strong>Hours left to fill in</strong>
              td.text-md-right <strong>36 hours (4,5 days)</strong>
  .row
    .col-md-8
</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'

var data = {}

export default {
  name: 'colleagues',

  components: {},

  data () {
    return data;
  },

  created: () => {}
  computed: {
    users: function(){
      if(store.getters.users)
        return store.getters.users
    },

    groups: function() {
      if(store.getters.user_groups)
        return store.getters.user_groups
    },

    filteredUsers: function(){
      if(store.getters.users){
        var query = this.query;
        return this.sortedUsers.filter( user => {
          user.fullname = user.first_name + ' ' + user.last_name;
          return user.email.toLowerCase().indexOf(query.toLowerCase()) !== -1
                || user.fullname.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
      }
    }
  },
}
</script>

<style>
</style>