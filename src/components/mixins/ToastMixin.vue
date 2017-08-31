<script>
export default {
  methods: {
    //Displays a toast with message
    showToast: function(text) {
      this.$toast(text, 
        { 
          id: 'performance-toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 2500,
          transition: 'slide-down',
          mode: 'override'
        });
    },

    //Displays a warning toast with message
    showWarningToast(text) {
      this.$toast(text, 
        { 
          id: 'performance-toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          className: 'et-warn',
          duration: 2500,
          transition: 'slide-down',
          mode: 'override'
        });
    },

    //Displays a danger toast with message
    showDangerToast(text) {
      this.$toast(text, 
        { 
          id: 'performance-toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          className: 'et-danger',
          duration: 2500,
          transition: 'slide-down',
          mode: 'override'
        });
    },

    //Displays an info toast with message
    showInfoToast(text) {
      this.$toast(text, 
        { 
          id: 'performance-toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          className: 'et-info',
          duration: 2500,
          transition: 'slide-down',
          mode: 'override'
        });
    },

    //Displays a success toast with message
    showSuccessToast(text) {
      this.$toast(text, 
        { 
          id: 'performance-toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          className: 'et-success',
          duration: 2500,
          transition: 'slide-down',
          mode: 'override'
        });
    },
  }
}
</script>
<style>
.et-wrapper.et-success {
  background-color: rgba(40, 167, 69, 0.7);
}
</style>
