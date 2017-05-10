<template lang="pug">
div
  //- generate a month overview that displays who is on leave this month.
  //- it should be possible to filter based on project.
  table.table
    thead
      tr
        th Name
        th(v-for='d in daysInMonth') {{ d }}
    tbody
      tr(v-for='user in users')
        td {{ user.display_label }}
        td.day-cell(v-for='d in daysInMonth' v-bind:class='determineCellColor(user, d)') &nbsp;
</template>
<script>
  import Vue from 'vue'
  import store from '../store'
  import * as types from '../store/mutation-types'
  import moment from 'moment'

  export default {
  name: 'LeaveOverviewGrid',
  data() { 
    return {}
  },
  created: function() {
    if(!store.getters.grid_date)
      store.dispatch(types.NINETOFIVER_RELOAD_GRID_DATE)
    if(!store.getters.leaves)
      store.dispatch(types.NINETOFIVER_RELOAD_LEAVES)
  },
  computed: {
    grid_date: function() {
      if(store.getters.grid_date){
        return store.getters.grid_date
      }
    },

    grid_month: function() {
      if(this.grid_date)
        return parseInt(moment(this.grid_date).format('MM'))
    },

    grid_year: function() {
      if(this.grid_date)
        return parseInt(moment(this.grid_date).format('YYYY'))
    },

    daysInMonth: function() {
      if(this.grid_date)
        return parseInt(moment(this.grid_date).endOf('month').format('DD'));
    },

    users: function() {
      if(store.getters.users)
        return store.getters.users
    },

    leaves: function() {
      if(store.getters.leaves)
        return store.getters.leaves
    }
  },
  methods: { 
    determineCellColor: function(user, day) {
      if(this.users && this.leaves){
        var leave = this.leaves.find(l => l.user === user.id);
        if(leave){
          var start = moment(leave.leavedate_set[0].starts_at, 'YYYY-MM-DD');
          var end = moment(leave.leavedate_set[leave.leavedate_set.length - 1].ends_at, 'YYYY-MM-DD');
          var date = moment().year(this.grid_year).month(this.grid_month - 1).date(day).format('YYYY-MM-DD');
          if(moment(date).isBetween(start, end, null, [])){
            return 'cel-vacation';
          }
        }
      }
    }
  }
  }
</script>
<style lang='less'>
.cel-vacation {
  background-color: #FA5858;
}
</style>