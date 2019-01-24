<template lang="pug">
div(v-if='user' class='d-flex')
  router-link(
    :to='{ name: "colleague", params: { userId: user.id }}'
    class='avatar-container'
    :title='user.display_label'
    v-b-tooltip="{boundary: 'window'}"
  )
    span(class='avatar-label') {{ user.display_label }}
    img(
      class='img-fluid'
      v-bind:style='{"max-height": avatarSize + "px"}'
      :src='getAvatarUrl(user)'
    )
</template>

<script>
import utils from '../../utils';

export default {
  name: 'ColleagueAvatarWidget',

  props: [
    'user',
    'size',
  ],

  computed: {
    avatarSize: function () {
      return this.size ? this.size : 250
    }
  },

  methods: {
    getAvatarUrl: utils.getAvatarUrl,
  }
}
</script>

<style scoped lang="less">
.avatar-container {
  display: block;
  position: relative;
  padding: .2rem .2rem 1.1rem;
	background-color: #fff;
	border: 1px solid #dee2e6;
	border-radius: .2rem;
}

.avatar-label {
  position: absolute;
  bottom: .2rem;
  left: .2rem;
  right: .2rem;
  color: #000;
  font-size: 0.7rem;
  line-height: 0.7rem;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>