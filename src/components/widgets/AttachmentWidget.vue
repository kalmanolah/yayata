<template lang="pug">
div(class='card card-top-blue mb-3')
  div(class='card-header text-center') 📎 Manage attachments
  div(class='card-body')
    div(class='list-group mb-3')
      div(class='list-group-item d-flex justify-content-between align-items-center' v-for='(attachment, k) in existingAttachments')
        | {{ attachment.display_label }}

        div(class='btn-group btn-group-sm')
          b-btn(
            variant='outline-secondary'
            v-b-tooltip
            title='Download'
            :href='baseUrl + attachment.file_url'
          )
            i(class='fa fa-download')
          b-btn(
            variant='outline-danger'
            v-b-tooltip
            title='Delete'
            @click='removeAttachment(attachment)'
          )
            i(class='fa fa-trash')

    b-form-fieldset
      label Attachments
      b-form-file(v-model='newAttachments' :multiple='true' ref='attachments')

    div(class='form-group')
      div(class='row justify-content-between')
        div(class='col')
          input(class='btn btn-primary' type="submit" value="Add" @click="saveAttachments()")
</template>

<script>
import toastr from 'toastr';
import * as types from '../../store/mutation-types';
import store from '../../store';

export default {
  name: 'AttachmentWidget',

  props: [
    'leave',
    'timesheet',
  ],

  mixins: [
  ],

  data: () => {
    return {
      loading: false,
      existingAttachments: [],
      newAttachments: [],
    }
  },

  computed: {
    baseUrl: () => store.state.oauth2.config.baseUrl
  },

  created: function() {
    this.reloadData()
  },

  methods: {
    reloadData: function() {
      let params = {}
      if (this.timesheet) {
        params.timesheet = this.timesheet.id
      } else if (this.leave) {
        params.leave = this.leave.id
      }

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_attachments/',
        params: params
      }).then(res => {
        this.existingAttachments = res.data.results
      })
    },

    removeAttachment: function(attachment) {
      if (this.loading) return
      this.loading = true

      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: `/my_attachments/${attachment.id}/`,
        method: 'DELETE'
      }).then(res => {
        toastr.success('Attachment deleted.')
      }).catch(() => {
        toastr.error('Error deleting attachment.')
      }).finally(() => {
        this.existingAttachments = this.existingAttachments.filter(x => x.id != attachment.id)
        this.loading = false
      })
    },

    saveAttachments: function() {
      if (this.loading) return
      this.loading = true

      // Upload attachments
      let promises = this.newAttachments.map(attachment => {
        let form = new FormData()
        form.append('name', attachment.name)
        form.append('file', attachment)

        return store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/my_attachments/',
          method: 'POST',
          body: form
        })
      })

      Promise.all(promises).then(responses => {
        // Add all new attachments to existing attachments,
        // reset new attachments
        responses.forEach(response => {
          this.existingAttachments.push(response.data)
        })
        this.newAttachments.splice(0, this.newAttachments.length)
        this.$refs.attachments.reset()

        // Update timesheet/leave with attachment IDs
        let resourceUrl = null
        if (this.timesheet) {
          resourceUrl = `/my_timesheets/${this.timesheet.id}/`
        } else if (this.leave) {
          resourceUrl = `/my_leaves/${this.leave.id}/`
        }
        let attachmentIds = this.existingAttachments.map(x => x.id)

        store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: resourceUrl,
          method: 'PATCH',
          body: {
            attachments: attachmentIds,
          }
        }).then(() => {
          this.loading = false
          toastr.success('Attachments updated.')
          // this.$emit('success')
        })
      }).catch(error => {
        this.loading = false
        toastr.error('Error updating attachments.')
        this.$emit('error', error)
      })
    }
  }
}
</script>
