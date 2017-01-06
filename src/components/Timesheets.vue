<template lang="pug">
div
  h3 My timesheets
  p.subtitle Hurr durr durr timesheets
  div(v-for="(year_group,year) in timesheets")
    br
    h3 {{ year }}
    div.btn-toolbar(role="toolbar", aria-label="Wow, such month")
      div.btn-group(role="group")
        button.btn.btn-secondary(type="button", v-for='sheet in year_group')
          | {{ sheet.month }}
    ul.list-group
</template>

<script>
import { mapState } from 'vuex'
import store from '../store'
import * as types from '../store/mutation-types'

var data = {
    timesheets: [],
    today: new Date(),
}

export default {
  name: 'timesheets',

  data () {
    return data;
  },

  created: () => {
    store.dispatch(types.NINETOFIVER_API_REQUEST, {
      path: '/my_timesheets/',
      params: {
      },
    }).then((response) => {
      var timesheets = {};
      response.data.results.forEach(function(sheet){
        if(!timesheets[sheet.year]){
          timesheets[sheet.year] = {};
        }
        timesheets[sheet.year][sheet.month] = sheet;
      });
      data.timesheets = timesheets;
    }, () => {
      this.loading = false
    })
  },
}
</script>
