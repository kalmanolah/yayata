<template lang="pug">
div(
  id='app'
  class='container-fluid'
)
  div.row
    div.col-md-2.sidebar.col-sm-3
      div.row
        div.col-md-8.offset-md-2
          img(class='card-img-top img-fluid px-1 pt-2' src='../assets/img/logo_text.svg').logo
      div.row
        div.col-md-10.offset-md-1
          nav
            h3 My timesheets
            p.small What's going on
            h3 My projects
            p.small What I'm currently working on
            h3 My leaves
            p.small Sickness / Vacation
            h3 My colleagues
            p.small The weirdos I work with
    div.col-md-10.main-app.offset-sm-3.offset-md-2
      div(class='my-1')
      router-view
</template>

<script>
import * as types from '../store/mutation-types'
import Navbar from './Navbar.vue'
import store from '../store'

export default {
  name: 'app',
  components: {
    navbar: Navbar
  },
  created: () => {
    if (!store.state.ninetofiver.user) {
      store.dispatch(types.NINETOFIVER_RELOAD_USER)
    }
  },
  computed: {
    foo () {
      return 'bar'
    }
  },
  data () {
    return {
    }
  }
}
</script>

<style lang="less" scoped>
.container-fluid{
  background: #FAFAFA;
}
#app {
  padding: 3rem 6rem;
}
.sidebar{
  background-color: white;
  height: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
}
.logo{
  margin: 0 auto;
  display: block;
}
.sidebar nav{
  h3{
    font-weight: 300;
  }


  margin-top: 30px;
  color: #398BCC;
}

</style>
