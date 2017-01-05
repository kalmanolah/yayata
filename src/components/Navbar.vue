<template lang="pug">
nav(
  class='navbar navbar-yayata'
)
  button(
    class='navbar-toggler hidden-md-up'
    type='button'
    data-toggle='collapse'
    data-target='#navbarResponsive'
    aria-controls='navbarResponsive'
    aria-expanded='false'
    aria-label='Toggle navigation'
  )
  div(
    class='collapse navbar-toggleable-sm'
    id='navbarResponsive'
  )
    ul(
      class='nav navbar-nav float-md-right'
    )
      li(
        class='nav-item dropdown'
        v-if='user'
      )
        a(
          class='nav-link dropdown-toggle'
          data-toggle='dropdown'
          id='responsiveNavbarDropdown'
          aria-haspop='true'
          aria-expanded='false'
          href='#'
        ) {{ user.display_label }}
        div(
          class='dropdown-menu dropdown-menu-right'
          aria-labelledby='responsiveNavbarDropdown'
        )
          router-link(
            :to='{ name: "auth.logout" }'
            class='dropdown-item'
          ) Logout
</template>

<script>
import { mapState } from 'vuex'
import store from '../store'
import * as types from '../store/mutation-types'

export default {
  name: 'navbar',

  computed: mapState({
    user: state => state.ninetofiver.user
  }),

  data () {
    return {
    }
  }
}
</script>

<style lang="less" scoped>



</style>
