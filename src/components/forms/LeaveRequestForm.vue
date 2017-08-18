<template lang="pug">
div
  .card.card-top-blue.col-12.mb-3.p-2
    h4.card-title.text-md-center
      i.fa.fa-plane
      | &nbsp; Request a Leave

    .card-block
      .form

        .row
          .col.text-center
            toggle-button(
              @change='switchForm()',
              :sync='true',
              :color={checked: '#f0ad4e', unchecked: '#5cb85c'},
              :labels={
                checked: 'Single day',
                unchecked: 'Multiple days'
              },
              :width='95',
            )

        LeaveDayForm(v-if='singleDay')
        LeavePeriodForm(v-else)

</template>
<script>
import LeavePeriodForm from './LeavePeriodForm.vue';
import LeaveDayForm from './LeaveDayForm.vue';

export default {
  name: 'leaverequestform',
  components: { 
    LeavePeriodForm,
    LeaveDayForm    
  },
  data() {
      return {
        // Full day
        singleDay: false,
      }
  },

  methods: {
    switchForm: function() {
      // Switches form and resets the depending fields.
      this.singleDay = !this.singleDay;
    },
  },

}
</script>
<style lang='less'>

.select-warning {
  border: solid 1px #f0ad4e;
  border-radius: .25em;
}
.form-field {
  padding: 0px 5px;
}
.form-control {
  
}
.form-group {
  margin: 0px;
}
.form-header-title {
  padding: 10px 15px;
}
.custom-file-control {
    overflow: hidden;
}
.custom-file-control {
    overflow: hidden;
}
.custom-file-control.dragging {
    overflow: hidden;
    filter: blur(3px);
}
.custom-file-control::after {
    content: attr(data-selected);
}
.custom-file-control::before {
    content: attr(data-choose);
}
.custom-file .drop-here {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, .5);
    border-radius: 3px;
    z-index: 99999;
    display: flex;
    justify-content: center;
    align-items: center;
}
.custom-file .drop-here::before {
    color: white;
    content: attr(data-drop);
}

</style>
