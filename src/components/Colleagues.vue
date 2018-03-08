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
        },
        customSorting: {
          country: function (ascending) {
            return function (a, b) {
              let res = 0

              if (!a.userinfo || !a.userinfo.country) {
                res = -1
              } else if (!b.userinfo || !b.userinfo.country) {
                res = 1
              } else {
                res = a.userinfo.country < b.userinfo.country ? -1 : 1
              }

              if (!ascending) {
                res = res * -1
              }

              return res
            }
          },
          join_date: function (ascending) {
            return function (a, b) {
              let res = 0

              if (!a.userinfo || !a.userinfo.birth_date) {
                res = -1
              } else if (!b.userinfo || !b.userinfo.birth_date) {
                res = 1
              } else {
                res = moment(a.userinfo.birth_date).isBefore(b.userinfo.birth_date) ? -1 : 1
              }

              if (!ascending) {
                res = res * -1
              }

              return res
            }
          },
          join_date: function (ascending) {
            return function (a, b) {
              let res = 0

              if (!a.userinfo || !a.userinfo.join_date) {
                res = -1
              } else if (!b.userinfo || !b.userinfo.join_date) {
                res = 1
              } else {
                res = moment(a.userinfo.join_date).isBefore(b.userinfo.join_date) ? -1 : 1
              }

              if (!ascending) {
                res = res * -1
              }

              return res
            }
          }
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
