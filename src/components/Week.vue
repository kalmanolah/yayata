<template lang="pug">
div(class='calendar')
  div(class='row')
    h1(class='col-md-6') Week {{ selectedWeek }} {{ selectedYear}}
    div(class='col-md-6 text-md-right')
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
        button(
          class='btn btn-secondary'
          type='button'
          v-on:click.prevent='selectNextWeek()'
        )
          | Next&nbsp;
          i(class='fa fa-angle-double-right')
  hr

  div(class='calendar-header')
    div.card-deck-wrapper
      div.card-deck
        div.card.calendar-day(v-for='weekDay in getDaysOfWeek()')
          div.card-header
            | {{ weekDay | moment('dd DD-MM-YYYY') }}
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
      this.selectedWeek = to.params.week
      this.selectedYear = to.params.year
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

      // this.selectedMonth = new Date(year, month - 1, 1)
    },
    selectNextWeek: function () {
      var year = this.selectedYear,
      week = this.selectedWeek;
      week++;

      if (week == 53) {
        week = 1
        year += 1
      }

      this.setSelectedWeek(year, week)
    },
    selectPreviousWeek: function () {
      var year = this.selectedYear,
      week = this.selectedWeek - 1

      if (week == 0) {
        week = 52
        year -= 1
      }

      this.setSelectedWeek(year, week)
    },
    getDaysOfWeek: function () {
      var week = this.selectedWeek,
      year = this.selectedYear,
      DayOfWeek = moment().week(week).year(year).startOf('isoweek'),
      daysofweek = [];

      var i = 0;
      for(i = 0; i < 7; i++){
        daysofweek[i] = DayOfWeek;
        DayOfWeek = moment(DayOfWeek).add(1, ('days'));
      }

      console.log(daysofweek)

      return daysofweek
    },
  },

  data () {
    return {
      selectedYear: 2017,
      selectedWeek: 1
    }
  },

  computed: {
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
