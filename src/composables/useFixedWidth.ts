import { ref } from 'vue';

export const useFixedWidth = (maxWrapperWidth = 800, padding = 25) => {
  const fixedWidth = ref('100%');

  const calculateWidth = () => {
    const horizontalPadding = padding * 2;
    const screenWidth = window.innerWidth;
    const availableWidth =
      Math.min(screenWidth, maxWrapperWidth) - horizontalPadding;

    fixedWidth.value = `${availableWidth}px`;
  };

  calculateWidth();

  return { fixedWidth };
};
