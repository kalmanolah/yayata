<template lang="pug">
div(class='row')
  div(class='col')
    h3 Colleagues
    p(class='subtitle') Overview of all colleagues

    div(v-if='tableData')
      v-client-table(:columns="tableColumns" :data="tableData" :options="tableOptions")
        template(slot='display_label' slot-scope='props')
          router-link(:to='{ name: "colleague", params: { userId: props.row.id }}')
            | {{ props.row.display_label }}

        template(slot='birth_date' slot-scope='props')
          span(v-if='props.row.userinfo && props.row.userinfo.birth_date') {{ props.row.userinfo.birth_date | moment('YYYY-MM-DD') }}

        template(slot='join_date' slot-scope='props')
          span(v-if='props.row.userinfo && props.row.userinfo.join_date') {{ props.row.userinfo.join_date | moment('YYYY-MM-DD') }}

        template(slot='country' slot-scope='props')
          span(v-if='props.row.userinfo && props.row.userinfo.country') {{ props.row.userinfo.country }}

        template(slot='phone_number' slot-scope='props')
          span(v-if='props.row.userinfo && props.row.userinfo.phone_number') {{ props.row.userinfo.phone_number }}
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
        'phone_number',
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
          column: 'join_date',
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
          birth_date: function (ascending) {
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
          },
          phone_number: function (ascending) {
            return function (a, b) {
              let res = 0

              if (!a.userinfo || !a.userinfo.phone_number) {
                res = -1
              } else if (!b.userinfo || !b.userinfo.phone_number) {
                res = 1
              } else {
                res = a.userinfo.phone_number < b.userinfo.phone_number ? -1 : 1
              }

              if (!ascending) {
                res = res * -1
              }

              return res
            }
          },
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

        return users
      }
    },
  }
}
</script>

<style scoped lang="less">
</style>
