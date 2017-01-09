<template lang="pug">
div
  .card.card-top-blue.col-md-12
    h4.card-title.text-md-center
      i.fa.fa-plane
      | &nbsp; Request a Leave
    .card-block
      vue-form-generator(:schema="schema",:model="model",:options="formOptions")
</template>

<script>
import moment from 'moment'

var today = new Date();
console.log(moment().format('YYYY-MM-DD'))

export default {
  data: () => {
    return {

      name: 'LeaveForm',

      model: {
        start_date: moment().add(1, ('days')).format('YYYY-MM-DD'),
        end_date: moment().add(2, 'days').format('YYYY-MM-DD'),
        start_hour: '00:00',
        end_hour: '00:00',
        start_full_day: true,
        end_full_day: true,
        description: "",
        attachement: null,
      },

      schema: {
        fields: [
        {
          type: "input",
          inputType: "date",
          label: "From",
          model: "start_date",
          placeholder: "From",
          featured: true,
          required: true,
          styleClasses: ['col-md-6', 'clearfix'],
        },
        {
          type: "checkbox",
          label: "Full day",
          model: "start_full_day",
          default: true,
          styleClasses: 'col-md-2'
        },
        {
          type: "text",
          label: "From",
          model: "start_hour",
          placeholder: "hh:mm",
          required: false,
          styleClasses: 'col-md-4'
        },
        {
          type: "input",
          inputType: "date",
          label: "To",
          model: "end_date",
          placeholder: "To",
          featured: true,
          required: true,
          styleClasses: ['col-md-6', 'clearfix'],
        },
        {
          type: "checkbox",
          label: "Full day",
          model: "end_full_day",
          styleClasses: 'col-md-2'
        },
        {
          type: "text",
          label: "From",
          model: "end_hour",
          placeholder: "hh:mm",
          required: false,
          styleClasses: 'col-md-4'
        },
        {
          type: "textArea",
          label: "Description",
          model: "description",
        },
        {
          type: "input",
          inputType: "file",
          label: "Attachement",
          model: "attachement",
        }]
      },

      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true
      }
    }
  }
}
</script>
