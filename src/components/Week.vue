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
  
  //- Buttons to toggle what to display
  div.btn-group.centered
    button.btn.btn-secondary(v-on:click='setWeekFormat("workweek")') Workweek
    button.btn.btn-secondary(v-on:click='setWeekFormat("weekend")') Weekend
    button.btn.btn-secondary(v-on:click='setWeekFormat("fullweek")') Full week

  //- Cards
  div.calendar-header
    div.card-group
      div.card(v-for='(weekDay, weekIndex) in daysOfWeek')

        div.card-header.text-md-center.card-info
          | {{ weekDay | moment('dddd') }} <br> {{ weekDay | moment('DD/MM') }}
          button.btn.btn-secondary.col-lg-12(v-on:click='setStandby(weekDay)') Standby 

        //- Content of performances
        div.card-block(v-for='perf in getDaysPerformances(weekDay.date())' v-bind:key='perf.id')
          ul.list-group
            li.list-group-item
              span.card-title 
                | {{ findContractName(perf.contract) }}
              div.card-text 
                | <small>{{ perf.duration }} hours </small> 

        //- Performance creation
        b-popover(title='Create a new entry' triggers='click' placement='top' v-bind:popover-style='popoverStyle')
          b-btn.btn-success.col-lg-12 + 
          .text-xs-center.col-lg-12(slot='content' )
            strong.fa.fa-calendar-check-o
              | {{ weekDay | moment('DD/MM/YYYY') }} 
            div
              PerformanceForm(v-bind:selected-date='weekDay' v-on:success='onSubmitSuccess') 
  
        div.card-footer.text-lg-center
          small.text-muted
            | {{ getDurationTotal(weekDay) }}<strong> / {{ getHoursTotal(weekDay) }} hours</strong>


</template>

<script>
import { mapState } from 'vuex';
import * as types from '../store/mutation-types';
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

  computed: {

    work_schedule: function() {
      if(store.getters.work_schedule)
        return store.getters.work_schedule;
    },

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
      return this.getDaysOfWeek(this.currentWeekFormat);
    },

  },

  created: function() { },

  methods: {

    //Get the amount of hours spent 
    getDurationTotal: function(day) {
      var total = 0;

      for(var val of this.performances.filter(x => x.day == day.format('D'))) 
        total += parseFloat(val.duration);

      return total;
    },

    //Get total hours/day from the work_schedule per user
    getHoursTotal: function(day) {
      for(var x in this.work_schedule) 
        if(x == day.format('dddd').toLowerCase())
          return this.work_schedule[x];
    },

    //Set standbyperformance for specific day
    setStandby: function(day) {
      var timesheet = store.state.ninetofiver.timesheets.find(x => 
        x.month == (day.month() + 1)
        &&
        x.year == day.year()
      );

      store.dispatch(
        types.NINETOFIVER_API_REQUEST,
        {
          path: '/my_performances/standby/',
          method: 'POST',
          body: {
            timesheet: timesheet.id,
            day: day.date()
          },
          emulateJSON: true,
        }
      ).then((response) => {
        if(response.status == 201)
          this.$emit('success', response);
      });
    },

    //Sets the popover placement, based on the weekindex and weekformat
    // setPopoverPlacement: function(val) {
    //   return (val >= Math.floor((this.currentWeekFormat.end - this.currentWeekFormat.start) / 2) + 1) ? 'left' : 'right';
    // },

    //Set Week format
    setWeekFormat: function(format) {
      this.currentWeekFormat = store.getters.week_formatting[format];
    },

    //When performance properly submitted
    onSubmitSuccess: function() {
      this.getDaysOfWeek(this.currentWeekFormat);
    },

    //Find the contract that belongs to the contract id
    findContractName: function(id) {
      if(store.getters.contracts) {
        var cont = store.getters.contracts.find(x => x.id == id);
        return cont.name + ': ' + cont.customerName;
      }
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
      var year = parseInt(this.selectedYear);
      var week = parseInt(this.selectedWeek) + 1;

      if (week > moment().isoWeekYear(year).isoWeeksInYear()) {
        week = 1;
        year++;
      }

      this.setSelectedWeek(year, week)
    },

    //Push params for last week into route
    selectPreviousWeek: function () {
      var year = parseInt(this.selectedYear);
      var week = parseInt(this.selectedWeek) - 1;

      if (week == 0) {
        year--;
        week = moment().isoWeekYear(year).isoWeeksInYear();
      }

      this.setSelectedWeek(year, week)
    },

    //Make the days/week to be drawn
    getDaysOfWeek: function() {
      var week = this.selectedWeek;
      var year = this.selectedYear;
      var index = 0;
      var period = this.currentWeekFormat;
      var daysofweek = [];
      var dayOfWeek = moment().isoWeekYear(year).isoWeek(week).startOf('isoWeek');

      for(var i = 1; i < 8; i++) {
        if(i >= period.start && i <= period.end) 
          daysofweek[index++] = dayOfWeek;
        
        dayOfWeek = moment(dayOfWeek).add(1, ('days'));
      }

      var arr = daysofweek.map(o => { return o.date()  });
      this.makePerformances(arr);

      return daysofweek;
    },

    //Calls performance with correct params
    makePerformances: function(arr) {
      var start, end, month;
      this.performances = [];

      //If the index of the lowest value in the array is not the first,
      //the days are transitioning from one month to the other
      if(arr.indexOf(Math.min.apply(Math, arr)) != 0) {
        
        //Get index of highest in array (automatically final day of month that)
        var maxIndex = arr.indexOf(Math.max.apply(Math, arr));

        start = arr[0],
        end = arr[maxIndex],   
        month = parseInt(this.periodStartMonth.format('MM'));     //Months are zero-indexed

        this.callPerformance(month, start, end);

        //Reset the vars for use further below
        start = arr[maxIndex + 1],
        end = arr[arr.length - 1],
        month = parseInt(this.periodEndMonth.format('MM'));

        this.callPerformance(month, start, end);
      
      } else {
        start = arr[0],
        end = arr[arr.length - 1],
        month = parseInt(this.periodStartMonth.format('MM')) + 1;

        this.callPerformance(month, start, end);
      }
    },

    //Make the my_performances call & push into arr
    callPerformance: function(month, start, end) {

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_performances/activity',
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
      currentWeekFormat: store.getters.week_formatting["workweek"],

      popoverStyle: {
        'max-width': '400px'
      },
    }

  },

  filters: {  },
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
