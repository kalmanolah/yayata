<template lang="pug">
div(class='calendar')
  .row
    .col-lg-6.p-0.pt-2
      //- Upcoming leave
      .col
        h3.text-center Upcoming leave
        p.text-center The first one upcoming, or currently active.

        .list-group-item.text-center(v-if='nearestLeave')
          p <strong> {{ nearestLeave.leave_type.display_label }} </strong>
          p {{ nearestLeave.description }}
          hr
          template(v-if='nearestLeave')
            | <strong>From:</strong> {{ nearestLeave.leave_start | moment('DD MMM YYYY - HH:mm') }}<br>
            | <strong>To:</strong> {{ nearestLeave.leave_end | moment('DD MMM YYYY - HH:mm') }}<br>
        p.alert.alert-info(v-else)
          | No leaves coming up. Are you sure you don't need a break from all that hard work?

        hr.pb-4

      //- All leaves
      .col
        h3.text-center All Leaves
        p.text-center An overview of all your leaves.

        template(v-if='processedLeaves')
          #allLeavesAccordion(v-for='(yg, year) in processedLeaves' role='tablist', aria-multiselectable='true')
            .card.card-top-blue.mb-3
              .card-header(role='tab', :id='"leavesHeading-" + year', data-toggle='collapse', data-parent='#allLeavesAccordion', aria-expanded='false', :aria-controls='"allLeavesCollapse-" + year', :href='"#allLeavesCollapse-" + year')
                h4.card-title.text-md-center <strong>{{ year }}</strong>

              .collapse(role='tabpanel', :id='"allLeavesCollapse-" + year', :aria-labelledby='"leavesHeading-" + year')
                .card-block.pl-2.pr-2
                  table.table
                    tbody(v-for='(leaves, month) in yg')
                      tr
                        td(colspan='2').text-center
                          h5 <strong>{{ month | fullMonthString }}</strong>

                      template(v-for='leave in leaves')
                        tr
                          td <strong>{{ leave.leave_type.display_label }}</strong>
                            .badge.float-left.p-1.mr-3(v-bind:class='getBadgeStyleClass(leave)')
                              //- .d-none.d-xl-block {{ leave.status }}
                              .fa(:class='getStatusStyleClass(leave)')
                          td.text-right.row.justify-content-center.pr-0.mr-2
                            .col-auto.col-md-auto {{ leave.leave_start | moment('DD MMM - HH:mm') }}
                            .col-auto.d-xl-inline.d-none →
                            .col-auto.col-md-auto {{ leave.leave_end | moment('DD MMM - HH:mm') }}
          hr.d-lg-inline.pb-4
        template(v-else)
          p.alert.alert-info You have requested zero leaves as of today. Only robots never have to take a break!

    .col-lg-6.p-0.pt-2

      //- Holidays
      .col
        cmpHolidays

        hr.pb-4

      //- Pending leaves
      .col
        h3.text-center(@click='showPendingLeaves = !showPendingLeaves') Pending leaves
          .btn.btn-default.pull-right
            i.fa(v-bind:class='[showPendingLeaves ? "fa-chevron-up" : "fa-chevron-down"]')
        p.text-center Still awaiting approval.

        div(v-if='showPendingLeaves')
          p.text-center(v-if='pendingLeaves.length === 0') <strong>No leaves awaiting approval.</strong>

          .p-1#accordion(v-for='(leave, i) in sortLeaves(pendingLeaves)' role='tablist', aria-multiselectable='true')
            .card(:class='getRibbonStyleClass(leave)')
              .card-header.leave__header(role='tab', v-bind:id='"pendHeading-" + i', data-toggle='collapse', data-parent='#accordion', aria-expanded='false', v-bind:aria-controls='"pendCollapse-" + i', v-bind:href='"#pendCollapse-" + i')
                .row
                  .col-9
                    a  <strong>{{ leave.leave_type.display_label }}:</strong> {{ leave.description }}
                  .col-3
                    .badge.float-right(:class='getBadgeStyleClass(leave)')
                      | {{ leave.status }}

              .collapse.p-2(role='tabpanel', v-bind:id='"pendCollapse-" + i', v-bind:aria-labelledby='"pendHeading-" + i')
                .card-block.row.p-2
                  .col
                    .row
                      strong.col From:
                      .col-auto.float-right {{ leave.leave_start | moment('DD MMM YYYY - HH:mm') }}<br>
                    .row
                      strong.col To:
                      .col-auto.float-right {{ leave.leave_end | moment('DD MMM YYYY - HH:mm') }}<br>
                  .col-3
                    button.btn.btn-danger(@click='cancelPendingLeave(leave)')
                      i.fa.fa-ban.text-center
