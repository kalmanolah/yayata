<template lang="pug">
div(
  id='app'
  class='container-fluid p-0'
)
  div(class='application-wrapper')
    vue-progress-bar
    sidebar(class='application-sidebar d-none d-md-block')

    div(class='application-main')
      navbar
      div(class='container-fluid application-content')
        router-view(class='py-3' v-if='user')
</template>

<script>
import * as types from '../store/mutation-types';
import Navbar from './Navbar.vue';
import Sidebar from './Sidebar.vue';
import store from '../store';

export default {
  name: 'app',

  components: {
    navbar: Navbar,
    sidebar: Sidebar
  },

  created: () => {
    new Promise((resolve, reject) => {
      if (!store.getters.user) {
        store.dispatch(types.NINETOFIVER_RELOAD_USER).then(() => resolve())
      } else{
        resolve()
      }
    })
  },

  computed: {
    user: () => {
      if (store.getters.user) {
        return store.getters.user
      }
    }
  },

  data () {
    return {
      picker: ''
    }
  },

}
</script>

<style lang="less">
@sidebar-width: 250px;
@background-color: #FFF;
@primary-color: #0aa6c9;

* {
  -webkit-overflow-scrolling: touch;
}

#app {
  overflow-x: hidden;
}

.container-fluid{
  background: @background-color;
}

.application-wrapper {
  height: 100vh;

  @media all and (min-width: 768px) {
    .application-main {
      margin-left: @sidebar-width;
    }
  }

  .application-sidebar {
    width: @sidebar-width;
  }
}

.card-top-blue{
  border-top: solid 3px @primary-color;
}
.card-top-red{
  border-top: solid 3px #FA5858;
}
.card-top-green{
  border-top: solid 3px #60C200;
}

a {
  color: @primary-color;

  &:hover {
    color: darken(@primary-color, 5%);
  }
}

.dropdown-menu {
  max-height: 70vh;
  overflow: auto;
}
.fade {
    display: inherit;
}

.rendered-markdown {
  > *:last-child {
    margin-bottom: 0
  }
}

@media all and (min-width: 768px) {
  .half-width-md {
    width: 50%;
    float: left;

    &+ .half-width-md {
      padding-left: 5px;
    }
  }

  .third-width-md {
    width: 33%;
    float: left;

    &+ .third-width-md {
      padding-left: 5px;
    }
  }
}

.white-space-normal {
    white-space: normal;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
