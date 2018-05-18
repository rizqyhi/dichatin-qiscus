<template lang="pug">
  div(class="qcw-notification" v-show="newMessagesExist") {{ message }}
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      default: 0,
    },
  },

  computed: {
    newMessagesCount() {
      return this.count;
    },
    newMessagesExist() {
      return this.newMessagesCount > 0;
    },
    message() {
      return `${this.newMessagesCount} pesan baru`;
    },
  },
};
</script>

<style lang="stylus">
@import '../assets/stylus/_variables.styl'

.qcw-notification
  padding: 10px 15px
  background #34b6ff
  color #fff
  border-radius: $big-border-radius
  transition all .3s ease
  box-shadow 0 7px 16px rgba(46,46,46,.15)
  text-align center
  font-size 0.8rem
</style>
