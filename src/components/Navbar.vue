<template lang="pug">
.row
  .col.bg-light.d-flex.mr-auto
    .col.pull-left.d-md-none
      b-btn.m-2(v-b-modal="'modalio'")
        i.fa.fa-bars
      b-modal#modalio(
        ref='modalio'
        hide-header=true
        hide-footer=true
        ok-disabled=true
      )
        nav.text-center(@click='hideModal()')
          router-link(:to='{ name: "timesheets" }')
            h2 Timesheets
          router-link(:to='{ name: "contracts" }')
            h2 Contracts
          router-link(:to='{ name: "leaves" }')
            h2 Leaves
          router-link(:to='{ name: "colleagues_redirect" }')
            h2 Colleagues
          router-link(:to='{ name: "calendar_month_redirect" }')
            h2 Calendar
          router-link(:to='{ name: "availability_redirect" }')
            h2 Availability
          router-link(:to='{ name: "import" }')
            h2 Import

    .col.navbar.navbar-expand
      .collapse.navbar-collapse#navbarDropdown
        ul.navbar-nav.ml-auto
          li.nav-item.dropdown
            a(
              class='nav-link dropdown-toggle'
              v-if='user'
              href='#'
              id='responsiveNavbarDropdown'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            ) {{ user.display_label }}
            .dropdown-menu.dropdown-menu-right(
              aria-labelledby='responsiveNavbarDropdown'
            )
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
