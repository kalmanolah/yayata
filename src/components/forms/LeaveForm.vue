<template lang="pug">
  div
    .card.card-top-blue
      .card-block
        form
          .row
            .col-md8
              .form-group.row
                label.col-sm-2.form-control-label(for='inputEmail3') Email
                .col-sm-10
                  input#inputEmail3.form-control(type='email', placeholder='Email')
              .form-group.row
                label.col-sm-2.form-control-label(for='inputPassword3') Password
                .col-sm-10
                  input#inputPassword3.form-control(type='password', placeholder='Password')
            .col-md4
              .form-group.row
                label.col-sm-2.form-control-label(for='inputEmail3') Email
                .col-sm-10
                  input#inputEmail3.form-control(type='email', placeholder='Email')
              .form-group.row
                label.col-sm-2.form-control-label(for='inputPassword3') Password
                .col-sm-10
                  input#inputPassword3.form-control(type='password', placeholder='Password')


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
