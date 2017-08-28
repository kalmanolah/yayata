<script>
export default {
  methods: {
    //Get the amount of hours spent 
    getDurationTotal: function(day) {
      let total = 0;

      for(let val of this.activityPerformances.filter(x => x.day == day.format('D')))
        total += parseFloat(val.duration);
      
      return total;
    },
    
    //Get total hours/day from the workSchedule per user
    getHoursTotal: function(day) {
      if(this.workSchedule) {

        let total = this.workSchedule[day.format('dddd').toLowerCase()];
        let date = day.date();

        if(this.getDaysHolidays(date) && this.getDaysHolidays(date).length > 0) {
          let weekday = day.format('dddd').toLowerCase()
          total -= parseInt(this.workSchedule[weekday]);
        }

        // Add hours with leave of this day to total
        if(this.leaves) {
          let leaves = this.getDaysLeaves(day);
          leaves.forEach((leave) => {
            total -= parseFloat(leave.leaveDuration)
          });
        }

        return total > 0 ? total : 0;
      } 
    },

    getDaysHolidays: function(day) {
      if(this.holidays) {
        let result = [];
        this.holidays.forEach((holiday) => {
          if(moment(holiday.date).date() == day) {
            result.push(holiday)
          }
        });

        return result;
      }
    },

    getDaysLeaves: function(day) {
      let result = [];

      this.leaves.forEach((leave) => {
        let ld = leave.leavedate_set.find((ld) => moment(ld.starts_at).isSame(day, 'day'));

        if(ld) {
          let leaveDuration = null;

          // Leave spans multiple days
          if(leave.leavedate_set.length > 1) {

            // Subtract full workday from total
            let weekday = moment(day).format('dddd').toLowerCase();
            leaveDuration = parseInt(this.workSchedule[weekday]);

          } else {
            leaveDuration = (moment(ld.ends_at).diff(moment(ld.starts_at), 'minutes')/60);
          }

          leave.leaveDuration = leaveDuration;
          result.push(leave)
        }
      });
      return result;
    }
  }
}
</script>
