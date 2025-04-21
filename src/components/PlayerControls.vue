<template>
  <div class="player-controls" role="region" aria-label="Video player controls">
    <div
      class="player-controls__progress"
      ref="progress"
      @pointerdown="onPointerDown"
      @pointermove="throttledPointerMove"
      @pointerleave="onPointerLeave"
      @pointerenter="onPointerEnter"
      :style="chapterHighlightStyle"
    >
      <div
        ref="tooltip"
        v-if="hoveredTime"
        aria-hidden="true"
        class="player-controls__tooltip"
        :style="{ left: tooltipLeft }"
      >
        {{ formatTime(hoveredTime) }}
      </div>
      <div class="player-controls__chapter-overlay">
        {{ currentHoveredChapter?.title }}
      </div>
      <span
        v-for="(chapter, i) in chapters"
        :key="i"
        class="player-controls__chapter-marker"
        :style="{ left: `${(chapter.time / duration) * 100}%` }"
      ></span>
      <div
        class="player-controls__progress-bar"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>
    <div class="player-controls__group">
      <button
        class="player-controls__button"
        :title="playButtonState.title"
        :aria-label="playButtonState.title"
        @click="$emit('toggle-play')"
      >
        <component
          :is="playButtonState.icon"
          :size="playButtonState.size"
          aria-hidden="true"
        />
      </button>
      <button
        class="player-controls__button player-controls__button--replay"
        :title="replayButtonMeta.title"
        :aria-label="replayButtonMeta.title"
        @click="$emit('replay')"
      >
        <component
          :is="replayButtonMeta.icon"
          :size="replayButtonMeta.size"
          aria-hidden="true"
        />
      </button>
      <div class="player-controls__time">
        {{ timeDisplay }}
      </div>
    </div>

    <button
      class="player-controls__button player-controls__button--mute"
      @click="$emit('toggle-mute')"
      :aria-pressed="props.isMuted"
      :title="muteButtonState.title"
      :aria-label="muteButtonState.title"
    >
      <component
        :is="muteButtonState.icon"
        :size="muteButtonState.size"
        aria-hidden="true"
      />
    </button>

    <div
      class="player-controls__slider-wrapper player-controls__slider-wrapper--volume"
    >
      <input
        ref="volume"
        type="range"
        name="volume"
        class="player-controls__slider"
        min="0"
        max="1"
        step="0.05"
        role="slider"
        aria-label="Volume"
        aria-valuemin="0"
        aria-valuemax="1"
        :aria-valuenow="props.volume"
        :value="props.volume"
        :title="volumeMeta.title"
        @input="
          $emit(
            'update:volume',
            parseFloat(($event.target as HTMLInputElement).value)
          )
        "
      />
      <div class="player-controls__tooltip" aria-hidden="true">
        <component
          :is="volumeMeta.icon"
          :size="volumeMeta.size"
          aria-hidden="true"
        />
        {{ volumeMeta.label }}
      </div>
    </div>

    <div
      class="player-controls__chapter-nav"
      :class="{ 'is-fullscreen': isFullscreen }"
    >
      <button
        class="player-controls__button player-controls__button--chapter-nav"
        :title="chapterNavButtons.prev.title"
        :aria-label="chapterNavButtons.prev.title"
        @click="seekToPreviousChapter"
      >
        <component
          :is="chapterNavButtons.prev.icon"
          :size="chapterNavButtons.prev.size"
          aria-hidden="true"
        />
      </button>
      <div
        class="player-controls__chapter-title"
        tabindex="0"
        aria-readonly="true"
        :aria-label="currentChapter?.title"
        :title="currentChapter?.title"
      >
        {{ currentChapterTitle }}
      </div>
      <button
        class="player-controls__button player-controls__button--chapter-nav"
        :title="chapterNavButtons.next.title"
        :aria-label="chapterNavButtons.next.title"
        @click="seekToNextChapter"
      >
        <component
          :is="chapterNavButtons.next.icon"
          :size="chapterNavButtons.next.size"
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      class="player-controls__slider-wrapper player-controls__slider-wrapper--play-back-rate"
    >
      <input
        type="range"
        name="playbackRate"
        class="player-controls__slider"
        min="0.5"
        max="2"
        step="0.1"
        role="slider"
        aria-label="Playback rate"
        aria-valuemin="0.5"
        aria-valuemax="2"
        :aria-valuenow="props.playbackRate"
        :value="props.playbackRate"
        :title="playbackRateMeta.title"
        @input="
          $emit(
            'update:playbackRate',
            parseFloat(($event.target as HTMLInputElement).value)
          )
        "
      />
      <div class="player-controls__tooltip" aria-hidden="true">
        <component
          :is="playbackRateMeta.icon"
          :size="playbackRateMeta.size"
          aria-hidden="true"
        />
        {{ playbackRateMeta.label }}
      </div>
    </div>

    <button
      class="player-controls__button player-controls__button--skip"
      :title="skipButtonMeta.rewind.title"
      :aria-label="skipButtonMeta.rewind.title"
      @click="$emit('skip', -10)"
    >
      <component
        :is="skipButtonMeta.rewind.icon"
        :size="skipButtonMeta.rewind.size"
        aria-hidden="true"
      />
      {{ `${skipButtonMeta.rewind.label}` }}
    </button>
    <button
      class="player-controls__button player-controls__button--skip"
      :title="skipButtonMeta.forward.title"
      :aria-label="skipButtonMeta.forward.title"
      @click="$emit('skip', 25)"
    >
      {{ `${skipButtonMeta.forward.label}` }}
      <component
        :is="skipButtonMeta.forward.icon"
        :size="skipButtonMeta.forward.size"
        aria-hidden="true"
      />
    </button>
    <button
      class="player-controls__button player-controls__button--fullscreen"
      :title="fullscreenButtonState.title"
      :aria-label="fullscreenButtonState.title"
      :aria-pressed="props.isFullscreen"
      @click="$emit('toggle-fullscreen')"
    >
      <component
        :is="fullscreenButtonState.icon"
        :size="fullscreenButtonState.size"
        aria-hidden="true"
      />
    </button>
    <button
      class="player-controls__button player-controls__button--cc"
      :title="closedCaptionsMeta.title"
      :aria-label="closedCaptionsMeta.title"
      :aria-pressed="props.captionsEnabled"
      :class="{ 'is-active': props.captionsEnabled }"
      @click="$emit('toggle-captions')"
    >
      <component
        :is="closedCaptionsMeta.icon"
        :size="closedCaptionsMeta.size"
        aria-hidden="true"
      />
    </button>
    <div
      v-if="captionsEnabled && currentSubtitle"
      class="player-controls__subtitle"
      aria-hidden="true"
    >
      {{ currentSubtitle.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useTemplateRef,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  toRef,
} from 'vue';
import { throttle } from 'lodash-es';
import { formatTime } from '@/utilities/timeUtils';
import type { Chapter, Subtitle } from '@/types';
import { usePlayerMeta } from '@/composables/usePlayerMeta';

const props = defineProps<{
  progressPercent: number;
  currentTime: number;
  currentSubtitle: Subtitle | null;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  captionsEnabled: boolean;
  duration: number;
  volume: number;
  playbackRate: number;
  chapters: Chapter[];
}>();

const emit = defineEmits<{
  (e: 'toggle-play'): void;
  (e: 'toggle-mute'): void;
  (e: 'replay'): void;
  (e: 'toggle-fullscreen'): void;
  (e: 'toggle-captions'): void;
  (e: 'seek', time: number): void;
  (e: 'skip', time: number): void;
  (e: 'update:volume', value: number): void;
  (e: 'update:playbackRate', value: number): void;
  (e: 'update:isMuted', value: boolean): void;
}>();

const progressRef = useTemplateRef<HTMLDivElement>('progress');
const tooltipRef = useTemplateRef<HTMLDivElement>('tooltip');
const volumeRef = useTemplateRef<HTMLInputElement>('volume');

const pointerdown = ref(false);
const tooltipLeft = ref('0px');
const hoveredTime = ref(0);
const isHovered = ref(false);
const currentHoveredChapter = ref<Chapter | null>(null);

const volumePercent = computed(() => `${Math.round(props.volume * 100)}%`);
const playbackRateLabel = computed(() => props.playbackRate.toFixed(1));
const currentChapter = computed(() => getChapterAt(props.currentTime));
const isEnded = computed(() => props.currentTime >= props.duration);

const timeDisplay = computed(() => {
  return `${formatTime(props.currentTime)} / ${formatTime(props.duration)}`;
});

const currentChapterTitle = computed(
  () =>
    currentChapter.value?.title ||
    (isEnded.value ? 'End of video' : 'No chapter')
);

const {
  playButtonState,
  muteButtonState,
  fullscreenButtonState,
  replayButtonMeta,
  playbackRateMeta,
  volumeMeta,
  closedCaptionsMeta,
  skipButtonMeta,
  chapterNavButtons,
} = usePlayerMeta({
  isPlaying: toRef(props, 'isPlaying'),
  isMuted: toRef(props, 'isMuted'),
  isFullscreen: toRef(props, 'isFullscreen'),
  volume: toRef(props, 'volume'),
  playbackRate: toRef(props, 'playbackRate'),
  volumePercent,
  playbackRateLabel,
});

const chapterHighlightStyle = computed(() => {
  if (!isHovered.value || !props.duration || !currentHoveredChapter.value)
    return {};

  const current = currentHoveredChapter.value;
  const nextIndex =
    props.chapters.findIndex((ch) => ch.time === current.time) + 1;
  const next = props.chapters[nextIndex];
  const start = (current.time / props.duration) * 100;
  const end = (next ? next.time / props.duration : 1) * 100;

  return {
    background: `linear-gradient(
      to right,
      transparent ${start}%,
      rgba(97, 221, 1, 0.3) ${start}%,
      rgba(97, 221, 1, 0.3) ${end}%,
      transparent ${end}%
    )`,
  };
});

watch(
  () => props.isMuted,
  () => {
    const input = volumeRef.value as HTMLInputElement | null;
    if (!input) return;

    const volumeValue = props.isMuted ? 0 : 1;
    if (parseFloat(input.value) !== volumeValue) {
      emit('update:volume', volumeValue);
    }
  }
);

watch(
  () => props.volume,
  (newVolume) => {
    const isMutedNow = newVolume === 0;
    if (props.isMuted !== isMutedNow) {
      emit('update:isMuted', isMutedNow);
    }
  }
);

const onPointerDown = (e: PointerEvent) => {
  pointerdown.value = true;
  seekToPointer(e);
};

const onPointerUp = () => (pointerdown.value = false);

const onPointerEnter = () => (isHovered.value = true);

const onPointerLeave = () => (isHovered.value = false);

const onPointerMove = (e: PointerEvent) => {
  const data = getScrubData(e);
  if (!data) return;

  hoveredTime.value = data.scrubTime;
  currentHoveredChapter.value = getChapterAt(hoveredTime.value) ?? null;

  if (pointerdown.value) {
    emit('seek', data.scrubTime);
  }
};

const onPointerCancel = () => {
  pointerdown.value = false;
};

const throttledPointerMove = throttle(onPointerMove, 20);

const seekToPointer = (e: PointerEvent) => {
  isHovered.value = true;
  const data = getScrubData(e);
  if (data) {
    emit('seek', data.scrubTime);
  }
};

const getTooltipWidth = () => {
  const el = tooltipRef.value;
  return el && el.offsetWidth > 0 ? el.offsetWidth : 33;
};

const setTooltipLeftPosition = (x: number, containerWidth: number) => {
  const tooltipWidth = getTooltipWidth();
  if (!tooltipWidth) return;

  x + tooltipWidth > containerWidth
    ? (tooltipLeft.value = `${containerWidth - tooltipWidth}px`)
    : (tooltipLeft.value = `${x}px`);
};

const getScrubData = (e: PointerEvent) => {
  if (!progressRef.value) return null;

  const rect = progressRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percent = Math.min(Math.max(x / rect.width, 0), 1);
  const scrubTime = percent * props.duration;

  setTooltipLeftPosition(x, rect.width);

  return { x, percent, scrubTime };
};

const getChapterAt = (time: number): Chapter | undefined => {
  return props.chapters.find((ch, i) => {
    const next = props.chapters[i + 1];
    const end = next ? next.time : props.duration;
    const isCurrentChapter = time >= ch.time && time < end;
    return isCurrentChapter;
  });
};

const seekToPreviousChapter = () => {
  const current = props.currentTime;
  const previous = [...props.chapters]
    .reverse()
    .find((ch) => ch.time < current);
  if (previous) emit('seek', previous.time);
};

const seekToNextChapter = () => {
  const current = props.currentTime;
  const next = props.chapters.find((ch) => ch.time > current);
  if (next) emit('seek', next.time);
};

onMounted(() => {
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerCancel);
});

