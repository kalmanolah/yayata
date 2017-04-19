  <template lang="pug">
div
  h3 My timesheets
  p.subtitle Overview of all open timesheets
  div(v-for="(year_group, year) in timesheets")
    
    br

    div.card

      h3.card-header {{ year }}
      
      div.card-block
        div.btn-group(v-for='sheet in year_group' )
          router-link(:to='{ name: "calendar_month", params: { year: sheet.year, month: sheet.month } }')
            button.btn.btn-secondary(type='button')
              | {{ sheet | outputCorrectMonth }}

</template>

<script>
import { mapState } from 'vuex'
import store from '../store'
import * as types from '../store/mutation-types'

var data = {
    today: new Date(),
}

export default {
  name: 'timesheets',

  data () {
    return data;
  },

  computed: {
    timesheets: function() {

      if(store.getters.timesheets) {
        var ts = {};
        store.getters.timesheets.forEach(x => {
          if(!ts[x.year])
            ts[x.year] = {};

          ts[x.year][x.month] = x;
        });

        return ts;
      }
    }
  },

  created: () => { },

  filters: {

    outputCorrectMonth(sheet) {
      return moment().year(sheet.year).month(sheet.month - 1).format('MMMM');
    },

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
