<script setup>
// 导入Vue Composition API
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Popup from './components/Popup.vue'

const route = useRoute()
const hideNavBar = computed(() => route.meta && route.meta.hideNavBar)

// ── Scroll-to-top button ──
const showScrollTop = ref(false)
let scrollHandler = null

onMounted(() => {
  scrollHandler = () => {
    showScrollTop.value = window.scrollY > 400
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
})

onUnmounted(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})

function scrollToTop () {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <!-- 应用根容器 -->
  <div class="app-container">
    <!-- 导航栏组件（某些页面如管理后台隐藏） -->
    <NavBar v-if="!hideNavBar" />
    
    <!-- 路由出口：Vue Router渲染匹配的页面组件 -->
    <router-view v-slot="{ Component }">
      <!-- 页面切换过渡动画 -->
      <Transition name="fade" mode="out-in">
        <!-- 动态组件：渲染当前路由对应的组件 -->
        <component :is="Component" />
      </Transition>
    </router-view>

    <!-- 回到顶部按钮 -->
    <Transition name="scroll-fade">
      <button
        v-if="showScrollTop"
        class="scroll-top-btn"
        @click="scrollToTop"
        aria-label="回到顶部"
        title="回到顶部"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 16V4M10 4l-5 5M10 4l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </Transition>
  </div>
  <!-- 全局弹窗组件 -->
  <Popup />
</template>

<style scoped>
/* ── @font-face moved to src/styles/variables.css ── */

/* 应用根容器样式 */
.app-container {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* 页面切换过渡动画样式 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal) var(--easing-in-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 回到顶部按钮 */
.scroll-top-btn {
  position: fixed;
  bottom: var(--space-xl);
  right: var(--space-xl);
  z-index: var(--z-navbar);
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--easing-out);
  backdrop-filter: blur(8px);
  background: var(--glass-bg);
}

.scroll-top-btn:hover {
  color: var(--color-brand);
  border-color: var(--color-brand);
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

.scroll-fade-enter-active,
.scroll-fade-leave-active {
  transition: opacity var(--duration-normal) var(--easing-out), transform var(--duration-normal) var(--easing-out);
}

.scroll-fade-enter-from,
.scroll-fade-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>

<!-- 全局 CSS 变量 -->
<style>
:root {
  /* 用户生成内容区域使用系统字体栈，避免子集化字体缺失字符导致多字体混杂 */
  --content-font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "WenQuanYi Micro Hei", sans-serif;
}
</style>
