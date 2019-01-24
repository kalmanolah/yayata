<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center d-flex justify-content-between')
    span(title='Go to previous day')
      i(class='fa fa-chevron-left chevron' @click='dayEarlier')
    | 😷🌴 Absences for {{ selectedDay | moment('ddd, MMMM Do') }}
    span(title='Go to next day')
      i(class='fa fa-chevron-right chevron' @click='dayLater')

  div(class='row justify-content-center m-0 p-1' v-if='absentUsers.length')
    ColleagueAvatarWidget(
      v-for='(user, index) in absentUsers'
      v-bind:key='user.id'
      :user='user'
      size='64'
      class='col-auto p-1'
    )

  table(class='table my-0' v-if='holidays.length')
    tbody
      tr(v-for='holiday in holidays')
        td 🌐 {{ holiday.display_label }}
        td(class='text-right') {{ holiday.country }}

  div(class='card-body text-center' v-if='!holidays.length && !absentUsers.length') Everyone's present! 🙂
</template>

<script>
import moment from 'moment';
import * as types from '../../store/mutation-types';
import store from '../../store';
import ColleagueAvatarWidget from './ColleagueAvatarWidget.vue';

export default {
  name: 'AbsenceWidget',

  components: {
    ColleagueAvatarWidget
  },

  data () {
    return {
      selectedDay: null,
      absentUsers: [],
      holidays: []
    }
  },

  created: function() {
    new Promise((resolve, reject) => {
      if (!store.getters.users) {
        store.dispatch(types.NINETOFIVER_RELOAD_USERS).then(() => resolve())
      } else{
        resolve()
      }
    }).then(() => {
      this.selectedDay = moment()
    })
  },

  methods: {
    dayEarlier: function() {
      let orig = this.selectedDay
      orig.subtract(1, 'days')
      this.selectedDay = null
      this.selectedDay = orig
    },

    dayLater: function() {
      let orig = this.selectedDay
      orig.add(1, 'days')
      this.selectedDay = null
      this.selectedDay = orig
    },
  },

  watch: {
    selectedDay: function() {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/range_availability/',
        params: {
          from: this.selectedDay.format('YYYY-MM-DD'),
          until: this.selectedDay.format('YYYY-MM-DD')
        }
      }).then((res) => {
        this.absentUsers = store.getters.users.filter(user => {
          return (res.data[user.id][this.selectedDay.format('YYYY-MM-DD')]['sickness'].length > 0) || (res.data[user.id][this.selectedDay.format('YYYY-MM-DD')]['leave'].length > 0)
        })
      });

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/holidays/',
        params: {
          date: this.selectedDay.format('YYYY-MM-DD')
        }
      }).then((res) => {
        this.holidays = res.data.results
      })
    }
  }
}
</script>

<style lang="less" scoped>
.chevron {
  color: #0aa6c9;

  &:hover {
    cursor: pointer;
  }
}
</style>
