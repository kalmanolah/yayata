<template lang="pug">
div
  b-modal(ref='leaveModal' hide-header=true hide-footer=true lazy=true size='lg')
    LeaveWidget(
      :leave='selectedLeave'
      v-on:success='onLeaveModified()'
    )

  b-modal(ref='attachmentModal' hide-header=true hide-footer=true lazy=true size='lg')
    AttachmentWidget(
      :leave='selectedLeave'
      v-on:success='onAttachmentModified()'
    )

  div(class='row')
    div(class='col-md-6')
      div(class='card card-top-blue mb-3')
        div(class='card-header text-center d-flex justify-content-between')
          span All leave
          span(class='cursor-pointer' v-on:click.prevent='addLeave()' v-b-tooltip title='Request leave') ➕

        div(v-if='leave && leave.length' class='pt-2')
          nav(class='nav nav-tabs')
            a(
              v-for='year in years'
              v-on:click.prevent='filterByYear(year)'
              class='nav-link nav-item'
              v-bind:class='{"active": year == filterYear}'
              href='#'
            ) {{ year }}

          div(class='list-group list-group-flush')
            li(class='list-group-item list-group-item-action cursor-pointer p-2' v-for='leave in filteredLeave' v-on:click.prevent='leave.status == "pending" ? editLeave(leave) : null')
              div(class='d-flex justify-content-between')
                div {{ leave.leave_type.display_label }}
                div
                  span(class='badge' v-bind:class='{"bg-danger": leave.status == "rejected", "bg-warning": leave.status == "pending", "bg-success": leave.status == "approved"}') {{ leave.status }}
              div(class='d-flex justify-content-between')
                div
                  div(v-for='leave_date in leave.leavedate_set' class='text-muted')
                    small {{ leave_date.starts_at | moment('YYYY-MM-DD, HH:mm') }} - {{ leave_date.ends_at | moment('HH:mm') }}
                  div(v-if='leave.description' class='text-muted')
                    small {{ leave.description }}
                div
                  div(class='cursor-pointer' v-b-tooltip title='Attachments' v-on:click.stop='editAttachment(leave)') 📎
        div(class='card-body' v-else)
          | You have requested no leave as of today. Only robots never take a break!
</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';
import moment from 'moment-timezone';
import toastr from 'toastr';
import LeaveWidget from './widgets/LeaveWidget.vue';
import AttachmentWidget from './widgets/AttachmentWidget.vue';


export default {
  name: 'leave',

  components: {
    LeaveWidget,
    AttachmentWidget,
  },

  data () {
    return {
      years: null,
      filterYear: null,
      leave: null,
      selectedLeave: null,
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
      })
    },

    addLeave: function() {
      this.selectedLeave = null
      this.$refs.leaveModal.show()
    },

    editLeave: function(leave) {
      this.selectedLeave = leave
      this.$refs.leaveModal.show()
    },

    onLeaveModified: function() {
      this.$refs.leaveModal.hide()
      this.selectedLeave = null
      this.reloadData()
    },

    editAttachment: function(leave) {
      this.selectedLeave = leave
      this.$refs.attachmentModal.show()
    },

    onAttachmentModified: function() {
      this.$refs.attachmentModal.hide()
      this.selectedLeave = null
    },
  },
}
</script>

<style lang="less" scoped>
</style>
