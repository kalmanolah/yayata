<template lang="pug">
  div
    .card.card-top-blue.col-md-12
      h4.card-title.text-md-center
        | Request a Leave
      .card-block
        form
          .row
            .col-md-6
              .form-group.row
                label.col-sm-2.form-control-label(for='inputEmail3') From
                .col-sm-10
                  input#inputEmail3.form-control(type='date', placeholder='Pick a date')
              .form-group.row
                label.col-sm-2.form-control-label(for='inputPassword3') To
                .col-sm-10
                  input#inputPassword3.form-control(type='date', placeholder='Pick a date')
            .col-md-6
              .form-group.row
                input(type="checkbox").col-sm-1
                label.col-sm-4.form-control-label(for='inputEmail3') Full day
                .col-sm-7
                  input#inputEmail3.form-control(type='email', placeholder='00:00')
              .form-group.row
                input(type="checkbox").col-sm-1.
                label.col-sm-4.form-control-label(for='inputEmail3') Full day
                .col-sm-7
                  input#inputEmail3.form-control(type='email', placeholder='12:00')
          .row
            .col-md-12
              .row
                textarea.col-md-12.form-control(placeholder="Please give a description yo, we ain't letting you go without a proper explanation")


</template>

<script>

var data = {};

export default {
  name: 'LeaveForm',
  data () {
    return data;
  }
}
</script>
