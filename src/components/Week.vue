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
            | {{ weekDay | moment('dddd') }} 
            div {{ weekDay | moment('DD') }}
          div.card-block
            p.card-text
              | Hoe graaf is dees {{selectedMonth}}

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
    },  

  },

  mounted: function() {

    //To be executed when page is loaded
    console.log(this.$route);

  },

  methods: {


    setSelectedWeek: function (year, week) {
      this.$router.push({
        name: 'calendar_week',
        params: {
          year: year,
          week: week,
        },
      })

      console.log('year: ' + year);
      console.log('week: ' + week);

      this.selectedMonth = moment(year, 'YYYY').isoWeek(week);
    },

    selectNextWeek: function () {

      console.log('SELECT NEXT WEEK');

      var year = this.selectedYear,
          week = parseInt(this.selectedWeek) + 1;

      var dat = moment(year, 'YYYY');



      console.log(week);
      console.log(dat.isoWeeksInYear());
      if (week > dat.isoWeeksInYear()) {
        week = 1;
        year++;
      }

      this.setSelectedWeek(year, week)
    },

    selectPreviousWeek: function () {
      var year = this.selectedYear,
          week = this.selectedWeek - 1;

      if (week <= 0) {
        week = 52;
        year--;
      }

      this.setSelectedWeek(year, week)
    },

    getDaysOfWeek: function () {

      var week = this.selectedWeek,
        year = this.selectedYear,
        DayOfWeek = moment().week(week).year(year).startOf('isoweek'),
        daysofweek = [];

      for(var i = 0; i < 7; i++) {
        daysofweek[i] = DayOfWeek;
        DayOfWeek = moment(DayOfWeek).add(1, ('days'));
      }

      return daysofweek;
    },

  },

  data () {

    return {
      selectedYear: this.$route.params.year,
      selectedWeek: this.$route.params.week,
      selectedMonth: null
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
