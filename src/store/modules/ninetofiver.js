import Vue from 'vue';
import moment from 'moment';
import * as types from '../mutation-types';

// initial state
const state = {
    user: null,
    leave_types: null,
    performance_types: null,
    contract_roles: null,
    users: null,
    timesheets: null,
    contracts: null,
    contract_users: null,
    locations: null,
}

// mutations
const mutations = {
    [types.NINETOFIVER_SET_USER](state, { user }) {
        state.user = user;
    },
    [types.NINETOFIVER_SET_LEAVE_TYPES](state, { leave_types }) {
        state.leave_types = leave_types;
    },
    [types.NINETOFIVER_SET_PERFORMANCE_TYPES](state, { performance_types }) {
        state.performance_types = performance_types;
    },
    [types.NINETOFIVER_SET_CONTRACT_ROLES](state, { contract_roles }) {
        state.contract_roles = contract_roles;
    },
    [types.NINETOFIVER_SET_USERS](state, { users }) {
        state.users = users;
    },
    [types.NINETOFIVER_SET_TIMESHEETS](state, { timesheets }) {
        state.timesheets = timesheets;
    },
    [types.NINETOFIVER_SET_CONTRACTS](state, { contracts }) {
        state.contracts = contracts;
    },
    [types.NINETOFIVER_SET_CONTRACT_USERS](state, { contract_users }) {
        state.contract_users = contract_users;
    },
    [types.NINETOFIVER_SET_LOCATIONS](state, { locations }) {
        state.locations = locations;
    },
}

// getters
const getters = {
    user: state => state.user,
    leave_types: state => state.leave_types,
    performance_types: state => state.performance_types,
    contract_roles: state => state.contract_roles,
    users: state => state.users,
    timesheets: state => state.timesheets,
    contracts: state => state.contracts,
    contract_users: state => state.contract_users,
    locations: state => state.locations,

    active_contracts: (state) => {
        if (state.contracts) {
            return state.contracts.filter(c => c.active)
        }
    },
    open_timesheets: (state) => {
        if (state.timesheets) {
            return state.timesheets.filter(ts => ts.status !== 'closed')
        }
    },
    closed_timesheets: (state) => {
        if (state.timesheets) {
            return state.timesheets.filter(ts => ts.status === 'closed')
        }
    },
    current_timesheet: (state) => {
        if (state.timesheets) {
            let year = new Date().getFullYear()
            let month = new Date().getMonth() + 1

            return state.timesheets.filter(ts => {
                return (ts.year == year) && (ts.month == month)
            })[0]
        }
    },

    navbar_items: state => [
        {
            label: 'Dashboard',
            route: {
                name: 'dashboard'
            }
        },
        {
            divider: true
        },
        {
            label: 'This week',
            route: {
                name: 'calendar_week_redirect'
            }
        },
        {
            label: 'This month',
            route: {
                name: 'calendar_month_redirect'
            }
        },
        {
            divider: true
        },
        {
            label: 'Timesheets',
            route: {
                name: 'timesheets'
            }
        },
        {
            label: 'Leave',
            route: {
                name: 'leave'
            }
        },
        {
            label: 'Colleagues',
            route: {
                name: 'colleagues'
            }
        },
        {
            label: 'Availability',
            route: {
                name: 'availability_redirect'
            }
        },
        {
            label: 'Import',
            route: {
                name: 'import'
            }
        },
        {
            label: 'FAQ',
            route: {
                name: 'faq'
            }
        }
    ],
}

