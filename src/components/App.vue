<template lang="pug">
div(
  id='app'
  class='container-fluid p-0'
)
  div(class='row no-gutters application-wrapper')
    sidebar(class='col-auto d-none d-md-block')

    div(class='col')
      navbar
      div(class='container-fluid main-app')
        router-view(class='py-3' v-if='user')
</template>

<script>
import * as types from '../store/mutation-types';
import Navbar from './Navbar.vue';
import Sidebar from './Sidebar.vue';
import store from '../store';

export default {
  name: 'app',

  components: {
    navbar: Navbar,
    sidebar: Sidebar
  },

  created: () => {
    //Initialize constants
    if (!store.getters.user)
      store.dispatch(types.NINETOFIVER_RELOAD_USER).then(() => {
        if (!store.getters.leave_types)
          store.dispatch(types.NINETOFIVER_RELOAD_LEAVE_TYPES);
        if (!store.getters.performance_types)
          store.dispatch(types.NINETOFIVER_RELOAD_PERFORMANCE_TYPES);
        if (!store.getters.contract_groups)
          store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_GROUPS);
        if(!store.getters.contract_roles)
          store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_ROLES);
        if(!store.getters.user_groups)
          store.dispatch(types.NINETOFIVER_RELOAD_USER_GROUPS);
        if (!store.getters.employment_contract_types)
          store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACT_TYPES);
        if (!store.getters.companies)
          store.dispatch(types.NINETOFIVER_RELOAD_COMPANIES);
        if(!store.getters.work_schedules)
          store.dispatch(types.NINETOFIVER_RELOAD_WORK_SCHEDULES);
        date: moment()
      });
  },
  methods: {},

  computed: {
    user: () => {
      if(store.getters.user)
        return store.getters.user
    }
  },

  data () {
    return {
      picker: ''
    }
  },

}
</script>

<style lang="less">
@datepickerHeight: 228px;
@sidebar-width: 250px;
@background-color: #FFF;
@primary-color: #0aa6c9;

#app {
  overflow-x: hidden;
}

.container-fluid{
  background: @background-color;
}

.application-wrapper {
    height: 100vh;
}

.main-app {
}

.logo{
  margin: 0 auto;
  display: block;
  max-width: 150px;
  overflow: hidden;
  padding-bottom: 30px;
}

.card-top-blue{
  border-top: solid 3px @primary-color;
}

.card-top-red{
  border-top: solid 3px #FA5858;
}
.card-top-green{
  border-top: solid 3px #60C200;
}

.card-columns {
  margin-top: 1rem;
}
.navbar-yayata{
  border-radius: 0;
  background: #f3f0f0;
}

.card-shadow{
  box-shadow: rgba(0,0,0,.29) 0 0 4px 0;
}

.fixed {
  position: fixed;
}

.wrapper{
  position: relative;
}

.bottom {
  position: absolute;
  bottom: 0;
}

#container {
  margin-left: .5rem;
}

.pika-single {
  height: @datepickerHeight;
  border: 0;
}

#container>.pika-single>.pika-lendar {
  width: 100%;
}

.sidebar-wrapper {
    z-index: 1000;
    position: fixed;
    left: @sidebar-width;
    width: @sidebar-width;
    height: 100%;
    margin-left: -@sidebar-width;
    overflow-y: auto;
    overflow-x: hidden;
}
a {
  color: @primary-color;
}
a:hover {
  color: @primary-color;

}
.dropdown-menu {
  max-height: 70vh;
  overflow: auto;
}
.fade {
    display: inherit;
}

.rendered-markdown {
  > *:last-child {
    margin-bottom: 0
  }
}
</style>
