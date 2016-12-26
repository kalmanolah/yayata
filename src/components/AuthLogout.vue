<template>
</template>

<script>
import * as types from '../store/mutation-types'

export default {
  beforeRouteEnter (to, from, next) {
    // When entering the logout route,
    // clear all auth state and redirect to root state (/)
    // Note: This will redirect users to the login state,
    // since they're no longer authenticated
    next(vm => {
      vm.$store.commit(types.OAUTH2_SET_TOKEN, {})
      vm.$router.push({ name: 'home' })
    })
  }
}
</script>
