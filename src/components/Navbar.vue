<template lang="pug">
div(class='navbar navbar-light bg-light navbar-expand')
  form(class='form-inline d-md-none')
    b-btn(v-b-modal="'modalio'" class='btn-outline-dark')
      i(class='fa fa-bars')
    b-modal(
      id='modalio'
      ref='modalio'
      hide-header=true
      hide-footer=true
      ok-disabled=true
    )
      div(class='list-group list-group-flush text-center' @click='hideModal()')
        router-link(:to='{ name: "dashboard" }' class='list-group-item list-group-item-action')
          h2 Dashboard
        router-link(:to='{ name: "timesheets" }' class='list-group-item list-group-item-action')
          h2 Timesheets
        router-link(:to='{ name: "contracts" }' class='list-group-item list-group-item-action')
          h2 Contracts
        router-link(:to='{ name: "leaves" }' class='list-group-item list-group-item-action')
          h2 Leaves
        router-link(:to='{ name: "colleagues_redirect" }' class='list-group-item list-group-item-action')
          h2 Colleagues
        router-link(:to='{ name: "calendar_redirect" }' class='list-group-item list-group-item-action')
          h2 Calendar
        router-link(:to='{ name: "availability_redirect" }' class='list-group-item list-group-item-action')
          h2 Availability
        router-link(:to='{ name: "import" }' class='list-group-item list-group-item-action')
          h2 Import

  div(class='navbar-collapse collapse' id='navbarSupportedContent')
    ul(class='navbar-nav ml-auto')
      li(class='nav-item dropdown')
        a(
          class='nav-link dropdown-toggle'
          v-if='user'
          href='#'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
        ) {{ user.display_label }}
          div(class='dropdown-menu dropdown-menu-right')
            router-link(
              :to='{ name: "auth.logout" }',
              class='dropdown-item'
            ) Logout
</template>

<script>
import store from '../store'
import * as types from '../store/mutation-types'

export default {
  name: 'navbar',

  computed: {
    user: function() {
      if(store.getters.user)
        return store.getters.user;
    }
  },
  methods: {
    hideModal() {
        this.$refs.modalio.hide();
    }
  },
  data () {
    return {
      clicked: false
    }
  }
}
</script>

<style lang="less" scoped>
</style>
