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
        template(v-for='navbarItem in navbarItems')
          router-link(v-if='!navbarItem.divider' :to='navbarItem.route' class='list-group-item list-group-item-action')
            h2 {{ navbarItem.label }}

  div(class='navbar-collapse collapse' id='navbarSupportedContent')
    ul(class='navbar-nav ml-auto')
      b-nav-item-dropdown(v-if='user' :text='user.display_label' right)
        b-dropdown-item(:to='{ name: "colleague", params: { userId: user.id } }') Profile
        b-dropdown-item(:to='{ name: "auth.logout" }') Logout
</template>

<script>
import store from '../store'
import * as types from '../store/mutation-types'

export default {
  name: 'navbar',

  computed: {
    user: function() {
      if (store.getters.user) {
          return store.getters.user
      }
    },

    navbarItems: function() {
        if (store.getters.navbar_items) {
            return store.getters.navbar_items
        }
    }
  },
  methods: {
    hideModal() {
        this.$refs.modalio.hide()
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
