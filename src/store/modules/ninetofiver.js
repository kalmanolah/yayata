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
    contract_roles: null,
    companies: null,
    users: null,
    filtered_contracts: null,
    filtered_users: null,
    project_estimates: null,
    leaves: null,
    attachments: null,
    work_schedules: null,
    activity_performances: null,
    all_monthly_activity_performances: null,

    //User specific & prone to frequent change outside of this session
    redmine_time_entries: null,
    timesheets: null,
    contracts: null,
    contract_durations: null,
    contract_users: null,
    standby_performances: null,
    monthly_activity_performances: null,
    user_work_schedule: null,
    show_extra_info: null,
    upcoming_leaves: null,
    whereabouts: null,
    employment_contracts: null,
    month_info: null,
    leave_overview: null,

    //Predefined
    backend_base_url: null,
    timesheet_statuses: ['CLOSED', 'ACTIVE', 'PENDING'],
    leave_statuses: ['PENDING', 'REJECTED', 'APPROVED', 'DRAFT'],
    group_names: ['Developer', 'Consultant', 'Project Manager', 'Support'],
    contract_types: ['ConsultancyContract', 'ProjectContract', 'SupportContract'],
    whereabout_locations: ['Brasschaat', 'Gent', 'Home'],
    colleagues_filter: 'all',
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
    },
    main_leave_types: {
        'sick': '',
    },
    days: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
    },
    working_hours: {
        start: {
            hour: 9,
            minute: 0
        },
        end: {
            hour: 17,
            minute: 30
        },
        total: {
            hour: 8
        }
    },

    // ng
    my_active_contracts: null,
    my_contract_users: null,
    my_current_timesheet: null,
    my_current_month_info: null,
    my_open_timesheets: null,
    my_importable_performances: null,
}

