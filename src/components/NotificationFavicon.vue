<template>
</template>

<script>
export default {
  props: {
    replaceFavicon: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      faviconSelector: 'link[rel="icon"][sizes="32x32"]',
      originalFavicon: '',
      generatedFavicon: '',
    };
  },

  watch: {
    replaceFavicon: function replaceFavicon(shouldReplace) {
      if (shouldReplace) {
        this.getFaviconEl().href = this.generatedFavicon;
      } else {
        this.getFaviconEl().href = this.originalFavicon;
      }
    },
  },

  methods: {
    getFaviconEl() {
      return document.querySelector(this.faviconSelector);
    },
    generateFavicon() {
      const faviconSize = 16;
      const canvas = document.createElement('canvas');
      canvas.width = faviconSize;
      canvas.height = faviconSize;

      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      img.src = this.originalFavicon;

      img.onload = () => {
        ctx.drawImage(img, 0, faviconSize * 0.2, faviconSize * 0.8, faviconSize * 0.8);

        ctx.beginPath();
        ctx.arc(canvas.width - (faviconSize / 4), faviconSize / 4, faviconSize / 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff2424';
        ctx.fill();

        this.generatedFavicon = canvas.toDataURL('image/png');
      };
    },
  },

  created() {
    try {
      const faviconEl = this.getFaviconEl();
      this.originalFavicon = faviconEl.href;
      this.generateFavicon();
    } catch (error) {
      // console.log(error);
    }
  },
};
</script>
