import type { Ref } from 'vue';
export function withVideo(
  videoRef: Ref<HTMLVideoElement | null>,
  callback: (video: HTMLVideoElement) => void
) {
  if (videoRef.value) {
    callback(videoRef.value);
  }
}
