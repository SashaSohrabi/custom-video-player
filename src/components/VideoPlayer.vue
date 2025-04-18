<template>
  <div class="player">
    <video
      class="player__video"
      ref="video"
      :src="videoSrc"
      @click="togglePlay"
      @play="updateButton"
      @pause="updateButton"
      @timeupdate="handleProgress"
      @loadedmetadata="onLoadedMetadata"
    ></video>
    <PlayerControls
      :is-playing="isPlaying"
      :is-fullscreen="isFullscreen"
      :progress-percent="progressPercent"
      :duration="duration"
      :current-time="currentTime"
      @toggle-play="togglePlay"
      @toggle-mute="toggleMute"
      @toggle-fullscreen="toggleFullscreen"
      @seek="seekTo"
      @skip="skip"
      v-model:volume="volume"
      v-model:playback-rate="playbackRate"
      v-model:is-muted="isMuted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch, onMounted, onBeforeUnmount } from 'vue';
import { withVideo } from '@/composables/useVideo';
import PlayerControls from '@/components/PlayerControls.vue';

const videoSrc =
  'https://meetyoo-code-challenge.s3.eu-central-1.amazonaws.com/live/S14JJ9Z6PKoO/bf1d4883-5305-4d65-a299-cbb654ef1ed9/video.webm'; //TODO: Move to constants

const video = useTemplateRef<HTMLVideoElement>('video');
const isPlaying = ref(false);
const isMuted = ref(false);
const isFullscreen = ref(false);
const volume = ref(1);
const playbackRate = ref(1);
const progressPercent = ref(0);
const currentTime = ref(0);
const duration = ref(0); // in seconds

const togglePlay = () => {
  withVideo(video, (v) => (v.paused ? v.play() : v.pause()));
};

watch(volume, (newVolume) => {
  withVideo(video, (v) => {
    v.volume = newVolume;
  });
});

watch(playbackRate, (newRate) => {
  withVideo(video, (v) => {
    v.playbackRate = newRate;
  });
});

const toggleMute = () => {
  withVideo(video, (v) => {
    v.muted = !v.muted;
    isMuted.value = v.muted;
  });
};

const updateButton = () => {
  withVideo(video, (v) => {
    isPlaying.value = !v.paused;
  });
};

const handleProgress = () => {
  withVideo(video, (v) => {
    currentTime.value = v.currentTime;
    progressPercent.value = (v.currentTime / v.duration) * 100;
  });
};

const seekTo = (time: number) => {
  withVideo(video, (v) => {
    v.currentTime = time;
  });
};

const skip = (time: number) => {
  withVideo(video, (v) => {
    v.currentTime += time;
  });
};

const onLoadedMetadata = () => {
  withVideo(video, (v) => {
    duration.value = v.duration;
  });
};

const toggleFullscreen = () => {
  const playerContainer = video.value?.parentElement;
  if (!playerContainer) return;

  if (!document.fullscreenElement) {
    playerContainer?.requestFullscreen?.() ||
      (playerContainer as any).webkitRequestFullscreen?.() ||
      (playerContainer as any).mozRequestFullScreen?.() ||
      (playerContainer as any).msRequestFullscreen?.();
  } else {
    document.exitFullscreen?.() ||
      (document as any).webkitExitFullscreen?.() ||
      (document as any).mozCancelFullScreen?.() ||
      (document as any).msExitFullscreen?.();
  }
};

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});
</script>

<style scoped lang="scss">
.player {
  width: 100%;
  background: rgba($black, 0.95);
  box-shadow: 0 0 20px rgba($black, 0.2);
  aspect-ratio: 16 / 9;
  position: relative;
  overflow: hidden;

  &__video {
    width: 100%;
  }

  &:hover {
    .player-controls {
      transform: translateY(0);
    }
  }
}
</style>
