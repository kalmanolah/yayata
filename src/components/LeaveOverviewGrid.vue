<template lang="pug">
div
  .row.mb-3
    .col.mt-2
      toggle-button.m-1(
                @change='toggleSwitch("showHome")',
                :value='showFilters["showHome"]',
                color='#ffbb33',
                :sync='true',
                :labels={
                  checked: 'Home',
                  unchecked: 'Home'
                },
                :width='65'
              )
      toggle-button.m-1(
                @change='toggleSwitch("showSickness")',
                :value='showFilters["showSickness"]',
                color='#ff4444',
                :sync='true',
                :labels={
                  checked: 'Sickness',
                  unchecked: 'Sickness'
                },
                :width='75'
              )
      toggle-button.m-1(
                @change='toggleSwitch("showLeave")',
                :value='showFilters["showLeave"]',
                color='#00c851',
                :sync='true',
                :labels={
                  checked: 'Leave',
                  unchecked: 'Leave'
                },
                :width='65'
              )
      toggle-button.m-1(
                @change='toggleSwitch("showHoliday")',
                :value='showFilters["showHoliday"]',
                color='#59b8e6',
                :sync='true',
                :labels={
                  checked: 'Holiday',
                  unchecked: 'Holiday'
                },
                :width='70'
              )
      toggle-button.m-1(
                @change='toggleSwitch("showNonWorkingDay")',
                :value='showFilters["showNonWorkingDay"]',
                color='#37474f',
                :sync='true',
                :labels={
                  checked: 'Nonworking day',
                  unchecked: 'Nonworking day'
                },
                :width='110'
              )
    .col
      .pull-right
        .btn-group(role='group' aria-label='Button group with nested dropdown')

          .btn-group(role='group')
            button.btn.btn-outline-dark.dropdown-toggle#btnGroupDrop(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ cu_label }}
            .dropdown-menu(aria-labelledby='btnGroupDrop')
              a.dropdown-item(@click='cu_label = "Contract"; cu_filter="Contract"') All
              a.dropdown-item(v-for='contract in contracts' @click='showContractUsers(contract)') {{ contract.display_label }}

          .btn-group(role='group')
            button.btn.btn-outline-dark.dropdown-toggle#countryBtnGroup(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ country_label }}
            .dropdown-menu(aria-labelledby='countryBtnGroup')
              a.dropdown-item(@click='country_label = "Country"; country_filter="Country"') All
              a.dropdown-item(v-for='country in countries' @click='showCountryUsers(country)') {{ country }}

  .row.mb-3
    .col
      table.table.table-bordered.table-sm.table-responsive(v-if='daysInMonth')
        thead
          tr.text-center
            th.overviewgrid.p-2.name-cell Name
            th.overviewgrid.text-center(v-for='d in daysInMonth') {{ d }}
            th.overviewgrid.next-month.text-center(v-if='(daysInMonth < 31)' v-for='d in (31 - daysInMonth)') {{ d }}
        tbody
          tr(v-for='user in country_users')
            td.p-2.name-cell
              .d-none.d-xl-inline
                router-link(:to='{ name: "colleagues", params: { userId: user.id }}') {{ user.display_label }} <small>({{ user.username }})</small>
              .d-xl-none.d-lg-inline
                router-link(:to='{ name: "colleagues", params: { userId: user.id }}') {{ user.username }}
            td.day-cell.pl-2.pr-2(v-for='d in 31' v-bind:class='determineCellColor(user, d)') &nbsp;
</template>

<script>
import Vue from 'vue';
import store from '../store';
import * as types from '../store/mutation-types';
import moment from 'moment';

