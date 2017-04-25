<template lang="pug">
div
  .col-md-9
    .row
      h3 Colleagues
      p.subtitle Overview of all colleagues
    .row
      .col-md-8
        .btn-group(role='group' aria-label='Button group with nested dropdown')
          button.btn.btn-secondary(type='button' @click='setSortBy("all")') All
          .btn-group(role='group')
            button.btn.btn-secondary.dropdown-toggle#btnGroupDrop(type='button' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false") {{ groupLabel }}
            .dropdown-menu(aria-labelledby='btnGroupDrop')
              //- button.btn.btn-secondary(v-for='group in groups' @click='setSortBy(group)') {{ group.name }}          
              a.dropdown-item(v-for='group in groups' @click='setSortBy(group)') {{ group.name }}
      .col-md-4
        .input-group
          span.input-group-addon Search
          input(type='text', class='form-control', placeholder='Name, email, ...', v-model='query')
    .row.card-row(v-if='filtered_users')
      .col-md-6#accordion(v-for='(user, index) in queryUsers' role='tablist' aria-multiselectable='true') 
        .card
          .card-header( v-bind:id='"heading-" + index' role='tab' aria-expanded='false' v-bind:aria-controls='"collapse-" + index')
            span.user-fullname {{ user.first_name }} {{ user.last_name }}
            span(v-for='group in user.groups' v-bind:class='determineTagColor(group)').tag.pull-right  {{ group | getGroupAsString }}
          .card-block
            .card-text
              .row
                .col-md-3 <strong>Email: </strong>
                .col-md-9.text-md-right {{ user.email }}
              .row
                .col-md-3 <strong>Telephone: </strong>
                .col-md-9.text-md-right +32 498 348585
              .collapse(role='tabpanel' v-bind:id='"collapse-" + index' v-bind:aria-labelledby='"heading-" + index')
                .row
                  .col-md-3 <strong>Birth Date: </strong>
                  .col-md-9.text-md-right {{ user.birth_date | moment('DD MMMM YYYY') }}
                .row
                  .col-md-3 <strong>Gender: </strong>
                  .col-md-9.text-md-right {{ user.gender | fullGender }}
                .row
                  .col-md-3 <strong>Country: </strong>
                  .col-md-9.text-md-right {{ user.country }}    
            button.btn.btn-sm.pull-right.toggle-info(data-toggle='collapse' v-bind:data-target='"#collapse-" + index' @click='hideOpen()') More info
    .row(v-if='users && users.length === 0')
      .col-md-3
      .col-md-6
        h1.text-md-center.notice No colleagues found!
      .col-md-3
  .col-md-3
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

var data = {
  sortBy: 'all',
  groupLabel: 'group',
  query: '',
}

export default {
  name: 'colleagues',

  components: {
    ColleaguesFilterForm
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
      if(store.getters.filtered_users && this.sortedUsers){
        var query = this.query;
        return this.sortedUsers.filter( user => {
          user.fullname = user.first_name + ' ' + user.last_name;
          // Fields to filter on
          return user.email.toLowerCase().indexOf(query.toLowerCase()) !== -1
                || user.fullname.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
      }
    },

    // Sort users by group
    sortedUsers: function() {
      if(this.sortBy !== 'all' && this.filtered_users){
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
    hideOpen: function() {
      $('.collapse').collapse('hide');
    },

    setSortBy: function(value) {
      if(value === 'all') {
        this.sortBy = 'all';
        this.groupLabel = 'group';
      } else {
        this.sortBy = this.groups.find(x => x == value).id;
        this.groupLabel = this.groups.find(x => x == value).name;        
      }
    },

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

.card-row {
  margin-top: 1rem;
   display: flex;
   flex-wrap: wrap;
}

.card-row > div[class*='col-'] {
  display: flex;

}

.card {
  width: 100%;
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

</style>