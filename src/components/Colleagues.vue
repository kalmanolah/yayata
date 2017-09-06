<template lang="pug">
div.row
  .col
    //- Header
    .row
      .col
        h3 Colleagues
          .btn.btn-outline-primary.pull-right(@click='showFilter = !showFilter') 
            i.fa(aria-hidden='true', :class="showFilter ? 'fa-angle-double-right' : 'fa-filter'")
        p.subtitle Overview of all colleagues

    //- Advanced filter panel
    .row
      #colleagues_filter.col.order-12(v-if='showFilter')
        ColleaguesFilterForm
      //- Main page
      #colleagues.order-1(:class='showFilter ? "col-9" : "col"')
        .row
          .col-8
            .btn-group(role='group' aria-label='Button group with nested dropdown')
              button.btn.btn-outline-dark(v-if='userId === "all"' type='button' @click='setSortByGroup("all")') All
              button.btn.btn-outline-dark(v-else type='button' @click='reloadPage()') All
              
              .btn-group(role='group')
                button.btn.btn-outline-dark.dropdown-toggle#btnGroupDrop(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ groupLabel }}
                .dropdown-menu(aria-labelledby='btnGroupDrop')
                  a.dropdown-item(v-for='group in groups' @click='setSortByGroup(group)') {{ group.name }}

          .col-lg-4
            .input-group
              span.input-group-addon Search
              input(type='text', class='form-control', placeholder='Name, email, ...', v-model='query')

        .row
          .col-sm-12
            div#user-table(v-if='filtered_users')
              .alert.alert-warning(v-if='noResultsFound') No results found
              table.table.table-striped
                thead#user-table-head
                  tr
                    th(@click='setTableSort("first_name")') Name
                      .pull-right.fa.fa-sort(aria-hidden='true')
                    th(@click='setTableSort("username")') Username
                      .pull-right.fa.fa-sort(aria-hidden='true')
                    th(@click='setTableSort("email")') Email
                      .pull-right.fa.fa-sort(aria-hidden='true')
                    th(@click='setTableSort("userinfo__birth_date")') Birthdate
                      .pull-right.fa.fa-sort(aria-hidden='true')
                    th(@click='setTableSort("userinfo__country")') Country
                      .pull-right.fa.fa-sort(aria-hidden='true')
                    th(@click='setTableSort("userinfo__join_date")') Joindate
                      .pull-right.fa.fa-sort(aria-hidden='true')
                tbody
                  tr(v-for='(user, index) in requestedUsers')
                    td {{ user.first_name }} {{ user.last_name }} 
                      span.ml-1.badge.pull-right(v-for='group in user.groups' v-bind:class='determineBadgeColor(group)') {{ group | getGroupAsString }}
                    td 
                      span {{ user.username }}
                    td
                      span {{ user.email }}
                      a.pull-right(:href="`mailto:${user.email}`")
                        i.fa.fa-envelope

                    td
                      span(v-if='user.userinfo && user.userinfo.birth_date') {{ user.userinfo.birth_date | moment('DD/MM/YYYY') }}
                      span(v-else) &nbsp;
                    td 
                      span(v-if='user.userinfo && user.userinfo.country') {{ user.userinfo.country }}
                      span(v-else) &nbsp;
                    td
                      span(v-if='user.userinfo && user.userinfo.join_date') {{ user.userinfo.join_date | moment('DD/MM/YYYY') }}
                      span(v-else) &nbsp;

        .row(v-if='users && users.length === 0')
          .col-md-3
          .col-md-6
            .text-md-center.alert.alert-info <strong> No colleagues found! </strong>
          .col-md-3

</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';
import Vue from 'vue';
import ColleaguesFilterForm from './forms/ColleaguesFilterForm.vue';

var data = {
  sortBy: 'all',
  tableSort: '',
  groupLabel: 'group',
  query: '',
  showFilter: false
}

