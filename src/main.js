import Vue from 'vue'
// import Vuex from 'vuex'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import { sync } from 'vuex-router-sync'
import store from './store'
import * as types from './store/mutation-types'

import App from './components/App.vue'
import Auth from './components/Auth.vue'
import AuthLogin from './components/AuthLogin.vue'
import AuthLogout from './components/AuthLogout.vue'
import Dashboard from './components/Dashboard.vue'
import Calendar from './components/Calendar.vue'

// Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(VueResource)

export const cfg_file_path = '/cfg/config.json'

export const router = new VueRouter({
  routes: [
    {
      name: 'home',
      path: '/',
      component: App,
      redirect: '/dashboard',
      children: [
        {
          name: 'dashboard',
          path: '/dashboard',
          component: Dashboard,
        },
        {
          name: 'calendar',
          path: '/calendar',
          redirect: `/calendar/${(new Date()).getFullYear()}/${(new Date()).getMonth() + 1}`,
        },
        {
          name: 'calendar_month',
          path: '/calendar/:year/:month',
          component: Calendar,
        }
      ],
    },
    {
      name: 'auth',
      path: '/auth',
      component: Auth,
      redirect: 'login',
      children: [
        {
          name: 'auth.login',
          path: 'login',
          component: AuthLogin,
          meta: {
            anonymous: true
          },
        },
        {
          name: 'auth.logout',
          path: 'logout',
          component: AuthLogout,
          meta: {
            anonymous: true
          },
        },
      ]
    },
    { path: '*', redirect: { name: 'home' } }
  ]
})

// Sync store with router
sync(store, router)

// If the user is navigating to a secured route,
// verify authentication or redirect to login screen
router.beforeEach((to, from, next) => {
  if (!to.meta.anonymous && !store.state.oauth2.authenticated) {
    next({ name: 'auth.login' })
  } else {
    next()
  }
})

Vue.http.get(cfg_file_path).then((response) => {
  store.commit(types.OAUTH2_CONFIGURE, response.data.oauth2.config)

  new Vue({
    el: '#app',
    router,
    store
  })
}, (error) => {
  console.error(`Could not load configuration file at ${cfg_file_path}!`)
})
