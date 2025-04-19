<template>
  <div class="player-controls">
    <div
      class="player-controls__progress"
      ref="progress"
      @pointerdown="onPointerDown"
      @pointermove="throttledPointerMove"
      @mouseleave="onPointerLeave"
    >
      <div
        ref="tooltip"
        v-if="hoveredTime"
        class="player-controls__tooltip"
        :style="{ left: tooltipLeft }"
      >
        {{ formatTime(hoveredTime) }}
      </div>
      <div
        class="player-controls__progress-bar"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>
    <button
      class="player-controls__button"
      :title="playButtonState.title"
      @click="$emit('toggle-play')"
    >
      {{ playButtonState.icon }}
    </button>
    <div class="player-controls__time">
      {{ timeDisplay }}
    </div>
    <div class="player-controls__slider-wrapper">
      <input
        ref="volume"
        type="range"
        name="volume"
        class="player-controls__slider"
        min="0"
        max="1"
        step="0.05"
        :value="props.volume"
        :title="volumeMeta.title"
        @input="
          $emit(
            'update:volume',
            parseFloat(($event.target as HTMLInputElement).value)
          )
        "
      />
      <div class="player-controls__tooltip">
        {{ volumeMeta.label }}
      </div>
    </div>
    <button
      class="player-controls__button player-controls__button--mute"
      @click="$emit('toggle-mute')"
      :title="muteButtonState.title"
    >
      {{ muteButtonState.icon }}
    </button>
    <div class="player-controls__slider-wrapper">
      <input
        type="range"
        name="playbackRate"
        class="player-controls__slider"
        min="0.5"
        max="2"
        step="0.1"
        :value="props.playbackRate"
        :title="playbackRateMeta.title"
        @input="
          $emit(
            'update:playbackRate',
            parseFloat(($event.target as HTMLInputElement).value)
          )
        "
      />
      <div class="player-controls__tooltip">
        {{ playbackRateMeta.label }}
      </div>
    </div>

    <button
      class="player-controls__button"
      :title="skipButtonMeta.rewind.title"
      @click="$emit('skip', -10)"
    >
      <span class="icon">{{ `${skipButtonMeta.rewind.icon}` }}</span>
      <span class="text">{{ `${skipButtonMeta.rewind.text}` }}</span>
    </button>
    <button
      class="player-controls__button"
      :title="skipButtonMeta.forward.title"
      @click="$emit('skip', 25)"
    >
      <span class="text">{{ `${skipButtonMeta.forward.text}` }}</span>
      <span class="icon">{{ `${skipButtonMeta.forward.icon}` }}</span>
    </button>
    <button
      class="player-controls__button"
      :title="fullscreenButtonState.title"
      @click="$emit('toggle-fullscreen')"
    >
      {{ fullscreenButtonState.icon }}
    </button>
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
} from 'vue';
import { throttle } from 'lodash-es';
import { formatTime } from '@/utilities/timeUtils';

const props = defineProps<{
  progressPercent: number;
  currentTime: number;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  duration: number;
  volume: number;
  playbackRate: number;
}>();

const emit = defineEmits<{
  (e: 'toggle-play'): void;
  (e: 'toggle-mute'): void;
  (e: 'toggle-fullscreen'): void;
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
const hoveredTime = ref<number | null>(null);

const volumePercent = computed(() => `${Math.round(props.volume * 100)}%`);
const playbackRateValue = computed(() => props.playbackRate.toFixed(1));

const timeDisplay = computed(() => {
  return `${formatTime(props.currentTime)} / ${formatTime(props.duration)}`;
});

const playButtonState = computed(() =>
  props.isPlaying
    ? { title: 'Pause', icon: '\u275A\u275A' }
    : { title: 'Play', icon: '\u25BA' }
);

const muteButtonState = computed(() =>
  props.isMuted
    ? { title: 'Unmute', icon: '\u{1F507}' }
    : { title: 'Mute', icon: '\u{1F50A}' }
);

const fullscreenButtonState = computed(() =>
  props.isFullscreen
    ? { title: 'Exit Fullscreen', icon: '\u{1F5D6}' }
    : { title: 'Enter Fullscreen', icon: '\u26F6' }
);

const playbackRateMeta = computed(() => ({
  title: 'Playback Rate',
  label: `\u23E9 ${playbackRateValue.value}`,
}));

const volumeMeta = computed(() => ({
  title: 'Volume',
  label: `\u{1F50A} ${volumePercent.value}`,
}));

const skipButtonMeta = computed(() => ({
  forward: { title: 'Skip Forward', icon: '\u21BB', text: '25s' },
  rewind: { title: 'Skip Rewind', icon: '\u21BA', text: '10s' },
}));

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

const onPointerUp = () => {
  pointerdown.value = false;
};

const onPointerLeave = () => {
  hoveredTime.value = null;
};

const onPointerMove = (e: PointerEvent) => {
  const data = getScrubData(e);
  if (!data) return;

  hoveredTime.value = data.scrubTime;

  if (pointerdown.value) {
    emit('seek', data.scrubTime);
  }
};

const onPointerCancel = () => {
  pointerdown.value = false;
};

const throttledPointerMove = throttle(onPointerMove, 20);

const seekToPointer = (e: PointerEvent) => {
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
  flex-wrap: wrap;
  transition: all 0.3s;
  background: rgba($black, 0.3);

  @media (hover: hover) and (pointer: fine) {
    transform: translateY(calc(100% - 5px));
  }

  > * {
    flex: 1;
  }

  &__time {
    color: $white;
    font-size: 0.75rem;
    margin: 0 10px;
    align-self: center;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: none;
    border: 0;
    color: $white;
    text-align: center;
    cursor: pointer;
    max-width: 50px;
    height: 30px;
    font-size: 0.95rem;
    padding: 0;

    .icon {
      font-size: 1.3rem;
      line-height: 1;
      transform: translateY(-2px);
    }

    .text {
      font-size: 0.9rem;
      line-height: 1;
    }

    &--mute {
      margin: 0 10px;
    }
  }

  &__progress {
    position: relative;
    display: flex;
    flex-basis: 100%;
    height: 10px;
    transition: height 0.3s;
    background: transparent;
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

    &:hover .player-controls__tooltip {
      opacity: 1;
      pointer-events: auto;

      @media (hover: none) and (pointer: coarse) {
        display: none;
      }
    }
  }

  &__slider-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover .player-controls__tooltip {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &__tooltip {
    position: absolute;
    top: -20px;
    background: rgba($black, 0.85);
    color: $white;
    font-size: 0.75rem;
    padding: 3px 6px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 10;
    transform: translateY(-5px);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }
}
</style>
