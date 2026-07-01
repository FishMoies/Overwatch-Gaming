<template>
  <div class="empty-state" role="status">
    <div class="empty-icon" aria-hidden="true">
      <slot name="icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="2" opacity="0.2"/>
          <path d="M22 40s4-6 10-6 10 6 10 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
          <circle cx="24" cy="28" r="2" fill="currentColor" opacity="0.3"/>
          <circle cx="40" cy="28" r="2" fill="currentColor" opacity="0.3"/>
        </svg>
      </slot>
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="description" class="empty-description">{{ description }}</p>
    <div v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl) var(--space-xl);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.empty-title {
  margin: 0 0 var(--space-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.empty-description {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-tertiary);
  max-width: 320px;
  line-height: var(--line-height-relaxed);
}

.empty-action {
  margin-top: var(--space-lg);
}
</style>