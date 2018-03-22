<template lang="pug">
div
  div(class='row justify-content-between align-items-center')
    div(class='col-lg-auto text-center')
      div(class='btn-group' role='group')
        button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectPreviousMonth()')
          i(class='fa fa-angle-double-left')
          | &nbsp;Previous
        button(class='btn btn-sm btn-outline-dark disabled' type='button')
          | {{ date | moment('MMMM YYYY') }}
        button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectNextMonth()')
          | Next&nbsp;
          i(class='fa fa-angle-double-right')

    div(class='col-lg-auto text-center')
      hr(class='d-lg-none')

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
    div(class='col-lg-auto')
      hr(class='d-lg-none')

      div(class='btn-toolbar justify-content-center')
        div(class='input-group input-group-sm mr-2')
          b-form-input(:type='text' :placeholder='"Filter (eg. " + user.username + ")"' v-model="filterQuery")

        div(class='btn-group btn-group-sm' role='group')
          button(class='btn btn-outline-dark btn-sm dropdown-toggle' type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false")
            span(v-if='filterCountry') {{ filterCountry }}
            span(v-else) Country
          div(class='dropdown-menu dropdown-menu-right')
            a(class='dropdown-item' @click='filterByCountry()') All
            a(class='dropdown-item' v-for='country in countries' @click='filterByCountry(country)') {{ country }}

  hr

  div(class='table-responsive')
    table(class='table table-bordered table-sm' v-if='daysInMonth')
      thead
        tr
          th Name
          th(class='cell text-center' v-for='day in daysInMonth' v-bind:class='determineCellColor(day)') {{ day }}
          th(class='cell cell-na' v-if='(daysInMonth < 31)' v-for='day in (31 - daysInMonth)')
      tbody
        tr(v-for='user in users')
          td
            router-link(:to='{ name: "colleagues", params: { userId: user.id }}')
              | {{ user.display_label }}
              small(class='d-none d-xl-inline') &nbsp;({{ user.username }})
          td(v-for='day in daysInMonth' v-bind:class='determineCellColor(day, user)') &nbsp;
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
      filterQuery: null,
      filterCountry: null,
      showHoliday: true,
      showLeave: true,
      showNoWork: true,
      showHomeWork: true,
      showSickness: true,
      countries: [],
      date: null,
      today: moment(),
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
  },

  computed: {
    user: () => store.getters.user,

    users: function() {
      if (store.getters.users) {
        let users = store.getters.users.slice(0)

        if (this.filterCountry) {
          users = users.filter(user => {
            return user.userinfo && user.userinfo.country === this.filterCountry
          })
        }

        if (this.filterQuery) {
          let query = this.filterQuery.toLowerCase()
          users = users.filter(user => {
            return (user.username.toLowerCase().indexOf(query) > -1)
              || (user.display_label.toLowerCase().indexOf(query) > -1)
          })
        }

        return users
      }
    },

    daysInMonth: function() {
      if (this.date) {
        return parseInt(moment(this.date).endOf('month').format('DD'))
      }
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
      let start = moment(this.date).startOf('month')
      let end = moment(this.date).endOf('month')

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/services/range_availability/',
        params: {
          from: start.format('YYYY-MM-DD'),
          until: end.format('YYYY-MM-DD')
        }
      }).then(res => {
        this.availability = res.data
      })
    },

    filterByCountry: function(country) {
      this.filterCountry = country
    },

    determineCellColor: function(day, user) {
      let date = moment(this.date).date(day).format('YYYY-MM-DD')
      let cls = []

      if (date == this.today.format('YYYY-MM-DD')) {
        cls.push('cell-today')
      }

      if (user && this.availability) {
        if (this.showSickness && this.availability['sickness'][user.id].find(d => d == date)) {
          cls.push('cell-sickness')
        } else if (this.showLeave && this.availability['leave'][user.id].find(d => d == date)) {
          cls.push('cell-leave')
        } else if (this.showHomeWork && this.availability['home_work'][user.id].find(d => d == date)) {
          cls.push('cell-homework')
        } else if (this.showHoliday && this.availability['holiday'][user.id].find(d => d == date)) {
          cls.push('cell-holiday')
        } else if (this.showNoWork && this.availability['no_work'][user.id].find(d => d == date)) {
          cls.push('cell-nowork')
        }
      }

      return cls.join(' ')
    },
  },
}
</script>

<style lang='less' scoped>
@highlight: #333333;
@sickness: #ff4444;
@holiday: #59b8e6;
@leave: #00c851;
@nowork: #9e9d9d;
@homework: #ffbb33;

.cell {
  width: 2.5%;

  &:nth-child(-n+10) {
    &:before {
      content: '0';
      color: rgba(0, 0, 0, 0.1);
    }
  }
}
.cell-today {
  border-left: 2px solid @highlight;
  border-right: 2px solid @highlight;
}
thead tr .cell-today {
  border-top: 2px solid @highlight;
  border-bottom: 2px solid @highlight;
  background-color: @highlight;
  color: #f9f9f9;
}
thead th {
  border-bottom: none;
}
tbody tr:last-child .cell-today {
  border-bottom: 2px solid @highlight;
}
tbody tr:hover td {
  border-top: 2px solid @highlight;
  border-bottom: 2px solid @highlight;

  &:first-child {
    border-left: 2px solid @highlight;
  }

  &:last-child {
    border-right: 2px solid @highlight;
  }
}
.cell-homework {
  background-color: @homework;
}
.cell-holiday {
  background-color: @holiday;
}
.cell-sickness {
  background-color: @sickness;
}
.cell-leave {
  background-color: @leave;
}
.cell-nowork {
  background-color: @nowork;
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