// mutations
const mutations = {
    [types.NINETOFIVER_SET_USER](state, { user }) {
        state.user = user;
    },

    [types.NINETOFIVER_SET_ATTACHMENTS](state, { attachments }) {
        state.attachments = attachments;
    },

    [types.NINETOFIVER_SET_HOLIDAYS](state, { holidays }) {
        state.holidays = holidays;
    },

    [types.NINETOFIVER_SET_LEAVE_TYPES](state, { leave_types }) {
        state.leave_types = leave_types;
    },
    [types.NINETOFIVER_SET_PERFORMANCE_TYPES](state, { performance_types }) {
        state.performance_types = performance_types;
    },
    [types.NINETOFIVER_SET_EMPLOYMENT_CONTRACT_TYPES](state, { employment_contract_types }) {
        state.employment_contract_types = employment_contract_types;
    },

    [types.NINETOFIVER_SET_CONTRACT_GROUPS](state, { contract_groups }) {
        state.contract_groups = contract_groups;
    },

    [types.NINETOFIVER_SET_CONTRACT_ROLES](state, { contract_roles }) {
        state.contract_roles = contract_roles;
    },

    [types.NINETOFIVER_SET_USER_GROUPS](state, { user_groups }) {
        state.user_groups = user_groups;
    },

    [types.NINETOFIVER_SET_COMPANIES](state, { companies }) {
        state.companies = companies;
    },
    [types.NINETOFIVER_SET_USERS](state, { users }) {
        state.users = users;
    },
    [types.NINETOFIVER_SET_LEAVES](state, { leaves }) {
        state.leaves = leaves;
    },
    [types.NINETOFIVER_SET_FILTERED_USERS](state, { filtered_users }) {
        state.filtered_users = filtered_users;
    },

    [types.NINETOFIVER_SET_TIMESHEETS](state, { timesheets }) {
        state.timesheets = timesheets;
    },
    [types.NINETOFIVER_SET_CONTRACTS](state, { contracts }) {
        state.contracts = contracts;
    },
    [types.NINETOFIVER_SET_FILTERED_CONTRACTS](state, { filtered_contracts }) {
        state.filtered_contracts = filtered_contracts;
    },
    [types.NINETOFIVER_SET_PROJECT_ESTIMATES](state, { project_estimates }) {
        state.project_estimates = project_estimates;
    },
    [types.NINETOFIVER_SET_CONTRACT_USERS](state, { contract_users }) {
        state.contract_users = contract_users;
    },
    [types.NINETOFIVER_SET_MONTHLY_ACTIVITY_PERFORMANCES](state, { monthly_activity_performances }) {
        state.monthly_activity_performances = monthly_activity_performances;
    },
    [types.NINETOFIVER_SET_ALL_MONTHLY_ACTIVITY_PERFORMANCES](state, { all_monthly_activity_performances }) {
        state.all_monthly_activity_performances = all_monthly_activity_performances;
    },
    [types.NINETOFIVER_SET_WORK_SCHEDULES](state, { work_schedules }) {
        state.work_schedules = work_schedules;
    },
    [types.NINETOFIVER_SET_USER_WORK_SCHEDULE](state, { user_work_schedule }) {
        state.user_work_schedule = user_work_schedule;
    },
    [types.NINETOFIVER_SET_UPCOMING_LEAVES](state, { upcoming_leaves }) {
        state.upcoming_leaves = upcoming_leaves;
    },
    [types.NINETOFIVER_SET_WHEREABOUTS](state, { whereabouts }) {
        state.whereabouts = whereabouts
    },
    [types.NINETOFIVER_SET_EMPLOYMENT_CONTRACTS](state, { employment_contracts }) {
        state.employment_contracts = employment_contracts
    },
    [types.NINETOFIVER_SET_STANDBY_PERFORMANCES](state, { standby_performances }) {
        state.standby_performances = standby_performances
    },
    [types.NINETOFIVER_SET_ACTIVITY_PERFORMANCES](state, { activity_performances }) {
        state.activity_performances = activity_performances
    },
    [types.NINETOFIVER_SET_REDMINE_TIME_ENTRIES](state, { redmine_time_entries }) {
        state.redmine_time_entries = redmine_time_entries
    },
    [types.NINETOFIVER_SET_MONTH_INFO](state, { month_info }) {
        state.month_info = month_info
    },
    [types.NINETOFIVER_SET_LEAVE_OVERVIEW](state, { leave_overview }) {
        state.leave_overview = leave_overview
    },
    [types.NINETOFIVER_SET_BACKEND_BASE_URL](state, { backend_base_url }) {
        state.backend_base_url = backend_base_url
    },

    // ng
    [types.NINETOFIVER_SET_MY_ACTIVE_CONTRACTS](state, { my_active_contracts }) {
        state.my_active_contracts = my_active_contracts;
    },
    [types.NINETOFIVER_SET_MY_CONTRACT_USERS](state, { my_contract_users }) {
        state.my_contract_users = my_contract_users;
    },
    [types.NINETOFIVER_SET_MY_CURRENT_TIMESHEET](state, { my_current_timesheet }) {
        state.my_current_timesheet = my_current_timesheet;
    },
    [types.NINETOFIVER_SET_MY_CURRENT_MONTH_INFO](state, { my_current_month_info }) {
        state.my_current_month_info = my_current_month_info;
    },
    [types.NINETOFIVER_SET_MY_OPEN_TIMESHEETS](state, { my_open_timesheets }) {
        state.my_open_timesheets = my_open_timesheets;
    },
    [types.NINETOFIVER_SET_MY_IMPORTABLE_PERFORMANCES](state, { my_importable_performances }) {
        state.my_importable_performances = my_importable_performances;
    },
    [types.NINETOFIVER_SET_MY_CURRENT_WORK_SCHEDULE](state, { my_current_work_schedule }) {
        state.my_current_work_schedule = my_current_work_schedule;
    },
}