</template>
<script>
import * as types from '../store/mutation-types';
import store from '../store';
import Holidays from './Holidays.vue';
import moment from 'moment-timezone';
import ToastMixin from './mixins/ToastMixin.vue';


export default {
  name: 'leaves',
  mixins: [ToastMixin],

  data () {
    return {
      leaves: [],
      showAllLeaves: false,
      showPendingLeaves: true,
      loaded: false,
    }
  },

  components: {
    cmpHolidays: Holidays,
  },

  created: function () {
    this.getLeaves();
  },

  computed: {

    leaveTypes: function() {
      if(store.getters.leave_types)
        return store.getters.leave_types;
    },

    acceptedLeaves: function() {
      return this.leaves.filter(x => {
        return x.status === 'accepted'
      });
    },

    pendingLeaves: function() {
      return this.leaves.filter(x => {
        return x.status === 'pending'
      });
    },

    processedLeaves: function() {
      if(this.leaves){
        let procLeaves = {};

        let leaves = this.leaves.filter(x => {
          if(x.status !== 'draft'
            && x.status !== 'pending') {
              x.year = x.leave_start.year();
              x.month = x.leave_start.month() + 1;
              return x;
            }
        });

        leaves.forEach((leave) => {
          if(!procLeaves[leave.year])
            procLeaves[leave.year] = {};

          if(!procLeaves[leave.year][leave.month])
            procLeaves[leave.year][leave.month] = [];

          procLeaves[leave.year][leave.month].push(leave);
        });

        for(let year in procLeaves) {
          for(let month in procLeaves[year]) {
            this.sortLeaves(procLeaves[year][month]).reverse();
          }
        }

        return procLeaves;
      }
    },

    //Filters for upcoming leaves, sorts them & returns the first result
    nearestLeave: function() {
      let upcoming = this.leaves.filter(x => {
        return x.status == 'approved' && moment().isSameOrBefore(x.leave_end, 'date')
      });

      return this.sortLeaves(upcoming).reverse()[0];
    },
  },

  filters: {

    // Takes a month integer and returns a month-format
    fullMonthString: function(val) {
      return moment().month(val-1).format('MMM');
    }
  },

  methods: {

    //Cancels the pending
    cancelPendingLeave: function(lv) {

      store.dispatch(
        types.NINETOFIVER_API_REQUEST,
        {
          path: '/my_leaves/' + lv.id + '/',
          method: 'DELETE'
        }
      ).then((response) => {
        if(response.status == 200 || response.status == 204) {
            this.getLeaves();
            this.showSuccessToast('Leave successfully deleted.');
          } else {
            console.log(response);
            this.showDangerToast('Error deleting Leave. Console has more information.');
          }
      });
    },

    //Load all leaves
    getLeaves: function() {

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_leaves/'
      }).then((response) => {

        //Converts the start / end datetime from strings to actual JS datetimes
        response.data.results.forEach(lv => {
          lv.leavedate_set.forEach(ld => {
            ld.starts_at = moment(ld.starts_at, 'YYYY-MM-DD HH:mm:ssZZ');
            ld.ends_at = moment(ld.ends_at, 'YYYY-MM-DD HH:mm:ssZZ');
          });

          lv['leave_start'] = lv.leavedate_set[0].starts_at;
          lv['leave_end'] = lv.leavedate_set[lv.leavedate_set.length-1].ends_at;
        });

        this.leaves = response.data.results
      }, () => {
        this.loading = false
      }).catch((error) => {
        console.log(error)
      });
    },

    //Sorts the leaves from furthest in the future to furthest  in the past
    sortLeaves: function(val) {
      return val.sort(function(a, b) {
        a = a.leave_start;
        b = b.leave_start;

        return a > b ? -1 : (a < b ? 1 : 0);
      });
    },

    //Get the style class of the ribbon based on the leave_status
    getRibbonStyleClass: function(leave) {
      let tempObj = {
        'approved': 'card-top-green',
        'rejected': 'card-top-red',
      };

      return tempObj[leave.status] || 'card-top-blue';
    },

    //Get the style class of the badge based on the leave_status
    getBadgeStyleClass: function(leave) {
      let tempObj = {
        'approved': 'badge-success',
        'rejected': 'badge-danger',
      };

      return tempObj[leave.status] || 'badge-primary';
    },

    //Get the style based on the status of the leave
    getStatusStyleClass: function(leave) {
      let tempObj = {
        'approved': 'fa-check',
        'rejected': 'fa-times'
      };

      return tempObj[leave.status] || 'fa-question';
    }

  },
}
</script>

<style lang="less" scoped>
.leave__header {
  cursor: pointer;
}

</style>
