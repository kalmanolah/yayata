<template lang="pug">
.row
  .col.navbar-yayata.d-flex.justify-content-end
    nav(
      class='navbar navbar-expand'
    ) 
      .collapse.navbar-collapse#navbarDropdown
        ul(
          class='navbar-nav'
        ) 
          li(
            class='nav-item dropdown'
          )
            a(
              class='nav-link dropdown-toggle'
              v-if='user'
              href='#'
              id='responsiveNavbarDropdown'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            ) {{ user.display_label }}
            div(
              class='dropdown-menu'
              aria-labelledby='responsiveNavbarDropdown'
            )
              router-link.dropdown-item#admin-nav(:to='{ name: "admin" }') Admin
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

  data () {
    return {
      clicked: false
    }
  }
}
</script>

<style lang="less" scoped>



</style>
