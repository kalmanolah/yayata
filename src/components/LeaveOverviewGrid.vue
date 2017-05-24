<template lang="pug">
div
  h1(class='col-md-12 text-md-center') {{ grid_month | fullMonthString }} {{ grid_year }}
    .pull-right
      i.fa.fa-spinner.fa-pulse.fa-fw(v-show='loading')
      span.sr-only Loading...
      div(
        class='btn-group'
        role='group'
        aria-label='Button group with nested dropdown'
      )
        .btn-group(role='group')
          button.btn.btn-secondary.dropdown-toggle#btnGroupDrop(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ cu_label }}
          .dropdown-menu(aria-labelledby='btnGroupDrop')
            a.dropdown-item(@click='cu_label = "Contract"; cu_filter="Contract"') All
            a.dropdown-item(v-for='contract in contracts' @click='showContractUsers(contract)') {{ contract.display_label }}
        .btn-group(role='group')
          button.btn.btn-secondary.dropdown-toggle#countryBtnGroup(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ country_label }}
          .dropdown-menu(aria-labelledby='countryBtnGroup')
            a.dropdown-item(@click='country_label = "Country"; country_filter="Country"') All
            a.dropdown-item(v-for='country in countries' @click='showCountryUsers(country)') {{ country }}
        button(
                class='btn btn-secondary'
                type='button'
                v-on:click.prevent='selectPreviousMonth()'
              )
                i(class='fa fa-angle-double-left')
                |  &nbsp;Previous
        button(
          class='btn btn-secondary'
          type='button'
          v-on:click.prevent='selectNextMonth()'
        )
          | Next&nbsp;
          i(class='fa fa-angle-double-right')
  .tag.tag-success sickness
  .tag.tag-primary 4/5
  .tag.tag-danger Holliday
  .tag.cell-weekend Weekend
  table.table.table-bordered
    thead
      tr
        th Name
        th(v-for='d in daysInMonth' v-bind:class='determineWeekend(d)') {{ d }}
        th.nextMonth(v-if='(daysInMonth < 31)' v-for='d in (31 - daysInMonth)') {{ d }}
    tbody
      tr(v-if='country_users' v-for='user in country_users')
        td 
          router-link(:to='{ name: "colleagues", params: { userId: user.id }}') {{ user.display_label }}
        td.day-cell(v-for='d in 31' v-bind:class='[determineWeekend(d), determineCellColor(user, d)]') &nbsp;
