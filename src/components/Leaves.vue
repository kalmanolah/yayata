<template lang="pug">
div(class='calendar')
  div.row
    div.col-md-6

      //- Upcoming leave
      h3.text-md-center Upcoming leave
      div(v-if='nearestLeave')
        div.list-group-item.text-md-center
          p <strong> {{ nearestLeave.leave_type }} </strong>
          p {{ nearestLeave.description }}
          hr
          div
            | <strong>From:</strong> {{ nearestLeave.leave_start | moment('DD MMM YYYY - HH:mm') }}<br>
            | <strong>To:</strong> {{ nearestLeave.leave_end | moment('DD MMM YYYY - HH:mm') }}<br>
      div(v-else)
        p.alert.alert-info No leaves coming up. Are you sure you don't need a break from all that hard work?

      hr

      //- All leaves
      h3.text-md-center All Leaves
        button.btn.btn-default.pull-right(@click='showAllLeaves = !showAllLeaves')
          i.fa(v-bind:class='[showAllLeaves ? "fa-chevron-up" : "fa-chevron-down"]')
      p.text-md-center An overview of all your leaves

        div(v-if='showAllLeaves')
          #accordion(v-for='(leave, i) in sortLeaves(processedLeaves)' role='tablist', aria-multiselectable='true')
            .card( v-bind:class='getRibbonStyleClass(leave)')
              div.card-header.leave__header(role='tab', v-bind:id='"procHeading-" + i', data-toggle='collapse', data-parent='#accordion', aria-expanded='false', v-bind:aria-controls='"procCollapse-" + i', v-bind:href='"#procCollapse-" + i')

                div.row
                  div.col-sm-9
                    a(v-bind:class='leave.leave_end < new Date() ? "text-muted" : ""')
                      | <strong>{{ leave.leave_type }}:</strong> {{ leave.description }}
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
      h3.text-md-center Pending leaves
        button.btn.btn-default.pull-right(@click='showPendingLeaves = !showPendingLeaves')
          i.fa(v-bind:class='[showPendingLeaves ? "fa-chevron-up" : "fa-chevron-down"]')
      p.text-md-center Still awaiting approval

      div(v-if='showPendingLeaves')
        #accordion(v-for='(leave, i) in sortLeaves(pendingLeaves)' role='tablist', aria-multiselectable='true')
          .card(:class='getRibbonStyleClass(leave)')
            div.card-header.leave__header(role='tab', v-bind:id='"pendHeading-" + i', data-toggle='collapse', data-parent='#accordion', aria-expanded='false', v-bind:aria-controls='"pendCollapse-" + i', v-bind:href='"#pendCollapse-" + i')

              div.row
                div.col-sm-9
                  a(v-bind:class='leave.leave_end < new Date() ? "text-muted" : ""')
                    | <strong>{{ leave.leave_type }}:</strong> {{ leave.description }}
                div.col-sm-3 
                  span.tag.float-md-right(v-bind:class='getTagStyleClass(leave)') 
                    | {{ leave.status }}
                  
            div.collapse(role='tabpanel', v-bind:id='"pendCollapse-" + i', v-bind:aria-labelledby='"pendHeading-" + i')
              div.card-block.row
                div.col-md-10
                  | <strong>From:</strong> {{ leave.leave_start | moment('DD MMM YYYY - HH:mm') }}<br>
                  | <strong>To:</strong> {{ leave.leave_end | moment('DD MMM YYYY - HH:mm') }}<br>
                button.btn.btn-danger.col-md-2(@click='cancelPendingLeave(leave)')
                  i.fa.fa-ban.text-sm-center


</template>
<script>
import { mapState } from 'vuex';
import * as types from '../store/mutation-types';
import store from '../store';
import Holidays from './Holidays.vue';
import LeaveForm from './forms/LeaveForm.vue';
import moment from 'moment';


export default {
  name: 'leaves',

  data () {
    return {
      leaves: [],
      showAllLeaves: false,
      showPendingLeaves: true,
    }
  },

  components: {
    cmpHolidays: Holidays,
  },

  created: function () {
    
    //Get most recent data
    this.getLeaves();

  },

  computed: {

    leaveTypes: function() {
      if(store.getters.leave_types)
        return store.getters.leave_types;
    },

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
    
    //Displays a toast with message
    showToast(text) {
      this.$toast(text, 
        { 
          id: 'performance-toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 1000,
          transition: 'slide-down',
          mode: 'override'
        });
    },

    //Cancels the pending
    cancelPendingLeave: function(lv) {
      console.log( lv );

      store.dispatch(
        types.NINETOFIVER_API_REQUEST,
        {
          path: '/my_leaves/' + lv.id + '/',
          method: 'DELETE'
        }
      ).then((response) => {
        if(response.status == 200 || response.status == 204) {
            this.getLeaves();
            this.showToast('Leave successfully deleted.');
          } else {
            console.log(response);
            this.showToast('Error deleting Leave. Console has more information.');
          }
      });
    },

    //Load all leaves
    getLeaves: function() {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_leaves/',
        params: {
          page_size: 100
        }
      }).then((response) => {

        //Converts the start / end datetime from strings to actual JS datetimes
        response.data.results.forEach(lv => {
          lv.leavedate_set.forEach(ld => {
            ld.starts_at = moment(ld.starts_at, 'YYYY-MM-DD HH:mm:ss');
            ld.ends_at = moment(ld.ends_at, 'YYYY-MM-DD HH:mm:ss');
          });
          
          lv['leave_start'] = lv.leavedate_set[0].starts_at;
          lv['leave_end'] = lv.leavedate_set[lv.leavedate_set.length-1].ends_at;

          lv['leave_type'] = this.leaveTypes.find(x => { return x.id === lv.leave_type}).name;
        });

        this.leaves = response.data.results
      }, () => {
        this.loading = false
      });
    },

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
.leave__header {
  cursor: pointer;
}
</style>
