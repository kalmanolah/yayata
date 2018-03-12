<template lang="pug">
div
  div(class='sidebar')
    div(class='sidebar-container p-4')
      router-link(:to='{ name: "home" }')
        img(class='img-fluid mb-4' src='../assets/img/logo_text.svg')

      nav(class='nav flex-column nav-pills')
        router-link(v-for='navbarItem in navbarItems' :to='navbarItem.route' class='nav-item nav-link')
          | {{ navbarItem.label }}

      div(class='sidebar-datepicker')
        input(type='hidden' ref='sidebar-datepicker')
        div(ref='sidebar-datepicker-container')
</template>

<script>
import store from '../store'
import * as types from '../store/mutation-types'

export default {
  name: 'sidebar',
  mounted: function() {
    var vm = this;
    this.picker = new Pikaday({
      field: this.$refs['sidebar-datepicker'],
      container: this.$refs['sidebar-datepicker-container'],
      firstDay: 1,
      minDate: new Date(2000, 0, 1),
      maxDate: new Date(2020, 12, 31),
      yearRange: [2000, 2020],
      bound: false,
      format: 'D MMM YYYY',
      onSelect: function() {
        var date = this.getMoment();
        vm.$router.push({ name: 'calendar_week', params: { year: date.get('year'), week: date.get('isoWeek') }})
      }
    });

    // HACK WARING: pikaday added arrowkey support for accessability reasons, this is something we don't want however
    // as the pikaday is used to navigate. This would mean that whenever the user uses his arrowkeys after using the pikaday
    // he leaves his current page.
    // This feature is not not yet optional but will be in the future after the merge request that fixes this is accepted.
    document.removeEventListener('keydown', this.picker._onKeyChange);
    document.removeEventListener('keyup', this.picker._onKeyChange);
    document.removeEventListener('keyleft', this.picker._onKeyChange);
    document.removeEventListener('keyright', this.picker._onKeyChange);
  },

  data () {
    return {
      picker: '',
    }
  },

  computed: {
    navbarItems: function() {
      if (store.getters.navbar_items) {
        return store.getters.navbar_items
      }
    }
  }
}
</script>

<style lang="less">
@sidebar-width: 230px;
@datepicker-height: 228px;

.sidebar {
  width: @sidebar-width;

  .sidebar-container {
    height: 100%;
    position: fixed;
    width: @sidebar-width;
  }

  .nav {
    .nav-link {
      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }

  .sidebar-datepicker {
    position: absolute;
    bottom: 0;

    .pika-lendar {
      width: auto;
    }

    .pika-single {
      height: @datepicker-height;
      border: 0;
    }
  }
}
</style>
