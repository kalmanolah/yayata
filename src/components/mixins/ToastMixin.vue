<script>
export default {
  methods: {
    // Displays a toast with message
    showToast: function(text) {
      this.$toast(text,
        {
          id: 'toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 2500,
          transition: 'slide-down',
          mode: 'override'
        });
    },

    // Displays a warning toast with message
    showWarningToast: function(text) {
      this.$toast(text,
        {
          id: 'toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          className: 'et-warn',
          duration: 2500,
          transition: 'slide-down',
          mode: 'override'
        });
    },

    // Displays a danger toast with message
    showDangerToast: function(text) {
      this.$toast(text,
        {
          id: 'toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          className: 'et-danger',
          duration: 2500,
          transition: 'slide-down',
          mode: 'override'
        });
    },

    // Displays an info toast with message
    showInfoToast: function(text) {
      this.$toast(text,
        {
          id: 'toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          className: 'et-info',
          duration: 2500,
          transition: 'slide-down',
          mode: 'override'
        });
    },

    // Displays a success toast with message
    showSuccessToast: function(text) {
      this.$toast(text,
        {
          id: 'toast',
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
<style lang="less">
.et-wrapper {
  margin: 25px;

  &.et-success {
    background-color: rgba(40, 167, 69, 0.8);
  }

  &.et-warn {
    background-color: rgba(200, 109, 43, 0.8);
  }

  &.et-danger {
    background-color: rgba(203, 23, 23, 0.8);
  }

  &.et-info {
    background-color: rgba(67, 131, 163, 0.8);
  }
}
</style>
