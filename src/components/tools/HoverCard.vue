<template lang="pug">
.hovercard(v-on-clickaway='closePopover')
  a.hovercard__text(href='', v-on:click.prevent='togglePopover')
    slot
  transition(:name='fade')
    .hovercard__content(v-if='showpopover')

      .hovercard__close-icon.pull-right
        i.fa.fa-times(@click.prevent='closePopover')

      slot(name='content')
      p.text-xs-center
        i.fa.fa-calendar-check-o
        span &nbsp; {{ date | moment('DD/MM/YYYY') }}
      PerformanceForm(
        :selected-date='date',
        :performance='performance',
        @success='closeAndThrow'
      )

</template>

<script>

import { mixin as clickaway } from 'vue-clickaway';
import PerformanceForm from '../forms/PerformanceForm.vue';

export default {
  name: 'hovercard',

  mixins: [ clickaway ],
  components: {
    PerformanceForm: PerformanceForm,
  },

  data () {
    return {
      showpopover: false,
    }
  },

  props: ['performance', 'date'],

  methods: {

    togglePopover: function() {
      this.showpopover = !this.showpopover;
    },

    closePopover: function() {
      this.showpopover = false
    },

    closeAndThrow: function() {
      this.closePopover();
      this.$emit('success');
    }

  }
}


</script>

<style>

.hovercard-enter-active {
  transition: all .3s ease-in-out;
  background: red;
}

.hovercard-leave-active {
  transition: all .3s ease-in-out;
}

.hovercard {
  background-color: rgba(0,0,0,0);
  display: inline-block;
  width: 100%;
  position: relative;
  border: 0px;
  margin: 0px;
  padding: 0px;
}

.hovercard__text {
  position: relative;
}

.hovercard__content {
  /*Style of hidden popover content*/
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 6px 6px rgba(16, 16, 16, 0.04), 0 6px 6px rgba(0, 0, 0, 0.1);
  max-width: 350px;
  padding: 10px;
  position: absolute;
  width: 70vw;
  z-index: 10001;
}

.hovercard__close-icon {
  cursor: pointer;
}



</style>