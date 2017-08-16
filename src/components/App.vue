<template lang="pug">
div(
  id='app'
  class='container-fluid'
)
  .row.application-wrapper
    //- sidebar
    .col-md-auto.sidebar
      .row
        .col
          router-link(
            :to='{ name: "home" }'
          )
            img.logo(class='card-img-top img-fluid px-1 pt-2' src='../assets/img/logo_text.svg')
      .row
        .col
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
            router-link(:to='{ name: "colleagues", params: { userId: "all"}}')
              h3 Colleagues
              p.small.hidden-md-down The weirdos I work with
            router-link(:to='{ name: "calendar_month_redirect" }')
              h3 Calendar
              p.small.hidden-md-down Monthly overview
            router-link(:to='{ name: "redmine" }')
              h3 Redmine
              p.small.hidden-md-down Time entries
      .row
        .bottom
          input#datepicker(type='hidden' ref='datepicker')
          #container(ref='container')
    //- content
    .col
      .container-fluid
        .row
          .col
            .main-app
              navbar
        .row
          .main-app
            router-view.p-3(v-if='user')
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
        if(!store.getters.calendar_selected_month)
          store.dispatch(types.NINETOFIVER_RELOAD_CALENDAR_SELECTED_MONTH);
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
          store.dispatch(types.NINETOFIVER_RELOAD_TIMESHEETS, {
            filter_future_timesheets: true
          });
        if (!store.getters.contracts)
          store.dispatch(types.NINETOFIVER_RELOAD_CONTRACTS);
        if (!store.getters.filtered_contracts){
          store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, {
            params: {
              contractuser__user__id: store.getters.user.id
            }
          });
        }
        if(!store.getters.contract_roles)
          store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_ROLES);
        if(!store.getters.contract_users)
          store.dispatch(types.NINETOFIVER_RELOAD_CONTRACT_USERS);
        if(!store.getters.monthly_activity_performances)
          store.dispatch(types.NINETOFIVER_RELOAD_MONTHLY_ACTIVITY_PERFORMANCES);
        if(!store.getters.all_monthly_activity_performances)
          store.dispatch(types.NINETOFIVER_RELOAD_ALL_MONTHLY_ACTIVITY_PERFORMANCES);
        if(!store.getters.user_work_schedule)
          store.dispatch(types.NINETOFIVER_RELOAD_USER_WORK_SCHEDULE);
        if(!store.getters.work_schedules)
          store.dispatch(types.NINETOFIVER_RELOAD_WORK_SCHEDULES);
        if(!store.getters.upcoming_leaves)
          store.dispatch(types.NINETOFIVER_RELOAD_UPCOMING_LEAVES);
        if(!store.getters.project_estimates)
          store.dispatch(types.NINETOFIVER_RELOAD_PROJECT_ESTIMATES);
        if(!store.getters.users)
          store.dispatch(types.NINETOFIVER_RELOAD_USERS);
        if(!store.getters.user_groups)
          store.dispatch(types.NINETOFIVER_RELOAD_USER_GROUPS);
        if(!store.getters.attachments)
          store.dispatch(types.NINETOFIVER_RELOAD_ATTACHMENTS);
        if(!store.getters.wherabouts)
          store.dispatch(types.NINETOFIVER_RELOAD_WHEREABOUTS);
        if(!store.getters.activity_performances)
          store.dispatch(types.NINETOFIVER_RELOAD_ACTIVITY_PERFORMANCES)
        if(!store.getters.employment_contracts)
          store.dispatch(types.NINETOFIVER_RELOAD_EMPLOYMENT_CONTRACTS, {
            params: {
              started_at__lte: moment().format('YYYY-MM-DD'),
              ended_at__isnull: 'True'
            }
          })
        date: moment()
      });
  },
  mounted: function() {
    var vm = this;
    this.picker = new Pikaday({
      field: this.$refs.datepicker,
      container: this.$refs.container,
      firstDay: 1,
      minDate: new Date(2000, 0, 1),
      maxDate: new Date(2020, 12, 31),
      yearRange: [2000, 2020],
      bound: false,
      format: 'D MMM YYYY',
      onSelect: function() {
        var date = this.getMoment();
        vm.$router.push({ name: 'calendar_week', params: { year: date.get('year'), week: date.get('isoWeek') }})
      }
    });

    // HACK WARING: pikaday added arrowkey support for accessability reasons, this is something we don't want however
    // as the pikaday is used to navigate. This would mean that whenever the user uses his arrowkeys after using the pikaday
    // he leaves his current page.
    // This feature is not not yet optional but will be in the future after the merge request that fixes this is accepted.
    document.removeEventListener('keydown', this.picker._onKeyChange);
    document.removeEventListener('keyup', this.picker._onKeyChange);
    document.removeEventListener('keyleft', this.picker._onKeyChange);
    document.removeEventListener('keyright', this.picker._onKeyChange);
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
.container-fluid{
  background: @background-color;
}

.application-wrapper {
    height: 100vh;
}

.main-app {
  padding-left: 1rem;
  padding-left: 0;
  // width: 100vw
}

.logo{
  margin: 0 auto;
  display: block;
  max-width: 150px;
  overflow: hidden;
  padding-bottom: 30px;
}

.sidebar {
  min-width: 100px
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

.filter-scrollable {
  max-height: 70vh;
}

.fixed {
  position: fixed;
}

.filter-form {
  width: 20%;
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
    background: white;
    -webkit-transition: all 0.5s ease;
    -moz-transition: all 0.5s ease;
    -o-transition: all 0.5s ease;
    transition: all 0.5s ease;
}
/*a {
  color: #0aa6c9;
}*/
</style>
