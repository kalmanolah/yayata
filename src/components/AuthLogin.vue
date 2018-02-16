<template lang="pug">
.row
  .col
    form.p-3(v-on:submit.prevent="onSubmit")
      div(
        v-if='errorMessage'
        class='alert alert-danger'
        role='alert'
      ) {{ errorMessage }}

      div(class="form-group")
        label(for='username-input') Username
        input(
          required
          id='username-input'
          type="text"
          class="form-control"
          v-model='username'
        )

      div(class="form-group")
        label(for='password-input') Password
        input(
          required
          id='password-input'
          type="password"
          class="form-control mb-2"
          v-model='password'
        )

      button(
        type="submit"
        class="btn btn-primary"
      ) Submit
</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'

export default {
  name: 'auth_login',
  data () {
    return {
      errorMessage: null,
      username: null,
      password: null,
      onSubmit: () => {
        this.errorMessage = null
        this.$store.dispatch(types.OAUTH2_GET_TOKEN, {
          username: this.username,
          password: this.password,
        }).then(() => {
          this.$router.push({ name: 'home' })
        }, (error) => {
          this.errorMessage = error.data.error_description || error.data.error
        })
      }
    }
  }
}
</script>
