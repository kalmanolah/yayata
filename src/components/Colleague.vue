<template lang="pug">
div(v-if='user')
  div(class='card user-card')
    div(class='card-header user-card-header' style='background-image: url("https://source.unsplash.com/featured/?landscape");')
      div(class='row')
        div(class='col-lg-6 d-flex justify-content-center')
          img(class='my-4 m-lg-5 img-thumbnail img-fluid' :src='getGravatarUrl(user.email)')
        div(class='col-lg-6 align-self-center')
          div(class='user-header-text text-white text-center text-lg-left')
            h1 {{ user.display_label }}
            h4 {{ user.username }}
    div(class='card-body')
      div(class='row justify-content-center')
        div(class='col-lg-4')
          div(class='card card-top-blue mb-3')
            div(class='card-header') Personal information
            div(class='card-body')
              dl(class='row mb-0')
                dt(class='col-sm-6') Name
                dd(class='col-sm-6') {{ user.display_label }}

                dt(class='col-sm-6') Username
                dd(class='col-sm-6') {{ user.username }}

                dt(class='col-sm-6') Email
                dd(class='col-sm-6') {{ user.email }}

                template(v-if='user.userinfo && user.userinfo.phone_number')
                  dt(class='col-sm-6') Phone number
                  dd(class='col-sm-6') {{ user.userinfo.phone_number }}

                template(v-if='user.userinfo && user.userinfo.join_date')
                  dt(class='col-sm-6') Join date
                  dd(class='col-sm-6') {{ user.userinfo.join_date }}

                template(v-if='user.userinfo && user.userinfo.birth_date')
                  dt(class='col-sm-6') Birth date
                  dd(class='col-sm-6') {{ user.userinfo.birth_date }}

                template(v-if='user.userinfo && user.userinfo.country')
                  dt(class='col-sm-6') Country
                  dd(class='col-sm-6') {{ user.userinfo.country }}

        div(class='col-lg-4')
          AvailabilityCalendarWidget(:user='user')
</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';
import utils from '../utils';
import AvailabilityCalendarWidget from './widgets/AvailabilityCalendarWidget.vue';

export default {
  name: 'colleague',

  components: {
    AvailabilityCalendarWidget
  },

  data () {
    return {
    }
  },

  created: function() {
    new Promise((resolve, reject) => {
      if (!store.getters.users) {
        store.dispatch(types.NINETOFIVER_RELOAD_USERS).then(() => resolve())
      } else{
        resolve()
      }
    })
  },

  computed: {
    userId: function() {
      return this.$route.params.userId
    },

    user: function() {
      if (store.getters.users) {
        return store.getters.users.find(x => x.id == this.userId)
      }
    },
  },

  methods: {
    getGravatarUrl: utils.getGravatarUrl,
  }
}
</script>

<style scoped lang="less">
.user-card {
  .user-card-header {
    background-size: cover;
    background-position: center center;
    text-shadow: 1px 1px 4px #222;

    img {
      box-shadow: 1px 1px 5px #222;
    }
  }
}
</style>
