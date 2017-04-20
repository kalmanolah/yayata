<template lang="pug">
div(class='calendar')
  div.row
    div.col-md-6

      //- Upcoming leave
      h3 Upcoming leave
      p
        div(v-if='nearestLeave')
          div.list-group-item
            p
              | {{ nearestLeave.description }}
            hr
            div
              | <strong>From:</strong> {{ nearestLeave.leave_start | moment('DD MMM YYYY - HH:mm') }}<br>
              | <strong>To:</strong> {{ nearestLeave.leave_end | moment('DD MMM YYYY - HH:mm') }}<br>
        div(v-else)
          p.alert.alert-info No leaves coming up. Are you sure you don't need a break from all that hard work?


      hr

      //- All leaves
      h3 All Leaves
      p An overview of all your leaves
        div
          #accordion(v-for='(leave, i) in sortLeaves(processedLeaves)' role='tablist', aria-multiselectable='true')
            .card( v-bind:class='getRibbonStyleClass(leave)')
              div.card-header(role='tab', v-bind:id='"procHeading-" + i', data-toggle='collapse', data-parent='#accordion', aria-expanded='false', v-bind:aria-controls='"procCollapse-" + i', v-bind:href='"#procCollapse-" + i')
                div.row
                  div.col-sm-9
                    a(v-bind:class='leave.leave_end < new Date() ? "text-muted" : ""')
                      | {{ leave.description }}
                  div.col-sm-3
                    span.tag.float-md-right(v-bind:class='getTagStyleClass(leave)') 
                      | {{ leave.status }}
                    
              div.collapse(role='tabpanel', v-bind:id='"procCollapse-" + i', v-bind:aria-labelledby='"procHeading-" + i')
                div.card-block
                  div
                    | <strong>From:</strong> {{ leave.leave_start | moment('DD MMM YYYY - HH:mm') }}<br>
                    | <strong>To:</strong> {{ leave.leave_end | moment('DD MMM YYYY - HH:mm') }}<br>
    div.col-md-6
      //- Holidays
      cmpHolidays

      hr

      //- Pending leaves
      h3 Pending leaves
      p Still awaiting approval by Johan
      div
        #accordion(v-for='(leave, i) in pendingLeaves' role='tablist', aria-multiselectable='true')
          .card( v-bind:class='getRibbonStyleClass(leave)')
            div.card-header(role='tab', v-bind:id='"pendHeading-" + i', data-toggle='collapse', data-parent='#accordion', aria-expanded='false', v-bind:aria-controls='"pendCollapse-" + i', v-bind:href='"#pendCollapse-" + i')
              div.row
                div.col-sm-9
                  a(v-bind:class='leave.leave_end < new Date() ? "text-muted" : ""')
                    | {{ leave.description }}
                div.col-sm-3 
                  span.tag.float-md-right(v-bind:class='getTagStyleClass(leave)') 
                    | {{ leave.status }}
                  
            div.collapse(role='tabpanel', v-bind:id='"pendCollapse-" + i', v-bind:aria-labelledby='"pendHeading-" + i')
              div.card-block
                div
                  | <strong>From:</strong> {{ leave.leave_start | moment('DD MMM YYYY - HH:mm') }}<br>
                  | <strong>To:</strong> {{ leave.leave_end | moment('DD MMM YYYY - HH:mm') }}<br>


</template>
<script>
import { mapState } from 'vuex';
import * as types from '../store/mutation-types';
import store from '../store';
import Holidays from './Holidays.vue';
import LeaveForm from './forms/LeaveForm.vue';
import moment from 'moment';

var data = {
  leaves: [],
}

export default {
  name: 'my_leaves',

  data () {
    return data;
  },

  components: {
    cmpHolidays: Holidays,
  },

  created: () => {
    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_leaves/',
    }).then((response) => {

      //Converts the start / end datetime from strings to actual JS datetimes
      response.data.results.forEach(lv => {
        lv.leavedate_set.forEach(ld => {
          ld.starts_at = moment(ld.starts_at, 'YYYY-MM-DD HH:mm:ss');
          ld.ends_at = moment(ld.ends_at, 'YYYY-MM-DD HH:mm:ss');
        });
        
        lv['leave_start'] = lv.leavedate_set[0].starts_at;
        lv['leave_end'] = lv.leavedate_set[lv.leavedate_set.length-1].ends_at;
      });

      data.leaves = response.data.results
    }, () => {
      this.loading = false
    });
  },

  computed: {

    acceptedLeaves: function() {
      return this.leaves.filter(x => {
        if(x.status === store.getters.leave_statuses[2])
          return x;
      });
    },

    pendingLeaves: function() {
      return this.leaves.filter(x => {
        if(x.status === store.getters.leave_statuses[0])
          return x;
      });
    },

    processedLeaves: function() {
      return this.leaves.filter(x => {
        if(x.status !== store.getters.leave_statuses[0] 
          && x.status !== store.getters.leave_statuses[3])
          return x;
      });
    },

    //Filters for upcoming leaves, sorts them & returns the first result
    nearestLeave: function(val) {
      var upcoming = this.acceptedLeaves.filter(x => {
        return moment().isSameOrBefore(x.leave_end)
      });

      return this.sortLeaves(upcoming).reverse()[0];
    },
  },

  filter: { },

  methods: {

    //Sorts the leaves from furthest in the future to furthest  in the past
    sortLeaves: function(val) {
      return val.sort(function(a, b) {
        a = a.leave_start.toDate();
        b = b.leave_start.toDate();

        return a > b ? -1 : (a < b ? 1 : 0);
      });
    },

    //Get the style class of the ribbon based on the leave_status
    getRibbonStyleClass: function(leave) {
      var tempObj = {
        [store.getters.leave_statuses[2]]: 'card-top-green',
        [store.getters.leave_statuses[1]]: 'card-top-red',
      }

      return (tempObj[leave.status]) ? tempObj[leave.status] : 'card-top-blue';                           
    },

    //Get the style class of the tag based on the leave_status
    getTagStyleClass: function(leave) {
      var tempObj = {
        [store.getters.leave_statuses[2]]: 'tag-success',
        [store.getters.leave_statuses[1]]: 'tag-danger',
      }

      return (tempObj[leave.status]) ? tempObj[leave.status] : 'tag-primary';
    }

  },
}
</script>

<style lang="less" scoped>

</style>
