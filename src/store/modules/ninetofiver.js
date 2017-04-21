import Vue from 'vue';
import moment from 'moment';
import * as types from '../mutation-types';

// initial state
const state = {
  user: null,
  holidays: null,

  //Global props, unlikely
  leave_types: null,
  performance_types: null,
  employment_contract_types: null,
  user_groups: null,

  //Global props, more likely to change
  contract_groups: null,
  companies: null,
  users: null,

  //User specific & prone to frequent change outside of this session
  timesheets: null,
  contracts: null,
  contract_durations: null,
  contract_users: null,
  monthly_activity_performances: null,
  work_schedule: null,

  //Predefined
  leave_statuses: ['PENDING', 'REJECTED', 'APPROVED', 'DRAFT'],
  group_names: ['Developer', 'Consultant', 'Project Manager', 'Support'],
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

  [types.NINETOFIVER_SET_USER_GROUPS] (state, { user_groups }) {
    state.user_groups = user_groups;
  },

  [types.NINETOFIVER_SET_COMPANIES] (state, { companies }) {
    state.companies = companies;
  },
  [types.NINETOFIVER_SET_USERS] (state, { users }) {
    state.users = users;
  },

  [types.NINETOFIVER_SET_TIMESHEETS] (state, { timesheets }) {
    state.timesheets = timesheets;
  },
  [types.NINETOFIVER_SET_CONTRACTS] (state, { contracts }) {
    state.contracts = contracts;
  },
  [types.NINETOFIVER_SET_CONTRACT_USERS] (state, { contract_users }) {
    state.contract_users = contract_users;
  },
  [types.NINETOFIVER_SET_MONTHLY_ACTIVITY_PERFORMANCES] (state, { monthly_activity_performances }) {
    state.monthly_activity_performances = monthly_activity_performances;
  },
  [types.NINETOFIVER_SET_WORK_SCHEDULE] (state, { work_schedule }) {
    state.work_schedule = work_schedule;
  }
}

