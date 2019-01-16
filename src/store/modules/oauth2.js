import Vue from 'vue'
import * as types from '../mutation-types'

// initial state
const state = {
  config: {
    clientId: null,
    baseUrl: null,
  },
  token: {
    accessToken: null,
    refreshToken: null,
    tokenType: null,
    expiresAt: null,
  },
  authenticated: false,
  refreshing: false,
}

// mutations
const mutations = {
  [types.OAUTH2_CONFIGURE] (state, { baseUrl, clientId }) {
    state.config.baseUrl = baseUrl
    state.config.clientId = clientId
  },

  [types.OAUTH2_SET_TOKEN] (state, { accessToken, refreshToken, tokenType, expiresIn }) {
    state.token.accessToken = accessToken
    state.token.refreshToken = refreshToken
    state.token.tokenType = tokenType

    var expiresAt = new Date()
    expiresAt.setTime(expiresAt.getTime() + (expiresIn * 1000))
    state.token.expiresAt = expiresAt

    state.authenticated = !!(
      state.token.accessToken &&
      state.token.refreshToken &&
      state.token.tokenType &&
      state.token.expiresAt
    )
  },

  [types.OAUTH2_SET_AUTHENTICATED] (state, { authenticated }) {
    state.authenticated = authenticated
  },

  [types.OAUTH2_SET_REFRESHING] (state, { refreshing }) {
    state.refreshing = refreshing
  }
}

// actions
const actions = {
  [types.OAUTH2_GET_TOKEN] (store, { username, password }) {
    return new Promise((resolve, reject) => {
      Vue.http.post(store.state.config.baseUrl + '/oauth/v2/token/', {
        grant_type: 'password',
        client_id: store.state.config.clientId,
        username: username,
        password: password,
      }, {
        emulateJSON: true,
      }).then((response) => {
        store.commit(types.OAUTH2_SET_TOKEN, {
          accessToken: response.body.access_token,
          refreshToken: response.body.refresh_token,
          tokenType: response.body.token_type,
          expiresIn: response.body.expires_in,
        })

        resolve(response)
      }, (response) => {
        reject(response)
      });
    })
  },

  [types.OAUTH2_REFRESH_TOKEN] (store) {
    let refreshing = store.state.refreshing

    if (refreshing) {
      return new Promise((resolve, reject) => {
        refreshing.then((res) => {
          resolve(res)
        }, (err) => {
          reject(err)
        })
      })
    }

    let refresher = new Promise((resolve, reject) => {
      Vue.http.post(store.state.config.baseUrl + '/oauth/v2/token/', {
        grant_type: 'refresh_token',
        client_id: store.state.config.clientId,
        refresh_token: store.state.token.refreshToken,
      }, {
        emulateJSON: true,
      }).then((response) => {
        store.commit(types.OAUTH2_SET_TOKEN, {
          accessToken: response.body.access_token,
          refreshToken: response.body.refresh_token,
          tokenType: response.body.token_type,
          expiresIn: response.body.expires_in,
        })
        store.commit(types.OAUTH2_SET_REFRESHING, { refreshing: false })
    
        resolve(response)
      }, (response) => {
        // If we fail to refresh our token, clear all auth state..
        store.commit(types.OAUTH2_SET_TOKEN, {})
        store.commit(types.OAUTH2_SET_REFRESHING, { refreshing: false })

        reject(response)
      });
    })
    store.commit(types.OAUTH2_SET_REFRESHING, { refreshing: refresher })

    return refresher
  },
}

export default {
  state,
  mutations,
  actions,
}
