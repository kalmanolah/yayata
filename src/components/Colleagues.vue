<template lang="pug">
div
  .col-md-9
    .row
      h3 Colleagues
      p.subtitle Overview of all colleagues
    .row
      .col-md-8
        .btn-group(role='group' aria-label='Button group with nested dropdown')
          button.btn.btn-secondary(@click='showEditUserForm = !showEditUserForm') Edit
          button.btn.btn-secondary(type='button' @click='setSortByGroup("all")') All
          .btn-group(role='group')
            button.btn.btn-secondary.dropdown-toggle#btnGroupDrop(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ groupLabel }}
            .dropdown-menu(aria-labelledby='btnGroupDrop')
              a.dropdown-item(v-for='group in groups' @click='setSortByGroup(group)') {{ group.name }}
      .col-md-4
        .input-group
          span.input-group-addon Search
          input(type='text', class='form-control', placeholder='Name, email, ...', v-model='query')
    .row#user-table(v-if='filtered_users')
      table.table.table-striped
        thead#user-table-head
          tr
            th(@click='setTableSort("first_name")') Name
            th(@click='setTableSort("email")') Email
            th(@click='setTableSort("userinfo__birth_date")') Birthdate
            th(@click='setTableSort("userinfo__country")') Country
        tbody
          tr(v-for='(user, index) in queryUsers')
            td {{ user.first_name }} {{ user.last_name }} 
              span(v-for='group in user.groups' v-bind:class='determineTagColor(group)').tag.pull-right  {{ group | getGroupAsString }}
            td {{ user.email }}
            td {{ user.birth_date | moment('DD MMMM YYYY') }}
            td {{ user.country }}

    .row
      .container
        EditUserForm.col-md-4(v-bind:user='this.storeUser' v-if='showEditUserForm')

    .row(v-if='users && users.length === 0')
      .col-md-3
      .col-md-6
        h1.text-md-center.notice No colleagues found!
      .col-md-3
  .col-md-3.fixed
    .row
      h3 Advanced Filter
      p.subtitle more advanced filtering here   
    .row
      ColleaguesFilterForm
</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'
import store from '../store';
import Vue from 'vue';
import ColleaguesFilterForm from './forms/ColleaguesFilterForm.vue';
import EditUserForm from './forms/EditUserForm.vue';

var data = {
  sortBy: 'all',
  tableSort: '',
  groupLabel: 'group',
  query: '',
  showEditUserForm: false
}

export default {
  name: 'colleagues',
  components: {
    ColleaguesFilterForm,
    EditUserForm
  },

  data () {
    return data;
  },

  created: () => {
    if(!store.getters.filtered_users){
      store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_USERS);
    }
  },

  computed: {
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

    // Filter users by input
    queryUsers: function(){
      if(store.getters.filtered_users && this.sortedUsers && this.userId === store.getters.colleagues_filter){
        var query = this.query;
        return this.sortedUsers.filter( user => {
          user.fullname = user.first_name + ' ' + user.last_name;
          // Fields to filter on
          return user.email.toLowerCase().indexOf(query.toLowerCase()) !== -1
                || user.fullname.toLowerCase().indexOf(query.toLowerCase()) !== -1;
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
      if(this.sortBy !== store.getters.colleagues_filter && this.filtered_users){
        var users = [];
        this.filtered_users.forEach(user => {
          user.groups.forEach( group => {
              if(group === this.sortBy){
                users.push(user);
              }
            });
        });
        return users;
      } else {
        if(this.filtered_users)
          return this.filtered_users;
      }
    },
  },

  methods: {
    setTableSort: function(value) {
      console.log(value);
      if(this.tableSort === value){
        this.tableSort = '-' + value;
      } else {
        this.tableSort = value;
      }
      var options = {
        path: '/users/',
        params: {
          order_by: this.tableSort
        }
      }
      console.log(options)
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

    // Determines the group tag color
    determineTagColor: function(group_id) {
      var group_name = store.getters.user_groups.find(group => group_id === group.id).name;
      var tempObj = {
        [store.getters.group_names[3]]: 'tag-primary',
        [store.getters.group_names[2]]: 'tag-red',        
        [store.getters.group_names[1]]: 'tag-blue',
        [store.getters.group_names[0]]: 'tag-green',
      }
      return (tempObj[group_name]) ? tempObj[group_name] : 'tag-primary';   
    }
  },

  filters: {
    getGroupAsString: function(val){
      if(store.getters.user_groups){
        var output = '';
        output += store.getters.user_groups.find(group => val == group.id).name;
        return output;
      }
    },

    fullGender: function(val){
      var output = ''
      val == 'f' ? output += 'Female' : output += 'Male';
      return output;
    }
  }

}
</script>

<style>
.dropdown-item:hover {
  cursor: pointer;
}

.tag {
  margin-left: 0.1rem;
  margin-right: 0.1rem;
}

.tag-red {
  background-color: #ff0000;
}

.tag-blue {
  background-color: #000080;
}

.tag-green {
  background-color: #006400;
}

.user-fullname {
  font-weight: bold;
}

.card-columns {
  margin-top: 1rem;
}

.toggle-info {
  margin-top: .3rem;
}

.notice {
  background-color: #fff;
  border: 1px solid black;
  border-radius: 5px;
}

.fa-pencil-square-o {
  padding-right: .2rem;
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
</style>