// getters
const getters = {
    user: state => state.user,
    holidays: state => state.holidays,
    backend_base_url: state => state.backend_base_url,

    whereabouts: state => state.whereabouts,
    leave_types: state => state.leave_types,
    attachments: state => state.attachments,
    performance_types: state => state.performance_types,
    employment_contract_types: state => state.employment_contract_types,
    contract_groups: state => state.contract_groups,
    contract_roles: state => state.contract_roles,
    user_groups: state => state.user_groups,
    companies: state => state.companies,
    users: state => state.users,
    leaves: state => state.leaves,
    filtered_users: state => state.filtered_users,
    employment_contracts: state => state.employment_contracts,
    activity_performances: state => state.activity_performances,
    standby_performances: state => state.standby_performances,
    all_monthly_activity_performances: state => state.all_monthly_activity_performances,
    month_info: state => state.month_info,
    leave_overview: state => state.leave_overview,
    project_estimates: state => {
        if (!state.project_estimates)
            return null;
        else {
            return state.project_estimates.map(x => {
                return {
                    id: x.id,
                    created_at: x.created_at,
                    updated_at: x.updated_at,
                    type: x.type,
                    display_label: x.display_label,
                    role: x.role,
                    project: x.project,
                    // Cast hours_estimated to number, gets converted to string.
                    hours_estimated: Number(x.hours_estimated)
                }
            });
        }
    },

    //User specific
    timesheets: state => state.timesheets,
    contracts: state => state.contracts,
    filtered_contracts: state => {
        if (!state.filtered_contracts || !state.companies)
            return null;
        else {
            return state.filtered_contracts.map(x => {
                return {
                    id: x.id,
                    name: x.name,
                    type: x.type,
                    display_label: x.display_label,
                    description: x.description,
                    performance_types: x.performance_types,
                    contract_groups: x.contract_groups,
                    contract_type: x.type,
                    active: x.active,
                    customer: x.customer,
                    company: x.company,
                    projectName: x.name,
                    start_date: x.starts_at,
                    end_date: x.ends_at,
                    project_estimate: x.hours_estimated,
                    redmine_id: x.redmine_id || null,
                    external_only: x.external_only,
                    attachments: x.attachments,
                    customerName: state.companies.find(com => com.id == x.customer.id).name,
                    companyName: state.companies.find(com => com.id == x.company.id).name,
                    total_duration: (x.hours_spent * 1)
                };
            });
        }
    },
    // Full contracts: merges contract, activity performances, contract users and attachments.
    full_contracts: state => {
        if (state.filtered_contracts && state.contract_users && state.all_monthly_activity_performances && state.attachments) {
            return state.filtered_contracts.map((c) => {

                // Calculate total hours allocated to project contract
                let total_hours_allocated = 0;
                if (c.type === 'ProjectContract') {
                    if (c.hours_estimated) {
                        c.hours_estimated.forEach((estimate) => {
                            total_hours_allocated += estimate[0];
                        });
                    }
                }

                // Calculate how many hours were spent this month
                let hours_spent_this_month = 0;
                state.all_monthly_activity_performances.forEach((maPerformance) => {
                    if (maPerformance.contract && (maPerformance.contract.id === c.id)) {
                        hours_spent_this_month += (maPerformance.duration * 1);
                    }
                });

                // Calculate hours left to fill in
                let hLeft = total_hours_allocated - c.hours_spent;
                let hours_left = hLeft >= 0 ? hLeft : 0;

                // Get the contract users
                let contract_users = [];
                state.contract_users.forEach((cu) => {
                    if (cu.contract.id === c.id) {
                        contract_users.push(cu);
                    }
                });

                // Get attachments if the contract has any
                let attachments = [];
                if (c.attachments.length > 0) {
                    state.attachments.forEach((a) => {
                        c.attachments.forEach((ca) => {
                            if (ca === a.id) {
                                attachments.push(a);
                            }
                        });
                    });
                }

                return {
                    id: c.id,
                    name: c.name,
                    display_label: c.display_label,
                    type: c.type,
                    description: c.description,
                    performance_types: c.performance_types,
                    contract_groups: c.contract_groups,
                    contract_type: c.type,
                    active: c.active,
                    customer: c.customer,
                    company: c.company,
                    projectName: c.name,
                    start_date: c.starts_at,
                    end_date: c.ends_at,
                    project_estimate: c.hours_estimated,
                    external_only: c.external_only,
                    customerName: state.companies.find(com => com.id == c.customer.id).name,
                    companyName: state.companies.find(com => com.id == c.company.id).name,
                    // CALCULATED:
                    total_hours_spent: c.hours_spent,
                    total_hours_allocated: total_hours_allocated,
                    contract_users: contract_users,
                    attachments: attachments,
                    hours_left: hours_left,
                    hours_spent_this_month: hours_spent_this_month
                }
            });
        }
    },
    contract_users: state => state.contract_users,
    monthly_activity_performances: state => state.monthly_activity_performances,
    work_schedules: state => state.work_schedules,
    user_work_schedule: state => state.user_work_schedule,
    show_extra_info: state => {
        if (!state.user) {
            return null;
        } else {
            // Return true if the user is a project manager.
            var show = true;
            state.user.groups.forEach((group) => {
                if (group.id === 3) {
                    show = true;
                }
            });
            return show;
        }
    },
    upcoming_leaves: state => state.upcoming_leaves,
    redmine_time_entries: state => state.redmine_time_entries,

    //Predefined
    whereabout_locations: state => state.whereabout_locations,
    leave_statuses: state => state.leave_statuses,
    timesheet_statuses: state => state.timesheet_statuses,
    week_formatting: state => state.week_formatting,
    group_names: state => state.group_names,
    contract_types: state => state.contract_types,
    colleagues_filter: state => state.colleagues_filter,
    days: status => state.days,
    working_hours: state => state.working_hours,
    main_leave_types: state => {
        if (state.leave_types) {

            // Parse & stringify to copy the object without references
            let mltypes = JSON.parse(JSON.stringify(state.main_leave_types));

            for (let mlt in state.main_leave_types) {
                let myRegExp = new RegExp(`(${mlt})`, "ig");

                for (let lt of state.leave_types) {
                    if (myRegExp.test(lt.name))
                        mltypes[mlt] = lt.id;
                }
            }

            return mltypes;
        }
    },

    contract_users_count: state => {
        if (state.contract_users)
            return state.contract_users.length;
    },

    // ng
    navbar_items: state => [
        {
            label: 'Dashboard',
            route: {
                name: 'dashboard'
            }
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
                name: 'colleagues_redirect'
            }
        },
        {
            label: 'Calendar',
            route: {
                name: 'calendar_redirect'
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
        }
    ],
    my_active_contracts: state => state.my_active_contracts,
    my_contract_users: state => state.my_contract_users,
    my_current_timesheet: state => state.my_current_timesheet,
    my_current_month_info: state => state.my_current_month_info,
    my_open_timesheets: state => state.my_open_timesheets,
    my_importable_performances: state => state.my_importable_performances,
    my_current_work_schedule: state => state.my_current_work_schedule,
}

