<template>
</template>

<script>
export default {
  props: {
    play: {
      type: Boolean,
      default: false,
    },
  },

  watch: {
    play: function playWatcher(play) {
      if (play) {
        this.audio.play();
      } else {
        this.audio.pause();
        this.audio.currentTime = 0.0;
      }
    },
  },

  created() {
    this.audio = new window.Audio();

    // https://notificationsounds.com/notification-sounds/quite-impressed-565
    this.audio.src = '/static/notification.mp3';
  },
};
</script>
