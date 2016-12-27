<template lang="pug">
div
  div(
    v-for='n in dayCount'
    class='calendar-day'
  )
    div(
      class='card'
    )
      div(
        class='card-block'
      )
        h4(class='card-title') {{ n }}
</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'

var daysInMonth = (d) => {
  return  new Date(d.getYear(), d.getMonth() + 1, 0).getDate()
}

export default {
  name: 'calendar',

  watch: {
    '$route' (to, from) {
      this.selectedMonth = new Date(to.params.year, to.params.month - 1, 1)
    }
  },

  data () {
    return {
      selectedMonth: new Date(this.$route.params.year, this.$route.params.month - 1, 1),
    }
  },

  computed: {
    dayCount: (vm) => {
      return daysInMonth(vm.selectedMonth)
    }
  },

  // data () {
  //   return {
  //     initialized: false,
  //     now: new Date(),
  //     year: (new Date()).getFullYear(),
  //     month: (new Date()).getMonth(),
  //   }
  // }
}
</script>

<style lang="less" scoped>
@media all and (min-width: 768px) {
  .calendar-day {
    width: 14.2857%;
    float: left;
    padding: 0 5px
  }
}

</style>
