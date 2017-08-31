<template lang="pug">
div.location-select
  .text-md-center
    strong Select location
  b-form-radio(:id='location_radio',v-model='selectedLocation', :options='whereaboutLocations', stacked)

</template>
<script>
import Vue from 'vue';
import store from '../store';
import * as types from '../store/mutation-types';
import moment from 'moment';
import ToastMixin from './mixins/ToastMixin.vue';

export default {
  name: 'locationselect',
  mixins: [ToastMixin],
  data() {
    return {
      selectedLocation: null
    }
  },
  created () {
    store.dispatch(types.NINETOFIVER_RELOAD_WHEREABOUTS).then( () => {
      if(store.getters.whereabouts) {
        let wb = store.getters.whereabouts.find(w => w.day == moment(this.properties.date).format('D') && w.timesheet === this.properties.data.timesheet.id);
        if(wb) {
          this.selectedLocation = wb.location;
        }
      }
    }).catch( (error) => {
      console.log(error);
      this.showWarningtoast('Something went wrong when reloading location. Check console for more information') 
    });
  },
  props: {
    properties: {
      type: Object,
      default: null,
      validator(value) {
        return (value !== null && value !== undefined && typeof value === 'object')
      }
    }
  },
  methods: { 
    patchOrSetLocation: function () {
      console.log(this.selectedLocation);
    },

    patchWhereabout: function(whereaboutId) {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/whereabouts/' + whereaboutId + '/',
        method: 'PATCH',
        body: {
          location: this.selectedLocation,
          day: moment(this.properties.date).date(),
          timesheet: this.properties.data.timesheet.id
        },
        emulateJSON: true
      }).then( () => {
        store.dispatch(types.NINETOFIVER_RELOAD_WHEREABOUTS);
        this.showInfoToast('Updated whereabout to ' + this.selectedLocation + '!');
      }).catch((error) => {
        console.log(error);
        this.showDangerToast('Something went wrong. Check console for more information');
      });
    },

    createWhereabout: function() {
      store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/whereabouts/',
        method: 'POST',
        body: {
          location: this.selectedLocation,
          day: moment(this.properties.date).date(),
          timesheet: this.properties.data.timesheet.id
        },
        emulateJSON: true
      }).then((res) => {
        if(res) {
          store.dispatch(types.NINETOFIVER_RELOAD_WHEREABOUTS);
          this.showSuccessToast('Set whereabout to ' + this.selectedLocation + '!');
        } 
      }).catch((error) => {
        console.log(error);
        this.showDangerToast('Something went wrong. Check console for more information');
      });
    },

    // Create new whereabout
    setWhereabout: function() {
      store.dispatch(types.NINETOFIVER_RELOAD_WHEREABOUTS).then( () => {
        let whereabout = store.getters.whereabouts.find(w => w.day == moment(this.properties.date).format('D') && w.timesheet === this.properties.data.timesheet.id)
        // Whereabout already exists
        if(whereabout){
          this.patchWhereabout(whereabout.id);
        // Whereabout does not exist
        } else {
          this.createWhereabout();
        }
      }).catch( (error) => {
        console.log(error);
        this.showDangerToast('Something went wrong when reloading locations. Check console for more information');
      });
    }
  },
  computed: {
    whereaboutLocations: function () {
      if(store.getters.whereabout_locations) {
        return store.getters.whereabout_locations;
      }
    },

    
  },
  watch: {
    selectedLocation: function (newSelectedLocation, oldSelectedLocation) {
      if(oldSelectedLocation){
        this.setWhereabout();
      }
    }
  }
}
</script>
<style scoped>
.location-select {
  color: black
}
</style>