<template lang="pug">
div
  .row
    h3 Redmine
  .row
    .btn-group(role='group')
      button.btn.btn-secondary.dropdown-toggle#btnGroupDropContract(type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false') {{ selectedContract.displayLabel }}
      .dropdown-menu(aria-labelledby='btnGroupDropContract')
        a.dropdown-item(v-for='contract in contracts' @click='selectContract(contract)') {{ contract.display_label }}
    .btn-group.pull-right
      button.btn.btn-primary(@click='importToYayata()') Import to Yayata
  br
  .row
    h3.text-md-center Not imported
    table.table.table-striped
      thead
        tr
          th Activity
          th Hours
          th Issue
          th Comments
          th 
            b-form-checkbox(v-model='checkedStateImported') &nbsp;
      tbody(v-if='contractTimeEntries')
        template(v-for='timeEntry in contractTimeEntries')
          template(v-if='!getImportStatus(timeEntry)')
            tr
            td {{ timeEntry.activity.name }}
            td {{ timeEntry.hours }}
            td 
              a(:href="'https://redmine.inuits.eu/issues/' + timeEntry.issue.id") {{ timeEntry.issue.id }}
            td {{ timeEntry.comments }}
            td
              b-form-checkbox(v-model='timeEntry.checked') &nbsp;
  br
  .row
    h3.text-md-center Imported
    table.table.table-striped
      thead
        tr
          th Activity
          th Hours
          th Issue
          th Comments
          th 
            b-form-checkbox(v-model='checkedStateNotImported') &nbsp;
      tbody(v-if='contractTimeEntries')
        template(v-for='timeEntry in contractTimeEntries')
          template(v-if='getImportStatus(timeEntry)')
            tr
              td(:class='checkDiff(timeEntry)') {{ timeEntry.activity.name }}
              td(:class='checkDiffHours(timeEntry)') {{ timeEntry.hours }}
              td(:class='checkDiff(timeEntry)') 
                a(:href="'https://redmine.inuits.eu/issues/' + timeEntry.issue.id") {{ timeEntry.issue.id }}
              td(:class='checkDiffComments(timeEntry)') {{ timeEntry.comments }}
              td(:class='checkDiff(timeEntry)')
                b-form-checkbox(v-model='timeEntry.checked') &nbsp;
</template>
<script>
import store from '../store';
import moment from 'moment';
import * as types from '../store/mutation-types'

