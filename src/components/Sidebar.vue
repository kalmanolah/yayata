<template lang="pug">
div(class='sidebar')
  div(class='sidebar-container p-4')
    router-link(:to='{ name: "home" }')
      img(class='img-fluid pb-4' src='../assets/img/logo_text.svg')

    nav
      router-link(:to='{ name: "timesheets" }')
        h3.mb-0 Timesheets
        p.small.d-none.d-lg-block.hide-on-small--side-text All open timesheets
      router-link(:to='{ name: "contracts" }')
        h3.mb-0 Contracts
        p.small.d-none.d-lg-block.hide-on-small--side-text What I'm working on
      router-link(:to='{ name: "leaves" }')
        h3.mb-0 Leaves
        p.small.d-none.d-lg-block.hide-on-small--side-text Sickness / Vacation
      router-link(:to='{ name: "colleagues_redirect" }')
        h3.mb-0 Colleagues
        p.small.d-none.d-lg-block.hide-on-small--side-text The weirdos I work with
      router-link(:to='{ name: "calendar_redirect" }')
        h3.mb-0 Calendar
        p.small.d-none.d-lg-block.hide-on-small--side-text Calendar overview
      router-link(:to='{ name: "availability_redirect" }')
        h3.mb-0 Availability
        p.small.d-none.d-lg-block.hide-on-small--side-text Availability overview
      router-link(:to='{ name: "import" }')
        h3.mb-0 Import
        p.small.d-none.d-lg-block.hide-on-small--side-text Time entries

    //- DATEPICKER
    .row.hide-on-small--date-picker
      .bottom.ml-0.pl-0.pr-4
        input#datepicker(type='hidden' ref='datepicker')
        #container(ref='container')
  </template>

<script>
import store from '../store'
import * as types from '../store/mutation-types'

export default {
  name: 'sidebar',
  mounted: function() {
    var vm = this;
    this.picker = new Pikaday({
      field: this.$refs.datepicker,
      container: this.$refs.container,
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
  }
}
</script>

<style lang="less" scoped>
.sidebar-container {
  height: 100%;
  position: fixed;
  width: 230px;
}

.sidebar {
  width: 230px;
}
</style>
