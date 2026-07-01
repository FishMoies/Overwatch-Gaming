<template>
  <div class="error-state" role="alert">
    <div class="error-icon" aria-hidden="true">
      <slot name="icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="var(--color-error)" stroke-width="2" opacity="0.2"/>
          <path d="M32 20v14" stroke="var(--color-error)" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
          <circle cx="32" cy="42" r="2" fill="var(--color-error)" opacity="0.6"/>
        </svg>
      </slot>
    </div>
    <h3 class="error-title">{{ title }}</h3>
    <p v-if="message" class="error-message">{{ message }}</p>
    <div v-if="$slots.action || showRetry" class="error-action">
      <button v-if="showRetry" class="error-retry-btn" @click="$emit('retry')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right:6px">
          <path d="M2 8a6 6 0 0110.47-4M14 2v4h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        重试
      </button>
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '出错了'
  },
  message: {
    type: String,
    default: ''
  },
  showRetry: {
    type: Boolean,
    default: true
  }
})

defineEmits(['retry'])
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl) var(--space-xl);
  text-align: center;
}

.error-icon {
  margin-bottom: var(--space-lg);
}

.error-title {
  margin: 0 0 var(--space-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-error);
}

.error-message {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-tertiary);
  max-width: 320px;
  line-height: var(--line-height-relaxed);
}

.error-action {
  margin-top: var(--space-lg);
  display: flex;
  gap: var(--space-sm);
}

.error-retry-btn {
  display: inline-flex;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--font-size-base);
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-out);
}

.error-retry-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-brand);
  color: var(--color-brand);
}
</style>