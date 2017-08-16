<template lang="pug">
.container
  .row
    .col
    .col-md-6.col-sm-12
      .card.m-3
        router-link(:to='{ name: "home" }')
          img(class='card-img-top img-fluid px-1 pt-2' src='../assets/img/logo_text.svg')
        div(class='card-block')
          h4(class='card-title')
            block title
          router-view
    .col
</template>

<script>
export default {
  name: 'auth',
  data () {
    return {
    }
  }
}
</script>
