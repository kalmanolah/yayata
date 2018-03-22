import Vue from 'vue'
import * as types from '../mutation-types'

// initial state
const state = {
  preferences: {}
}

// getters
const getters = {
  preferences: state => state.preferences
}

// mutations
const mutations = {
  [types.PREFERENCES_SET_KEY] (state, { key, value }) {
    state.preferences[key] = value
  },
}

// actions
const actions = {
}

export default {
  state,
  getters,
  mutations,
  actions,
}
