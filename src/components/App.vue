<template lang="pug">
div(
  id='app'
  class='container-fluid'
)
  .application-wrapper
    .sidebar-wrapper
      .row
        .col-md-12
          router-link(
            :to='{ name: "home" }'
          )
            img.logo(class='card-img-top img-fluid px-1 pt-2' src='../assets/img/logo_text.svg')
      .row
        .col-sm-8.offset-xs-1
          nav
            router-link(:to='{ name: "timesheets" }')
              h3 Timesheets 
              p.small.hidden-md-down All open timesheets
            router-link(:to='{ name: "contracts" }')
              h3 Contracts
              p.small.hidden-md-down What am I working on
            router-link(:to='{ name: "leaves" }')
              h3 Leaves
              p.small.hidden-md-down Sickness / Vacation
            router-link(:to='{ name: "colleagues" }')
              h3 Colleagues
              p.small.hidden-md-down The weirdos I work with
            router-link(:to='{ name: "companies" }')
              h3 Companies
              p.small.hidden-md-down Overview of clients
            router-link(:to='{ name: "calendar_month_redirect" }')
              h3 Calendar
              p.small.hidden-md-down Monthly overview

    .row
      navbar
    .main-app
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
      store.dispatch(types.NINETOFIVER_RELOAD_USER).then(() => {
        if (!store.getters.holidays) 
          store.dispatch(types.NINETOFIVER_RELOAD_HOLIDAYS);
        if (!store.getters.leave_types)
          store.dispatch(types.NINETOFIVER_RELOAD_LEAVE_TYPES);
        if (!store.getters.performance_types)
          store.dispatch(types.NINETOFIVER_RELOAD_PERFORMANCE_TYPES);
        if (!store.getters.employment_contract_types)
          store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACT_TYPES);
        if (!store.getters.contract_groups)
          store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_GROUPS);
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
        if(!store.getters.upcoming_leaves)
          store.dispatch(types.NINETOFIVER_RELOAD_UPCOMING_LEAVES);

      });
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

.logo{
  margin: 0 auto;
  display: block;
  max-width: 150px;
  overflow: hidden;
  padding-bottom: 30px;
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

.application-wrapper {
    padding-left: 200px;
}

.sidebar-wrapper {
    z-index: 1000;
    position: fixed;
    left: 200px;
    width: 200px;
    height: 100%;
    margin-left: -200px;
    overflow-y: auto;
    background: white;
    -webkit-transition: all 0.5s ease;
    -moz-transition: all 0.5s ease;
    -o-transition: all 0.5s ease;
    transition: all 0.5s ease;
}
</style>
