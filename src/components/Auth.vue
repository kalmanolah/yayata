<template lang="pug">
div(class='container')
  div(class='row')
    div(class='col-lg-4 offset-lg-4 col-md-6 offset-md-3 col-sm-8 offset-sm-2')
      div(class='my-1')
      div(class='card')
        router-link(:to='{ name: "home" }')
          img(class='card-img-top img-fluid px-1 pt-2' src='../assets/img/logo_text.jpg')
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