</template>
<script>
  import Vue from 'vue'
  import store from '../store'
  import * as types from '../store/mutation-types'
  import moment from 'moment'

  export default {
  name: 'LeaveOverviewGrid',
  data() { 
    return {
      cu_filter: 'Contract',
      cu_label: 'Contract',
      country_label: 'Country',
      country_filter: 'Country',
      countries: [],
      loading: false
    }
  },
  created: function() {
    if(!store.getters.grid_date)
      store.dispatch(types.NINETOFIVER_RELOAD_GRID_DATE)

    if(!store.getters.leaves){
      var lowerBoundary = moment().subtract(1, 'months').format('YYYY-MM-DDTHH:mm:ss')
      var upperBoundary = moment().add(1, 'months').format('YYYY-MM-DDTHH:mm:ss')
      var range = lowerBoundary + ',' + upperBoundary;
      console.log(range)
      var options = {
        params: {
          leavedate__range: range
        }
      }
      store.dispatch(types.NINETOFIVER_RELOAD_LEAVES, options)
    }

    if(!store.getters.filtered_users){
      store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_USERS).then( () => {
        // Get every unique country
        store.getters.filtered_users.forEach( user => {
          if(this.countries.indexOf(user.country) === -1){
            this.countries.push(user.country);
          }
        });
      });
    }
    if(!store.getters.contract_users)
      store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_USERS)
},
  computed: {
    contracts: function() {
      if(store.getters.contracts)
        return store.getters.contracts
    },

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
      if(store.getters.filtered_users){
        this.contractUsers = [];
        store.getters.filtered_users.forEach(user => {
          this.contractUsers.push(user);
        });
        return store.getters.filtered_users
      }
    },

    leaves: function() {
      if(store.getters.leaves)
        return store.getters.leaves
    },

    all_contract_users: function() {
      if(store.getters.contract_users)
        return store.getters.contract_users
    },

    // Returns the users of a secific contract if specified. 
    contract_users: function() {
      if(this.users && this.cu_filter === 'Contract')
        return this.users
      else if (this.users && this.all_contract_users){
        var contract_users = store.getters.contract_users.filter((cu) => cu.contract === this.cu_filter);
        return this.users.filter( user => {
          return contract_users.find(cu => cu.user === user.id)
        });
      }

    },

    // Returns the users of a specific country if specified.
    country_users: function() {
      if(this.contract_users && this.country_filter === 'Country'){
        return this.contract_users;
      } else if(this.contract_users) {
        return this.contract_users.filter( (cu) => {
          return cu.country === this.country_filter;
        });
      } else {
        console.log('oifjkjfjdjkfdjdfjs');
        
      }
    }
  },
  methods: { 

    // Changes the country filter and dropdown label to the selected value.
    showCountryUsers: function(country) {
      this.country_filter = country;
      this.country_label = country;
    },

    // Changes the contract filter and dropdown label to the selected value.
    showContractUsers: function(contract) {
      this.cu_filter = contract.id;
      this.cu_label = contract.display_label;
    },

    // Determines if the given day is a weekend day and styles it accordingly.
    determineWeekend: function(day) {
      if(moment().month(this.grid_month - 1).date(day).isoWeekday() > 5)
        return 'cell-weekend';
    },

    // Determines the color of the cell depending on the leave type.
    determineCellColor: function(user, day) {
      if(this.country_users && this.leaves){
        var leave = this.leaves.find(l => l.user === user.id);
        if(leave){
          var start = moment(leave.leavedate_set[0].starts_at, 'YYYY-MM-DD');
          var end = moment(leave.leavedate_set[leave.leavedate_set.length - 1].ends_at, 'YYYY-MM-DD');
          var date = moment().year(this.grid_year).month(this.grid_month - 1).date(day).format('YYYY-MM-DD');
          
          if(moment(date).isBetween(start, end, null, [])){
            var temp = ['tag-primary', 'tag-success', 'tag-danger']
            return (temp[leave.leave_type]) ? temp[leave.leave_type] : 'tag-primary';
         }
        }
      }
    },
    
    // Reloads the grid date to one month later.
    selectNextMonth: function() {
      var options = { 
        params: {
          date: moment(this.grid_date).add(1, 'month')
        } 
      };
      store.dispatch(types.NINETOFIVER_RELOAD_GRID_DATE, options).then( () => {
        this.reloadLeaves();
      })
    },

    // Reloads the grid date to one month earlier.
    selectPreviousMonth: function() {
      var options = { 
        params: {
          date: moment(this.grid_date).subtract(1, 'month')
        } 
      };
      store.dispatch(types.NINETOFIVER_RELOAD_GRID_DATE, options).then( () => {
        this.reloadLeaves();
      })
    },

    reloadLeaves: function() {
      this.loading = true;
      // take griddate add and subtract 1 month, reload filtered leaves
      var lowerBoundary = moment(this.grid_date).subtract(1, 'months').format('YYYY-MM-DDTHH:mm:ss');
      var upperBoundary = moment(this.grid_date).add(1, 'months').format('YYYY-MM-DDTHH:mm:ss');
      var range = lowerBoundary + ',' + upperBoundary;
      var options = {
        params: {
          leavedate__range: range
        }
      }
      store.dispatch(types.NINETOFIVER_RELOAD_LEAVES, options).then( () => this.loading = false);
    }
  },

  filters: {
    // Returns the month as a string
    fullMonthString: function(val) {
      return moment().month(val - 1).format('MMMM')
    }
  }
  }
</script>
<style lang='less'>
.cell-weekend {
  background-color: rgba(150, 150, 150, 0.25);
}

.nextMonth {
  color: #ededed;
}
</style>