<template>
  <div :class="['skeleton-wrapper', type]" role="status" aria-label="加载中">
    <div v-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-line skeleton-title" />
      <div class="skeleton-line skeleton-text" />
      <div class="skeleton-line skeleton-text skeleton-text--short" />
      <div class="skeleton-meta">
        <div class="skeleton-avatar" />
        <div class="skeleton-line skeleton-text--xshort" />
      </div>
    </div>
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="n in count" :key="n" class="skeleton-list-item">
        <div class="skeleton-avatar" />
        <div class="skeleton-list-content">
          <div class="skeleton-line skeleton-title" />
          <div class="skeleton-line skeleton-text skeleton-text--short" />
        </div>
      </div>
    </div>
    <div v-else-if="type === 'post'" class="skeleton-post">
      <div class="skeleton-line skeleton-title" />
      <div class="skeleton-line skeleton-text" />
      <div class="skeleton-line skeleton-text" />
      <div class="skeleton-line skeleton-text skeleton-text--short" />
      <div class="skeleton-divider" />
      <div class="skeleton-line skeleton-text" />
      <div class="skeleton-line skeleton-text" />
      <div class="skeleton-line skeleton-text skeleton-text--short" />
    </div>
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div v-for="n in 4" :key="n" class="skeleton-line skeleton-text" />
      </div>
      <div v-for="n in count" :key="n" class="skeleton-table-row">
        <div v-for="m in 4" :key="m" class="skeleton-line skeleton-text--xshort" />
      </div>
    </div>
    <div v-else class="skeleton-default">
      <div v-for="n in count" :key="n" class="skeleton-line skeleton-text" />
    </div>
    <span class="sr-only">加载中...</span>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'card',
    validator: v => ['card', 'list', 'post', 'table', 'default'].includes(v)
  },
  count: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
/* ── Skeleton base ── */
.skeleton-wrapper {
  width: 100%;
}

.skeleton-line {
  background: linear-gradient(
    90deg,
    var(--color-surface-hover) 25%,
    var(--color-surface-active) 50%,
    var(--color-surface-hover) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-title {
  height: 20px;
  width: 60%;
}

.skeleton-text {
  height: 14px;
  width: 100%;
}

.skeleton-text--short {
  width: 70%;
}

.skeleton-text--xshort {
  width: 40%;
}

.skeleton-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-surface-hover);
  flex-shrink: 0;
  background: linear-gradient(
    90deg,
    var(--color-surface-hover) 25%,
    var(--color-surface-active) 50%,
    var(--color-surface-hover) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
}

.skeleton-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.skeleton-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-base) 0;
}

/* ── Card skeleton ── */
.skeleton-card {
  padding: var(--space-lg);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

/* ── List skeleton ── */
.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border);
}

.skeleton-list-content {
  flex: 1;
}

/* ── Post skeleton ── */
.skeleton-post {
  padding: var(--space-xl);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

/* ── Table skeleton ── */
.skeleton-table-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  padding: var(--space-md);
  border-bottom: 2px solid var(--color-border);
}

.skeleton-table-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}
</style>