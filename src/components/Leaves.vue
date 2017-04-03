<template lang="pug">
div(class='calendar')
  div.row
    div.col-md-6
      h3 My Leaves
      p Here, have an overview of all your leaves. Whatever
        div
          #accordion(v-for='(leave, i) in sortedLeaves' role='tablist', aria-multiselectable='true')
            hr(v-if='leave.leavedate_set')
            .card( v-bind:class='getRibbonStyleClass(leave)')
              div.card-header(role='tab', v-bind:id='"heading-" + i', data-toggle='collapse', data-parent='#accordion', aria-expanded='false', 'v-bind:aria-controls='"collapse-" + i', 'v-bind:href='"#collapse-" + i')
                div.row
                  div.col-md-10
                    a
                      | {{ leave.description }}
                  div.col-md-2 
                    span.tag.float-md-right(v-bind:class='getTagStyleClass(leave)') 
                      | {{ leave.status }}
                    
              div.collapse(role='tabpanel', v-bind:id='"collapse-" + i', v-bind:aria-labelledby='"heading-" + i')
                div.card-block
                  div
                    | <strong>From:</strong> {{ leave.leave_start | moment('DD MMM YYYY - HH:mm') }}<br>
                    | <strong>To:</strong> {{ leave.leave_end | moment('DD MMM YYYY - HH:mm') }}<br>
                    //- ul.list-group
                    //-   li.list-group-item(v-for='leave_date in leave.leavedate_set')
                    //-     | <strong>From:</strong> {{ leave_date.starts_at | moment('DD MMM YYYY - HH:mm') }}<br>
                    //-     | <strong>To:</strong> {{ leave_date.ends_at | moment('DD MMM YYYY - HH:mm') }}
    div.col-md-6
      cmpHolidays


</template>
<script>
import { mapState } from 'vuex';
import * as types from '../store/mutation-types';
import * as constant from '../store/constants';
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

    sortedLeaves: function() {
      return this.leaves;
      // .sort(function(a,b) {

      //   var thing1 = a.leavedate_set.find(Math.min.apply(Math, function(o) {
      //     return o.starts_at
      //     }));
      //   var thing2 = b.leavedate_set.find(Math.min.apply(Math, function(o) {
      //       return o.starts_at
      //     }));

        
      //   if(thing1 < thing2)
      //     return -1;
      //   else if(thing1 == thing2)
      //     return 0;
      //   else
      //     return 1;

      // });
    },

    nearestLeave: function() {
      // var today = new Date();
      // var leaveLength = this.leaves.length;

      // for(var i = 0; i < leaveLength; i++) {

      // }

    },
  },

  methods: {

    getRibbonStyleClass: function(leave) {
      var tempObj = {
        [constant.LEAVE_STATUSES[2]]: 'card-top-green',
        [constant.LEAVE_STATUSES[1]]: 'card-top-red',
      }

      return (tempObj[leave.status]) ? tempObj[leave.status] : 'card-top-blue';                           
    },

    getTagStyleClass: function(leave) {
      var tempObj = {
        [constant.LEAVE_STATUSES[2]]: 'tag-success',
        [constant.LEAVE_STATUSES[1]]: 'tag-danger',
      }

      return (tempObj[leave.status]) ? tempObj[leave.status] : 'tag-primary';
    }

  },
}
</script>

<style lang="less" scoped>

</style>
