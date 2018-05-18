<template lang="pug">
  .qcw-trigger-btn(@click="clickHandler" :style="buttonStyle")
    | {{ (label) ? label : 'Talk To Us' }}
</template>

<script>
export default {
  name: 'QiscusTriggerButton',
  props: ['label', 'clickHandler', 'core'],
  data() {
    return {
      buttonStyle: {},
    };
  },
  mounted() {
    this.buttonStyle = {
      background: this.core.UI.colors.widgetButtonBackgroundColor,
    };
  },
};
</script>

<style lang="stylus">
@import '../assets/stylus/_variables.styl'

.qcw-trigger-btn
  background: $green
  color: $white
  padding: 10px 15px
  border-radius: $big-border-radius
  vertical-align middle
  width 120px
  text-align center
  cursor pointer
  transition all .3s ease
  box-shadow 0 7px 16px rgba(46,46,46,.15)
  margin-top: 15px

  @media screen and (max-width: 600px)
    position relative
    z-index 0
  
  &:hover
    transform translateY(-3px)
    box-shadow 0 7px 16px rgba(46,46,46,.25)
  
  .qcw-container.qcw-container--wide &
    display none
</style>


