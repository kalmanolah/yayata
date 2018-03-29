<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center')
    | ✔️ Submit timesheet
  div(class='card-body')
    p Are you sure you wish to submit this timesheet?
      | <br>
      | If you do so, you will no longer be able to modify it until it has been reviewed.

    div(class='row justify-content-between')
      div(class='col')
        input(class='btn btn-primary' type="submit" value="Submit" @click="submit()")
</template>

<script>
import toastr from 'toastr';
import * as types from '../../store/mutation-types';
import store from '../../store';
import utils from '../../utils';

export default {
  name: 'TimesheetSubmissionWidget',

  props: [
    'timesheet',
  ],

  data () {
    return {
      loading: false,
    }
  },

  created: function() {
  },

  methods: {
    submit: function() {
      if (this.loading) return

      this.loading = true

      let body = {
        status: 'pending',
      }

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: `/my_timesheets/${this.timesheet.id}/`,
        method: 'PATCH',
        body: body,
      }).then((response) => {
        this.$emit('success', response)
        toastr.success('Timesheet submitted.')
        this.loading = false
      }).catch((error) => {
        this.$emit('error', error)
        toastr.error('Error submitting timesheet.')
        this.loading = false
      });
    },
  },
}
</script>

<style lang="less" scoped>
</style>
