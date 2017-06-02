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
                | Previous&nbsp;
        button(
          class='btn btn-secondary'
          type='button'
          v-on:click.prevent='selectNextMonth()'
        )
          | Next&nbsp;
          i(class='fa fa-angle-double-right')

  toggle-button(
            @change='toggleSwitch("home")', 
            :value='showHome', 
            color='#ff4444', 
            :sync='true', 
            :labels={
              checked: 'Home',
              unchecked: 'Home'
            }, 
            :width='65'
          )
  toggle-button(
            @change='toggleSwitch("sickness")', 
            :value='showSickness', 
            color='#ffbb33', 
            :sync='true', 
            :labels={
              checked: 'Sickness',
              unchecked: 'Sickness'
            }, 
            :width='75'
          )
  toggle-button(
            @change='toggleSwitch("45")',
            :value='show45', 
            color='#33b5e5', 
            :sync='true', 
            :labels={
              checked: '4/5',
              unchecked: '4/5'
            }, 
            :width='45'
          )
  toggle-button(
            @change='toggleSwitch("leave")', 
            :value='showLeave', 
            color='#00c851', 
            :sync='true', 
            :labels={
              checked: 'Leave',
              unchecked: 'Leave'
            }, 
            :width='65'
          )
  toggle-button(
            @change='toggleSwitch("weekend")', 
            :value='showWeekend', 
            color='#37474f', 
            :sync='true', 
            :labels={
              checked: 'Weekend',
              unchecked: 'Weekend'
            }, 
            :width='75'
          )
  table.table.table-bordered
    thead
      tr
        th Name
        th(v-for='d in daysInMonth' v-bind:class='determineWeekend(d)') {{ d }}
        th.nextMonth(v-if='(daysInMonth < 31)' v-for='d in (31 - daysInMonth)') {{ d }}
    tbody
      tr(v-if='country_users && leaves' v-for='user in country_users')
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
      loading: true,
      showHome: true,
      showSickness: true,
      show45: true,
      showLeave: true,
      showWeekend: true
    }
  },

  beforeRouteEnter (to, from, next) {
    store.dispatch(types.NINETOFIVER_RELOAD_USERS).then( () => next())
  },

  beforeCreate: function() {
    store.dispatch(types.NINETOFIVER_RELOAD_USERS)
  },

  created: function() {
    if(!store.getters.grid_date)
      store.dispatch(types.NINETOFIVER_RELOAD_GRID_DATE)

    this.reloadLeaves();
    store.dispatch(types.NINETOFIVER_RELOAD_USERS).then( () => {
      // Get every unique country
      store.getters.users.forEach( user => {
        if(this.countries.indexOf(user.country) === -1){
          this.countries.push(user.country);
        }
      });
      this.loading = false;
    });

    if(!store.getters.contract_users)
      store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_USERS)
  },
  computed: {
    whereabouts: function() {
      if(store.getters.whereabouts)
        return store.getters.whereabouts
    },

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
      if(store.getters.users && !this.loading){
        this.contractUsers = [];
        store.getters.users.forEach(user => {
          this.contractUsers.push(user);
        });
        return store.getters.users
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
      } else if(this.contract_users && this.leaves) {
        return this.contract_users.filter( (cu) => {
          return cu.country === this.country_filter;
        });
      } 
    }
  },
  methods: {
    // Toggles the visibility of cells
    toggleSwitch: function(switchToggle) {
      if(switchToggle === "home")
        this.showHome = !this.showHome;
      else if(switchToggle === "sickness")
        this.showSickness = !this.showSickness;
      else if(switchToggle === "45")
        this.show45 = !this.show45;
      else if(switchToggle === "leave")
        this.showLeave = !this.showLeave;
      else if(switchToggle === "weekend")
        this.showWeekend = !this.showWeekend;
    },

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
      if(this.showWeekend && moment().month(this.grid_month - 1).date(day).isoWeekday() > 5)
        return 'cell-weekend';
    },

    // Determines the color of the cell depending on the leave type.
    determineCellColor: function(user, day) {
      if(this.country_users && this.leaves && this.grid_month && this.grid_year){
        var leave = this.leaves.find(l => l.user === user.id);
        if(leave){
          var start = moment(leave.leavedate_set[0].starts_at, 'YYYY-MM-DD');
          var end = moment(leave.leavedate_set[leave.leavedate_set.length - 1].ends_at, 'YYYY-MM-DD');
          var date = moment().year(this.grid_year).month(this.grid_month - 1).date(day).format('YYYY-MM-DD');
          
          if(moment(date).isBetween(start, end, null, [])){
            var temp = [
              'cell-sickness',
              'cell-leave',
              'cell-45',
            ]
            // LeavetypeIds are not 0 indexed so we subtract 1 to get the right value
            var cellClass = (temp[leave.leave_type - 1]) ? temp[leave.leave_type - 1] : 'cell-leave';

            if(cellClass === 'cell-sickness' && this.showSickness)
              return cellClass;
            else if(cellClass === 'cell-leave' && this.showLeave)
              return cellClass;
            else if(cellClass === 'cell-45' && this.show45)
              return cellClass;
         }
        }

        var timesheet = store.getters.timesheets.find((ts) => ts.month === this.grid_month && ts.user === user.id)
        if(timesheet){
          var whereabout = this.whereabouts.find((w) => {
            return w.day === day && timesheet.id === w.timesheet
          });
          if(whereabout && this.showHome){
            if(whereabout.location === 'Home')
              return 'cell-home';
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
      this.reloadWhereabouts(lowerBoundary, upperBoundary)
      store.dispatch(types.NINETOFIVER_RELOAD_LEAVES, options).then( () => this.loading = false);
    },

    reloadWhereabouts: function(lowerBoundary, upperBoundary) {
      var lowerMonth = moment(lowerBoundary).format('MM');
      var upperMonth = moment(upperBoundary).format('MM');
      store.dispatch(types.NINETOFIVER_RELOAD_WHEREABOUTS, {
        params: {
          timesheet__month__gte: lowerMonth,
          timesheet__month__lte: upperMonth,
          timesheet__year: this.grid_year
        }
      });     
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
@danger: #ff4444;
@warining: #ffbb33;
@info: #33b5e5;
@success: #00c851;
@neutral: #e0e0e0;

.cell-home {
  background-color: @danger;
}

.cell-sickness{
  background-color: @warining;
}

.cell-45{
  background-color: @info;
}

.cell-leave{
  background-color: @success;
}


.cell-weekend {
  background-color: @neutral;
}

.vue-js-switch {
  margin-left: 3px;
}

.nextMonth {
  color: #ededed;
}
</style>