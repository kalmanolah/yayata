<template lang="pug">
div
  div(class='row')
    div(class='col-md-6')
      LeaveWidget
    div(class='col-md-6')
      div(class='card card-top-blue mb-3')
        div(class='card-header text-center') Leave pending approval

        div(class='list-group list-group-flush' v-if='pendingLeave && pendingLeave.length')
          li(class='list-group-item p-2' v-for='leave in pendingLeave')
            div(class='d-flex justify-content-between')
              div {{ leave.leave_type.display_label }}
              div
                a(class='btn btn-sm btn-danger' @click='deleteLeave(leave)')
                  i(class='fa fa-trash')
            div(v-for='leave_date in leave.leavedate_set' class='text-muted')
              small {{ leave_date.starts_at | moment('YYYY-MM-DD, HH:mm') }} - {{ leave_date.ends_at | moment('HH:mm') }}
            div(v-if='leave.description' class='text-muted')
              small {{ leave.description }}
        div(class='card-body' v-else)
          | No leave pending. Are you sure you don't need a break from all that hard work?

      div(class='card card-top-blue mb-3')
        div(class='card-header text-center') Upcoming leave

        div(class='list-group list-group-flush' v-if='upcomingLeave && upcomingLeave.length')
          li(class='list-group-item p-2' v-for='leave in upcomingLeave')
            div(class='d-flex justify-content-between')
              div {{ leave.leave_type.display_label }}
              div 🏖️
            div(v-for='leave_date in leave.leavedate_set' class='text-muted')
              small {{ leave_date.starts_at | moment('YYYY-MM-DD, HH:mm') }} - {{ leave_date.ends_at | moment('HH:mm') }}
            div(v-if='leave.description' class='text-muted')
              small {{ leave.description }}
        div(class='card-body' v-else)
          | No leave coming up. Are you sure you don't need a break from all that hard work?

      div(class='card card-top-blue mb-3')
        div(class='card-header text-center') Upcoming holidays

        div(class='list-group list-group-flush' v-if='upcomingHolidays && upcomingHolidays.length')
          li(class='list-group-item p-2' v-for='holiday in upcomingHolidays')
            div(class='d-flex mb-0 justify-content-between')
              div {{ holiday.display_label }}
              div 🌐
            div(class='text-muted')
              small {{ holiday.date | moment('YYYY-MM-DD') }}
        div(class='card-body' v-else)
          | No holidays coming up.

    div(class='col-md-6')
      div(class='card card-top-blue mb-3')
        div(class='card-header text-center') All leave
        div(v-if='leave && leave.length')
          nav(class='nav nav-tabs')
            a(
              v-for='year in years'
              v-on:click.prevent='filterByYear(year)'
              class='nav-link nav-item'
              v-bind:class='{"active": year == filterYear}'
              href='#'
            ) {{ year }}

          div(class='list-group list-group-flush')
            li(class='list-group-item p-2' v-for='leave in filteredLeave')
              div(class='d-flex justify-content-between')
                div {{ leave.leave_type.display_label }}
                div
                  span(class='badge' v-bind:class='{"bg-danger": leave.status == "rejected", "bg-warning": leave.status == "pending", "bg-success": leave.status == "approved"}') {{ leave.status }}
              div(v-for='leave_date in leave.leavedate_set' class='text-muted')
                small {{ leave_date.starts_at | moment('YYYY-MM-DD, HH:mm') }} - {{ leave_date.ends_at | moment('HH:mm') }}
              div(v-if='leave.description' class='text-muted')
                small {{ leave.description }}
        div(class='card-body' v-else)
          | You have requested no leave as of today. Only robots never take a break!
</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';
import moment from 'moment-timezone';
import toastr from 'toastr';
import LeaveWidget from './widgets/LeaveWidget.vue';


export default {
  name: 'leave',

  components: {
    LeaveWidget,
  },

  data () {
    return {
      years: null,
      filterYear: null,
      leave: null,
      upcomingHolidays: null,
      upcomingLeave: null,
      pendingLeave: null,
    }
  },

  created: function () {
    this.reloadData()
  },

  computed: {
    filteredLeave: function() {
      if (this.leave) {
        return this.leave.filter(leave => {
          return moment(leave.leavedate_set[0].starts_at).format('YYYY') == this.filterYear
        })
      }
    },
  },

  filters: {
  },

  methods: {
    filterByYear: function(year) {
      this.filterYear = year
    },

    reloadData: function() {
      let now = moment()

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_leaves/',
        params: {
          'status!': 'draft',
        }
      }).then((res) => {
        let leave = res.data.results.filter(lv => {
          return lv && lv.leavedate_set && lv.leavedate_set.length
        }).sort((a, b) => {
          return moment(a.leavedate_set[0].starts_at).isBefore(moment(b.leavedate_set[0].starts_at)) ? -1 : 1
        })

        this.years = _.uniq(leave.map(lv => moment(lv.leavedate_set[0].starts_at).format('YYYY')))
        this.filterYear = this.years.slice(-1)[0]
        this.leave = leave

        // Upcoming leave occurs after now
        let now = moment()
        this.upcomingLeave = leave.filter(lv => {
          return (lv.status == 'approved') && moment(lv.leavedate_set[0].starts_at).isAfter(now)
        }).slice(0, 2)

        // Pending leaves are pending
        this.pendingLeave = leave.filter(lv => {
          return lv.status == 'pending'
        })
      })

      if (store.getters.user.userinfo && store.getters.user.userinfo.country) {
        store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/holidays/',
          params: {
            'status!': 'draft',
            'country': store.getters.user.userinfo.country,
            'date__gt': now.format('YYYY-MM-DD'),
            'page_size': 2,
            'order_by': 'date'
          },
          full: false
        }).then((res) => {
          this.upcomingHolidays = res.data.results
        })
      }
    },

    deleteLeave: function(leave) {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: `/my_leaves/${leave.id}/`,
        method: 'DELETE'
      }).then((res) => {
        toastr.success('Leave deleted.')
        this.reloadData()
      })
    },
  },
}
</script>

<style lang="less" scoped>
</style>
