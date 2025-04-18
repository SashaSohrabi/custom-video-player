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
        v-if="hoveredTime"
        class="player-controls__slider-tooltip"
        :style="{ left: tooltipLeft }"
      >
        {{ formatTime(hoveredTime) }}
      </div>
      <div
        class="player-controls__progress-filled"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>
    <button class="player-controls__button" @click="$emit('toggle-play')">
      {{ isPlaying ? '❚ ❚' : '►' }}
    </button>
    <div class="player-controls__slider-wrapper">
      <input
        type="range"
        name="volume"
        class="player-controls__slider"
        min="0"
        max="1"
        step="0.05"
        :value="props.volume"
        @input="
          $emit(
            'update:volume',
            parseFloat(($event.target as HTMLInputElement).value)
          )
        "
      />
      <button
        class="player-controls__button player-controls__button--mute"
        @click="$emit('toggle-mute')"
      >
        {{ isMuted ? '🔇' : '🔊' }}
      </button>
      <div class="player-controls__slider-tooltip">🔊 {{ volumePercent }}</div>
    </div>
    <div class="player-controls__slider-wrapper">
      <input
        type="range"
        name="playbackRate"
        class="player-controls__slider"
        min="0.5"
        max="2"
        step="0.1"
        :value="props.playbackRate"
        @input="
          $emit(
            'update:playbackRate',
            parseFloat(($event.target as HTMLInputElement).value)
          )
        "
      />
      <div class="player-controls__slider-tooltip">
        ⏩ {{ playbackRateValue }}
      </div>
    </div>

    <button class="player-controls__button" @click="$emit('skip', -10)">
      « 10s
    </button>
    <button class="player-controls__button" @click="$emit('skip', 25)">
      25s »
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { throttle } from 'lodash-es';
import { formatTime } from '@/utilities/timeUtils';

const props = defineProps<{
  progressPercent: number;
  isPlaying: boolean;
  isMuted: boolean;
  duration: number;
  volume: number;
  playbackRate: number;
}>();

const emit = defineEmits<{
  (e: 'toggle-play'): void;
  (e: 'toggle-mute'): void;
  (e: 'seek', time: number): void;
  (e: 'skip', time: number): void;
  (e: 'update:volume', value: number): void;
  (e: 'update:playbackRate', value: number): void;
}>();

const progress = useTemplateRef<HTMLDivElement>('progress');
const pointerdown = ref(false);
const tooltipLeft = ref('0px');
const hoveredTime = ref<number | null>(null);

const volumePercent = computed(() => `${Math.round(props.volume * 100)}%`);
const playbackRateValue = computed(() => props.playbackRate.toFixed(1));

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
  const el = progress.value?.querySelector(
    '.player-controls__slider-tooltip'
  ) as HTMLElement | null;
  return el ? el.offsetWidth : 34;
};

const setTooltipLeftPosition = (x: number, containerWidth: number) => {
  const tooltipWidth = getTooltipWidth();
  if (!tooltipWidth) return;

  x + tooltipWidth > containerWidth
    ? (tooltipLeft.value = `${containerWidth - tooltipWidth}px`)
    : (tooltipLeft.value = `${x}px`);
};

const getScrubData = (e: PointerEvent) => {
  if (!progress.value) return null;

  const rect = progress.value.getBoundingClientRect();
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
  background: rgba($black, 0.1);

  @media (hover: hover) and (pointer: fine) {
    transform: translateY(calc(100% - 5px));
  }

  > * {
    flex: 1;
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
    height: 30px;
  }

  &__progress {
    position: relative;
    display: flex;
    flex-basis: 100%;
    height: 10px;
    transition: height 0.3s;
    background: transparent;
    cursor: ew-resize;

    .player-controls__progress-filled {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: $primary-green;
      pointer-events: none;
      transition: width 0.1s ease;
    }

    &:hover .player-controls__slider-tooltip {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &__slider-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover .player-controls__slider-tooltip {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &__slider-tooltip {
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

  input[type='range'] {
    -webkit-appearance: none;
    background: transparent;
    width: 100%;
    margin: 0 5px;

    &:focus {
      outline: none;
    }

    &::-webkit-slider-runnable-track {
      width: 100%;
      height: 8.4px;
      cursor: pointer;
      background: rgba($white, 0.8);
      border-radius: 1.3px;
      border: 0.2px solid rgba(1, 1, 1, 0);
      box-shadow: 1px 1px 1px transparent, 0 0 1px transparent;
    }

    &::-webkit-slider-thumb {
      height: 15px;
      width: 15px;
      border-radius: 50px;
      background: $primary-green;
      cursor: pointer;
      -webkit-appearance: none;
      margin-top: -3.5px;
      box-shadow: 0 0 2px rgba($black, 0.2);
    }

    &:focus::-webkit-slider-runnable-track {
      background: $light-gray;
    }

    &::-moz-range-track {
      width: 100%;
      height: 8.4px;
      cursor: pointer;
      background: $white;
      border-radius: 1.3px;
      border: 0.2px solid rgba(1, 1, 1, 0);
      box-shadow: 1px 1px 1px transparent, 0 0 1px transparent;
    }

    &::-moz-range-thumb {
      height: 15px;
      width: 15px;
      border-radius: 50px;
      background: $primary-green;
      cursor: pointer;
      box-shadow: none;
    }
  }
}
</style>
