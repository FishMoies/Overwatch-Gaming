<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>创建战队</h3>
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label>战队名称</label>
          <input type="text" v-model="name" required placeholder="请输入战队名称（不含#号）" class="form-input" />
          <p class="hint">系统会自动在名称后添加 #随机四位数 作为唯一标识符</p>
        </div>
        <div v-if="message" class="msg" :class="{ error: isError }">{{ message }}</div>
        <div class="modal-actions">
          <button type="button" class="btn cancel" @click="$emit('close')">取消</button>
          <button type="submit" class="btn confirm">创建战队</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['close', 'submit'])
const name = ref('')
const message = ref('')
const isError = ref(false)
function handleSubmit() {
  if (!name.value.trim()) {
    message.value = '请输入战队名称'
    isError.value = true
    return
  }
  emit('submit', name.value.trim())
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.5);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:1000;
}
.modal-content {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 480px;
  box-shadow: var(--shadow-xl);
}
h3 {
  font-family: 'SmileySans Oblique', sans-serif;
  font-size: 1.6rem;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  text-align: center;
}
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-weight: 500; color: var(--color-text-secondary); font-size: 0.95rem; }
.form-input {
  padding: 10px 12px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'SmileySans Oblique', sans-serif;
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}
.form-input:focus { outline: none; border-color: var(--color-text-link); }
.hint { font-size: 0.85rem; color: var(--color-text-tertiary); margin-top: 4px; }
.msg { padding: 10px; border-radius: 8px; text-align: center; font-weight: 500; }
.msg:not(.error) { background: var(--color-success-bg); color: var(--color-success); }
.msg.error { background: var(--color-error-bg); color: var(--color-error); }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-family: 'SmileySans Oblique', sans-serif;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}
.cancel { background: var(--color-text-tertiary); color: var(--color-text-inverse); }
.cancel:hover { background: var(--color-text-secondary); }
.confirm { background: var(--color-brand); color: var(--color-text-inverse); }
.confirm:hover { background: var(--color-brand-dark); }
</style>
