<template>
  <div class="video-wrapper">
    <VideoPlayer />
  </div>
</template>

<script setup>
import VideoPlayer from './components/VideoPlayer.vue';
</script>

<style scoped lang="scss">
.video-wrapper {
  padding: 30px;
  width: 100%;
  max-width: 750px;
}
</style>