onBeforeUnmount(() => {
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('pointercancel', onPointerCancel);
  throttledPointerMove.cancel();
});
</script>

<style scoped lang="scss">
.player-controls {
  display: flex;
  position: absolute;
  bottom: 0;
  width: 100%;
  color: $white;
  flex-wrap: wrap;
  transition: all 0.3s;
  background: rgba($black, 0.3);

  @include hover-only {
    transform: translateY(calc(100% - 5px));
  }

  > * {
    flex: 1;
  }

  &__group {
    display: flex;
    align-items: center;
    flex: 1;
  }

  &__time {
    font-size: 0.7rem;
    display: none;
    min-width: 5rem;

    @include respond-to('sm') {
      display: block;
    }
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 0;
    color: inherit;
    text-align: center;
    cursor: pointer;
    padding: 0.45em 0.8rem;
    font-size: 0.75rem;
    flex: 0 0 3rem;

    &--mute {
      display: none;

      @include respond-to('sm-md') {
        display: inline-block;
      }
    }

    &--skip {
      display: none;
      align-items: center;

      @include respond-to('sm-md') {
        display: flex;
      }
    }

    &--cc {
      background: rgba($white, 0.2);
      transition: background 0.2s ease;

      &:hover {
        background: rgba($primary-green, 0.3);
      }

      &.is-active {
        background: $primary-green;
      }
    }
  }

  &__progress {
    position: relative;
    display: flex;
    flex-basis: 100%;
    height: 0.8rem;
    transition: height 0.3s;
    background: rgba($black, 0.2);
    cursor: ew-resize;

    &-bar {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: $primary-green;
      pointer-events: none;
      transition: width 0.1s ease;
    }

    &:hover {
      .player-controls__tooltip,
      .player-controls__chapter-overlay {
        opacity: 1;
        visibility: visible;

        @include touch-only {
          display: none;
        }
      }
    }
  }

  &__slider-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    &--play-back-rate {
      display: none;

      @include respond-to('md') {
        display: flex;
      }
    }

    .player-controls__tooltip {
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: space-between;
    }
  }

  :is(&__slider:hover, &__slider:focus) + &__tooltip {
    opacity: 1;
    visibility: visible;
  }

  &__chapter-marker {
    position: absolute;
    z-index: 10;
    top: 0;
    width: 4px;
    height: 100%;
    background-color: $white;
  }

  &__chapter-nav {
    display: flex;
    width: 30%;
    justify-content: center;
    gap: 4px;
    margin: 0 0.8rem;
    flex: 0 0 auto;

    &.is-fullscreen {
      width: 35%;
    }
  }

  &__chapter-title {
    flex: 1;
    align-self: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    font-size: 0.85rem;
    width: 65%;
  }

  &__tooltip,
  &__chapter-overlay {
    position: absolute;
    background: rgba($black, 0.8);
    border-radius: 4px;
    user-select: none;
    z-index: 10;
    opacity: 0;
    visibility: hidden;
    white-space: nowrap;
    transition: opacity 0.3s ease;
  }

  &__tooltip {
    top: -20px;
    font-size: 0.7rem;
    padding: 3px 6px;

    pointer-events: none;
  }

  &__subtitle {
    position: absolute;
    bottom: 60px;
    width: 100%;
    text-align: center;
    font-size: 1rem;
    text-shadow: 1px 1px 4px rgba($black, 0.8);
    pointer-events: none;
  }

  &__chapter-overlay {
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}
</style>
