import Vue from 'vue'
import * as types from '../mutation-types'

// initial state
const state = {
}

// mutations
const mutations = {
  // [types.OAUTH2_CONFIGURE] (state, { baseUrl, clientId, clientSecret }) {
  //   state.config.baseUrl = baseUrl
  //   state.config.clientId = clientId
  //   state.config.clientSecret = clientSecret
  // },
  //
  // [types.OAUTH2_SET_TOKEN] (state, { accessToken, refreshToken, tokenType, expiresIn }) {
  //   state.token.accessToken = accessToken
  //   state.token.refreshToken = refreshToken
  //   state.token.tokenType = tokenType
  //
  //   var expiresAt = new Date()
  //   expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn)
  //   state.token.expiresAt = expiresAt
  //
  //   state.authenticated = (
  //     state.token.accessToken &&
  //     state.token.refreshToken &&
  //     state.token.tokenType &&
  //     state.token.expiresAt
  //   )
  // },
  //
  // [types.OAUTH2_SET_AUTHENTICATED] (state, { authenticated }) {
  //   state.authenticated = authenticated
  // }
}

// actions
const actions = {
  [types.NINETOFIVER_API_REQUEST] (store, options = {}) {
    if (!options.method) {
      options.method = 'GET'
    }

    if (!options.path) {
      options.path = '/'
    }

    if (!options.params) {
      options.params = {}
    }

    var oauth2State = store.rootState.oauth2
    var url = `${oauth2State.config.baseUrl}/api/v1${options.path}`
    var opts = {
      url: url,
      headers: {},
    }

    // If we are authenticated, add the correct authorization header
    // if required
    if (!options.anonymous) {
      if (oauth2State.authenticated) {
        // If our token has expired, refresh the token before trying again
        if ((new Date(oauth2State.token.expiresAt)).getTime() <= (new Date()).getTime()) {
          return new Promise((resolve, reject) => {
            store.dispatch(types.OAUTH2_REFRESH_TOKEN, {}).then(() => {
              store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                resolve(res)
              }, (res) => {
                reject(res)
              })
            }, (res) => {
              reject(res)
            })
          })
        }

        opts.headers.authorization = `${oauth2State.token.tokenType} ${oauth2State.token.accessToken}`
      }
    }

    // Merge in custom options
    for (var key in options) {
      opts[key] = options[key];
    }

    return new Promise((resolve, reject) => {
      Vue.http(opts).then((response) => {
        resolve(response)
      }, (response) => {
        // If we get a 401, assume this is due an expired token which
        // we should refresh before trying again
        if (response.status == 401) {
          store.dispatch(types.OAUTH2_REFRESH_TOKEN, {}).then(() => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
              resolve(res)
            }, (res) => {
              reject(res)
            })
          }, () => {
            reject(response)
          })
        } else {
          reject(response)
        }
      })
    })
  }
}

export default {
  state,
  mutations,
  actions,
}
