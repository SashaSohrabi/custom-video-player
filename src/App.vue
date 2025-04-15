<template>
  <div class="player">
    <video
      class="player__video"
      ref="video"
      :src="videoSrc"
      @click="togglePlay"
      @play="updateButton"
      @pause="updateButton"
    ></video>
    <div class="player__controls">
      <button class="player__button" title="Toggle Play" @click="togglePlay">
        {{ isPlaying ? '❚ ❚' : '►' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const videoSrc =
  'https://meetyoo-code-challenge.s3.eu-central-1.amazonaws.com/live/S14JJ9Z6PKoO/bf1d4883-5305-4d65-a299-cbb654ef1ed9/video.webm'; //TODO: Move to constants

const video = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);

const togglePlay = () => {
  if (!video.value) return;
  video.value.paused ? video.value.play() : video.value.pause();
};
const updateButton = () => {
  if (!video.value) return;
  isPlaying.value = !video.value.paused;
};
</script>

<style scoped lang="scss">
.player {
  width: 750px;
  background: rgba($black, 0.95);
  box-shadow: 0 0 20px rgba($black, 0.2);
  aspect-ratio: 16 / 9;
  position: relative;
  overflow: hidden;

  &__video {
    width: 100%;
  }

  &__button {
    background: none;
    border: 0;
    line-height: 1;
    color: $white;
    text-align: center;
    outline: 0;
    padding: 0;
    cursor: pointer;
    max-width: 50px;

    &:focus {
      border-color: $primary-yellow;
    }
  }

  &__controls {
    display: flex;
    position: absolute;
    bottom: 0;
    width: 100%;
    flex-wrap: wrap;
    background: rgba($black, 0.1);
  }
}
</style>
