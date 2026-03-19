<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from './components/NavBar.vue'
import auth from './utils/auth.js'
import fullpage from 'fullpage.js'

const route = useRoute()
const router = useRouter()
const isLoggedIn = ref(false)
let fpInstance = null

// 检查登录状态
const checkLoginStatus = () => {
  isLoggedIn.value = auth.isLoggedIn()
}

// 导航函数
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

// 初始化fullpage.js
const initFullpage = () => {
  if (fpInstance) {
    fpInstance.destroy('all')
  }

  fpInstance = new fullpage('#fullpage', {
    autoScrolling: true,
    navigation: true,
    scrollingSpeed: 700,
    paddingTop: '60px',
    css3: true,
    fitToSection: false,
    fixedElements: '.navbar',
    afterLoad: function(origin, destination, direction) {
      // 可以在这里添加滚动后的逻辑
    }
  })
}

// 销毁fullpage.js
const destroyFullpage = () => {
  if (fpInstance) {
    fpInstance.destroy('all')
    fpInstance = null
  }
}

// 根据路由变化处理fullpage.js
watch(() => route.path, (newPath) => {
  checkLoginStatus()
  
  if (newPath === '/' || newPath === '/about') {
    // 首页或关于页面，需要初始化fullpage.js
    nextTick(() => {
      initFullpage()
    })
  } else {
    // 其他页面，销毁fullpage.js
    destroyFullpage()
  }
})

onMounted(() => {
  checkLoginStatus()
  window.addEventListener('storage', checkLoginStatus)

  // 初始加载时，如果是首页则初始化fullpage.js
  if (route.path === '/' || route.path === '/about') {
    nextTick(() => {
      initFullpage()
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('storage', checkLoginStatus)
  destroyFullpage()
})
</script>

<template>
  <div class="app-container">
    <NavBar />
    
    <!-- 路由出口 -->
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<style scoped>

@font-face {
  font-family: 'SmileySans Oblique';
  src: url('/SmileySans-Oblique.ttf') format('truetype');
}

.app-container{
  width:100%;
  height:100vh;
  position:relative;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active{
  transition:opacity .5s;
}

.fade-enter-from,
.fade-leave-to{
  opacity:0;
}

</style>