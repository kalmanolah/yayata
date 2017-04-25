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
            router-link(:to='{ name: "calendar_month_redirect" }')
              h3 Calendar
              p.small Get monthly overview

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


.popover-enter-active {
  transition: all .3s ease-in-out;
}

.popover-leave-active {
  transition: all .3s ease-in-out;
}

.popover-enter,
.popover-leave-active {
  opacity: 0;
  transform: translateX(10px);
}

.popover {
  /*popover container*/
  display: inline-block;
  position: relative;
  width: 100%;
  border: 0px;
  margin: 0px;
  padding: 0px;
  z-index: 5;

  button {
    width: 100%;
    margin: -4px;
    z-index: 5;
  }

}

.popover__content {
  /*Style of hidden popover content*/
  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 6px 6px rgba(16, 16, 16, 0.04), 0 6px 6px rgba(0, 0, 0, 0.05);
  max-width: 70vw;
  padding: 10px;
  position: absolute;
  width: 300px;
  z-index: 1069;
}

.popover__content:hover {
  /*background-color: red;*/
}

.popover__text {
  /*Initially shown text*/
}

.popover__text:hover {

}

.popover__close-icon {
  cursor: pointer;
  display: inline-block;
  fill: #000;
  fill-opacity: .3;
  height: .9rem;
  position: absolute;
  right: 10px;
  stroke-width: 0;
  stroke: currentColor;
  width: .9em;
}


</style>
