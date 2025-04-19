import { ref, onMounted, onBeforeUnmount } from 'vue';

export const useFixedWidth = () => {
  const fixedWidth = ref('100%');

  const calculateWidth = () => {
    const maxWrapperWidth = 800;
    const horizontalPadding = 25 * 2;
    const screenWidth = window.innerWidth;
    const availableWidth =
      Math.min(screenWidth, maxWrapperWidth) - horizontalPadding;

    fixedWidth.value = `${availableWidth}px`;
  };

  calculateWidth();

  return { fixedWidth };
};
