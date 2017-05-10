  <template lang="pug">
div
  h3.text-md-center Upcoming holidays on {{ today | moment('DD MMMM YYYY') }}
  p.text-md-center.subtitle This is a list of all upcoming holidays in the next few months.
  ul.list-group
    li.list-group-item(v-for='holiday in holidays')
      | {{ [ holiday.date, 'YYYY-MM-DD' ] | moment('DD MMMM YYYY') }}  
      span.pull-right {{ holiday.display_label }}
</template>

<script>
import { mapState } from 'vuex'
import store from '../store'
import * as types from '../store/mutation-types'

var data = {
    today: new Date(),
}

export default {
  name: 'holidays',

  data () {
    return data;
  },

  computed: {
    holidays: function() {
      if(store.getters.holidays)
        return store.getters.holidays;
    }
  },

  created: () => {},
}
</script>
