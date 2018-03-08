<template lang="pug">
div(class='container')
  div(class='row justify-content-center')
    div(class='col-lg-4 col-md-6 col-sm-8')
      div(class='my-4')
      div(class='card')
        router-link(:to='{ name: "home" }')
          img(class='card-img-top img-fluid px-4 py-4' src='../assets/img/logo_text.svg')
        div(class='card-block')
          h4(class='card-title')
            block title
          router-view
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
