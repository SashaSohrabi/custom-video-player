import type { Ref } from 'vue';

export const withVideo = (
  videoRef: Ref<HTMLVideoElement | null>,
  callback: (video: HTMLVideoElement) => void
) => {
  if (videoRef.value) {
    callback(videoRef.value);
  }
};
