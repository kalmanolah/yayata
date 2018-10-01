<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center d-flex justify-content-between')
    span(title='Go to previous day')
      i(class='fa fa-chevron-left chevron' @click='dayEarlier')
    | 🎂 Birthdays for {{ selectedDay | moment('ddd, MMMM Do') }}
    span(title='Go to next day')
      i(class='fa fa-chevron-right chevron' @click='dayLater')
  ul(class='list-group list-group-flush' v-if='birthdayUsers && birthdayUsers.length')
    router-link(
      v-for='(user, index) in birthdayUsers'
      :to='{ name: "colleague", params: { userId: user.id }}'
      class='list-group-item'
    ) {{ user.display_label }}
  div(class='card-body text-center' v-else) Nothing to see here. 😞
</template>

<script>
import moment from 'moment';
import * as types from '../../store/mutation-types';
import store from '../../store';

export default {
  name: 'BirthdayWidget',

  data () {
    return {
      selectedDay: null,
    }
  },

  created: function() {
    this.selectedDay = moment()

    new Promise((resolve, reject) => {
      if (!store.getters.users) {
        store.dispatch(types.NINETOFIVER_RELOAD_USERS).then(() => resolve())
      } else{
        resolve()
      }
    })
  },

  computed: {
    birthdayUsers: function() {
      if (store.getters.users) {
        return store.getters.users.filter(user => {
          return user.userinfo && user.userinfo.birth_date && (user.userinfo.birth_date.substr(5) === this.selectedDay.format('MM-DD'))
        })
      }
    }
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
