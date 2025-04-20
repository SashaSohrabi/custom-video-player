<template>
  <div
    class="player"
    ref="videoWrapper"
    :style="isLoading || hasError ? { width: fixedWidth } : {}"
  >
    <video
      preload="auto"
      class="player__video"
      ref="video"
      tabindex="0"
      aria-label="Video player. Use keyboard arrows for playback control"
      @waiting="isLoading = true"
      @playing="isLoading = false"
      :src="videoSrc"
      @click="togglePlay"
      @play="updatePlayState"
      @pause="updatePlayState"
      @timeupdate="handleProgress"
      @loadedmetadata="onLoadedMetadata"
      @loadeddata="onLoadedData"
      @error="onVideoError"
      @canplay="onCanPlay"
      @keydown.space.prevent="togglePlay"
      @keydown.k.prevent="togglePlay"
      @keydown.right="skip(25)"
      @keydown.left="skip(-10)"
      @keydown.up.prevent="increaseVolume"
      @keydown.down.prevent="decreaseVolume"
      @keydown.m="toggleMute"
      @keydown.f="toggleFullscreen"
      @keydown.c="toggleCaptions"
      @keydown.[="decreaseRate"
      @keydown.]="increaseRate"
    ></video>

    <PlayerOverlay :is-loading="isLoading" :has-error="hasError" />

    <PlayerControls
      :is-playing="isPlaying"
      :is-fullscreen="isFullscreen"
      :captions-enabled="captionsEnabled"
      :progress-percent="progressPercent"
      :duration="duration"
      :current-time="currentTime"
      :current-subtitle="currentSubtitle"
      :chapters="chapters"
      @toggle-play="togglePlay"
      @toggle-mute="toggleMute"
      @toggle-fullscreen="toggleFullscreen"
      @toggle-captions="toggleCaptions"
      @seek="seekTo"
      @skip="skip"
      v-model:volume="volume"
      v-model:playback-rate="playbackRate"
      v-model:is-muted="isMuted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, computed, watch, onMounted } from 'vue';
import PlayerControls from '@/components/PlayerControls.vue';
import PlayerOverlay from './PlayerOverlay.vue';
import { withVideo } from '@/composables/useVideo';
import { useFullscreen } from '@/composables/useFullscreen';
import { useFixedWidth } from '@/composables/useFixedWidth';
import { parseVTT } from '@/utilities/subtitleUtils';
import type { Chapter, Subtitle } from '@/types';

const video = useTemplateRef<HTMLVideoElement>('video');
const videoWrapper = useTemplateRef<HTMLElement>('videoWrapper');
const isLoading = ref(true);
const hasError = ref(false);
const isPlaying = ref(false);
const isMuted = ref(false);
const captionsEnabled = ref(false);
const volume = ref(1);
const playbackRate = ref(1);
const progressPercent = ref(0);
const currentTime = ref(0);
const duration = ref(0); // in seconds;

const chapters = ref<Chapter[]>([]);
const subtitles = ref<Subtitle[]>([]);
const currentSubtitle = ref<Subtitle | null>(null);

const { isFullscreen, toggleFullscreen } = useFullscreen(videoWrapper);
const { fixedWidth } = useFixedWidth();

const videoSrc = computed(() => '/api/video.webm');

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

const onLoadedData = () => {
  isLoading.value = false;
};

const onCanPlay = () => {
  isLoading.value = false;
};

const onVideoError = () => {
  isLoading.value = false;
  hasError.value = true;
};

const toggleMute = () => {
  withVideo(video, (v) => {
    v.muted = !v.muted;
    isMuted.value = v.muted;
  });
};

const toggleCaptions = () => {
  captionsEnabled.value = !captionsEnabled.value;
};

const updatePlayState = () => {
  withVideo(video, (v) => {
    isPlaying.value = !v.paused;
  });
};

const updateSubtitle = () => {
  if (!subtitles.value.length) return;
  currentSubtitle.value =
    subtitles.value.find(
      (sub) => currentTime.value >= sub.start && currentTime.value <= sub.end
    ) || null;
};

const handleProgress = () => {
  withVideo(video, (v) => {
    if (!v.duration || isNaN(v.duration)) return;
    currentTime.value = v.currentTime;
    progressPercent.value = (v.currentTime / v.duration) * 100;
    updateSubtitle();
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

const increaseVolume = () => {
  volume.value = Math.min(volume.value + 0.05, 1);
};

const decreaseVolume = () => {
  volume.value = Math.max(volume.value - 0.05, 0);
};

const increaseRate = () => {
  playbackRate.value = Math.min(playbackRate.value + 0.1, 2);
};

const decreaseRate = () => {
  playbackRate.value = Math.max(playbackRate.value - 0.1, 0.5);
};

const fetchChapters = async () => {
  try {
    const res = await fetch('/api/full.xml');
    if (!res.ok) {
      throw new Error(`Failed to fetch chapters: ${res.statusText}`);
    }

    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');

    const parserError = xml.querySelector('parsererror');
    if (parserError) {
      throw new Error('Failed to parse XML: Invalid structure');
    }

    const chapterStream = xml.querySelector('EventStream[value="chapters"]');
    const eventNodes = chapterStream?.querySelectorAll('Event') ?? [];

    chapters.value = Array.from(eventNodes).map((node) => ({
      title: node.getAttribute('title') ?? 'Untitled',
      time: parseInt(node.getAttribute('presentationTime') ?? '0', 10) / 1000, // seconds
    }));
  } catch (error) {
    console.error('[fetchChapters] Error:', error);
    chapters.value = [];
  }
};

const fetchSubtitles = async () => {
  try {
    const res = await fetch('/api/transcript.vtt');
    if (!res.ok) {
      throw new Error(`Failed to fetch subtitles: ${res.statusText}`);
    }

    const text = await res.text();
    subtitles.value = parseVTT(text);
  } catch (error) {
    console.error('[fetchSubtitles] Error:', error);
    subtitles.value = [];
  }
};

onMounted(async () => {
  try {
    await Promise.all([fetchSubtitles(), fetchChapters()]);
  } catch (error) {
    console.error('Failed to fetch subtitles or chapters:', error);
  }
});
</script>

<style scoped lang="scss">
.player {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba($black, 0.95);
  box-shadow: 0 0 2rem rgba($black, 0.2);
  position: relative;
  overflow: hidden;

  &__video {
    width: 100%;
    height: auto;
    max-height: 100%;
  }

  &:hover,
  &:focus-within {
    .player-controls {
      transform: translateY(0);
    }
  }
}
</style>