export default {
  name: 'LeaveOverviewGrid',

  watch: {
    '$route': function(to, from) {
      this.setDate();
      this.buildPageInfo();
    },
  },

  data() {
    return {
      cu_filter: 'Contract',
      cu_label: 'Contract',
      country_label: 'Country',
      country_filter: 'Country',
      countries: [],
      date: null,
      showFilters: {
        showHoliday: true,
        showHome: true,
        showSickness: true,
        showLeave: true,
        showNonWorkingDay: true
      }
    }
  },

 created: function() {
    this.setDate();
    this.buildPageInfo();

    new Promise((resolve, reject) => {
      if (!store.getters.users) {
        store.dispatch(types.NINETOFIVER_RELOAD_USERS).then(() => resolve())
      } else{
        resolve()
      }
    }).then(() => {
      store.getters.users.forEach(user => {
        if (user.userinfo && user.userinfo.country && (this.countries.indexOf(user.userinfo.country) === -1)) {
          this.countries.push(user.userinfo.country)
        }
      })

      this.countries.sort()
    })

    if(!store.getters.contract_users)
      store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_USERS)

  },

  computed: {

    leaveOverview: function() {
      if(store.getters.leave_overview)
        return store.getters.leave_overview;
    },

    contracts: function() {
      if(store.getters.contracts) {
        let contracts = store.getters.contracts;
        return contracts.slice(0).sort((a, b) => {
          return a.display_label < b.display_label ? -1 : a.display_label > b.display_label ? 1 : 0;
        });
      }
    },

    daysInMonth: function() {
      if(this.date)
        return parseInt(moment(this.date).endOf('month').format('DD'));
    },

    users: function() {
      if(store.getters.users) {
        return store.getters.users
      }
    },

    all_contract_users: function() {
      if(store.getters.contract_users)
        return store.getters.contract_users
    },

    // Returns the users of a secific contract if specified.
    contract_users: function() {
      if(this.users) {

        if(this.cu_filter === 'Contract')
          return this.users;

        else if (this.all_contract_users) {

          let contract_users = store.getters.contract_users.filter((cu) => cu.contract.id === this.cu_filter);
          return this.users.filter( user => {
            return contract_users.find(cu => cu.user.id === user.id)
          });

        }
      }
    },

    // Returns the users of a specific country if specified.
    country_users: function() {
      if(this.contract_users) {

        if(this.country_filter === 'Country')
          return this.contract_users;
        else {
          return this.contract_users.filter( (cu) => {
            if(cu.userinfo)
              return cu.userinfo.country === this.country_filter;
          });
        }

      }
    }
  },

  methods: {
    setDate: function() {
      this.date = moment({
        year: this.$route.params.year,
        month: this.$route.params.month - 1
      }).startOf('month');
    },
    // Requests all data
    buildPageInfo: function() {
      store.dispatch(types.NINETOFIVER_RELOAD_LEAVE_OVERVIEW, {
        year: this.date ? this.date.format('YYYY') : null,
        month: this.date ? this.date.format('MM') : null,
      });
    },

    // Toggles the visibility of cells
    toggleSwitch: function(switchToggle) {
      this.showFilters[switchToggle] = !this.showFilters[switchToggle];
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

    //Determines the colour of the cell depending on the type of day and its leave_type
    determineCellColor: function(user, day) {
      if(this.leaveOverview) {

        if(this.showFilters['showSickness']) {
          let userSickness = this.leaveOverview['sickness'][user.id];
          if(userSickness && userSickness.find(d => d == day))
            return 'cell-sickness';
        }

        if(this.showFilters['showLeave']) {
          let userLeaves = this.leaveOverview['leave'][user.id];
          if(userLeaves && userLeaves.find(d => d == day))
            return 'cell-leave';
        }

        if(this.showFilters['showHome']) {
          let userHomeWork = this.leaveOverview['home_work'][user.id];
          if(userHomeWork && userHomeWork.find(d => d == day))
            return 'cell-home';
        }

        if(this.showFilters['showHoliday']) {
          let userHolidays = this.leaveOverview['holiday'][user.id];
          if(userHolidays && userHolidays.find(d => d == day))
            return 'cell-holiday';
        }

        if(this.showFilters['showNonWorkingDay']) {
          let userNonWorkingday = this.leaveOverview['no_work'][user.id];
          if(userNonWorkingday && userNonWorkingday.find(d => d == day))
            return 'cell-nonWorkingDay';
        }

        return 'next-month';
      }
    },

  },

}
</script>
<style lang='less' scoped>
@danger: #ff4444;
@warning: #ffbb33;
@info: #33b5e5;
@success: #00c851;
@neutral: #e0e0e0;
@party: #59b8e6;

tr {
width: 100%;
display: inline-table;
table-layout: fixed;
}

table{
  height: 75vh;
  display: -moz-groupbox;    // Firefox Bad Effect
}
tbody{
  overflow-y: scroll;
  height: 73vh;
  position: absolute;
}

.cell-name {
  min-width: 350px;
}

th.overviewgrid {
  max-width: 15px;
}
.cell-home {
  background-color: @warning;
}
.cell-holiday {
  background-color: @party;
}
.cell-sickness{
  background-color: @danger;
}
.cell-leave{
  background-color: @success;
}
.cell-nonWorkingDay{
  background-color: @neutral;
}
.vue-js-switch {
  margin-left: 3px;
}

.next-month {
  color: #ededed;
}
.name-cell {
  width: 18%;
}
</style>
