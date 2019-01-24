<template lang="pug">
div
  div(class='row justify-content-between align-items-center')
    div(class='col-lg-auto text-center')
      div(class='btn-group' role='group')
        button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectPreviousPeriod()')
          i(class='fa fa-angle-double-left')
          | &nbsp;Previous
        button(class='btn btn-sm btn-outline-dark disabled' type='button')
          | {{ days[0] | moment('YYYY-MM-DD') }} - {{ days[days.length - 1] | moment('YYYY-MM-DD') }}
        button(class='btn btn-sm btn-outline-dark' type='button' v-on:click.prevent='selectNextPeriod()')
          | Next&nbsp;
          i(class='fa fa-angle-double-right')

    div(class='col-lg-auto text-center')
      hr(class='d-lg-none')

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
        :width='80'
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
        @change='showWhereabout = !showWhereabout',
        :value='showWhereabout',
        color='#FBB829',
        :sync='true',
        :labels={
          checked: 'Whereabout',
          unchecked: 'Whereabout'
        },
        :width='90'
      )
      toggle-button(
        class='my-0'
        @change='showNoWork = !showNoWork',
        :value='showNoWork',
        color='#9e9d9d',
        :sync='true',
        :labels={
          checked: 'Not working',
          unchecked: 'Not working'
        },
        :width='90'
      )

    div(class='col-lg-auto')
      hr(class='d-lg-none')

      div(class='btn-toolbar justify-content-center')
        div(class='input-group input-group-sm mr-2')
          b-form-input(:type='"text"' :placeholder='"Filter (eg. " + user.username + ")"' v-model="filterQuery")

        div(class='btn-group btn-group-sm' role='group')
          b-dropdown(variant='outline-dark' size='sm' right :text='filterCountry ? filterCountry : "Country"')
            b-dropdown-item(@click='filterByCountry()') All
            b-dropdown-item(v-for='country in countries' @click='filterByCountry(country)') {{ country }}

  hr

  div(class='table-responsive')
    table(class='table table-bordered table-sm' v-if='days')
      thead
        tr
          th(class='text-center') User
          th(class='text-center' v-for='day in days') {{ day | moment('ddd, MMM Do') }}
      tbody
        tr(v-for='user in users')
          td(class='cell')
            div(class='row justify-content-center')
              ColleagueAvatarWidget(class='col-auto' :user='user' size='30')
          td(v-for='day in days' :class='determineCellColor(day, user)' class='cell')
            div(v-if='availability && availability[user.id] && availability[user.id][day]')
              div(v-if='showHoliday' v-for='holiday in availability[user.id][day].holidays')
                div(class='cell-holiday badge')
                  | 🌐 {{ holiday.name }}

              div(v-if='showLeave' v-for='leave_date in availability[user.id][day].leave')
                div(class='cell-leave badge')
                  | 🏖️ {{ leave_date.starts_at | moment('HH:mm') }} - {{ leave_date.ends_at | moment('HH:mm') }}

              div(v-if='showSickness' v-for='leave_date in availability[user.id][day].sickness')
                div(class='cell-sickness badge')
                  | 😷 {{ leave_date.starts_at | moment('HH:mm') }} - {{ leave_date.ends_at | moment('HH:mm') }}

              div(v-if='showWhereabout' v-for='whereabout in availability[user.id][day].whereabouts')
                div(class='cell-whereabout badge text-left')
                  | 📍 {{ whereabout.location.display_label }}
                  br
                  | &mdash;&nbsp;{{ whereabout.starts_at | moment('HH:mm') }} - {{ whereabout.ends_at | moment('HH:mm') }}
</template>

<script>
import Vue from 'vue';
import store from '../store';
import * as types from '../store/mutation-types';
import utils from '../utils';
import moment from 'moment';
import ColleagueAvatarWidget from './widgets/ColleagueAvatarWidget.vue';

export default {
  name: 'Availability',

  components: {
    ColleagueAvatarWidget,
  },

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
      showSickness: true,
      showWhereabout: true,
      countries: [],
      today: moment(),
      date: null,
      daysShown: 10,
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
              || (user.email.toLowerCase().indexOf(query) > -1)
          })
        }

        return users
      }
    },

    days: function() {
      if (this.date) {
        return [...Array(this.daysShown).keys()].map(i => {
          return moment(this.date).add(i, 'days').format('YYYY-MM-DD')
        })
      }
    }
  },

  methods: {
    selectNextPeriod: function() {
      let new_date = moment(this.date).add(this.daysShown, 'days')

      this.$router.push({
        name: 'availability_week',
        params: {
          month: new_date.format('MM'),
          year: new_date.format('YYYY'),
          date: new_date.format('DD')
        }
      })
    },

    selectPreviousPeriod: function() {
      let new_date = moment(this.date).subtract(this.daysShown, 'days')

      this.$router.push({
        name: 'availability_week',
        params: {
          month: new_date.format('MM'),
          year: new_date.format('YYYY'),
          date: new_date.format('DD')
        }
      })
    },

    setDate: function() {
      this.date = moment({
        year: this.$route.params.year,
        month: this.$route.params.month - 1,
        date: this.$route.params.date,
      })
    },

    reloadAvailability: function() {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/range_availability/',
        params: {
          from: this.days[0],
          until: this.days[this.days.length - 1]
        }
      }).then(res => {
        this.availability = res.data
      })
    },

    filterByCountry: function(country) {
      this.filterCountry = country
    },

    determineCellColor: function(date, user) {
      let cls = []

      if (date == this.today.format('YYYY-MM-DD')) {
        cls.push('cell-today')
      }

      if (this.availability && this.availability[user.id] && this.availability[user.id][date]) {
        if (this.showNoWork && !this.availability[user.id][date].work_hours) {
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
@sicknessPending: #f58585;
@leave: #00c851;
@leavePending: #48f490;
@holiday: #59b8e6;
@nowork: #9e9d9d;
@whereabout: #FBB829;

.cell {
  vertical-align: middle;
}
.cell-today {
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 215, 0, 0.25),
    rgba(0, 215, 0, 0.25) 10px,
    rgba(0, 215, 0, 0.1) 10px,
    rgba(0, 215, 0, 0.1) 20px
  );
}
.cell-whereabout {
  background-color: @whereabout;
}
.cell-holiday {
  background-color: @holiday;
}
.cell-sickness {
  background-color: @sickness;
}
.cell-sickness-pending {
  background-color: @sicknessPending;
}
.cell-leave {
  background-color: @leave;
}
.cell-leave-pending {
  background-color: @leavePending;
}
.cell-nowork {
  background-color: @nowork;
}
</style>
