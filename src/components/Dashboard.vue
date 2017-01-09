<template lang="pug">
div
  .row
    .col-md-8
      .alert.alert-warning.card-top-red
        | You have 1 due timesheet that is still open. Please fix that ASAP or Johan will haunt your dreams.
  .row
    .col-md-8
      .card
        h4.card-title.text-md-center
          | Timesheet for {{ today | moment('MMMM YYYY') }}
        table.table
          tbody
            tr
              td Port of Antwerp (Amaris Consultancy)
              td.text-md-right 92 hours (11,5 days)
            tr
              td Fabricom (LPA Track &amp; trace)
              td.text-md-right 24 hours (3 days)
            tr
              td Google (Search Engine Optimisation)
              td.text-md-right 16 hours (2 days)
            tr
              td <strong>Total</strong>
              td.text-md-right <strong>132 hours (16,5 days)</strong>
            tr
              td <strong>Hours left to fill in</strong>
              td.text-md-right <strong>36 hours (4,5 days)<strong>
  .row
    .col-md-8
      LeaveForm
</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'
import LeaveForm from './forms/LeaveForm.vue'

var data = {
    today: new Date(),
}

export default {
  name: 'dashboard',

  components: {
    LeaveForm: LeaveForm,
  },

  data () {
    return data;
  }
}
</script>

<style>
</style>
