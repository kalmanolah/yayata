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
    .card-columns
      #accordion(v-for='(user, index) in filteredUsers' role='tablist' aria-multiselectable='true') 
        .card
          .card-block
            .card-title(role='tab' v-bind:id='"title-" + index' data-parent='#accordion' aria-expanded='false' v-bind:aria-controls='"collapse-" + index')
              span.user-fullname {{ user.first_name }} {{ user.last_name }}
              span(v-for='group in user.groups').tag.tag-primary.pull-right  {{ group | getGroupAsString }}
            .card-text
              .row
                .col-md-6 <strong>Email: </strong>
                .col-md-6.text-md-right {{ user.email }}
              .row
                .col-md-6 <strong>Telephone: </strong>
                .col-md-6.text-md-right +32 498 348585
              .collapse(role='tabpanel' v-bind:id='"collapse-" + index' v-bind:aria-labelledby='"title-" + index')
                .row
                  .col-md-6 <strong>Birth Date: </strong>
                  .col-md-6.text-md-right {{ user.birth_date | moment('DD MMMM YYYY') }}
                .row
                  .col-md-6 <strong>Gender: </strong>
                  .col-md-6.text-md-right {{ user.gender | fullGender }}
                .row
                  .col-md-6 <strong>Country: </strong>
                  .col-md-6.text-md-right {{ user.country }}    
              button.btn.btn-sm.pull-right(data-toggle='collapse' v-bind:href='"#collapse-" + index') More info
              //- button.btn.btn-sm.pull-right(@click='getUserInfo(user)') More info

</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'
import store from '../store';
import Vue from 'vue';

var data = {
  // groups: [],
  sortBy: 'all',
  query: '',
  visible: false
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
    // getUserInfo(user)
    // TODO: userinfos in de store steken
    //       van de meegegeven user de userinfo ophalen en weergeven.
    // Hoe differentieren tussen verschillende userinfos en enkel de huidige weergeven?
    toggleUserInfo: function(user) {
      var index = this.sortedUsers.indexOf(user);
      this.sortedUsers.forEach(u => {
        if(u != user){
          u.toggleInfo = false;
          Vue.set(this.sortedUsers, this.sortedUsers.indexOf(u), u);
        }
        user.toggleInfo = !user.toggleInfo;
        Vue.set(this.sortedUsers, index, user)
      })
    },

    setSortBy: function(value) {
      if(value === 'all') {
        this.sortBy = 'all';
      } else {
        this.sortBy = this.groups.find(x => x == value).id;
      }
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

tr {
  width: 100%;
}

</style>