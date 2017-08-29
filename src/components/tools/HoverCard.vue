<template lang="pug">
.hovercard(v-on-clickaway='closePopover')

  a.hovercard__text(href='', @click.prevent='togglePopover')
    slot
  .hovercard__content(v-if='showpopover') 
    .hovercard__close-icon.pull-right(@click.prevent='closePopover')
      .fa.fa-times
    component(:is='currentForm', :properties='component.properties', @success='throwSuccessEvent')

</template>

<script>
/* UPDATE FOR MORE COMPONENT FORMS */
import PerformanceForm from '../forms/PerformanceForm.vue';
import StandbyContractSelect from '../StandbyContractSelect.vue';
import LocationSelect from '../LocationSelect.vue';
import { mixin as clickaway } from 'vue-clickaway';


export default {
  name: 'hovercard',

  mixins: [ clickaway ],
  components: {
    /* UPDATE FOR MORE COMPONENT FORMS */
    PerformanceForm: PerformanceForm,
    StandbyContractSelect,
    LocationSelect
  },

  data () {
    return {
      showpopover: false,
      currentForm: this.component['name'],
    }
  },

  props: {
    component: {
      type: Object,
      default: function() {
        return { name: 'PerformanceForm', properties: {}}
      },
      validator: function(val) {
        return (val !== null && val !== undefined && typeof val === 'object' && Object.keys(val).length === 2);
      }
    }
  },

  methods: {

    throwSuccessEvent: function() {
      this.$emit('success');
      this.closePopover();
    },

    togglePopover: function() {
      this.showpopover = !this.showpopover;
      if(this.showpopover)
        this.$emit('popped');
    },

    closePopover: function() {
      this.showpopover = false;
    },
  }
}


</script>

<style lang='less'>
@width: 280px;

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
  max-width: 100%;
  padding: 10px;
  position: absolute;
  min-width: @width;
  z-index: 100;
  left: -2em;
}

.hovercard__close-icon {
  cursor: pointer;
  position: relative;
  top: -10px;
}
</style>