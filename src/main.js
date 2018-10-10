import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import { sync } from 'vuex-router-sync'
import store from './store'
import * as types from './store/mutation-types'
import preferences from './preferences'
import VueFormGenerator from 'vue-form-generator'
import VueMarkdown from 'vue-markdown'
import VueProgressBar from 'vue-progressbar'

import ToggleButton from 'vue-js-toggle-button'
// import {ServerTable, ClientTable, Event} from 'vue-tables-2'
import { ClientTable } from 'vue-tables-2'

// Bootstrap
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.min.css'

// VueMultiSelect
import 'vue-multiselect/dist/vue-multiselect.min.css'
import './assets/less/vue-multiselect.less'
import VueMultiselect from 'vue-multiselect'

// toastr
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

// moment
import moment from 'moment-timezone'
import VueMoment from 'vue-moment'

// fontawesome
import 'font-awesome/css/font-awesome.min.css'

// Pikaday
import Pikaday from 'pikaday'
import 'pikaday/css/pikaday.css'
window.moment = moment // Required because vue-form-generator sucks
window.Pikaday = Pikaday // Required before vue-form-generator sucks

import App from './components/App.vue'
import Auth from './components/Auth.vue'
import AuthLogin from './components/AuthLogin.vue'
import AuthLogout from './components/AuthLogout.vue'
import Dashboard from './components/Dashboard.vue'
import Month from './components/Month.vue'
import Week from './components/Week.vue'
import Leave from './components/Leave.vue'
import Timesheets from './components/Timesheets.vue'
import Colleagues from './components/Colleagues.vue'
import Colleague from './components/Colleague.vue'
import Availability from './components/Availability.vue'
import Import from './components/Import.vue'
import FAQ from './components/FAQ.vue'
import Changelog from './components/Changelog.vue'


// Vue.use(Vuex)
Vue.use(ToggleButton)
Vue.use(BootstrapVue)
Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(VueMoment)
Vue.use(VueFormGenerator)
Vue.use(ClientTable, null, null, 'bootstrap4')
Vue.use(VueMarkdown)
Vue.use(VueProgressBar)
Vue.component('multiselect', VueMultiselect)

// Global toast options
toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-right",
}

export const cfg_file_path = '/cfg/config.json'

export const router = new VueRouter({
    routes: [{
            name: 'home',
            path: '/',
            component: App,
            redirect: '/dashboard',
            children: [{
                    name: 'dashboard',
                    path: '/dashboard',
                    component: Dashboard,
                },
                {
                    name: 'calendar_redirect',
                    path: '/calendar',
                    redirect: '/calendar/month'
                },
                {
                    name: 'calendar_month_redirect',
                    path: '/calendar/month',
                    redirect: `/calendar/month/${(new Date()).getFullYear()}/${(new Date()).getMonth() + 1}`,
                },
                {
                    name: 'calendar_month',
                    path: '/calendar/month/:year/:month',
                    component: Month,
                },
                {
                    name: 'calendar_week_redirect',
                    path: '/calendar/week',
                    redirect: `/calendar/week/${(new Date()).getFullYear()}/${moment().isoWeek()}`,
                },
                {
                    name: 'calendar_week',
                    path: '/calendar/week/:year/:week',
                    component: Week,
                },
                {
                    name: 'colleagues',
                    path: '/colleagues',
                    component: Colleagues,
                },
                {
                    name: 'colleague',
                    path: '/colleagues/:userId',
                    component: Colleague,
                },
                {
                    name: 'leave',
                    path: '/leave',
                    component: Leave,
                },
                {
                    name: 'availability_redirect',
                    path: '/availability',
                    redirect: `/availability/month`,
                },
                {
                    name: 'availability_month_redirect',
                    path: '/availability/month',
                    redirect: `/availability/month/${(new Date()).getFullYear()}/${(new Date()).getMonth() + 1}`,
                },
                {
                    name: 'availability_month',
                    path: '/availability/month/:year/:month',
                    component: Availability,
                },
                {
                    name: 'timesheets',
                    path: '/timesheets',
                    component: Timesheets,
                },
                {
                    name: 'import',
                    path: '/import',
                    component: Import,
                },
                {
                    name: 'faq',
                    path: '/faq',
                    component: FAQ,
                },
                {
                    name: 'changelog',
                    path: '/changelog',
                    component: Changelog,
                },
            ],
        },
        {
            name: 'auth',
            path: '/auth',
            component: Auth,
            redirect: 'login',
            children: [{
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

// Add a HTTP interceptor for showing/hiding progress bars
Vue.http.interceptors.push((request, next) => {
  Vue.prototype.$Progress._requests = (Vue.prototype.$Progress._requests || 0) + 1
  if (Vue.prototype.$Progress._requests === 1) {
    Vue.prototype.$Progress.start()
  }
  next((response) => {
    Vue.prototype.$Progress._requests -= 1
    if (Vue.prototype.$Progress._requests === 0) {
      Vue.prototype.$Progress.finish()
    }
  })
})

// Load configuration file and initialize Vue
console.debug(`Loading configuration file at ${cfg_file_path}`)
Vue.http.get(cfg_file_path).then((response) => {
    console.debug('Configuration loaded', response.data)
    store.commit(types.OAUTH2_CONFIGURE, response.data.oauth2.config)

    new Vue({
        el: '#app',
        router,
        store
    })
}, (error) => {
    console.error(`Could not load configuration file!`)
})

// Install service worker
if ('serviceWorker' in navigator) {
  let _updateReady = function(worker) {
    toastr.info('A new version of YAYATA is available. Click here to update!', 'Update available', {
      timeOut: 0,
      extendedTimeOut: 0,
      closeButton: true,
      onclick: function() {
        preferences.set(preferences.key.SHOW_UPDATED_NOTIFICATION, true)
        worker.postMessage({ cmd: 'skipWaiting' })
      }
    })
  }

  let _trackInstalling = function(worker) {
    worker.addEventListener('statechange', function() {
      if (worker.state == 'installed') {
        _updateReady(worker)
      }
    })
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      window.location.reload()
    })

    if ('webpackHotUpdate' in window) {
      console.log('hotupdate')
    } else {
      navigator.serviceWorker.register('/service-worker.js').then((reg) => {
        if (!navigator.serviceWorker.controller) {
          return
        }

        if (reg.waiting) {
          _updateReady(reg.waiting)
          return
        }

        if (reg.installing) {
          _trackInstalling(reg.installing)
          return
        }

        reg.addEventListener('updatefound', function() {
          _trackInstalling(reg.installing)
        })

        setInterval(() => {
          reg.update()
        }, 60 * 60 * 1000)
      })
    }

    if (preferences.get(preferences.key.SHOW_UPDATED_NOTIFICATION, false)) {
      preferences.set(preferences.key.SHOW_UPDATED_NOTIFICATION, false)
      toastr.success('YAYATA has been updated. Click here to show the most recent changes!', 'Updated', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: true,
        onclick: function() {
          router.push({ name: 'changelog' })
        }
      })
    }
  })
}
