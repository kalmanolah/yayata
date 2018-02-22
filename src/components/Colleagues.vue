<template lang="pug">
div(class='row')
  div(class='col')
    h3(class='d-flex justify-content-between')
      span Colleagues
      button(class='btn btn-sm btn-outline-primary' @click='showFilter = !showFilter')
        i(class='fa' aria-hidden='true' :class="showFilter ? 'fa-angle-double-right' : 'fa-filter'")
    p(class='subtitle') Overview of all colleagues

    div(class='row')
      div(class='col order-12' v-if='showFilter')
        ColleaguesFilterForm

      div(class='order-1' :class='showFilter ? "col-8" : "col"')
        div(class='row')
          div(class='col-lg-8')
            div(class='btn-group' role='group')
              button(class='btn btn-outline-dark' @click='resetFilters()') All

              div(class='btn-group' role='group')
                button(class='btn btn-outline-dark dropdown-toggle' id='btnGroupDrop' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false")
                  span(v-if='filterGroup') {{ filterGroup.display_label }}
                  span(v-else) Select a group
                div(class='dropdown-menu' aria-labelledby='btnGroupDrop')
                  a(class='dropdown-item' v-for='group in groups' @click='filterByGroup(group)') {{ group.display_label }}

        hr

        div(v-if='tableData')
          v-client-table(:columns="tableColumns" :data="tableData" :options="tableOptions")
            template(slot='birth_date' slot-scope='props')
              span(v-if='props.row.userinfo && props.row.userinfo.birth_date') {{ props.row.userinfo.birth_date | moment('DD/MM/YYYY') }}

            template(slot='join_date' slot-scope='props')
              span(v-if='props.row.userinfo && props.row.userinfo.join_date') {{ props.row.userinfo.join_date | moment('DD/MM/YYYY') }}

            template(slot='country' slot-scope='props')
              span(v-if='props.row.userinfo && props.row.userinfo.country') {{ props.row.userinfo.country }}
</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';
import ColleaguesFilterForm from './forms/ColleaguesFilterForm.vue';

export default {
  name: 'colleagues',

  components: {
    ColleaguesFilterForm,
  },

  data () {
    return {
      showFilter: false,
      filterGroup: null,
      tableColumns: [
        'display_label',
        'username',
        'email',
        'birth_date',
        'country',
        'join_date',
      ],
      tableOptions: {
        headings: {
          display_label: 'Name',
        },
        sortIcon: {
          base: 'fa',
          up: 'fa-sort-asc',
          down: 'fa-sort-desc',
          is: 'fa-sort'
        },
        orderBy: {
          column: 'display_label',
          ascending: true
        }
      }
    }
  },

  created: () => {
    new Promise((resolve, reject) => {
      if (!store.getters.users) {
        store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_USERS).then(() => resolve())
      } else{
        resolve()
      }
    })
  },

  computed: {
    userId: function() {
      return this.$route.params.userId
    },

    tableData: function() {
      if (store.getters.filtered_users) {
        let users = store.getters.filtered_users.slice(0)

        if (this.filterGroup) {
          users = users.filter(user => {
            return user.groups.filter(group => {
              return group.id === this.filterGroup.id
            }).length
          })
        }

        if (this.userId != 'all') {
          users = users.filter(user => {
            return user.id == this.userId
          })
        }

        return users
      }
    },

    groups: function() {
      if (store.getters.user_groups) {
        return store.getters.user_groups
      }
    },
  },

  methods: {
    resetFilters: function() {
      this.filterGroup = null

      if (this.userId != 'all') {
        this.$router.push({
          name: 'colleagues_redirect',
        })
      }
    },

    filterByGroup: function(group) {
      this.filterGroup = group
    },
  }
}
</script>

<style scoped lang="less">
.dropdown-item:hover {
  cursor: pointer;
}
</style>
