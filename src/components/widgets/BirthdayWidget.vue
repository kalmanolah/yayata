<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center d-flex justify-content-between')
    span(title='Go to previous day')
      i(class='fa fa-chevron-left chevron' @click='dayEarlier')
    | 🎂 Birthdays for {{ selectedDay | moment('ddd, MMMM Do') }}
    span(title='Go to next day')
      i(class='fa fa-chevron-right chevron' @click='dayLater')
  ul(class='list-group list-group-flush')
    router-link(
      v-for='(user, index) in birthdays'
      :to='{ name: "colleague", params: { userId: user.id }}'
      class='list-group-item'
    ) {{ user.display_label }}
  div(class='card-body text-center' v-if='!birthdays.length') Nothing to see here. 😞
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
      birthdays: [],
    }
  },

  created: function() {
    this.selectedDay = moment()
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
        path: '/users/',
        params: {
          userinfo__birth_date__month: this.selectedDay.format('MM'),
          userinfo__birth_date__day: this.selectedDay.format('DD')
        }
      }).then((res) => {
        this.birthdays = res.data.results
      });
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
