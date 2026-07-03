<template>
  <nav class="navbar" role="navigation" aria-label="主导航">
    <div class="navbar-inner">
      <!-- 品牌 Logo -->
      <router-link to="/" class="brand" aria-label="回到首页">
        <span class="brand-inner">
          <img src="/logo.svg" alt="OW" class="brand-logo">
          <span class="brand-text">E426</span>
        </span>
      </router-link>

      <!-- 汉堡菜单按钮 (移动端) -->
      <button
        class="hamburger"
        :class="{ active: mobileMenuOpen }"
        @click="toggleMobileMenu"
        aria-label="切换导航菜单"
        aria-expanded="mobileMenuOpen"
      >
        <span class="hamburger-line" />
        <span class="hamburger-line" />
        <span class="hamburger-line" />
      </button>

      <!-- 导航链接 + 右侧操作区 (桌面端显示，移动端抽屉) -->
      <div class="nav-drawer" :class="{ open: mobileMenuOpen }" @click.self="closeMobileMenu">
        <ul class="nav-links">
          <li><router-link to="/browse" active-class="active" @click="closeMobileMenu">浏览</router-link></li>
          <li><router-link to="/staff" active-class="active" @click="closeMobileMenu">站务</router-link></li>
          <li v-if="auth.isLoggedIn"><router-link to="/createpost" active-class="active" @click="closeMobileMenu">发帖</router-link></li>
          <li v-if="auth.isLoggedIn"><router-link to="/user" active-class="active" @click="closeMobileMenu">用户面板</router-link></li>
          <li v-if="auth.isAdmin || auth.isTrustedPlayer"><router-link to="/announcements" active-class="active" @click="closeMobileMenu">发布公告</router-link></li>
          <li><router-link to="/heroes" active-class="active" @click="closeMobileMenu">英雄图鉴</router-link></li>
          <li><a href="https://www.owmod.net/" target="_blank" rel="noopener noreferrer">熔火工坊</a></li>
        </ul>

        <div class="nav-actions">
          <!-- 主题切换 -->
          <button
            class="theme-toggle"
            :title="theme.isDark ? '切换到浅色' : '切换到深色'"
            :aria-label="theme.isDark ? '切换到浅色模式' : '切换到深色模式'"
            @click="theme.toggle()"
          >
            <!-- 月牙 (深色模式) / 太阳 (浅色模式) -->
            <svg v-if="theme.isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </button>

          <!-- 通知按钮 -->
          <router-link to="/notifications" class="notif-btn" title="通知" @click="closeMobileMenu">
            <span class="notif-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </span>
            <span v-if="auth.isLoggedIn && unreadCount > 0" class="notif-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </router-link>
          <SearchInput />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useNotificationStore } from '../stores/notification.js'
import { useThemeStore } from '../stores/theme.js'
import SearchInput from './SearchInput.vue'

const router = useRouter()
const auth = useAuthStore()
const notif = useNotificationStore()
const theme = useThemeStore()
const unreadCount = computed(() => notif.unreadCount)

// ── 移动端菜单 ──
const mobileMenuOpen = ref(false)

function toggleMobileMenu () {
  mobileMenuOpen.value = !mobileMenuOpen.value
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
}

function closeMobileMenu () {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// 路由跳转时关闭菜单
watch(() => router.currentRoute.value, closeMobileMenu)

// ── 生命周期 ──
onMounted(() => {
  auth.loadSession()
  window.addEventListener('storage', auth.loadSession)
  if (auth.currentUser && auth.currentUser.id) {
    notif.load(String(auth.currentUser.id))
  }
})

watch(() => auth.currentUser, (val) => {
  if (val && val.id) {
    notif.load(String(val.id))
  }
}, { immediate: true })

onUnmounted(() => {
  window.removeEventListener('storage', auth.loadSession)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-navbar);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow);
  border-bottom: 1px solid var(--glass-border);
  height: var(--navbar-height);
  box-sizing: border-box;
}

.navbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

/* ── 品牌 ── */
.brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 14px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-out);
}

.brand-inner:hover {
  background: var(--color-surface-active);
  border-color: var(--color-text-tertiary);
}

.brand-logo {
  height: 24px;
  width: auto;
  opacity: 0.95;
}

.brand-text {
  font-family: 'Fugaz One', sans-serif;
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  color: var(--color-text-primary);
}

/* ── 汉堡菜单按钮 ── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  padding: 6px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  gap: 4px;
  transition: background var(--duration-fast) var(--easing-out);
}

.hamburger:hover {
  background: var(--color-surface-hover);
}

.hamburger-line {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--color-text-secondary);
  border-radius: 2px;
  transition: all var(--duration-fast) var(--easing-in-out);
}

.hamburger.active .hamburger-line:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.hamburger.active .hamburger-line:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* ── 抽屉导航 (桌面直接显示，移动端隐藏+滑出) ── */
.nav-drawer {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
  justify-content: flex-end;
}

/* ── 导航链接 ── */
.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-links li {
  margin: 0;
}

.nav-links a {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
  transition: color var(--duration-fast) var(--easing-out),
              background var(--duration-fast) var(--easing-out);
  white-space: nowrap;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 12px;
  right: 12px;
  height: 2px;
  background: var(--color-text-primary);
  border-radius: 1px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform var(--duration-normal) var(--easing-in-out);
}

.nav-links a:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-hover);
}

.nav-links a:hover::after {
  transform: scaleX(1);
}

.nav-links a.active {
  color: var(--color-text-primary);
  background: var(--color-surface-active);
}

.nav-links a.active::after {
  transform: scaleX(1);
}

/* ── 右侧操作区 ── */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* ── 主题切换按钮 ── */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-out);
  flex-shrink: 0;
}

.theme-toggle:hover {
  background: var(--color-surface-active);
  color: var(--color-brand);
  transform: scale(1.05);
}

/* ── 通知按钮 ── */
.notif-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--duration-fast) var(--easing-out);
  cursor: pointer;
  flex-shrink: 0;
}

.notif-btn:hover {
  background: var(--color-surface-active);
  color: var(--color-text-primary);
  transform: scale(1.05);
}

.notif-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-badge {
  position: absolute;
  top: -1px;
  right: -1px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--color-error);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 17px;
  text-align: center;
  font-family: var(--font-sans);
  box-shadow: 0 0 6px var(--color-error-bg);
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .nav-drawer {
    position: fixed;
    top: var(--navbar-height);
    left: 0;
    right: 0;
    bottom: 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    padding: var(--space-lg);
    gap: var(--space-lg);
    background: var(--glass-bg-strong);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    transform: translateX(100%);
    transition: transform var(--duration-normal) var(--easing-in-out);
    overflow-y: auto;
    z-index: var(--z-dropdown);
  }

  .nav-drawer.open {
    transform: translateX(0);
  }

  .nav-links {
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .nav-links a {
    width: 100%;
    padding: var(--space-md) var(--space-base);
    font-size: var(--font-size-md);
    border-radius: var(--radius-md);
  }

  .nav-actions {
    width: 100%;
    justify-content: flex-start;
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
  }
}
</style>