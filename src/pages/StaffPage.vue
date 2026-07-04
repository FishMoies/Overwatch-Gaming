<template>
  <div class="staff-page">
    <div class="page-header">
      <h1 class="page-title">站务公示</h1>
      <p class="page-subtitle">社区管理团队信息与站务规定</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>

    <template v-else>

      <section class="staff-section">
        <div class="section-header">
          <h2 class="section-title">常驻站务管理人员</h2>
          <span class="section-badge">{{ permanentStaff.length }} 人</span>
        </div>
        <p class="section-desc">社区日常管理与维护</p>
        <div v-if="permanentStaff.length === 0" class="empty-state">暂无常驻站务管理人员</div>
        <div v-else class="staff-grid">
          <div
            v-for="staff in permanentStaff"
            :key="staff.uid"
            class="staff-card"
            @click="goToUser(staff.uid)"
          >
            <img
              :src="staff.avatar || '/default-avatar.png'"
              :alt="staff.nickname || staff.username"
              class="staff-avatar"
            />
            <div class="staff-info">
              <div class="staff-name">{{ staff.nickname || staff.username }}</div>
              <div class="staff-username" v-if="staff.nickname">@{{ staff.username }}</div>
              <div class="staff-meta">
                <span class="staff-title-tag">{{ staff.title }}</span>
                <span class="sid-badge">#{{ staff.sid }}</span>
              </div>
              <div class="staff-desc">{{ staff.description }}</div>
              <div v-if="staff.contact" class="staff-contact">📧 {{ staff.contact }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="staff-section">
        <div class="section-header">
          <h2 class="section-title">特设站务管理人员</h2>
          <span class="section-badge">{{ rotatingStaff.length }} 人</span>
        </div>
        <p class="section-desc">定期轮换参与阶段性管理与活动组织</p>
        <div v-if="rotatingStaff.length === 0" class="empty-state">暂无特设站务管理人员</div>
        <div v-else class="staff-grid">
          <div
            v-for="staff in rotatingStaff"
            :key="staff.uid"
            class="staff-card"
            @click="goToUser(staff.uid)"
          >
            <img
              :src="staff.avatar || '/default-avatar.png'"
              :alt="staff.nickname || staff.username"
              class="staff-avatar"
            />
            <div class="staff-info">
              <div class="staff-name">{{ staff.nickname || staff.username }}</div>
              <div class="staff-username" v-if="staff.nickname">@{{ staff.username }}</div>
              <div class="staff-meta">
                <span class="staff-title-tag">{{ staff.title }}</span>
                <span class="sid-badge">#{{ staff.sid }}</span>
              </div>
              <div class="staff-term" v-if="staff.term">⏳ {{ staff.term }}</div>
              <div class="staff-desc">{{ staff.description }}</div>
            </div>
            <div v-if="staff.term" class="term-badge">{{ staff.term }}</div>
          </div>
        </div>
      </section>

    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(true)
const error = ref('')
const permanentStaff = ref([])
const rotatingStaff = ref([])

onMounted(async () => {
  try {
    const res = await fetch('/api/staff')
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: 加载站务数据失败`)
    }
    const data = await res.json()
    if (data.success) {
      permanentStaff.value = data.permanentStaff || []
      rotatingStaff.value = data.rotatingStaff || []
    } else {
      error.value = data.message || '加载站务数据失败'
    }
  } catch (e) {
    console.error('加载站务数据失败:', e)
    error.value = '加载站务数据失败，请稍后重试'
  } finally {
    loading.value = false
  }
})

function goToUser(uid) {
  if (uid) {
    router.push(`/user/${encodeURIComponent(uid)}`)
  }
}
</script>

<!--
  scoped 样式：适用于页面内的所有布局和组件样式
  注意：由于 variables.css 中 body * { font-family: ... !important } 的存在，
  font-family 的覆盖需要在非 scoped <style> 中使用 body 前缀声明。
-->
<style scoped>
/* ========== 页面容器 ========== */
.staff-page {
  min-height: calc(100vh - var(--navbar-height));
  background: var(--color-bg);
  max-width: var(--max-width-narrow);
  margin: 0 auto;
  padding: calc(var(--navbar-height) + var(--space-xl)) var(--space-lg) var(--space-2xl);
}

/* ========== 头部 ========== */
.page-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.page-title {
  margin: 0 0 4px;
  font-size: 1.75rem;
  color: var(--color-text-primary);
}

.page-subtitle {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 0.92rem;
}

/* ========== 分区卡片 ========== */
.staff-section {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl) var(--space-xl);
  margin-bottom: var(--space-lg);
  box-shadow: var(--glass-shadow);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.staff-section:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-lg);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: 2px;
}

.section-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--color-text-primary);
}

.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  background: var(--color-info-bg);
  color: var(--color-info);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-mono);
}

.section-desc {
  margin: 2px 0 var(--space-lg);
  color: var(--color-text-tertiary);
  font-size: 0.85rem;
}

/* ========== 站务卡片列表 ========== */
.staff-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.staff-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.staff-card:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.staff-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--color-border-light);
  transition: border-color 0.25s;
}

.staff-card:hover .staff-avatar {
  border-color: var(--color-info);
}

.staff-info {
  flex: 1;
  min-width: 0;
}

.staff-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.staff-username {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  margin-bottom: 4px;
}

.staff-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.staff-title-tag {
  display: inline-block;
  padding: 2px 10px;
  background: var(--color-info-bg);
  color: var(--color-info);
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: var(--font-mono);
}

.sid-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--color-surface);
  color: var(--color-text-tertiary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 500;
  font-family: var(--font-mono);
}

.staff-desc {
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  line-height: 1.5;
  margin-top: 4px;
}

.staff-term {
  color: var(--color-warning);
  font-size: 0.82rem;
  margin-top: 4px;
}

.staff-contact {
  color: var(--color-text-tertiary);
  font-size: 0.82rem;
  margin-top: 4px;
}

.term-badge {
  position: absolute;
  top: 12px;
  right: 14px;
  padding: 3px 10px;
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
  font-family: var(--font-mono);
}

/* ========== 通用状态 ========== */
.loading-state,
.empty-state,
.error-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-tertiary);
  font-size: 0.95rem;
}

.error-state {
  color: var(--color-danger);
}

</style>

<!--
  非 scoped 样式：用于覆盖 variables.css 中全局 !important 字体规则。
  使用 body .staff-page 前缀确保高优先级，让标题和姓名等区域使用 display 字体。
-->
<style>
body .staff-page .page-title,
body .staff-page .section-title,
body .staff-page .staff-name {
  font-family: var(--font-display) !important;
}
</style>