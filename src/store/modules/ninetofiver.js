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

  //Global props, more likely to change
  contract_groups: null,
  companies: null,

  //User specific & prone to frequent change outside of this session
  timesheets: null,
  contracts: null,
  contract_durations: null,
  contract_users: null,
  monthly_activity_performances: null,
  work_schedule: null,
  upcoming_leaves: null,

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
  [types.NINETOFIVER_SET_HOLIDAYS] (state, { holidays }) {
    state.holidays = holidays;
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
  },
  [types.NINETOFIVER_SET_UPCOMING_LEAVES] (state, { upcoming_leaves }) {
    state.upcoming_leaves = upcoming_leaves;
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
  companies: state => state.companies,

  //User specific
  timesheets: state => state.timesheets,
  contracts: state => {
    if(state.contracts && state.companies ) {
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
          total_duration: parseFloat(x.hours_spent)
        };
      });
    }
      
  },
  contract_users: state => state.contract_users,
  monthly_activity_performances: state => state.monthly_activity_performances,
  work_schedule: state => state.work_schedule,
  upcoming_leaves: state => state.upcoming_leaves,

  //Predefined
  leave_statuses: state => state.leave_statuses,
  week_formatting: state => state.week_formatting,

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

  [types.NINETOFIVER_RELOAD_HOLIDAYS] (store, options = {}) {

    options.path = '/holidays/';
    
    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        options
      ).then((res) => {
        store.commit(types.NINETOFIVER_SET_HOLIDAYS, {
          holidays: res.data.results
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

    options.path = '/my_contracts/';

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
        timesheet__month: new Date().getMonth() + 1
      };
    } else {
      options.params['timesheet__year'] = new Date().getFullYear();
      options.params['timesheet__month'] = new Date().getMonth() + 1;
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
  },


  [types.NINETOFIVER_RELOAD_UPCOMING_LEAVES] (store, options = {}) {

    options.path = '/my_leaves/';

    if(!options.params) {
      var today = new Date();

      options.params = {
        leavedate__gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      };
    } else {
      options.params['leavedate__gte'] = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    }

    function leaveSorter(val) {
      return val.sort(function(a, b) {
        a = a['leave_start'].toDate();
        b = b['leave_end'].toDate();

        return a > b ? -1 : (a < b ? 1 : 0);
      });      
    }

    return new Promise((resolve, reject) => {
      store.dispatch(
        types.NINETOFIVER_API_REQUEST, 
        options
      ).then((res) => {

        //Converts the start / end datetime from strings to actual JS datetimes
        res.data.results.forEach(lv => {
          lv.leavedate_set.forEach(ld => {
            ld.starts_at = moment(ld.starts_at, 'YYYY-MM-DD HH:mm:ss');
            ld.ends_at = moment(ld.ends_at, 'YYYY-MM-DD HH:mm:ss');
          });
          
          lv['leave_start'] = lv.leavedate_set[0].starts_at;
          lv['leave_end'] = lv.leavedate_set[lv.leavedate_set.length-1].ends_at;
        });

        store.commit(types.NINETOFIVER_SET_UPCOMING_LEAVES, {
          upcoming_leaves: leaveSorter(res.data.results).reverse()
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
