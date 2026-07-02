<template>
  <div class="settings-tab">
    <div class="settings-card">
      <h3 class="card-title">账户操作</h3>
      <div class="action-grid">
        <button class="action-btn logout-btn" @click="$emit('logout')">
          <span class="btn-icon">🚪</span>
          <span class="btn-text">退出登录</span>
        </button>
        <button class="action-btn password-btn" @click="$emit('change-password')">
          <span class="btn-icon">🔒</span>
          <span class="btn-text">修改密码</span>
        </button>
        <button class="action-btn logout-btn" @click="$emit('edit-nickname')">
          <span class="btn-icon">✏️</span>
          <span class="btn-text">修改昵称</span>
        </button>
        <button class="action-btn delete-btn" @click="$emit('delete-account')">
          <span class="btn-icon">🗑️</span>
          <span class="btn-text">注销账户</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['logout', 'change-password', 'delete-account', 'edit-nickname'])
</script>

<style scoped>
.settings-tab {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 0;
}

.settings-card {
  background: var(--color-surface);
  border-radius: 14px;
  padding: 28px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-text-link);
}

.action-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border: 2px solid transparent;
  border-radius: 12px;
  font-family: 'SmileySans Oblique', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-icon {
  font-size: 1.5rem;
}

.logout-btn {
  background: var(--color-warning-bg);
  border-color: var(--color-warning);
  color: var(--color-warning);
}
.logout-btn:hover {
  background: linear-gradient(135deg, var(--color-warning), #e0a800);
  color: var(--color-bg);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--color-warning-bg);
}

.password-btn {
  background: var(--color-info-bg);
  border-color: var(--color-text-link);
  color: var(--color-text-link);
}
.password-btn:hover {
  background: var(--color-brand);
  color: var(--color-text-inverse);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--color-brand-bg);
}

.delete-btn {
  background: var(--color-error-bg);
  border-color: var(--color-error);
  color: var(--color-error);
}
.delete-btn:hover {
  background: var(--color-error);
  color: var(--color-text-inverse);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--color-error-bg);
}
</style>
