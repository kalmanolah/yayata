<template lang="pug">
div
  .row
    div.h3 Colleagues

  .row
    .col-md-8
      .btn-group
        button.btn.btn-secondary(@click='setSortBy("all")') All
        button.btn.btn-secondary(v-for='group in groups' @click='setSortBy(group)') {{ group.name }}
    .col-md-3
      .input-group
        span.input-group-addon Search
        input(type='text', class='form-control', placeholder='Name, email, ...', v-model='query')
      

  .row
    //- wrap the caaards
    .card-columns
      .card(v-for='user in filteredUsers')
        .card-block
          .card-title
            span.user-fullname {{ user.first_name }} {{ user.last_name }}
            span(v-for='group in user.groups').tag.tag-primary.pull-right  {{ group | getGroupAsString }}
          .card-text
            table.table
              tr
                td <strong>Email: </strong>
                td.text-md-right {{ user.email }}
              tr
                td <strong>Telephone: </strong>
                td.text-md-right +32 498 348585
              tr(v-if='user.toggleInfo')
                td <strong>Birth Date: </strong>
                td.text-md-right {{ user.birth_date | moment('DD MMMM YYYY') }}
              tr(v-if='user.toggleInfo')
                td <strong>Gender: </strong>
                td.text-md-right {{ user.gender | fullGender }}
              tr(v-if='user.toggleInfo')
                td <strong>Country: </strong>
                td.text-md-right {{ user.country }}    
            button.btn.btn-sm.pull-right(@click='toggleUserInfo(user)') More info

</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'
import store from '../store';
import Vue from 'vue';

var data = {
  // groups: [],
  sortBy: 'all',
  query: ''
}

export default {
  name: 'colleagues',

  components: {},

  data () {
    return data;
  },

  created: () => {
  },

  computed: {
    users: function(){
      if(store.getters.users)
        return store.getters.users
    },

    groups: function() {
      if(store.getters.user_groups)
        return store.getters.user_groups
    },

    filteredUsers: function(){
      if(store.getters.users && this.sortedUsers){
        var query = this.query;
        return this.sortedUsers.filter( user => {
          user.fullname = user.first_name + ' ' + user.last_name;
          return user.email.toLowerCase().indexOf(query.toLowerCase()) !== -1
                || user.fullname.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
      }
    },

    sortedUsers: function() {
      // this.sortedUsers = [];
      if(this.sortBy !== 'all' && this.users){
        var users = [];
        this.users.forEach(user => {
          user.groups.forEach( group => {
              if(group === this.sortBy){
                user.toggleInfo = false;
                users.push(user);
              }
            });
        });
        return users;
      } else {
        if(this.users)
          return this.users;
      }
    },
  },

  methods: {
    toggleUserInfo: function(user) {
      var index = this.filteredUsers.indexOf(user);
      this.filteredUsers.forEach(u => {
        if(u != user){
          u.toggleInfo = false;
          Vue.set(this.filteredUsers, this.filteredUsers.indexOf(u), u);
        }
        user.toggleInfo = !user.toggleInfo;
        Vue.set(this.filteredUsers, index, user)
      })
    },

    setSortBy: function(value) {
      if(value === 'all') {
        this.sortBy = 'all';
      } else {
        this.sortBy = this.groups.find(x => x == value).id;
      }
      console.log(this.sortedUsers);
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
.tag {
  margin-left: 0.1rem;
  margin-right: 0.1rem;
}

.user-fullname {
  font-weight: bold;
}

.card-columns {
  margin-top: 1rem;
}

</style>