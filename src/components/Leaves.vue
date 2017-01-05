<template lang="pug">
div(class='calendar')
  div(class='row')
    h1(class='col-md-6') My Leaves
  hr
  div
    #accordion(role='tablist', aria-multiselectable='true')
      .card(v-for='(leave, i) in leaves')
        div.card-header(role='tab', v-bind:id='"heading-" + i')
          h5.mb-0
            a(data-toggle='collapse', data-parent='#accordion', aria-expanded='false', 'v-bind:aria-controls='"collapse-" + i', 'v-bind:href='"#collapse-" + i')
              | {{ leave.display_label }}
        div.collapse.in(role='tabpanel', v-bind:id='"collapse-" + i', v-bind:aria-labelledby='"heading-" + i')
          div.card-block
            p {{ leave.description }}
            div
              ul.list-group
                li.list-group-item(v-for='leave_date in leave.leavedate_set')
                  | {{ leave_date.starts_at | moment('DD MMMM YYYY hh:mm') }} - {{ leave_date.ends_at | moment('DD MMMM YYYY hh:mm') }}
</template>
<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'
import store from '../store'

var data = {
  leaves: [],
}

export default {
  name: 'my_leaves',

  data () {
    return data;
  },

  created: () => {
    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_leaves/',
      params: {
      },
    }).then((response) => {
      data.leaves = response.data.results
    }, () => {
      this.loading = false
    })
  },
}
</script>

<style lang="less" scoped>

</style>
