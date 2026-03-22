<template>
  <nav class="navbar">
    <router-link to="/" class="brand">首页</router-link>
    <ul class="nav-links">
      <li v-if="isLoggedIn"><router-link to="/createpost">发帖</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/user">用户面板</router-link></li>
      <li><a href="https://www.owmod.net/" target="_blank" rel="noopener noreferrer">熔火工坊</a></li>
    </ul>
    <div class="nav-actions">
      <SearchInput />
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user.js';
import SearchInput from './SearchInput.vue';

const router = useRouter();
const userStore = useUserStore();

// 使用计算属性获取登录状态
const isLoggedIn = computed(() => userStore.isLoggedIn);

// 检查登录状态（兼容旧代码）
const checkLoginStatus = () => {
  // 计算属性会自动更新，这里不需要额外操作
};

onMounted(() => {
  checkLoginStatus(); // 初始检查
  
  // 监听存储变化以更新登录状态
  window.addEventListener('storage', checkLoginStatus);
  
  // 定期检查登录状态（每5秒）
  const intervalId = setInterval(checkLoginStatus, 5000);
  
  // 保存intervalId以便清理
  window.__navBarIntervalId = intervalId;
});

onUnmounted(() => {
  window.removeEventListener('storage', checkLoginStatus);
  
  // 清理定时器
  if (window.__navBarIntervalId) {
    clearInterval(window.__navBarIntervalId);
    delete window.__navBarIntervalId;
  }
});
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  color: white;
  padding: 10px 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.brand {
  color: white;
  text-decoration: none;
  font-size: 1em;
}

.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.nav-links li {
  margin-right: 20px;
}

.nav-links a {
  color: white;
  text-decoration: none;
}

.nav-links a:hover {
  text-decoration: underline;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-button {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  transition: all 0.3s ease;
  font-family: 'SmileySans Oblique', sans-serif;
}

.register-nav {
  background-color: rgba(102, 126, 234, 0.2);
  border: 2px solid #667eea;
}

.register-nav:hover {
  background-color: #667eea;
  text-decoration: none;
}

.login-nav {
  background-color: rgba(245, 87, 108, 0.2);
  border: 2px solid #f5576c;
}

.login-nav:hover {
  background-color: #f5576c;
  text-decoration: none;
}
</style>