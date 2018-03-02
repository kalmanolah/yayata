<template lang="pug">
div
  div(class='row justify-content-between align-items-center')
    div(class='col-auto')
      div(class='btn-group' role='group')
        button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectPreviousMonth()')
          i(class='fa fa-angle-double-left')
          | &nbsp;Previous
        button(class='btn btn-sm btn-outline-dark' type='button')
          | {{ date | moment('MMMM YYYY') }}
        button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectNextMonth()')
          | Next&nbsp;
          i(class='fa fa-angle-double-right')

    div(class='col-auto')
      toggle-button(
        class='my-0'
        @change='showHomeWork = !showHomeWork',
        :value='showHomeWork',
        color='#ffbb33',
        :sync='true',
        :labels={
          checked: 'Home',
          unchecked: 'Home'
        },
        :width='65'
      )
      toggle-button(
        class='my-0'
        @change='showSickness = !showSickness',
        :value='showSickness',
        color='#ff4444',
        :sync='true',
        :labels={
          checked: 'Sickness',
          unchecked: 'Sickness'
        },
        :width='75'
      )
      toggle-button(
        class='my-0'
        @change='showLeave = !showLeave',
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
        class='my-0'
        @change='showHoliday = !showHoliday',
        :value='showHoliday',
        color='#59b8e6',
        :sync='true',
        :labels={
          checked: 'Holiday',
          unchecked: 'Holiday'
        },
        :width='70'
      )
      toggle-button(
        class='my-0'
        @change='showNoWork = !showNoWork',
        :value='showNoWork',
        color='#9e9d9d',
        :sync='true',
        :labels={
          checked: 'Non working day',
          unchecked: 'Non working day'
        },
        :width='115'
      )
    div(class='col-auto')
      div(class='btn-group' role='group')
        div(class='btn-group' role='group')
          button(class='btn btn-outline-dark btn-sm dropdown-toggle' type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false")
            span(v-if='filterContract') {{ filterContract.display_label }}
            span(v-else) Select a contract
          div(class='dropdown-menu')
            a(class='dropdown-item' @click='filterByContract()') All
            a(v-for='contract in contracts' class='dropdown-item' @click='filterByContract(contract)') {{ contract.display_label }}

        div(class='btn-group' role='group')
          button(class='btn btn-outline-dark btn-sm dropdown-toggle' type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false")
            span(v-if='filterCountry') {{ filterCountry }}
            span(v-else) Select a country
          div(class='dropdown-menu dropdown-menu-right')
            a(class='dropdown-item' @click='filterByCountry()') All
            a(class='dropdown-item' v-for='country in countries' @click='filterByCountry(country)') {{ country }}

  hr

  table(class='table table-bordered table-sm table-responsive' v-if='daysInMonth')
    thead
      tr
        th Name
        th(class='cell text-center' v-for='day in daysInMonth') {{ day }}
        th(class='cell cell-na' v-if='(daysInMonth < 31)' v-for='day in (31 - daysInMonth)')
    tbody
      tr(v-for='user in users')
        td
          router-link(:to='{ name: "colleagues", params: { userId: user.id }}')
            | {{ user.display_label }}
            small(class='d-none d-xl-inline') &nbsp;({{ user.username }})
        td(v-for='day in daysInMonth' v-bind:class='determineCellColor(user, day)') &nbsp;
        td(class='cell-na' v-if='(daysInMonth < 31)' v-for='day in (31 - daysInMonth)')
</template>

<script>
import Vue from 'vue';
import store from '../store';
import * as types from '../store/mutation-types';
import moment from 'moment';

export default {
  name: 'Availability',

  watch: {
    '$route': function(to, from) {
      this.setDate()
      this.reloadAvailability()
    },
  },

  data() {
    return {
      filterCountry: null,
      filterContract: null,
      showHoliday: true,
      showLeave: true,
      showNoWork: true,
      showHomeWork: true,
      showSickness: true,
      countries: [],
      date: null,
      availability: null
    }
  },

 created: function() {
    this.setDate()
    this.reloadAvailability()

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

    new Promise((resolve, reject) => {
      if (!store.getters.contract_users) {
        store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_USERS).then(() => resolve())
      } else{
        resolve()
      }
    })

    new Promise((resolve, reject) => {
      if (!store.getters.contracts) {
        store.dispatch(types.NINETOFIVER_RELOAD_CONTRACTS).then(() => resolve())
      } else{
        resolve()
      }
    })
  },

  computed: {
    users: function() {
      if (store.getters.users) {
        let users = store.getters.users.slice(0)

        if (this.filterCountry) {
          users = users.filter(user => {
            return user.userinfo && user.userinfo.country === this.filterCountry
          })
        }

        if (this.filterContract) {
          if (store.getters.contract_users) {
            let contract_users = store.getters.contract_users.filter(contract_user => {
              return contract_user.contract.id = this.filterContract.id
            })

            users = users.filter(user => {
              return contract_users.find(contract_user => {
                return contract_user.user.id == user.id
              })
            })
          }
        }

        return users
      }
    },

    contracts: function() {
      if (store.getters.contracts) {
        return store.getters.contracts
      }
    },

    daysInMonth: function() {
      if (this.date) {
        return parseInt(moment(this.date).endOf('month').format('DD'))
      }
    },

    leaveOverview: function() {
      if(store.getters.leave_overview)
        return store.getters.leave_overview;
    },
  },

  methods: {
    selectNextMonth: function() {
      let new_date = moment(this.date).add(1, 'month')

      this.$router.push({
        name: 'availability_month',
        params: {
          month: new_date.format('MM'),
          year: new_date.format('YYYY')
        }
      })
    },

    selectPreviousMonth: function() {
      let new_date = moment(this.date).subtract(1, 'month')

      this.$router.push({
        name: 'availability_month',
        params: {
          month: new_date.format('MM'),
          year: new_date.format('YYYY')
        }
      })
    },

    setDate: function() {
      this.date = moment({
        year: this.$route.params.year,
        month: this.$route.params.month - 1
      }).startOf('month');
    },

    reloadAvailability: function() {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/services/monthly_availability/',
        params: {
          month: this.date.format('MM'),
          year: this.date.format('YYYY')
        }
      }).then(res => {
        this.availability = res.data
      })
    },

    filterByCountry: function(country) {
      this.filterCountry = country
    },

    filterByContract: function(contract) {
      this.filterContract = contract
    },

    determineCellColor: function(user, day) {
      if(this.availability) {
        if (this.showSickness) {
          let userSickness = this.availability['sickness'][user.id];
          if(userSickness && userSickness.find(d => d == day))
            return 'cell-sickness';
        }

        if(this.showLeave) {
          let userLeaves = this.availability['leave'][user.id];
          if(userLeaves && userLeaves.find(d => d == day))
            return 'cell-leave';
        }

        if(this.showHomeWork) {
          let userHomeWork = this.availability['home_work'][user.id];
          if(userHomeWork && userHomeWork.find(d => d == day))
            return 'cell-homework';
        }

        if(this.showHoliday) {
          let userHolidays = this.availability['holiday'][user.id];
          if(userHolidays && userHolidays.find(d => d == day))
            return 'cell-holiday';
        }

        if(this.showNoWork) {
          let userNonWorkingday = this.availability['no_work'][user.id];
          if(userNonWorkingday && userNonWorkingday.find(d => d == day))
            return 'cell-nowork';
        }

        return '';
      }
    },

  },
}
</script>

<style lang='less' scoped>
@danger: #ff4444;
@warning: #ffbb33;
@info: #59b8e6;
@success: #00c851;
@neutral: #9e9d9d;
@invalid: #222222;

.cell {
  width: 2.5%
}
.cell-homework {
  background-color: @warning;
}
.cell-holiday {
  background-color: @info;
}
.cell-sickness {
  background-color: @danger;
}
.cell-leave {
  background-color: @success;
}
.cell-nowork {
  background-color: @neutral;
}
.cell-na {
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.2) 10px,
    rgba(0, 0, 0, 0.1) 10px,
    rgba(0, 0, 0, 0.1) 20px
  );
}
</style>
