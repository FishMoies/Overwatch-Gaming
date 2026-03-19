<template>
  <nav class="navbar">
    <a href="#" class="brand" @click.prevent="goToHome">E426</a>
    <ul class="nav-links">
      <li><a href="#" @click.prevent="goToHome">首页</a></li>
      <li><a href="#about">关于</a></li>
      <li v-if="isLoggedIn"><a href="#user">用户面板</a></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import auth from '../utils/auth.js';

const isLoggedIn = ref(false);

// 检查登录状态
const checkLoginStatus = () => {
  isLoggedIn.value = auth.isLoggedIn();
};

const goToHome = () => {
  window.location.hash = '';
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
  font-size: 1.5em;
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