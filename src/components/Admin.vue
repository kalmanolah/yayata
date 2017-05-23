<template lang="pug">
div
  .btn-group(role='group')
    button.btn.btn-secondary(@click='currentView="LeaveOverviewGrid"') Leave Overview Grid
    button.btn.btn-secondary(@click='currentView="Contracts"') Contracts
  component(v-bind:is='currentView')
</template>
<script>
import Vue from 'vue'
import LeaveOverviewGrid from './LeaveOverviewGrid.vue'
import Contracts from './Contracts.vue'

export default {
name: 'admin',
components: {
    LeaveOverviewGrid,
    Contracts
},
data() {
  return {
    currentView: 'LeaveOverviewGrid'
  }
},
methods: {

 }
}
</script>
<style>

</style>