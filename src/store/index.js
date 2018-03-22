import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import * as actions from './actions'
import * as getters from './getters'
import oauth2 from './modules/oauth2'
import preferences from './modules/preferences'
import ninetofiver from './modules/ninetofiver'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  modules: {
    oauth2,
    ninetofiver,
    preferences,
  },
  strict: debug,
  plugins: [
    createPersistedState({
      key: 'yayata-state',
      paths: [
        'oauth2',
        'preferences',
      ],
    }),
  ],
})
