import store from './store'
import * as types from './store/mutation-types'

const key = {
    CALENDAR_SHOW_NO_WORK: 'calendar_show_no_work',
}


const set = (key, value) => {
    store.commit(types.PREFERENCES_SET_KEY, {
        key: key,
        value: value
    })
}

const get = (key, defaultValue = null) => {
    return store.getters.preferences[key] || defaultValue
}


export default {
    set,
    get,
    key,
}
