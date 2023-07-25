<template>
  <CompressText />
</template>

<script>
  import CompressText from '@/components/CompressText.vue';

  export default {
    name: 'App',
    components: {
      CompressText,
    },
  };
</script>

<style lang="scss">
  * {
    box-sizing: border-box;
    overflow-wrap: break-word;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    font-family: var(--default-font-family);
    color: var(--main-color);
    font-size: 14px;
  }
</style>
