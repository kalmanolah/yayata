import Vue from 'vue'
import * as types from '../mutation-types'

// initial state
const state = {
  config: {
    clientId: null,
    clientSecret: null,
    baseUrl: null,
  },
  token: {
    accessToken: null,
    refreshToken: null,
    tokenType: null,
    expiresAt: null,
  },
  authenticated: false
}

// mutations
const mutations = {
  [types.OAUTH2_CONFIGURE] (state, { baseUrl, clientId, clientSecret }) {
    state.config.baseUrl = baseUrl
    state.config.clientId = clientId
    state.config.clientSecret = clientSecret
  },

  [types.OAUTH2_SET_TOKEN] (state, { accessToken, refreshToken, tokenType, expiresIn }) {
    state.token.accessToken = accessToken
    state.token.refreshToken = refreshToken
    state.token.tokenType = tokenType

    var expiresAt = new Date()
    expiresAt.setTime(expiresAt.getTime() + (expiresIn * 1000))
    state.token.expiresAt = expiresAt

    state.authenticated = (
      state.token.accessToken &&
      state.token.refreshToken &&
      state.token.tokenType &&
      state.token.expiresAt
    )
  },

  [types.OAUTH2_SET_AUTHENTICATED] (state, { authenticated }) {
    state.authenticated = authenticated
  }
}

// actions
const actions = {
  [types.OAUTH2_GET_TOKEN] (store, { username, password }) {
    return new Promise((resolve, reject) => {
      Vue.http.post(store.state.config.baseUrl + '/oauth/v2/token/', {
        grant_type: 'password',
        client_id: store.state.config.clientId,
        client_secret: store.state.config.clientSecret,
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
    return new Promise((resolve, reject) => {
      Vue.http.post(store.state.config.baseUrl + '/oauth/v2/token/', {
        grant_type: 'refresh_token',
        client_id: store.state.config.clientId,
        client_secret: store.state.config.clientSecret,
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

        resolve(response)
      }, (response) => {
        // If we fail to refresh our token, clear all auth state..
        store.commit(types.OAUTH2_SET_TOKEN, {})

        reject(response)
      });
    })
  },
}

export default {
  state,
  mutations,
  actions,
}
