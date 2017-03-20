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
    span.col-md-offset-3.col-md-6.text-md-center
      router-link(:to='{ name: "calendar_month", params: { year: selectedYear, month: periodStartMonth.month()+1 } }')
        h3(class='col-md-3 text-md-left') {{ periodStartMonth | moment('MMMM')}}
      div(v-if='periodEndMonth.month() != periodStartMonth.month()')
        h3(class='col-md-1') -
        router-link(:to='{ name: "calendar_month", params: { year: selectedYear, month: periodEndMonth.month()+1 } }')
          h3(class='col-md-3 text-md-right') {{ periodEndMonth | moment('MMMM')}}

  hr
  
  div.calendar-header
    div.card-group
      div.card(v-for='weekDay in daysOfWeek')
          div.card-header.text-md-center.card-info
            | {{ weekDay | moment('dddd') }} 
            div.text-md-center {{ weekDay | moment('DD/MM') }}

          div.card-block(v-for='p in getDaysPerformances(weekDay.date())')
            span.card-title {{ findContractLabel(p.contract) }}
            .card-text {{ p.duration }}

          b-popover(title='Create a new entry' placement='bottom' triggers='click')
            b-btn.btn-success.col-md-12 +
            .text-xs-center.col-md-12(slot='content')
              strong.fa.fa-calendar-check-o {{ weekDay | moment('DD/MM/YYYY') }} 
              PerformanceForm(:test='weekDay')

          div.card-footer.text-md-center
            small.text-muted
              | 0/8 hours

//-
  div(class='calendar-header')
    div.card-deck-wrapper
      div.card-deck
        div.card.calendar-day(v-for='weekDay in daysOfWeek') 
          div.card-header.text-md-center
            | {{ weekDay | moment('dddd') }} 
            div.text-md-center {{ weekDay | moment('DD/MM') }}
          div.card-block(v-for='p in getDaysPerformances(weekDay.date())')
            p.card-text {{ p.id }}
          div.card-footer.text-muted.text-md-center
            | 0/8 hours

</template>

<script>
import { mapState } from 'vuex';
import * as types from '../store/mutation-types';
import * as constant from '../store/constants';
import store from '../store';
import moment from 'moment';
import PerformanceForm from './forms/PerformanceForm.vue';

export default {
  name: 'week',

  components: {
    PerformanceForm: PerformanceForm,
  },

  watch: {
    '$route' (to, from) {
      this.selectedWeek = to.params.week;
      this.selectedYear = to.params.year;
    }
  },

  methods: {

    //Find the label that belongs to the company id
    findCompanyName: function(id) {
      return constant.COMPANIES.find(x => x.id == id);
    },

    //Find the contract that belongs to the contract id
    findContractLabel: function(id) {
      var cont = constant.CONTRACTS.find(x => x.id == id);
      return cont.label + ': ' + cont.customer;
    },

    //Go to specified week, get params from URI
    setSelectedWeek: function (year, week) {
      this.$router.push({
        name: 'calendar_week',
        params: {
          year: year,
          week: week,
        },
      })
    },

    //Push params for next week into route
    selectNextWeek: function () {
      var year = parseInt(this.selectedYear),
      week = parseInt(this.selectedWeek) + 1;

      if (week > moment().isoWeekYear(year).isoWeeksInYear()) {
        week = 1;
        year++;
      }

      this.setSelectedWeek(year, week)
    },

    //Push params for last week into route
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
      var arr = daysofweek.map(o => { return o.date()  });
      this.makePerformances(arr);
      return daysofweek;
    },

    //Calls the performance stat and pushes into arr
    makePerformances: function(arr) {
      var start, end, month;
      this.performances = [];

      //If the index of the lowest value in the array is not the first,
      //the days are transitioning from one month to the other
      if(arr.indexOf(Math.min.apply(Math, arr)) != 0) {

        var maxIndex = arr.indexOf(Math.max.apply(Math, arr));    //Get index of highest in array (automatically final day of month that)

        start = arr[0],
        end = arr[ maxIndex ],   
        month = parseInt(this.periodStartMonth.format('MM'));     //Months are zero-indexed

        this.callPerformance(month, start, end);

        //Reset the vars for use further below
        start = arr[ maxIndex + 1 ],
        end = arr[arr.length-1],
        month = parseInt(this.periodEndMonth.format('MM'));

        this.callPerformance(month, start, end);
      
      } else {
        start = arr[0],
        end = arr[arr.length-1],
        month = parseInt(this.periodStartMonth.format('MM'));

        this.callPerformance(month, start, end);
      }
    },

    //Make the my_performances call & push into arr
    callPerformance: function(month, start, end) {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_performances/',
        params: {
          year: this.selectedYear,
          timesheet__month: month,
          day__gte: start,
          day__lte: end,
        },
      }).then((response) => {
        this.performances = this.performances.concat( response.data.results );
      });
    },

    //Get the performances linked to a day
    getDaysPerformances: function(day) {
      var result = [];

      for(var i = 0; i < this.performances.length; i++)
        if(this.performances[i].day == day)
          result.push(this.performances[i]);

      return result;
    }
  },

  data () {

    return {
      selectedYear: this.$route.params.year,
      selectedWeek: this.$route.params.week,
      performances: [],

      
    }

  },

  filters: {

    //Gets th
    formatContractName: function(val) {
      return;
    },

  },

  computed: {

    //Get the month corresponding with the start of the week
    periodStartMonth: function() {
      var year = this.selectedYear ? this.selectedYear : moment().year();
      var week = this.selectedWeek ? this.selectedWeek : moment().isoWeek();

      return moment().isoWeekYear(year).isoWeek(week).startOf('isoWeek');
    },

    //Get the month corresponding with the end of the week
    periodEndMonth: function() {
      var year = this.selectedYear ? this.selectedYear : moment().year();
      var week = this.selectedWeek ? this.selectedWeek : moment().isoWeek();

      return moment().isoWeekYear(year).isoWeek(week).endOf('isoWeek');
    },

    daysOfWeek: function() {
      return this.getDaysOfWeek();
    },

  },

  created: function() {
  }
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
