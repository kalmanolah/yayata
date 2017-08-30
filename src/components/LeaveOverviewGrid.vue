<template lang="pug">
div
  .row.mb-3
    .col.mt-2
      toggle-button.m-1(
                @change='toggleSwitch("home")', 
                :value='showHome', 
                color='#ffbb33', 
                :sync='true', 
                :labels={
                  checked: 'Home',
                  unchecked: 'Home'
                }, 
                :width='65'
              )
      toggle-button.m-1(
                @change='toggleSwitch("sickness")', 
                :value='showSickness', 
                color='#ff4444', 
                :sync='true', 
                :labels={
                  checked: 'Sickness',
                  unchecked: 'Sickness'
                }, 
                :width='75'
              )
      toggle-button.m-1(
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
      toggle-button.m-1(
                @change='toggleSwitch("nonWorkingDay")', 
                :value='showNonWorkingDay', 
                color='#37474f', 
                :sync='true', 
                :labels={
                  checked: 'nonWorkingDay',
                  unchecked: 'nonWorkingDay'
                }, 
                :width='110'
              )
    .col
      .pull-right
        i.fa.fa-spinner.fa-pulse.fa-fw(v-show='loading')
        span.sr-only Loading...
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
      table.table.table-bordered.table-sm.table-responsive
        thead
          tr.text-center
            th.overviewgrid Name
            th.overviewgrid.text-center(v-for='d in daysInMonth') {{ d }}
            th.overviewgrid.nextMonth.text-center(v-if='(daysInMonth < 31)' v-for='d in (31 - daysInMonth)') {{ d }}
        tbody
          tr(v-if='acceptedLeaves' v-for='user in country_users')
            td
              .d-none.d-xl-inline
                router-link(:to='{ name: "colleagues", params: { userId: user.id }}') {{ user.display_label }} <small>({{ user.username }})</small>
              .d-xl-none.d-lg-inline
                router-link(:to='{ name: "colleagues", params: { userId: user.id }}') {{ user.username }}
            td.day-cell.pl-2.pr-2(v-for='d in 31' v-bind:class='determineCellColor(user, d)') &nbsp;

  .row.mb-3
    .list-group
      //- Header
      .list-group-item.d-flex.p-2
        .d-flex.dinksken
          .p-2 Name
        .d-flex.text-center
          .p-2.ml-1(v-for='d in daysInMonth') {{ d }}
        .d-flex.text-center
          .p-2.ml-1.nextMonth(v-if='(daysInMonth < 31)' v-for='d in (31 - daysInMonth)') {{ d }}

      .list-group-item.d-flex.p-2(v-if='acceptedLeaves' v-for='user in country_users')
        .d-flex.dinksken
          .p-2
            .d-none.d-xl-inline
              router-link(:to='{ name: "colleagues", params: { userId: user.id }}') {{ user.display_label }} <small>({{ user.username }})</small>
            .d-xl-none.d-lg-inline
              router-link(:to='{ name: "colleagues", params: { userId: user.id }}') {{ user.username }}
        .d-flex.text-center
          .p-2.ml-1(v-for='d in daysInMonth', :class="determineCellColorZWEIJAWOHL(user, d)") {{ d }}


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

      let date = moment({
        year: this.$route.params.year, 
        month: this.$route.params.month - 1 
      }).startOf('month');

      store.dispatch(types.NINETOFIVER_RELOAD_CALENDAR_SELECTED_MONTH, {
        params: {
          date: date.format('YYYY-MM-DDThh:mm:ss')
        }
      });

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
      loading: true,

      showHome: true,
      showSickness: true,
      showLeave: true,
      showNonWorkingDay: true 
    }
  },

 created: function() {

    store.dispatch(types.NINETOFIVER_RELOAD_LEAVE_OVERVIEW);

    this.buildPageInfo();

    store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACTS);

    store.dispatch(types.NINETOFIVER_RELOAD_USERS).then( () => {

      // Get every unique country
      store.getters.users.forEach( user => {
        if(user.userinfo && this.countries.indexOf(user.userinfo.country) === -1)
          this.countries.push(user.userinfo.country);
      });

      this.loading = false;
    });

    if(!store.getters.contract_users)
      store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_USERS)

  },

  computed: {

    leaveOverview: function() {
      if(store.getters.leave_overview)
        return store.getters.leave_overview;
    },
    selectedPeriod: function() {
      if(store.getters.calendar_selected_month)
        return moment(store.getters.calendar_selected_month, "YYYY-MM-DDTHH:mm:ss");
    },

    selectedYear: function() {
      return this.selectedPeriod.year();
    },

    selectedMonth: function() {
      return this.selectedPeriod.month() + 1;
    },

    whereabouts: function() {
      if(store.getters.whereabouts)
        return store.getters.whereabouts
    },

    contracts: function() {
      if(store.getters.contracts)
        return store.getters.contracts
    },

    daysInMonth: function() {
      if(this.selectedPeriod)
        return parseInt(moment(this.selectedPeriod).endOf('month').format('DD'));
    },

    users: function() {
      if(store.getters.users && !this.loading) {
        return store.getters.users
      }
    },

    acceptedLeaves: function() {
      if(store.getters.leaves)
        return store.getters.leaves.filter(lv => {
          return lv.status === 'APPROVED';
        });
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

        else if (this.users && this.all_contract_users) {

          let contract_users = store.getters.contract_users.filter((cu) => cu.contract === this.cu_filter);
          return this.users.filter( user => {
            return contract_users.find(cu => cu.user === user.id)
          });

        }
      }
    },

    // Returns the users of a specific country if specified.
    country_users: function() {
      if(this.contract_users && this.country_filter === 'Country'){
        return this.contract_users;
      } else if(this.contract_users && this.acceptedLeaves) {
        return this.contract_users.filter( (cu) => {
          if(cu.userinfo)
            return cu.userinfo.country === this.country_filter;
        });
      } 
    }
  },

  methods: {

    // Requests all data
    buildPageInfo: function() {
      this.reloadLeaves();
    },

    // Toggles the visibility of cells
    toggleSwitch: function(switchToggle) {
      if(switchToggle === "home")
        this.showHome = !this.showHome;
      else if(switchToggle === "sickness")
        this.showSickness = !this.showSickness;
      else if(switchToggle === "leave")
        this.showLeave = !this.showLeave;
      else if(switchToggle === "nonWorkingDay")
        this.showNonWorkingDay = !this.showNonWorkingDay;
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
    determineCellColorZWEIJAWOHL: function(user, day) {

      console.log( this.leaveOverview );
      console.log( day ); 

      let userSickness = this.leaveOverview['sickness'][user.id];
      if(this.showSickness && userSickness && userSickness.find(d => d == day))
        return 'cell-sickness';

      let userLeaves = this.leaveOverview['leave'][user.id];
      if(this.showLeave && userLeaves && userLeaves.find(d => d == day))
        return 'cell-leave';

      let userHomeWork = this.leaveOverview['homeWork'][user.id];
      if(this.showHome && userHomeWork && userHomeWork.find(d => d == day))
        return 'cell-home';
      
      let userHolidays = this.leaveOverview['holiday'][user.id];
      if(this.showHoliday && userHolidays && userHolidays.find(d => d == day))
        return 'cell-holiday';

      let userNonWorkingday = this.leaveOverview['nonWorkingday'][user.id];
      if(this.showNonWorkingDay && userNonWorkingday && userNonWorkingday.find(d => d == day))
        return 'cell-nonWorkingDay';

      return 'nextMonth';
    },

    //Determines the colour of the cell depending on the type of day and its leave_type
    determineCellColor: function(user, day) {
      let cellStyle = '';

      if(this.acceptedLeaves) {

        // Check if we need to find our leaveobjects
        if(this.showLeave || this.showSickness) {
          let date = moment(this.selectedPeriod).date(day);

          let userLeaves = this.acceptedLeaves.filter(al => al.user === user.id);

          if(this.showLeave && userLeaves) {
            let leaves = userLeaves.filter(l => l.leave_type !== store.getters.main_leave_types['sick']);

            leaves && leaves.find(al => {
              let start = moment(al.leavedate_set[0].starts_at, 'YYYY-MM-DD').startOf('day');
              let end = moment(al.leavedate_set[al.leavedate_set.length - 1].ends_at, 'YYYY-MM-DD').endOf('day');

              if(date.isBetween(start, end, 'day', []))
                cellStyle = 'cell-leave';
            });

            if(cellStyle != '')
              return cellStyle;
          }

          if(this.showSickness && userLeaves) {
            let sickLeaves = userLeaves.filter(l => l.leave_type === store.getters.main_leave_types['sick']);

            sickLeaves && sickLeaves.find(al => {
              let start = moment(al.leavedate_set[0].starts_at, 'YYYY-MM-DD').startOf('day');
              let end = moment(al.leavedate_set[al.leavedate_set.length - 1].ends_at, 'YYYY-MM-DD').endOf('day');

              if(date.isBetween(start, end, 'day', []))
                cellStyle = 'cell-sickness';
            });

            if(cellStyle != '')
              return cellStyle;
          }
        }
      }

      // If showHome is true, find if the user works from home based on his whereabouts
      if(this.showHome) {

        let timesheet = store.getters.timesheets.find((ts) => {
          return (ts.month === this.selectedMonth && ts.user === user.id);
        });

        if(timesheet) {
          let whereabout = this.whereabouts.find((w) => {
            return w.day === day && w.timesheet === timesheet.id
          });

          if(whereabout && whereabout.location === 'Home')
            cellStyle = 'cell-home';
        }

        if(cellStyle != '')
          return cellStyle;
      }

      // If showNonWorkingDay is true, look for days without hours in the workschedule
      if(this.showNonWorkingDay) {

        if(store.getters.employment_contracts && user) {
          let date = moment(this.selectedPeriod).date(day);

          // Check if the user has an employment contract this month
          let emplContr = store.getters.employment_contracts.find((ec) => {
            let start = moment(ec.started_at);
            let end = moment(ec.ended_at);

            return ec.user === user.id && date.isBetween(start, end, 'day', []);
          });

          let workSchedule = emplContr ? store.getters.work_schedules.find((ws) => ws.id === emplContr.work_schedule) : null;

          // If day has 0 hours to perform on WS or there is no workschedule (~ emplcontract)
          if(workSchedule) {
            let dow = moment(this.selectedPeriod).date(day).format('dddd').toLowerCase();

            cellStyle = workSchedule[dow] === '0.00' ? 'cell-nonWorkingDay' : '';
          } else {
            cellStyle = 'cell-nonWorkingDay';
          }
        }
      }

      return cellStyle;
    },

    reloadLeaves: function() {
      this.loading = true;

      // Take griddate add and subtract 1 month, reload filtered leaves
      let lowerBoundary = moment(this.selectedPeriod).subtract(1, 'months').format('YYYY-MM-DDTHH:mm:ss');
      let upperBoundary = moment(this.selectedPeriod).add(1, 'months').format('YYYY-MM-DDTHH:mm:ss');

      let range = lowerBoundary + ',' + upperBoundary;
      let options = {
        params: {
          leavedate__range: range,
          status: 'APPROVED'
        }
      };

      this.reloadWhereabouts(lowerBoundary, upperBoundary);
      store.dispatch(types.NINETOFIVER_RELOAD_LEAVES, options).then( () => this.loading = false);
    },

    reloadWhereabouts: function(lowerBoundary, upperBoundary) {
      let lowerMonth = moment(lowerBoundary).format('MM');
      let upperMonth = moment(upperBoundary).format('MM');

      store.dispatch(types.NINETOFIVER_RELOAD_WHEREABOUTS, {
        params: {
          timesheet__month__gte: lowerMonth,
          timesheet__month__lte: upperMonth,
          timesheet__year: this.selectedYear
        }
      });     
    }
  },

}
</script>
<style lang='less'>
@danger: #ff4444;
@warning: #ffbb33;
@info: #33b5e5;
@success: #00c851;
@neutral: #e0e0e0;

.dinksken {
  min-width: 350px;
}

th.overviewgrid {
  max-width: 15px;
}
.cell-home {
  background-color: @warning;
}

.cell-sickness{
  background-color: @danger;
}

.cell-leave{
  background-color: @success;
}

.cell-paid-leave {
  background-color: @success;
}

.cell-klein-verlet {
  background-color: @success;
}

.cell-sick-leave {
  background-color: @warning;
}
.cell-nonWorkingDay{
  background-color: @neutral;
}

.vue-js-switch {
  margin-left: 3px;
}

.nextMonth {
  color: #ededed;
}
</style>