// actions
const actions = {
    [types.NINETOFIVER_API_REQUEST](store, options = {}) {
        var oauth2State = store.rootState.oauth2
        var url = `${oauth2State.config.baseUrl}/api/v2${options.path}`
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

        if (options.full === undefined) {
            options.full = true
        }

        if (!options.params.page_size) {
            if (options.full) {
                options.params.page_size = 250
            }
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

                opts.headers.Authorization = `${oauth2State.token.tokenType} ${oauth2State.token.accessToken}`
            }
        }

        // Merge in custom options
        for (var key in options) {
            opts[key] = options[key];
        }

        return new Promise((resolve, reject) => {
            // Fetch the first page
            Vue.http(opts).then((response) => {
                // Calculate additional pages we need to fetch
                let addnPages = opts.full && response.data.count && (response.data.count > opts.params.page_size) ?
                    [...Array(Math.ceil(response.data.count / opts.params.page_size)).keys()].map(p => p + 1).slice(1) : []

                if (addnPages.length) {
                    let pagePromises = addnPages.map((page) => {
                        let pageOpts = JSON.parse(JSON.stringify(opts))
                        pageOpts.params.page = page
                        return Vue.http(pageOpts)
                    })

                    Promise.all(pagePromises).then((responses) => {
                        response.data.results = response.data.results.concat.apply(response.data.results, responses.map(r => r.data.results))
                        resolve(response)
                    })
                } else {
                    resolve(response)
                }
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

    [types.NINETOFIVER_RELOAD_USER](store, options = {}) {
        options.path = '/me/';

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                store.commit(types.NINETOFIVER_SET_USER, {
                    user: res.data
                })
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    },

    [types.NINETOFIVER_RELOAD_LEAVE_TYPES](store, options = {}) {
        options.path = '/leave_types/';

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {
                store.commit(types.NINETOFIVER_SET_LEAVE_TYPES, {
                    leave_types: res.data.results
                });
                resolve(res);
            }, (res) => {
                reject(res);
            });
        });
    },

    [types.NINETOFIVER_RELOAD_PERFORMANCE_TYPES](store, options = {}) {
        options.path = '/performance_types/';

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {
                store.commit(types.NINETOFIVER_SET_PERFORMANCE_TYPES, {
                    performance_types: res.data.results
                });
                resolve(res);
            }, (res) => {
                reject(res);
            });
        });
    },

    [types.NINETOFIVER_RELOAD_CONTRACT_ROLES](store, options = {}) {
        options.path = '/contract_roles/';

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {
                store.commit(types.NINETOFIVER_SET_CONTRACT_ROLES, {
                    contract_roles: res.data.results
                });
                resolve(res);
            }, (res) => {
                reject(res);
            })
        });
    },

    [types.NINETOFIVER_RELOAD_USERS](store, options = {}) {
        options.path = '/users/';
        options.params = {
            order_by: 'first_name,last_name',
        }

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

    [types.NINETOFIVER_RELOAD_CONTRACTS](store, options = {}) {
        options.path = '/contracts/'

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                store.commit(types.NINETOFIVER_SET_CONTRACTS, {
                    contracts: res.data.results
                });
                resolve(res);
            }, (res) => {
                reject(res);
            })
        });
    },

    [types.NINETOFIVER_RELOAD_CONTRACT_USERS](store, options = {}) {
        options.path = '/contract_users/';

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                store.commit(types.NINETOFIVER_SET_CONTRACT_USERS, {
                    contract_users: res.data.results
                });
                resolve(res);
            }, (res) => {
                reject(res);
            })
        });
    },

    async [types.NINETOFIVER_RELOAD_TIMESHEETS](store, options = {}) {
        options.path = '/timesheets/'
        options.params = {}
        options.params['order_by'] = 'year,month'

        let res = await store.dispatch(types.NINETOFIVER_API_REQUEST, options)

        store.commit(types.NINETOFIVER_SET_TIMESHEETS, {
            timesheets: res.data.results
        })
    },

    [types.NINETOFIVER_RELOAD_LOCATIONS](store, options = {}) {
        options.path = '/locations/'
        options.params = {}

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                store.commit(types.NINETOFIVER_SET_LOCATIONS, {
                    locations: res.data.results
                })
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    },
}

export default {
    state,
    getters,
    mutations,
    actions,
}