export default {
  name: 'colleagues',
  components: {
    ColleaguesFilterForm,
  },

  data () {
    return data;
  },

  created: () => {
    store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_USERS, {
      params: {
        is_active: true,
        order_by: 'first_name'
      }
    });
  },

  computed: {
    noResultsFound: function() {
      return this.filtered_users.length === 0;
    },

    storeUser: function() {
      if(store.getters.user){
        return store.getters.user;
      }
    },

    userId: function() {
      return this.$route.params.userId;
    },

    filtered_users: function(){
      if(store.getters.filtered_users)
        return store.getters.filtered_users
    },

    groups: function() {
      if(store.getters.user_groups)
        return store.getters.user_groups
    },

    //Shows selected user by default or all as a fallback
    requestedUsers: function() {
      if(store.getters.users) {
        return this.userId == 'all' ? this.queryUsers : [store.getters.users.find(u => u.id == this.userId)];
      }
    },

    // Filter users by input
    queryUsers: function(){
      if(store.getters.filtered_users && this.sortedUsers && this.userId === store.getters.colleagues_filter){
        let query = this.query;
        
        return this.sortedUsers.filter( user => {
          user.fullname = user.first_name + ' ' + user.last_name;
          // Fields to filter on
          return user.email.toLowerCase().indexOf(query.toLowerCase()) !== -1
                || user.fullname.toLowerCase().indexOf(query.toLowerCase()) !== -1
                || user.username.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
      } else {
         return this.sortedUsers.filter( user => {
          // Fields to filter on
          return user.id === this.userId;
        });
      }
    },

    // Sort users by group
    sortedUsers: function() {
      if(this.filtered_users && this.sortBy !== store.getters.colleagues_filter){
        let users = [];

        console.log( this.sortBy );

        this.filtered_users.forEach(user => {
          user.groups.forEach( group => {
              if(group.id === this.sortBy)
                users.push(user);
            });
        });
        return users;
      }

      return this.filtered_users;
    },
  },

  methods: {

    // Sorts the table
    setTableSort: function(value) {
      this.tableSort = (this.tableSort === value) ? '-' + value : value;

      var options = {
        path: '/users/',
        params: {
          order_by: this.tableSort,
          is_active: true
        }
      }
      store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_USERS, options);
    },

    // Sets the group to sort by
    setSortByGroup: function(value) {
      if(value === store.getters.colleagues_filter) {
        this.sortBy = 'all';
        this.groupLabel = 'group';
      } else {
        this.sortBy = this.groups.find(x => x == value).id;
        this.groupLabel = this.groups.find(x => x == value).name;        
      }
    },

    // Determines the group badge color
    determineBadgeColor: function(grp) {
      var group = store.getters.user_groups.find(g => grp.id === g.id);
      var groupName = group ? group.name : 'UNDEFINED';
      var tempObj = {
        [store.getters.group_names[3]]: 'badge-primary',
        [store.getters.group_names[2]]: 'badge-danger',        
        [store.getters.group_names[1]]: 'badge-info',
        [store.getters.group_names[0]]: 'badge-success',
      }

      return tempObj[groupName] || 'badge-primary';   
    },

    reloadPage: function() {
      this.$router.push({ name: 'colleagues', params: { userId: 'all'}})
    }
  },

  filters: {
    getGroupAsString: function(val) {
      if(store.getters.user_groups) {
        let userGr = store.getters.user_groups.find(gr => val.id === gr.id);
        return userGr ? userGr.name.toString() : 'Not found';
      }
    },

    fullGender: function(val) {
      return val == 'f' ? 'Female' : 'Male';
    }
  }

}
</script>

<style scoped>
#colleagues {
  order: 1;
}

#colleagues-filter {
  order: 2;
}
.dropdown-item:hover {
  cursor: pointer;
}

.user-fullname {
  font-weight: bold;
}

.toggle-info {
  margin-top: .3rem;
}

.email-cell {
  color: #0275d8;
}

.email-cell>span:hover {
  cursor: pointer;
  border-bottom: 1px solid #0275d8;
}

#user-table {
  margin-top: 1rem;
}

#user-table-head {
  cursor: pointer;
}

#user-table-head>tr>th:hover {
  background-color: #d2d2d2;
  border-bottom: 2px solid #d2d2d2;
}

tr {
width: 100%;
display: inline-table;
table-layout: fixed;
}

table{
  height: 75vh; 
  display: -moz-groupbox;
}
tbody{
  overflow-y: scroll;      
  height: 73vh; 
  position: absolute;
}
</style>