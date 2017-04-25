<template lang="pug">
div(
  id='app'
  class='container-fluid'
)
  div.row
    div.col-md-2.sidebar.col-sm-4.hidden-print
      div.row
        div.col-md-8.offset-md-2
          router-link(
            :to='{ name: "home" }'
          )
            img(class='card-img-top img-fluid px-1 pt-2' src='../assets/img/logo_text.svg').logo
      div.row
        div.col-md-10.offset-md-1.col-sm-8
          nav
            router-link(:to='{ name: "timesheets" }')
              h3 Timesheets 
              p.small I said hey, what's going on
            router-link(:to='{ name: "calendar_month_redirect" }')
              h3 Calendar
              p.small It's a calendar, what more can I say
            router-link(:to='{ name: "contracts" }')
              h3 Contracts
              p.small What am I working on
            router-link(:to='{ name: "leaves" }')
              h3 Leaves
              p.small Sickness / Vacation
            router-link(:to='{ name: "colleagues" }')
              h3 Colleagues
              p.small The weirdos I work with
            router-link(:to='{ name: "companies" }')
              h3 Companies
              p.small Overview of clients
    div.col-md-10.offset-sm-3.offset-md-2
      div.row
        navbar
      div.main-app
        router-view
</template>

<script>
import * as types from '../store/mutation-types'
import Navbar from './Navbar.vue'
import store from '../store'

export default {
  name: 'app',
  components: {
    navbar: Navbar
  },
  created: () => {

    //Initialize constants
    if (!store.getters.user) 
      store.dispatch(types.NINETOFIVER_RELOAD_USER);
    if (!store.getters.users)
      store.dispatch(types.NINETOFIVER_RELOAD_USERS);
    if (!store.getters.leave_types)
      store.dispatch(types.NINETOFIVER_RELOAD_LEAVE_TYPES);
    if (!store.getters.performance_types)
      store.dispatch(types.NINETOFIVER_RELOAD_PERFORMANCE_TYPES);
    if (!store.getters.employment_contract_types)
      store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACT_TYPES);
    if (!store.getters.contract_groups)
      store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_GROUPS);
    if (!store.getters.user_groups)
      store.dispatch(types.NINETOFIVER_RELOAD_USER_GROUPS);
    if (!store.getters.companies)
      store.dispatch(types.NINETOFIVER_RELOAD_COMPANIES);
    if (!store.getters.timesheets)
      store.dispatch(types.NINETOFIVER_RELOAD_TIMESHEETS);
    if (!store.getters.contracts)
      store.dispatch(types.NINETOFIVER_RELOAD_CONTRACTS);
    if(!store.getters.contract_users)
      store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_USERS);
    if(!store.getters.monthly_activity_performances)
      store.dispatch(types.NINETOFIVER_RELOAD_MONTHLY_ACTIVITY_PERFORMANCES);
    if(!store.getters.work_schedule)
      store.dispatch(types.NINETOFIVER_RELOAD_WORK_SCHEDULE);
  },

  method: {},

  computed: {},

  data () {
    return {}
  }

}
</script>

<style lang="less">
.container-fluid{
  background: #FAFAFA;
}
.main-app {
  padding: 2rem 3rem;
}
.sidebar{
  background-color: white;
  height: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
}
.logo{
  margin: 0 auto;
  display: block;
}
.sidebar nav{
  h3{
    font-weight: 300;
  }
  margin-top: 30px;
  color: #398BCC;
}

.card-top-blue{
  border-top: solid 3px #398bcc;
}

.card-top-red{
  border-top: solid 3px #FA5858;
}
.card-top-green{
  border-top: solid 3px #60C200;
}

.navbar-yayata{
  border-radius: 0;
  background: #f3f0f0;
}

.card-shadow{
  box-shadow: rgba(0,0,0,.29) 0 0 4px 0;
}

.card-title{
  font-weight: 300;
  margin-top: 1rem;
}

.pre-scrollable {
  max-height: 70vh;
}
</style>
