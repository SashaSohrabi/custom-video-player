import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';

export function useFullscreen(targetRef: Ref<HTMLElement | null>) {
  const isFullscreen = ref(false);

  const enter = () => {
    const el = targetRef.value;
    if (!el) return;

    el.requestFullscreen?.() ||
      (el as any).webkitRequestFullscreen?.() ||
      (el as any).mozRequestFullScreen?.() ||
      (el as any).msRequestFullscreen?.();
  };

  const exit = () => {
    document.exitFullscreen?.() ||
      (document as any).webkitExitFullscreen?.() ||
      (document as any).mozCancelFullScreen?.() ||
      (document as any).msExitFullscreen?.();
  };

  const toggle = () => {
    isFullscreen.value ? exit() : enter();
  };

  const onChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
  };

  onMounted(() => {
    document.addEventListener('fullscreenchange', onChange);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', onChange);
  });

  return {
    isFullscreen,
    enterFullscreen: enter,
    exitFullscreen: exit,
    toggleFullscreen: toggle,
  };
}
