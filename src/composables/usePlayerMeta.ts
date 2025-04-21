// composables/usePlayerMeta.ts
import {
  Play,
  Pause,
  RotateCcw,
  VolumeX,
  Volume1,
  Volume2,
  VolumeOff,
  SkipForward,
  SkipBack,
  FastForward,
  ChevronsLeft,
  ChevronsRight,
  Maximize,
  Minimize,
  Captions,
} from 'lucide-vue-next';
import { computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';

type PlayerMetaProps = {
  isPlaying: Ref<boolean>;
  isMuted: Ref<boolean>;
  isFullscreen: Ref<boolean>;
  volume: Ref<number>;
  playbackRate: Ref<number>;
  volumePercent: ComputedRef<string>;
  playbackRateLabel: ComputedRef<string>;
};

export function usePlayerMeta(props: PlayerMetaProps) {
  const playButtonState = computed(() =>
    props.isPlaying.value
      ? { title: 'Pause', icon: Pause, size: 16 }
      : { title: 'Play', icon: Play, size: 16 }
  );

  const muteButtonState = computed(() =>
    props.isMuted.value
      ? { title: 'Unmute', icon: VolumeOff, size: 16 }
      : { title: 'Mute', icon: Volume2, size: 16 }
  );

  const fullscreenButtonState = computed(() =>
    props.isFullscreen.value
      ? { title: 'Exit Fullscreen', icon: Minimize, size: 16 }
      : { title: 'Enter Fullscreen', icon: Maximize, size: 16 }
  );

  const replayButtonMeta = computed(() => ({
    title: 'Replay',
    icon: RotateCcw,
    size: 16,
  }));

  const playbackRateMeta = computed(() => ({
    title: 'Playback Rate',
    label: props.playbackRateLabel.value,
    icon: FastForward,
    size: 12,
  }));

  const volumeMeta = computed(() => {
    const isMuted = props.isMuted.value || props.volume.value === 0;

    if (isMuted) {
      return {
        title: 'Muted',
        label: 'Muted',
        icon: VolumeX,
        size: 12,
      };
    } else if (props.volume.value < 0.5) {
      return {
        title: 'Low volume',
        label: props.volumePercent.value,
        icon: Volume1,
        size: 12,
      };
    } else {
      return {
        title: 'High volume',
        label: props.volumePercent.value,
        icon: Volume2,
        size: 12,
      };
    }
  });

  const closedCaptionsMeta = computed(() => ({
    title: 'Subtitles/closed captions (c)',
    icon: Captions,
    size: 16,
  }));

  const skipButtonMeta = computed(() => ({
    forward: {
      title: 'Forward',
      label: '25s',
      icon: ChevronsRight,
      size: 16,
    },
    rewind: {
      title: 'Rewind',
      label: '10s',
      icon: ChevronsLeft,
      size: 16,
    },
  }));

  const chapterNavButtons = computed(() => ({
    next: {
      title: 'Next Chapter',
      icon: SkipForward,
      size: 16,
    },
    prev: {
      title: 'Previous Chapter',
      icon: SkipBack,
      size: 16,
    },
  }));

  return {
    playButtonState,
    muteButtonState,
    fullscreenButtonState,
    replayButtonMeta,
    playbackRateMeta,
    volumeMeta,
    closedCaptionsMeta,
    skipButtonMeta,
    chapterNavButtons,
  };
}
