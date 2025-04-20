<template>
  <div
    v-if="isLoading || hasError"
    class="player-overlay"
    role="status"
    aria-live="polite"
  >
    <div
      v-if="isLoading && !hasError"
      class="player-overlay__spinner"
      aria-hidden="true"
    ></div>
    <span v-if="isLoading && !hasError" class="sr-only">Loading video</span>
    <div v-else-if="hasError" class="player-overlay__error" role="alert">
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
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  &__spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba($white, 0.5);
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
