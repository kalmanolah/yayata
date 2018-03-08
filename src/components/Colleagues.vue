<template lang="pug">
div(class='row')
  div(class='col')
    h3 Colleagues
    p(class='subtitle') Overview of all colleagues

    div(v-if='tableData')
      v-client-table(:columns="tableColumns" :data="tableData" :options="tableOptions")
        template(slot='birth_date' slot-scope='props')
          span(v-if='props.row.userinfo && props.row.userinfo.birth_date') {{ props.row.userinfo.birth_date | moment('YYYY-MM-DD') }}

        template(slot='join_date' slot-scope='props')
          span(v-if='props.row.userinfo && props.row.userinfo.join_date') {{ props.row.userinfo.join_date | moment('YYYY-MM-DD') }}

        template(slot='country' slot-scope='props')
          span(v-if='props.row.userinfo && props.row.userinfo.country') {{ props.row.userinfo.country }}
</template>

<script>
import * as types from '../store/mutation-types';
import store from '../store';

export default {
  name: 'colleagues',

  components: {
  },

  data () {
    return {
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
        store.dispatch(types.NINETOFIVER_RELOAD_USERS).then(() => resolve())
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
      if (store.getters.users) {
        let users = store.getters.users.slice(0)

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
  },

  methods: {
  }
}
</script>

<style scoped lang="less">
</style>
