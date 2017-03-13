<template lang="pug">
div(class='calendar')
  div(class='row')
    div(class='col-md-4 text-md-left')
      div(
        class='btn-group'
        role='group'
        aria-label='Calendar controls'
      )
        button(
          class='btn btn-secondary'
          type='button'
          v-on:click.prevent='selectPreviousWeek()'
        )
          i(class='fa fa-angle-double-left')
          |  &nbsp;Previous
    h1(class='col-md-4 text-md-center') {{ selectedYear }} Week {{ selectedWeek }} 
    div(class='col-md-4 text-md-right')
      div(
        class='btn-group'
        role='group'
        aria-label='Calendar controls'
      )
        button(
          class='btn btn-secondary'
          type='button'
          v-on:click.prevent='selectNextWeek()'
        )
          | Next&nbsp;
          i(class='fa fa-angle-double-right')

  //- Getting the months now shown and allowing routing back to where you came from
  div(class='row')
    span(class='col-md-6 text-md-center') 
      router-link(:to='{ name: "calendar_month", params: { year: selectedYear, month: periodStartMonth.month()+1 } }')
        div(class='col-md-3 text-md-left') {{ periodStartMonth | moment('MMMM')}}
      div(v-if='periodEndMonth.month() != periodStartMonth.month()')
        div(class='col-md-1') -
        router-link(:to='{ name: "calendar_month", params: { year: selectedYear, month: periodEndMonth.month()+1 } }')
          div(class='col-md-3 text-md-right') {{ periodEndMonth | moment('MMMM')}}

  hr(class='col-md-12')

  div(class='calendar-header')
    div.card-deck-wrapper
      div.card-deck
        div.card.calendar-day(v-for='weekDay in getDaysOfWeek()') 
          div.card-header
            | {{ weekDay | moment('dddd') }} 
            div {{ weekDay | moment('DD') }}
          div.card-block
            p.card-text
              | Hoe graaf is dees

</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'
import moment from 'moment'


export default {
  name: 'week',

  watch: {
    '$route' (to, from) {
      this.selectedWeek = to.params.week;
      this.selectedYear = to.params.year;
    }
  },

  methods: {

    setSelectedWeek: function (year, week) {
      console.log()
      this.$router.push({
        name: 'calendar_week',
        params: {
          year: year,
          week: week,
        },
      })
    },

    selectNextWeek: function () {
      var year = parseInt(this.selectedYear),
      week = parseInt(this.selectedWeek) + 1;

      if (week > moment().isoWeekYear(year).isoWeeksInYear()) {
        week = 1;
        year++;
      }

      this.setSelectedWeek(year, week)
    },

    selectPreviousWeek: function () {
      var year = parseInt(this.selectedYear),
      week = parseInt(this.selectedWeek) - 1;

      if (week == 0) {
        year--;
        week = moment().isoWeekYear(year).isoWeeksInYear();
      }

      this.setSelectedWeek(year, week)
    },

    //Make the days/week to be drawn
    getDaysOfWeek: function () {

      var week = this.selectedWeek,
        year = this.selectedYear,
        daysofweek = [],
        dayOfWeek = moment().isoWeekYear(year).isoWeek(week).startOf('isoWeek');

      for(var i = 0; i < 7; i++) {
        daysofweek[i] = dayOfWeek;
        dayOfWeek = moment(dayOfWeek).add(1, ('days'));
      }

      return daysofweek;
    },

  },

  data () {

    return {
      selectedYear: this.$route.params.year,
      selectedWeek: this.$route.params.week,
    }

  },

  computed: {

    periodStartMonth: function() {
      var year = this.selectedYear ? this.selectedYear : moment().year();
      var week = this.selectedWeek ? this.selectedWeek : moment().isoWeek();

      return moment().isoWeekYear(year).isoWeek(week).startOf('isoWeek');
    },

    periodEndMonth: function() {
      var year = this.selectedYear ? this.selectedYear : moment().year();
      var week = this.selectedWeek ? this.selectedWeek : moment().isoWeek();

      return moment().isoWeekYear(year).isoWeek(week).endOf('isoWeek');
    }

  },
}
</script>

<style lang="less" scoped>

.calendar-day-dummy {
  background: rgba(0, 0, 0, 0.1);
}

.calendar-day-weekend {
  .card {
    background: rgba(255, 0, 0, 0.2);
  }
}

.calendar-day-current {
  .card {
    background: rgba(0, 255, 0, 0.2);
  }
}

</style>
