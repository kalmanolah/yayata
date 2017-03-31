<template lang="pug">
div
  h3 My timesheets
  p.subtitle Overview of all open timesheets
  div(v-for="(year_group,year) in timesheets")
    
    br
    div.card

      h3.card-header {{ year }}
      
      div.btn-group.card-block(v-for='sheet in year_group')
        router-link(:to='{ name: "calendar_month", params: { year: sheet.year, month: sheet.month } }')
          button.btn.btn-secondary(type='button')
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

  filters: {

    //Calculates all timesheets still open, based on a list of timesheets
    calculateOpen(list) {
      var total = 0;

      for(var l in list) 
        if(!list[l]["closed"])
          total++;

      return total;
    },

  }

}
</script>