// getters
const getters = {
  user: state => state.user,
  holidays: state => state.holidays,

  leave_types: state => state.leave_types,
  performance_types: state => state.performance_types,
  employment_contract_types: state => state.employment_contract_types,
  contract_groups: state => state.contract_groups,
  user_groups: state => state.user_groups,
  companies: state => state.companies,
  users: state => state.users,

  //User specific
  timesheets: state => state.timesheets,
  contracts: state => {
    if(!state.contracts || !state.companies )
      return null;
    else {
      return state.contracts.map(x => {
        return {
          id: x.id, 
          name: x.label, 
          type: x.type,
          display_label: x.display_label,
          description: x.description,
          performance_types: x.performance_types,
          contract_groups: x.contract_groups,
          active: x.active,
          customer: x.customer,
          company: x.company,
          projectName: x.name,
          customerName: state.companies.find(com => com.id == x.customer).name,
          companyName: state.companies.find(com => com.id == x.company).name,
          total_duration: x.hours_spent
        };
      });
    }
      
  },
  contract_users: state => state.contract_users,
  monthly_activity_performances: state => state.monthly_activity_performances,
  work_schedule: state => state.work_schedule,

  //Predefined
  leave_statuses: state => state.leave_statuses,
  week_formatting: state => state.week_formatting,
  group_names: state => state.group_names,

  //Calculated
  open_timesheet_count: state => { 
    if(state.timesheets) 
      return state.timesheets.length; 
  },
  contract_users_count: state => {
    if(state.contract_users)
      return state.contract_users.length;
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

    return new Promise  ((resolve, reject) => {
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

    options.path = '/services/my_user';
    
    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        options
      ).then((res) => {
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

    options.path = '/leave_types/';

    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        options
      ).then((res) => {

        store.commit(types.NINETOFIVER_SET_LEAVE_TYPES, {
          leave_types: res.data.results.map(x => {
            return { id: x.id, name: x.type, display_label: x.display_label }
          })
        });
        resolve(res);

      }, (res) => {
        reject(res);
      });
    });

  },


  [types.NINETOFIVER_RELOAD_PERFORMANCE_TYPES] (store, options = {}) {

    options.path = '/performance_types/';

    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        options
      ).then((res) => {

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

    options.path = '/employment_contract_types/';

    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        options
      ).then((res) => {

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

    options.path = '/contract_groups/';

    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        options
      ).then((res) => {

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

  [types.NINETOFIVER_RELOAD_USER_GROUPS] (store, options = {}) {

    return new Promise((resolve, reject) => {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/groups/'
      }).then((res) => {

        store.commit(types.NINETOFIVER_SET_USER_GROUPS, {
          user_groups: res.data.results
        });
        resolve(res);

      }, (res) => {
        reject(res);
      })
    });

  },

  [types.NINETOFIVER_RELOAD_COMPANIES] (store, options = {}) {

    options.path = '/companies/';

    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        options
      ).then((res) => {

        store.commit(types.NINETOFIVER_SET_COMPANIES, {
          companies: res.data.results
        });
        resolve(res);

      }, (res) => {
        reject(res);
      })
    });

  },

  [types.NINETOFIVER_RELOAD_USERS] (store, options = {}) {

    options.path = '/users/'

    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        options
      ).then((res) => {
        store.commit(types.NINETOFIVER_SET_USERS, {
          users: res.data.results
        });
        resolve(res);

      }, (res) => {
        reject(res);
      })
    });

  },

  [types.NINETOFIVER_RELOAD_TIMESHEETS] (store, options = {}) {

    options.path = '/my_timesheets/';

    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST,
        options
      ).then((res) => {

        //Filter out all future timesheets after today's month
        var today = moment();
        var timesheets = res.data.results.filter(x => {
          return ( 
            x.year < today.year() 
            || (x.year == today.year() && x.month <= today.month() + 1)
          )
        });

        store.commit(types.NINETOFIVER_SET_TIMESHEETS, {
          timesheets: timesheets
        });
        resolve(res);

      }, (res) => {
        reject(res);
      });
    });
  },


  [types.NINETOFIVER_RELOAD_CONTRACTS] (store, options = {}) {

    options.path = '/contracts/';

    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        options
      ).then((res) => {

        store.commit(types.NINETOFIVER_SET_CONTRACTS, {
          contracts: res.data.results
        });
        resolve(res);

      }, (res) => {
        reject(res);
      })
    });

  },


  [types.NINETOFIVER_RELOAD_CONTRACT_USERS] (store, options = {}) {

    options.path = '/contract_users/';

    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST,
        options
      ).then((res) => {

        store.commit(types.NINETOFIVER_SET_CONTRACT_USERS, {
          contract_users: res.data.results
        });
        resolve(res);

      }, (res) => {
        reject(res);
      });
    });

  },


  [types.NINETOFIVER_RELOAD_MONTHLY_ACTIVITY_PERFORMANCES] (store, options = {}) {

    options.path = '/my_performances/activity/';

    if(!options.params) {
      options.params = {
        timesheet__year: new Date().getFullYear(),
        timesheet__month: new Date().getMonth()
      };
    } else {
      options.params['timesheet__year'] = new Date().getFullYear();
      options.params['timesheet__month'] = new Date().getMonth();
    }

    return new Promise((resolve, reject) => {
      store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {

        store.commit(types.NINETOFIVER_SET_MONTHLY_ACTIVITY_PERFORMANCES, {
          monthly_activity_performances: res.data.results
        });
        resolve(res);

      }, (res) => {
        reject(res);
      });
    });

  },


  [types.NINETOFIVER_RELOAD_WORK_SCHEDULE] (store, options = {}) {

    options.path = '/my_workschedules/';

    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        options
      ).then((res) => {

        store.commit(types.NINETOFIVER_SET_WORK_SCHEDULE, {
          work_schedule: res.data.results
        });
        resolve(res);

      }, (res) => {
        reject(res);
      });
    });
  }
  
}

export default {
  state,
  getters,
  mutations,
  actions,
}
