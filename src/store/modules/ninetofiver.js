import Vue from 'vue'
import * as types from '../mutation-types'

// initial state
const state = {
  user: null,
  holidays: null,

  //Global props, CAN change, not likely
  leave_types: null,
  performance_types: null,
  employment_contract_types: null,

  //Global props, more likely to change
  contract_groups: null,
  companies: null,

  //User specific
  timesheets: null,
  contracts: null,

  //Predefined
  leave_statuses: ['PENDING', 'REJECTED', 'APPROVED', 'DRAFT'],
  week_formatting: {
    'workweek': {
      'start': 1,
      'end': 5
    },
    'weekend': {
      'start': 6,
      'end': 7
    },
    'fullweek': {
      'start': 1,
      'end': 7
    }
  }
}

// mutations
const mutations = {
  [types.NINETOFIVER_SET_USER] (state, { user }) {
    state.user = user;
  },

  [types.NINETOFIVER_SET_LEAVE_TYPES] (state, { leave_types }) {
    state.leave_types = leave_types;
  },
  [types.NINETOFIVER_SET_PERFORMANCE_TYPES] (state, { performance_types }) {
    state.performance_types = performance_types;
  },
  [types.NINETOFIVER_SET_EMPLOYMENT_CONTRACT_TYPES] (state, { employment_contract_types }) {
    state.employment_contract_types = employment_contract_types;
  },

  [types.NINETOFIVER_SET_CONTRACT_GROUPS] (state, { contract_groups }) {
    state.contract_groups = contract_groups;
  },
  [types.NINETOFIVER_SET_COMPANIES] (state, { companies }) {
    state.companies = companies;
  },

  [types.NINETOFIVER_SET_CONTRACTS] (state, { contracts }) {
    state.contracts = contracts;
  },
  [types.NINETOFIVER_SET_TIMESHEETS] (state, { timesheets }) {
    state.timesheets = timesheets;
  }
}

// actions
const actions = {
  [types.NINETOFIVER_API_REQUEST] (store, options = {}, ) {

    var oauth2State = store.rootState.oauth2
    var url = `${oauth2State.config.baseUrl}/api/v1${options.path}`
    var opts = {
      url: url,
      headers: {},
    }

    if (!options.method) {
      options.method = 'GET'
    }

    if (!options.path) {
      options.path = '/'
    }

    if (!options.params) {
      options.params = {}
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
        resolve(response);
      }, (response) => {

        // If we get a 401, assume this is due an expired token which
        // we should refresh before trying again
        if (response.status == 401) {
          store.dispatch(types.OAUTH2_REFRESH_TOKEN, {}).then(() => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
              resolve(res);
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
  },

  [types.NINETOFIVER_RELOAD_USER] (store, options = {}) {
    return new Promise((resolve, reject) => {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/services/my_user/'
      }).then((res) => {
        store.commit(types.NINETOFIVER_SET_USER, {
          user: res.data
        })
        resolve(res)
      }, (res) => {
        reject(res)
      })
    })
  },


  [types.NINETOFIVER_RELOAD_LEAVE_TYPES] (store, options = {}) {

    return new Promise((resolve, reject) => {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/leave_types/'
      }).then((res) => {

        store.commit(types.NINETOFIVER_SET_LEAVE_TYPES, {
          leave_types: res.data.results.map(x => {
            return { id: x.id, name: x.type }
          })
        });
        resolve(res);

      }, (res) => {
        reject(res);
      });
    });

  },


  [types.NINETOFIVER_RELOAD_PERFORMANCE_TYPES] (store, options = {}) {

    return new Promise((resolve, reject) => {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/performance_types/'
      }).then((res) => {

        store.commit(types.NINETOFIVER_SET_PERFORMANCE_TYPES, {
          performance_types: res.data.results.map(x => {
            return { id: x.id, name: x.label }
          })
        });
        resolve(res);

      }, (res) => {
        reject(res);
      });
    });

  },


  [types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACT_TYPES] (store, options = {}) {

    return new Promise((resolve, reject) => {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/employment_contract_types/'
      }).then((res) => {

        store.commit(types.NINETOFIVER_SET_EMPLOYMENT_CONTRACT_TYPES, {
          employment_contract_types: res.data.results.map(x => {
            return { id: x.id, name: x.label }
          })
        });
        resolve(res);

      }, (res) => {
        reject(res);
      });
    });

  },


  [types.NINETOFIVER_RELOAD_CONTRACT_GROUPS] (store, options = {}) {

    return new Promise((resolve, reject) => {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/contract_groups/'
      }).then((res) => {

        store.commit(types.NINETOFIVER_SET_CONTRACT_GROUPS, {
          contract_groups: res.data.results.map(x => {
            return { id: x.id, name: x.label }
          })
        });
        resolve(res);

      }, (res) => {
        reject(res);
      })
    });

  },


  [types.NINETOFIVER_RELOAD_COMPANIES] (store, options = {}) {

    return new Promise((resolve, reject) => {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/companies/'
      }).then((res) => {

        store.commit(types.NINETOFIVER_SET_COMPANIES, {
          companies: res.data.results.map(x => {
            return { id: x.id, name: x.name }
          })
        });
        resolve(res);

      }, (res) => {
        reject(res);
      })
    });

  },


  [types.NINETOFIVER_RELOAD_CONTRACTS] (store, options = {}) {

    return new Promise((resolve, reject) => {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_contracts/'
      }).then((res) => {

        store.commit(types.NINETOFIVER_SET_CONTRACTS, {
          contracts: res.data.results.map(x => {
            return { 
              id: x.id, 
              name: x.label, 
              customer: state.companies.find(x => x.id === x.customer).name
            }
          })
        });
        resolve(res);

      }, (res) => {
        reject(res);
      })
    });

  },


  [types.NINETOFIVER_RELOAD_TIMESHEETS] (store, options = {}) {

    return new Promise((resolve, reject) => {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_timesheets/'
      }).then((res) => {

        var today = new Date();
        var timesheets = res.data.results.filter(x => {
          return ( 
            x.year < today.getYear() 
            || (x.year == today.getYear() && x.month <= today.getMonth())
          )
        });

        store.commit(types.NINETOFIVER_SET_TIMESHEETS, {
          timesheets: timesheets.map(x => {
              return { id: x.id, month: x.month, year: x.year, closed: x.closed }
          })
        });
        resolve(res);

      }, (res) => {
        reject(res);
      })
    });

  },

export default {
  state,
  mutations,
  actions,
}
