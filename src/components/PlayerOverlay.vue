<template>
  <div v-if="isLoading || hasError" class="player-overlay">
    <div v-if="isLoading && !hasError" class="player-overlay__spinner"></div>
    <div v-else-if="hasError" class="player-overlay__error">
      ⚠️ Failed to load video
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isLoading: boolean;
  hasError: boolean;
}>();
</script>

<style scoped lang="scss">
.player-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  &__spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: $primary-green;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__error {
    color: $white;
    font-size: 1.5rem;
    text-align: center;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