// actions
const actions = {
    [types.NINETOFIVER_API_REQUEST](store, options = {}) {
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

        // if (!options.params.page_size) {
        //     options.params.page_size = 250
        // }

        if (options.full === undefined) {
            options.full = true
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
            Vue.http(opts).then((response) => {
                // If the results are paginated; get all pages.
                var next = options.full && response.body.next;
                var results = response.data.results;

                function getNext(next) {
                    return new Promise((resolve, reject) => {
                        opts['url'] = next;
                        Vue.http(opts).then(res => {
                            res.body.results.forEach(el => results.push(el));
                            if (res.body.next) {
                                next = res.body.next;
                                getNext(next).then(() => {
                                    resolve()
                                })
                            } else {
                                resolve();
                            }
                        });
                    });
                }
                if (next) {
                    getNext(next).then(() => {
                        response.data['results'] = results;
                        resolve(response)
                    });
                } else {
                    resolve(response);
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

    [types.NINETOFIVER_RELOAD_BACKEND_BASE_URL](store, options = {}) {
        let oauth2State = store.rootState.oauth2
        let url = `${oauth2State.config.baseUrl}/admin/ninetofiver`
        store.commit(types.NINETOFIVER_SET_BACKEND_BASE_URL, {
            backend_base_url: url
        });
    },

    [types.NINETOFIVER_RELOAD_ATTACHMENTS](store, options = {}) {

        options.path = '/attachments/';

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {
                store.commit(types.NINETOFIVER_SET_ATTACHMENTS, {
                    attachments: res.data.results
                })
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    },
    [types.NINETOFIVER_RELOAD_USER](store, options = {}) {
        options.path = '/services/my_user/';

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

    [types.NINETOFIVER_RELOAD_HOLIDAYS](store, options = {}) {

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


    [types.NINETOFIVER_RELOAD_LEAVE_TYPES](store, options = {}) {

        options.path = '/leave_types/';

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {

                store.commit(types.NINETOFIVER_SET_LEAVE_TYPES, {
                    leave_types: res.data.results.map(x => {
                        return { id: x.id, name: x.label, display_label: x.display_label }
                    })
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


    [types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACT_TYPES](store, options = {}) {

        options.path = '/employment_contract_types/';

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {

                store.commit(types.NINETOFIVER_SET_EMPLOYMENT_CONTRACT_TYPES, {
                    employment_contract_types: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            });
        });

    },


    [types.NINETOFIVER_RELOAD_CONTRACT_GROUPS](store, options = {}) {

        options.path = '/contract_groups/';

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {

                store.commit(types.NINETOFIVER_SET_CONTRACT_GROUPS, {
                    contract_groups: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            })
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

    [types.NINETOFIVER_RELOAD_MONTH_INFO](store, options = {}) {

        options.path = '/services/month_info/';
        if (!options.params)
            options.params = {}

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {

                store.commit(types.NINETOFIVER_SET_MONTH_INFO, {
                    month_info: res.data
                });
                resolve(res);

            }, (res) => {
                reject(res);
            }).catch((error) => {
                console.log('Error!')
            });
        });

    },

    [types.NINETOFIVER_RELOAD_LEAVE_OVERVIEW](store, options = {}) {
        let year = options.year ? options.year : moment().year()
        let month = options.month ? options.month : (moment().month() + 1)

        options.path = '/services/monthly_availability/';

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, {
                path: '/services/monthly_availability/',
                params: {
                    year: year,
                    month: month
                }
            }).then(res => {
                store.commit(types.NINETOFIVER_SET_LEAVE_OVERVIEW, {
                    leave_overview: res.data
                })
                resolve(res)
            }, res => {
                reject(res)
            })
        })
    },

    [types.NINETOFIVER_RELOAD_USER_GROUPS](store, options = {}) {

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

    [types.NINETOFIVER_RELOAD_COMPANIES](store, options = {}) {

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

    [types.NINETOFIVER_RELOAD_USERS](store, options = {}) {
        options.path = '/users/';
        options.params = {
            order_by: 'first_name,last_name',
            is_active: true,
            page_size: 250
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

    [types.NINETOFIVER_RELOAD_LEAVES](store, options = {}) {

        options.path = '/leaves/'

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {
                store.commit(types.NINETOFIVER_SET_LEAVES, {
                    leaves: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            })
        });

    },

    [types.NINETOFIVER_RELOAD_FILTERED_USERS](store, options = {}) {

        options.path = '/users/';

        if (!options.params) {
            options.params = {
                order_by: 'first_name'
            }
        }

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {
                store.commit(types.NINETOFIVER_SET_FILTERED_USERS, {
                    filtered_users: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            })
        });

    },

    [types.NINETOFIVER_RELOAD_PROJECT_ESTIMATES](store, options = {}) {

        options.path = '/project_estimates/'

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {
                store.commit(types.NINETOFIVER_SET_PROJECT_ESTIMATES, {
                    project_estimates: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            })
        });

    },

    [types.NINETOFIVER_RELOAD_TIMESHEETS](store, options = {}) {

        options.path = '/my_timesheets/';

        if (options.filter_future_timesheets) {
            options.params = {
                year__lte: moment().year(),
                month__lte: moment().month() + 1,
            };
        }

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then(async(res) => {
                let timesheets = res.data.results;
                await Promise.all(timesheets.map(async(timesheet) => {
                    await store.dispatch(types.NINETOFIVER_API_REQUEST, {
                        path: '/services/month_info/',
                        params: {
                            month: timesheet.month
                        }
                    }).then((res) => {
                        timesheet.hours_required = parseFloat(res.data.hours_required);
                        timesheet.hours_performed = parseFloat(res.data.hours_performed);
                    });
                })).then(() => {
                    store.commit(types.NINETOFIVER_SET_TIMESHEETS, {
                        timesheets: timesheets
                    });
                    resolve(res);
                });

            }, (res) => {
                reject(res);
            });
        });
    },


    [types.NINETOFIVER_RELOAD_CONTRACTS](store, options = {}) {

        options.path = '/contracts/';
        if (!options.params) {
            options.params = {}
        }
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


    [types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS](store, options = {}) {
        //  Check show_extra_info
        if (store.getters.show_extra_info !== null && !store.getters.show_extra_info) {
            options.path = '/my_contracts/'
        } else if (!options.path) {
            options.path = '/contracts/';
        }
        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {

                store.commit(types.NINETOFIVER_SET_FILTERED_CONTRACTS, {
                    filtered_contracts: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            })
        });

    },


    [types.NINETOFIVER_RELOAD_CONTRACT_USERS](store, options = {}) {

        options.path = '/contract_users/';
        if (!options.params) {
            options.params = {
                is_active: true
            }
        }

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

    [types.NINETOFIVER_RELOAD_ACTIVITY_PERFORMANCES](store, options = {}) {

        options.path = '/performances/activity/';

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {
                store.commit(types.NINETOFIVER_SET_ACTIVITY_PERFORMANCES, {
                    activity_performances: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            });
        });
    },

    [types.NINETOFIVER_RELOAD_ALL_MONTHLY_ACTIVITY_PERFORMANCES](store, options = {}) {
        let today = moment();
        options.path = '/performances/activity/';
        options.params = {
            timesheet__year: today.format('YYYY'),
            timesheet__month: today.format('MM')
        }

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {
                store.commit(types.NINETOFIVER_SET_ALL_MONTHLY_ACTIVITY_PERFORMANCES, {
                    all_monthly_activity_performances: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            });
        });
    },

    [types.NINETOFIVER_RELOAD_MONTHLY_ACTIVITY_PERFORMANCES](store, options = {}) {

        options.path = '/my_performances/activity/';

        if (!options.params) {
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

    [types.NINETOFIVER_RELOAD_STANDBY_PERFORMANCES](store, options = {}) {

        options.path = '/my_performances/standby/';

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {

                store.commit(types.NINETOFIVER_SET_STANDBY_PERFORMANCES, {
                    standby_performances: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            });
        });

    },

    [types.NINETOFIVER_RELOAD_WORK_SCHEDULES](store, options = {}) {

        options.path = '/work_schedules/';

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {

                store.commit(types.NINETOFIVER_SET_WORK_SCHEDULES, {
                    work_schedules: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            });
        });
    },
    [types.NINETOFIVER_RELOAD_USER_WORK_SCHEDULE](store, options = {}) {

        options.path = '/employment_contracts/';
        options.params = {
            user: options.user,
            is_active: 'True'
        }

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((response) => {

                store.dispatch(
                    types.NINETOFIVER_API_REQUEST, {
                        path: '/work_schedules/' + response.data.results[0].work_schedule + '/'
                    }
                ).then(res => {

                    store.commit(types.NINETOFIVER_SET_USER_WORK_SCHEDULE, {
                        user_work_schedule: res.data
                    });

                    resolve(res);
                }, res => {
                    reject(res);
                });

            }, (response) => {
                reject(response);
            });
        });
    },

    [types.NINETOFIVER_RELOAD_WHEREABOUTS](store, options = {}) {

        options.path = '/whereabouts/';

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {

                store.commit(types.NINETOFIVER_SET_WHEREABOUTS, {
                    whereabouts: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            });
        });
    },

    [types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACTS](store, options = {}) {

        options.path = '/employment_contracts/';

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {

                store.commit(types.NINETOFIVER_SET_EMPLOYMENT_CONTRACTS, {
                    employment_contracts: res.data.results
                });
                resolve(res);

            }, (res) => {
                reject(res);
            });
        });
    },

    [types.NINETOFIVER_RELOAD_UPCOMING_LEAVES](store, options = {}) {

        options.path = '/my_leaves/';

        if (!options.params) {
            var today = new Date();

            options.params = {
                leavedate__gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
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
                    lv['leave_end'] = lv.leavedate_set[lv.leavedate_set.length - 1].ends_at;
                });

                store.commit(types.NINETOFIVER_SET_UPCOMING_LEAVES, {
                    upcoming_leaves: leaveSorter(res.data.results).reverse()
                });
                resolve(res);

            }, (res) => {
                reject(res);
            });
        });
    },

    [types.NINETOFIVER_RELOAD_REDMINE_TIME_ENTRIES](store, options = {}) {

        options.path = '/services/time_entry_import/'

        return new Promise((resolve, reject) => {
            store.dispatch(
                types.NINETOFIVER_API_REQUEST,
                options
            ).then((res) => {
                store.commit(types.NINETOFIVER_SET_REDMINE_TIME_ENTRIES, {
                    redmine_time_entries: res.data
                });
                resolve(res);

            }, (res) => {
                reject(res);
            });
        });


    },

    // ng
    [types.NINETOFIVER_RELOAD_MY_ACTIVE_CONTRACTS](store, options = {}) {
        options.path = '/my_contracts/'
        options.params = {}
        options.params['active'] = true

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                store.commit(types.NINETOFIVER_SET_MY_ACTIVE_CONTRACTS, {
                    my_active_contracts: res.data.results
                });
                resolve(res);
            }, (res) => {
                reject(res);
            })
        });
    },

    [types.NINETOFIVER_RELOAD_MY_CONTRACT_USERS](store, options = {}) {
        options.path = '/my_contract_users/';

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                store.commit(types.NINETOFIVER_SET_MY_CONTRACT_USERS, {
                    my_contract_users: res.data.results
                });
                resolve(res);
            }, (res) => {
                reject(res);
            })
        });
    },

    [types.NINETOFIVER_RELOAD_MY_CURRENT_TIMESHEET](store, options = {}) {
        options.path = '/my_timesheets/'
        options.params = {}
        options.params['year'] = new Date().getFullYear()
        options.params['month'] = new Date().getMonth() + 1

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                store.commit(types.NINETOFIVER_SET_MY_CURRENT_TIMESHEET, {
                    my_current_timesheet: res.data.results.length ? res.data.results[0] : null
                })
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    },

    [types.NINETOFIVER_RELOAD_MY_CURRENT_MONTH_INFO](store, options = {}) {
        options.path = '/services/month_info/'
        options.params = {}
        options.params['year'] = new Date().getFullYear()
        options.params['month'] = new Date().getMonth() + 1

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                store.commit(types.NINETOFIVER_SET_MY_CURRENT_MONTH_INFO, {
                    my_current_month_info: res.data
                })
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    },

    [types.NINETOFIVER_RELOAD_MY_OPEN_TIMESHEETS](store, options = {}) {
        options.path = '/my_timesheets/'
        options.params = {}
        options.params['status!'] = 'closed'
        options.params['order_by'] = '-year,-month'

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                store.commit(types.NINETOFIVER_SET_MY_OPEN_TIMESHEETS, {
                    my_open_timesheets: res.data.results
                })
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    },

    [types.NINETOFIVER_RELOAD_MY_IMPORTABLE_PERFORMANCES](store, options = {}) {
        options.path = '/services/performance_import/'
        options.params = {}

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                store.commit(types.NINETOFIVER_SET_MY_IMPORTABLE_PERFORMANCES, {
                    my_importable_performances: res.data
                })
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    },

    [types.NINETOFIVER_RELOAD_MY_CURRENT_WORK_SCHEDULE](store, options = {}) {
        options.path = '/my_work_schedules/'
        options.params = {}
        options.params.current = true

        return new Promise((resolve, reject) => {
            store.dispatch(types.NINETOFIVER_API_REQUEST, options).then((res) => {
                store.commit(types.NINETOFIVER_SET_MY_CURRENT_WORK_SCHEDULE, {
                    my_current_work_schedule: res.data.results[0]
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