export default {
  name: 'redmine',

  data() {
    return {
      selectedContract: {
        displayLabel: 'Select Contract',
        value: null
      },
      contractTimeEntries: null,
      checkedStateImported: true, 
      checkedStateNotImported: true, 
    }
  },

  created: function() {
    // Reload redmine time entries for this user and this month
    store.dispatch(types.NINETOFIVER_RELOAD_REDMINE_TIME_ENTRIES, {
      params: {
        user_id: 344,
        month: moment().month() + 1
      }
    });

    // Reload filtered contracts for this user
    store.dispatch(types.NINETOFIVER_RELOAD_FILTERED_CONTRACTS, {
      params: {
        contractuser__user__id: store.getters.user.id
      }
    })  
  },

  computed: {
    contracts: function() {
      if(store.getters.filtered_contracts) {
        return store.getters.filtered_contracts;
      }
    },

    timeEntries: function() {
      if(store.getters.redmine_time_entries) {
        let timeEntries = store.getters.redmine_time_entries;
        timeEntries.forEach((te) => {
          te.checked = true;
        });
        return timeEntries
      }
    },

    importedTimeEntries: function() {
      if(this.contractTimeEntries) {
        return this.contractTimeEntries.filter((te) => {
          if(!this.getImportStatus(te)){
            return te;
          }
        });
      }
    },

    notImportedTimeEntries: function() {
      if(this.contractTimeEntries) {
        return this.contractTimeEntries.filter((te) => {
          if(this.getImportStatus(te)){
            return te;
          }
        });
      }
    },

    timesheet: function() {
      return store.getters.timesheets.find(x => 
          x.month == moment().month() + 1
          &&
          x.year == moment().year()
        );
    },

    performances: function() {
      if(store.getters.activity_performances && this.timesheet) {
        return store.getters.activity_performances.filter((p) => p.redmine_time_entry_id && p.timesheet === this.timesheet.id)
      }
    }
  },

  watch: {
    // Watch checkedState and update the checked status of all time entries.
    checkedStateImported: function(newCheckedState) {
      this.toggleAllImported();
    },

    checkedStateNotImported: function(newCheckedState) {
      this.toggleAllNotImported();
    },

  },

  methods: {
    toggleAllImported() {
      this.contractTimeEntries.forEach((te) => {
        if(!this.getImportStatus(te)){
          te.checked = this.checkedStateImported
        }
      });
    },

    toggleAllNotImported() {
      this.contractTimeEntries.forEach((te) => {
        if(this.getImportStatus(te)) {
          te.checked = this.checkedStateNotImported;
        }
      });
    },

    selectContract: function(contract) {
      this.selectedContract.displayLabel = contract.display_label;
      this.selectedContract.value = contract.id;

      this.contractTimeEntries = this.timeEntries.filter((te) => {
        return contract.redmine_project_id && te.project.id === contract.redmine_project_id
      });
    },
    
    submitTimeEntries: function() {
      // Create a new timesheet if timesheet is undefined
      if(!this.timesheet) {
        this.createTimesheet().then((response) => {
          if(response.status === 201){
            this.importToYayata();
          } else {
            console.log(response);
            this.showToast('Could not create a new timesheet, check the console for more information.');
          }
        });
      } else {
        this.importToYayata();
      }
    },

    importToYayata: function() {
      let success = true;
      this.contractTimeEntries.forEach((te) => {
        // Check if Time Entry has been imported already and if it has been updated.
        if(this.getImportStatus(te) && this.checkDiff(te)){
          // Patch performance
          if(te.checked) {
            let performance = this.performances.find((perf) => perf.redmine_time_entry_id === te.id);
            let body = {
              timesheet: performance.timesheet,
              day: performance.day,
              duration: te.hours,
              description: te.comments,
              performance_type: performance.performance_type,
              contract: performance.contract,
              contract_role: performance.contract_role,
              redmine_time_entry_id: performance.redmine_time_entry_id
            }
            store.dispatch(types.NINETOFIVER_API_REQUEST, {
              path: '/my_performances/activity/' + performance.id + '/',
              method: 'PATCH',
              body: body,
              emulateJSON: true,
            }).then((res) => {
              console.log(res)
            }).catch((error) => {
              success = false;
            })
          }
        } else {
          // Create a new performance for each selected time entry
          if(te.checked) {
            let contract_id = this.contracts.find((c) => te.project.id === c.redmine_project_id).id;
            let body = {
              timesheet: this.timesheet.id,
              day: moment(te.spent_on).date(),
              duration: te.hours * 1,
              description: te.comments,
              performance_type: 1,
              contract: contract_id,
              contract_role: 1,
              redmine_time_entry_id: te.id
            }
            // Create new performance
            store.dispatch(types.NINETOFIVER_API_REQUEST, {
              path: '/my_performances/activity/',
              method: 'POST',
              body: body,
              emulateJSON: true,
            }).then((res) => {
              console.log(res)
            }).catch((error) => {
              success = false;
            });
          }
        };
      });
      let message = success ? 'Time entries imported!' : 'Something went wrong.';
      this.showToast(message);
    },

    createTimesheet: function() {
      return store.dispatch(types.NINETOFIVER_API_REQUEST, {
        path: '/my_timesheets/',
        method: 'POST',
        params: {
          year: moment().year(),
          month: moment().month() + 1
        }
      });
    },

    showToast: function(message) {
      this.$toast(
        message,
        { 
          id: 'import-toast',
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 2000,
          transition: 'slide-down',
          mode: 'override'
      });
    },

    getImportStatus(timeEntry) {
      let performance = this.performances.find((p) => {
        return p.redmine_time_entry_id === timeEntry.id
      })
      return performance ? true : false; 
    },

    checkDiff(timeEntry) {
      // Check if the time entry has been updated.
      let performance = this.performances.find((perf) => perf.redmine_time_entry_id === timeEntry.id);
      return timeEntry.hours != performance.duration ? true : timeEntry.comments === performance.description ? true : false;
    },

    checkDiffHours(timeEntry) {
      // Check if the time entry hours have been updated.
      let performance = this.performances.find((perf) => perf.redmine_time_entry_id === timeEntry.id);
      console.log(performance.duration)
      console.log(timeEntry.hours)
      return timeEntry.hours == performance.duration * 1 ? '' : 'diff'
    },

    checkDiffComments(timeEntry) {
      // Check if the time entry comments have been updated.
      let performance = this.performances.find((perf) => perf.redmine_time_entry_id === timeEntry.id);
      return timeEntry.comments === performance.description ? '' : diff
    },


  }
}
</script>
<style>
.diff {
  background: orange;
}
</style>
